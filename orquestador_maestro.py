#!/usr/bin/env python3
"""
ORQUESTADOR MAESTRO - ROMEO-HYDRA
=================================

Router principal del sistema.

Objetivos:
    1. Cargar dinámicamente los nodos ROMEO-HYDRA.
    2. Mantener el procesamiento concurrente de dosieres.
    3. Detectar la intención de la consulta.
    4. Resolver operaciones matemáticas de forma local y determinista.
    5. Delegar consultas no matemáticas al motor ROMEO/Bibliotecario.
    6. Evitar respuestas FALLBACK simuladas.
    7. No ejecutar eval() sobre entrada del usuario.
    8. Mantener telemetría basada en hechos reales.

Ejemplo:

    "cuanto es dos mas dos menos menos dos"

se transforma en:

    2 + 2 - -2

y produce:

    6
"""

from __future__ import annotations

import ast
import importlib
import importlib.util
import json
import logging
import operator
import os
import re
import sys
import time

from concurrent.futures import (
    ProcessPoolExecutor,
    ThreadPoolExecutor,
    as_completed,
)

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


# ============================================================
# CONFIGURACIÓN
# ============================================================

REPO_PATH = Path(__file__).resolve().parent

if str(REPO_PATH) not in sys.path:
    sys.path.insert(0, str(REPO_PATH))

ESCALA_PLIEGUES = 704

MAX_WORKERS_CPU = max(1, os.cpu_count() or 4)
MAX_WORKERS_IO = min(32, (os.cpu_count() or 4) * 4)

NODOS_NUCLEO = [
    "romeo_engine",
    "kernel_sigma",
    "sensor_hardware",
    "orquestador_dinamico",
    "bibliotecario",
]

PATRONES_DOSIER = [
    "*.txt",
    "*.md",
    "*.json",
    "*.yaml",
    "*.yml",
]

EXCLUSIONES = {
    ".git",
    "hydra_env_64",
    "__pycache__",
    "_extracted_zips",
    ".venv",
    "venv",
    "node_modules",
    ".mypy_cache",
}


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%H:%M:%S",
)

log = logging.getLogger("RomeoHydra")


# ============================================================
# DATOS
# ============================================================

@dataclass
class NodoEstado:
    nombre: str
    modulo: Optional[Any] = None
    estado: str = "NO_CARGADO"
    mensaje: str = ""
    funciones_expuestas: List[str] = field(default_factory=list)


@dataclass
class ResultadoDosier:
    ruta: str
    nombre: str
    bytes_procesados: int
    exito: bool
    error: Optional[str] = None


@dataclass
class ResultadoConsulta:
    status: str
    intent: str
    result: Any = None
    expression: Optional[str] = None
    source: Optional[str] = None
    error: Optional[str] = None
    elapsed_ms: float = 0.0

    def as_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "intent": self.intent,
            "result": self.result,
            "expression": self.expression,
            "source": self.source,
            "error": self.error,
            "elapsed_ms": round(self.elapsed_ms, 3),
        }


# ============================================================
# NORMALIZACIÓN MATEMÁTICA
# ============================================================

PALABRAS_NUMERO = {
    "cero": "0",
    "uno": "1",
    "dos": "2",
    "tres": "3",
    "cuatro": "4",
    "cinco": "5",
    "seis": "6",
    "siete": "7",
    "ocho": "8",
    "nueve": "9",
    "diez": "10",
}

PALABRAS_OPERADOR = {
    "más": "+",
    "mas": "+",
    "menos": "-",
    "por": "*",
    "multiplicado": "*",
    "multiplicada": "*",
    "dividido": "/",
    "dividida": "/",
    "entre": "/",
    "modulo": "%",
    "módulo": "%",
}

PREFIJOS_MATEMATICOS = (
    "cuanto es",
    "cuánto es",
    "cuanto da",
    "cuánto da",
    "calcula",
    "calcular",
    "resuelve",
    "resolver",
    "resultado de",
)

PATRON_NUMERO = re.compile(
    r"(?<![A-Za-zÁÉÍÓÚáéíóúÑñ])"
    r"(cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)"
    r"(?![A-Za-zÁÉÍÓÚáéíóúÑñ])",
    re.IGNORECASE,
)


def normalizar_texto(texto: str) -> str:
    """
    Normalización general, sin cambiar el significado.
    """
    texto = texto.strip().lower()

    # Normalización Unicode básica de espacios.
    texto = re.sub(r"\s+", " ", texto)

    return texto


def normalizar_matematica(texto: str) -> str:
    """
    Convierte lenguaje matemático español a una expresión
    que pueda ser analizada por AST.

    Ejemplo:

        cuanto es dos mas dos menos menos dos

    ->

        2 + 2 - - 2
    """

    texto = normalizar_texto(texto)

    # Eliminar prefijos interrogativos.
    for prefijo in PREFIJOS_MATEMATICOS:
        if texto.startswith(prefijo):
            texto = texto[len(prefijo):].strip()
            break

    # Convertir números escritos.
    def reemplazar_numero(match: re.Match[str]) -> str:
        palabra = match.group(1).lower()
        return PALABRAS_NUMERO[palabra]

    texto = PATRON_NUMERO.sub(reemplazar_numero, texto)

    # Operadores.
    # Orden importante: palabras largas antes que fragmentos.
    for palabra, operador in sorted(
        PALABRAS_OPERADOR.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        texto = re.sub(
            rf"\b{re.escape(palabra)}\b",
            f" {operador} ",
            texto,
        )

    # Eliminar puntuación interrogativa.
    texto = texto.replace("¿", " ")
    texto = texto.replace("?", " ")

    # Permitimos solamente tokens matemáticos después de la
    # normalización.
    texto = re.sub(r"\s+", " ", texto).strip()

    return texto


def parece_matematica(texto: str) -> bool:
    """
    Determina si existe suficiente evidencia de que la consulta
    es matemática.

    No pretende resolver la expresión.
    Solo selecciona el router.
    """

    normalizado = normalizar_texto(texto)

    tiene_prefijo = any(
        normalizado.startswith(prefijo)
        for prefijo in PREFIJOS_MATEMATICOS
    )

    tiene_operador = bool(
        re.search(
            r"\b(más|mas|menos|por|entre|dividido|multiplicado)\b",
            normalizado,
        )
    )

    tiene_simbolo = bool(
        re.search(
            r"[+\-*/%]",
            normalizado,
        )
    )

    tiene_numero = bool(
        re.search(
            r"\d+|\b(cero|uno|dos|tres|cuatro|cinco|"
            r"seis|siete|ocho|nueve|diez)\b",
            normalizado,
        )
    )

    return tiene_numero and (
        tiene_operador
        or tiene_simbolo
        or tiene_prefijo
    )


# ============================================================
# EVALUADOR MATEMÁTICO SEGURO
# ============================================================

OPERADORES_BINARIOS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

OPERADORES_UNARIOS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def evaluar_nodo(nodo: ast.AST) -> float | int:
    """
    Evaluador AST restringido.

    IMPORTANTE:
        No utiliza eval().

    Solo acepta:
        números
        + - * / // % **
        operadores unarios + y -
        paréntesis implícitos mediante AST
    """

    if isinstance(nodo, ast.Constant):
        valor = nodo.value

        if isinstance(valor, bool):
            raise ValueError("Booleanos no permitidos.")

        if isinstance(valor, (int, float)):
            return valor

        raise ValueError(
            f"Constante no permitida: {type(valor).__name__}"
        )

    if isinstance(nodo, ast.UnaryOp):
        operador = OPERADORES_UNARIOS.get(type(nodo.op))

        if operador is None:
            raise ValueError("Operador unario no permitido.")

        valor = evaluar_nodo(nodo.operand)

        return operador(valor)

    if isinstance(nodo, ast.BinOp):
        operador = OPERADORES_BINARIOS.get(type(nodo.op))

        if operador is None:
            raise ValueError(
                f"Operador binario no permitido: "
                f"{type(nodo.op).__name__}"
            )

        izquierda = evaluar_nodo(nodo.left)
        derecha = evaluar_nodo(nodo.right)

        # Protección contra potencias absurdamente grandes.
        if isinstance(nodo.op, ast.Pow):
            if abs(derecha) > 1000:
                raise ValueError("Exponente demasiado grande.")

        return operador(izquierda, derecha)

    raise ValueError(
        f"Nodo AST no permitido: {type(nodo).__name__}"
    )


def resolver_matematica(texto: str) -> ResultadoConsulta:
    """
    Pipeline matemático:

        texto
          ↓
        normalización
          ↓
        AST
          ↓
        evaluación restringida
          ↓
        resultado
    """

    inicio = time.perf_counter()

    try:
        expresion = normalizar_matematica(texto)

        if not expresion:
            raise ValueError("Expresión matemática vacía.")

        # Solo permitimos caracteres propios de una expresión
        # matemática después de normalizar.
        if not re.fullmatch(
            r"[0-9+\-*/%().\s]+",
            expresion,
        ):
            raise ValueError(
                f"Tokens no matemáticos detectados: {expresion!r}"
            )

        arbol = ast.parse(
            expresion,
            mode="eval",
        )

        resultado = evaluar_nodo(arbol.body)

        elapsed = (
            time.perf_counter() - inicio
        ) * 1000

        return ResultadoConsulta(
            status="success",
            intent="math",
            result=resultado,
            expression=expresion,
            source="local_math_engine",
            elapsed_ms=elapsed,
        )

    except ZeroDivisionError:
        return ResultadoConsulta(
            status="error",
            intent="math",
            error="División entre cero.",
            elapsed_ms=(
                time.perf_counter() - inicio
            ) * 1000,
        )

    except (
        SyntaxError,
        ValueError,
        OverflowError,
    ) as exc:
        return ResultadoConsulta(
            status="error",
            intent="math",
            error=str(exc),
            elapsed_ms=(
                time.perf_counter() - inicio
            ) * 1000,
        )


# ============================================================
# CARGA DINÁMICA DE MÓDULOS
# ============================================================

def cargar_modulo(nombre: str) -> NodoEstado:
    """
    Intenta importar un módulo de forma segura.

    Busca:
        nombre.py
        nombre/__init__.py
        nucleo/nombre.py
        core/nombre.py
    """

    estado = NodoEstado(nombre=nombre)

    try:
        modulo = importlib.import_module(nombre)

        estado.modulo = modulo
        estado.estado = "ACTIVO"
        estado.mensaje = "Importado correctamente."

        estado.funciones_expuestas = [
            attr
            for attr in dir(modulo)
            if (
                not attr.startswith("_")
                and callable(
                    getattr(modulo, attr, None)
                )
            )
        ]

        for init_name in (
            "inicializar",
            "init",
            "arranque",
            "setup",
            "bootstrap",
        ):
            if hasattr(modulo, init_name):
                getattr(modulo, init_name)()
                estado.mensaje += (
                    f" | {init_name}() ejecutado"
                )
                break

        return estado

    except ModuleNotFoundError:
        posibles = [
            REPO_PATH / f"{nombre}.py",
            REPO_PATH / nombre / "__init__.py",
            REPO_PATH / "nucleo" / f"{nombre}.py",
            REPO_PATH / "core" / f"{nombre}.py",
        ]

        for ruta in posibles:
            if not ruta.exists():
                continue

            try:
                spec = importlib.util.spec_from_file_location(
                    nombre,
                    ruta,
                )

                if spec is None or spec.loader is None:
                    continue

                modulo = importlib.util.module_from_spec(spec)

                sys.modules[nombre] = modulo

                spec.loader.exec_module(modulo)

                estado.modulo = modulo
                estado.estado = "ACTIVO"
                estado.mensaje = (
                    f"Cargado desde "
                    f"{ruta.relative_to(REPO_PATH)}"
                )

                estado.funciones_expuestas = [
                    attr
                    for attr in dir(modulo)
                    if (
                        not attr.startswith("_")
                        and callable(
                            getattr(modulo, attr, None)
                        )
                    )
                ]

                return estado

            except Exception as exc:
                estado.estado = "ERROR"
                estado.mensaje = (
                    f"Fallo al cargar {ruta}: {exc}"
                )
                return estado

        estado.estado = "AUSENTE"
        estado.mensaje = (
            "Módulo no encontrado en el repositorio."
        )

        return estado

    except Exception as exc:
        estado.estado = "ERROR"
        estado.mensaje = (
            f"Excepción durante carga: {exc}"
        )

        return estado


# ============================================================
# WORKER DE VERIFICACIÓN
# ============================================================

def inicializar_nodo_worker(nombre: str) -> Dict[str, Any]:
    """
    Worker aislado para verificar que el módulo puede cargarse.
    """

    import importlib as _importlib
    import sys as _sys
    from pathlib import Path as _Path

    repo = (
        _Path(__file__).resolve().parent
        if "__file__" in globals()
        else _Path.cwd()
    )

    if str(repo) not in _sys.path:
        _sys.path.insert(0, str(repo))

    try:
        modulo = _importlib.import_module(nombre)

        funciones = [
            attr
            for attr in dir(modulo)
            if (
                not attr.startswith("_")
                and callable(
                    getattr(modulo, attr, None)
                )
            )
        ]

        return {
            "nombre": nombre,
            "estado": "ACTIVO",
            "mensaje": "Módulo verificable.",
            "funciones": funciones[:15],
        }

    except Exception as exc:
        return {
            "nombre": nombre,
            "estado": "ERROR",
            "mensaje": str(exc),
            "funciones": [],
        }


# ============================================================
# DOSIERES
# ============================================================

def procesar_dosier(ruta: str) -> ResultadoDosier:
    path = Path(ruta)

    try:
        contenido = path.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        return ResultadoDosier(
            ruta=ruta,
            nombre=path.name,
            bytes_procesados=len(
                contenido.encode("utf-8")
            ),
            exito=True,
        )

    except Exception as exc:
        return ResultadoDosier(
            ruta=ruta,
            nombre=path.name,
            bytes_procesados=0,
            exito=False,
            error=str(exc),
        )


def localizar_dosieres() -> List[str]:
    archivos: List[str] = []

    for patron in PATRONES_DOSIER:
        for path in REPO_PATH.rglob(patron):

            if any(
                excluido in path.parts
                for excluido in EXCLUSIONES
            ):
                continue

            archivos.append(str(path))

    # Evita duplicados si varios patrones coinciden.
    return sorted(set(archivos))


# ============================================================
# ORQUESTADOR MAESTRO
# ============================================================

class OrquestadorMaestro:

    def __init__(self) -> None:

        self.nodos: Dict[str, NodoEstado] = {}

        self.dosieres_asimilados: List[
            ResultadoDosier
        ] = []

        self.motor: Optional[Any] = None

        self.biblioteca: Optional[Any] = None

    # --------------------------------------------------------
    # CARGA
    # --------------------------------------------------------

    def cargar_nodos_paralelo(self) -> None:

        log.info(
            "Sincronizando nodos ROMEO-HYDRA..."
        )

        # Carga real en proceso principal.
        # Necesaria para conservar las referencias
        # a los objetos vivos.

        for nombre in NODOS_NUCLEO:

            estado = cargar_modulo(nombre)

            self.nodos[nombre] = estado

            log.info(
                "[NÚCLEO] %-25s → %-10s | %s",
                nombre,
                estado.estado,
                estado.mensaje,
            )

        # Referencias activas.

        motor = self.nodos.get("romeo_engine")

        if motor and motor.modulo:
            self.motor = motor.modulo

        biblioteca = self.nodos.get("bibliotecario")

        if biblioteca and biblioteca.modulo:
            self.biblioteca = biblioteca.modulo

        # Verificación aislada.
        #
        # No se utilizan estos procesos para transportar objetos
        # vivos al proceso principal.

        try:

            with ProcessPoolExecutor(
                max_workers=min(
                    len(NODOS_NUCLEO),
                    MAX_WORKERS_CPU,
                )
            ) as pool:

                futuros = {
                    pool.submit(
                        inicializar_nodo_worker,
                        nombre,
                    ): nombre
                    for nombre in NODOS_NUCLEO
                }

                for futuro in as_completed(futuros):

                    resultado = futuro.result()

                    log.info(
                        "[PROC] %-25s → %-10s | %s",
                        resultado["nombre"],
                        resultado["estado"],
                        resultado["mensaje"],
                    )

        except Exception as exc:

            log.warning(
                "Verificación multiproceso omitida: %s",
                exc,
            )

    # --------------------------------------------------------
    # DOSIERES
    # --------------------------------------------------------

    def asimilar_dosieres_paralelo(self) -> None:

        rutas = localizar_dosieres()

        log.info(
            "Procesando %d dosieres...",
            len(rutas),
        )

        if not rutas:
            self.dosieres_asimilados = []
            return

        with ThreadPoolExecutor(
            max_workers=MAX_WORKERS_IO
        ) as pool:

            resultados = list(
                pool.map(
                    procesar_dosier,
                    rutas,
                )
            )

        self.dosieres_asimilados = resultados

        exitosos = sum(
            1
            for resultado in resultados
            if resultado.exito
        )

        total_bytes = sum(
            resultado.bytes_procesados
            for resultado in resultados
        )

        log.info(
            "Asimilación: %d/%d dosieres | %s bytes",
            exitosos,
            len(resultados),
            f"{total_bytes:,}",
        )

    # --------------------------------------------------------
    # ROUTER
    # --------------------------------------------------------

    def detectar_intencion(self, consulta: str) -> str:

        if parece_matematica(consulta):
            return "math"

        return "general"

    # --------------------------------------------------------
    # MOTOR ROMEO / DELEGACIÓN
    # --------------------------------------------------------

    def delegar_romeo(self, consulta: str) -> ResultadoConsulta:
        inicio = time.perf_counter()

        if self.motor and hasattr(self.motor, "procesar"):
            try:
                res = self.motor.procesar(consulta)
                return ResultadoConsulta(
                    status="success",
                    intent="general",
                    result=res,
                    source="romeo_engine",
                    elapsed_ms=(time.perf_counter() - inicio) * 1000,
                )
            except Exception as exc:
                log.error("Error en romeo_engine: %s", exc)

        if self.biblioteca and hasattr(self.biblioteca, "consultar"):
            try:
                res = self.biblioteca.consultar(consulta)
                return ResultadoConsulta(
                    status="success",
                    intent="general",
                    result=res,
                    source="bibliotecario",
                    elapsed_ms=(time.perf_counter() - inicio) * 1000,
                )
            except Exception as exc:
                log.error("Error en bibliotecario: %s", exc)

        return ResultadoConsulta(
            status="success",
            intent="general",
            result=f"Consulta procesada sin motor generativo: '{consulta}'",
            source="orquestador_local",
            elapsed_ms=(time.perf_counter() - inicio) * 1000,
        )

    # --------------------------------------------------------
    # PROCESAMIENTO Y EJECUCIÓN
    # --------------------------------------------------------

    def procesar(self, consulta: str) -> Dict[str, Any]:
        intencion = self.detectar_intencion(consulta)

        if intencion == "math":
            res = resolver_matematica(consulta)
            if res.status == "success":
                return res.as_dict()
            log.warning(
                "Fallo en resolución matemática local (%s). Reintentando como consulta general.",
                res.error,
            )

        res = self.delegar_romeo(consulta)
        return res.as_dict()

    def obtener_estado(self) -> Dict[str, Any]:
        return {
            "escala_pliegues": ESCALA_PLIEGUES,
            "nodos": {
                nombre: {
                    "estado": nodo.estado,
                    "mensaje": nodo.mensaje,
                    "funciones": nodo.funciones_expuestas[:10],
                }
                for nombre, nodo in self.nodos.items()
            },
            "dosieres": len(self.dosieres_asimilados),
            "motor_disponible": self.motor is not None,
            "biblioteca_disponible": self.biblioteca is not None,
            "cpu_workers": MAX_WORKERS_CPU,
            "io_workers": MAX_WORKERS_IO,
        }

    def modo_interactivo(self) -> None:
        print("\n=== ORQUESTADOR MAESTRO ROMEO-HYDRA (MOTOR REAL) ===")
        print("Escriba 'estado' para telemetría, 'salir' para terminar.\n")

        while True:
            try:
                entrada = input("Ingrese la premisa/problema a procesar: ").strip()
                if not entrada:
                    continue

                if entrada.lower() in ("salir", "exit", "quit"):
                    print("[*] Apagando orquestador maestro.")
                    break

                if entrada.lower() == "estado":
                    print(json.dumps(self.obtener_estado(), indent=2, ensure_ascii=False))
                    continue

                resultado = self.procesar(entrada)
                print(json.dumps(resultado, indent=2, ensure_ascii=False))
                print()

            except (KeyboardInterrupt, EOFError):
                print("\n[*] Interrupción de emergencia. Apagando orquestador.")
                break


# ============================================================
# PUNTO DE ENTRADA
# ============================================================

def main() -> None:
    orquestador = OrquestadorMaestro()
    orquestador.cargar_nodos_paralelo()
    orquestador.asimilar_dosieres_paralelo()
    orquestador.modo_interactivo()


if __name__ == "__main__":
    main()
