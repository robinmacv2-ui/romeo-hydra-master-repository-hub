#!/usr/bin/env python3
"""
ORQUESTADOR MAESTRO - ROMEO-HYDRA
=================================

Router principal del sistema.

Objetivos:
    1. Cargar dinámicamente los nodos ROMEO-HYDRA.
    2. Detectar la intención de la consulta.
    3. Resolver matemáticas de forma local y determinista.
    4. Resolver cualquier paradoja, premisa filosófica o consulta de
       ciencias exactas (matemáticas, genética, astrofísica, geografía)
       vía MotorRazonamientoUniversal.
    5. Historia → solo resolución lógica (sin hechos afirmados).
    6. Delegar el resto al motor ROMEO/Bibliotecario.
    7. No ejecutar eval() sobre entrada del usuario.
    8. Mantener activo el invariante Eukaris (regeneración / abundancia).
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

from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

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

PATRONES_DOSIER = ["*.txt", "*.md", "*.json", "*.yaml", "*.yml"]
EXCLUSIONES = {".git", "hydra_env_64", "__pycache__", "_extracted_zips", ".venv", "venv", "node_modules", ".mypy_cache"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("RomeoHydra")


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


# ── Matemáticas locales ──────────────────────────────────────

PALABRAS_NUMERO = {"cero": "0", "uno": "1", "dos": "2", "tres": "3", "cuatro": "4",
                   "cinco": "5", "seis": "6", "siete": "7", "ocho": "8", "nueve": "9", "diez": "10"}
PALABRAS_OPERADOR = {"más": "+", "mas": "+", "menos": "-", "por": "*", "multiplicado": "*",
                     "multiplicada": "*", "dividido": "/", "dividida": "/", "entre": "/",
                     "modulo": "%", "módulo": "%"}
PREFIJOS_MATEMATICOS = ("cuanto es", "cuánto es", "cuanto da", "cuánto da", "calcula",
                        "calcular", "resuelve", "resolver", "resultado de")
PATRON_NUMERO = re.compile(
    r"(?<![A-Za-zÁÉÍÓÚáéíóúÑñ])(cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?![A-Za-zÁÉÍÓÚáéíóúÑñ])",
    re.IGNORECASE,
)


def normalizar_texto(texto: str) -> str:
    return re.sub(r"\s+", " ", texto.strip().lower())


def normalizar_matematica(texto: str) -> str:
    texto = normalizar_texto(texto)
    for prefijo in PREFIJOS_MATEMATICOS:
        if texto.startswith(prefijo):
            texto = texto[len(prefijo):].strip()
            break
    texto = PATRON_NUMERO.sub(lambda m: PALABRAS_NUMERO[m.group(1).lower()], texto)
    for palabra, op in sorted(PALABRAS_OPERADOR.items(), key=lambda i: len(i[0]), reverse=True):
        texto = re.sub(rf"\b{re.escape(palabra)}\b", f" {op} ", texto)
    texto = texto.replace("¿", " ").replace("?", " ")
    return re.sub(r"\s+", " ", texto).strip()


def parece_matematica(texto: str) -> bool:
    n = normalizar_texto(texto)
    tiene_prefijo = any(n.startswith(p) for p in PREFIJOS_MATEMATICOS)
    tiene_operador = bool(re.search(r"\b(más|mas|menos|por|entre|dividido|multiplicado)\b", n))
    tiene_simbolo = bool(re.search(r"[+\-*/%]", n))
    tiene_numero = bool(re.search(r"\d+|\b(cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b", n))
    return tiene_numero and (tiene_operador or tiene_simbolo or tiene_prefijo)


OPERADORES_BINARIOS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
                       ast.Div: operator.truediv, ast.FloorDiv: operator.floordiv,
                       ast.Mod: operator.mod, ast.Pow: operator.pow}
OPERADORES_UNARIOS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def evaluar_nodo(nodo: ast.AST):
    if isinstance(nodo, ast.Constant):
        v = nodo.value
        if isinstance(v, bool):
            raise ValueError("Booleanos no permitidos.")
        if isinstance(v, (int, float)):
            return v
        raise ValueError(f"Constante no permitida: {type(v).__name__}")
    if isinstance(nodo, ast.UnaryOp):
        op = OPERADORES_UNARIOS.get(type(nodo.op))
        if op is None:
            raise ValueError("Operador unario no permitido.")
        return op(evaluar_nodo(nodo.operand))
    if isinstance(nodo, ast.BinOp):
        op = OPERADORES_BINARIOS.get(type(nodo.op))
        if op is None:
            raise ValueError(f"Operador no permitido: {type(nodo.op).__name__}")
        a, b = evaluar_nodo(nodo.left), evaluar_nodo(nodo.right)
        if isinstance(nodo.op, ast.Pow) and abs(b) > 1000:
            raise ValueError("Exponente demasiado grande.")
        return op(a, b)
    raise ValueError(f"Nodo AST no permitido: {type(nodo).__name__}")


def resolver_matematica(texto: str) -> ResultadoConsulta:
    inicio = time.perf_counter()
    try:
        expresion = normalizar_matematica(texto)
        if not expresion:
            raise ValueError("Expresión matemática vacía.")
        if not re.fullmatch(r"[0-9+\-*/%().\s]+", expresion):
            raise ValueError(f"Tokens no matemáticos: {expresion!r}")
        resultado = evaluar_nodo(ast.parse(expresion, mode="eval").body)
        return ResultadoConsulta(status="success", intent="math", result=resultado,
                                 expression=expresion, source="local_math_engine",
                                 elapsed_ms=(time.perf_counter() - inicio) * 1000)
    except ZeroDivisionError:
        return ResultadoConsulta(status="error", intent="math", error="División entre cero.",
                                 elapsed_ms=(time.perf_counter() - inicio) * 1000)
    except (SyntaxError, ValueError, OverflowError) as exc:
        return ResultadoConsulta(status="error", intent="math", error=str(exc),
                                 elapsed_ms=(time.perf_counter() - inicio) * 1000)


# ── Carga de módulos ─────────────────────────────────────────

def cargar_modulo(nombre: str) -> NodoEstado:
    estado = NodoEstado(nombre=nombre)
    try:
        modulo = importlib.import_module(nombre)
        estado.modulo = modulo
        estado.estado = "ACTIVO"
        estado.mensaje = "Importado correctamente."
        estado.funciones_expuestas = [a for a in dir(modulo) if not a.startswith("_") and callable(getattr(modulo, a, None))]
        return estado
    except ModuleNotFoundError:
        posibles = [
            REPO_PATH / f"{nombre}.py",
            REPO_PATH / nombre / "__init__.py",
            REPO_PATH / "core" / f"{nombre}.py",
            REPO_PATH / "core" / "logica_filosofica" / f"{nombre}.py",
            REPO_PATH / "core" / "razonamiento_universal" / f"{nombre}.py",
        ]
        for ruta in posibles:
            if not ruta.exists():
                continue
            try:
                spec = importlib.util.spec_from_file_location(nombre, ruta)
                if spec is None or spec.loader is None:
                    continue
                modulo = importlib.util.module_from_spec(spec)
                sys.modules[nombre] = modulo
                spec.loader.exec_module(modulo)
                estado.modulo = modulo
                estado.estado = "ACTIVO"
                estado.mensaje = f"Cargado desde {ruta.relative_to(REPO_PATH)}"
                estado.funciones_expuestas = [a for a in dir(modulo) if not a.startswith("_") and callable(getattr(modulo, a, None))]
                return estado
            except Exception as exc:
                estado.estado = "ERROR"
                estado.mensaje = f"Fallo al cargar {ruta}: {exc}"
                return estado
        estado.estado = "AUSENTE"
        estado.mensaje = "Módulo no encontrado."
        return estado
    except Exception as exc:
        estado.estado = "ERROR"
        estado.mensaje = str(exc)
        return estado


def inicializar_nodo_worker(nombre: str) -> Dict[str, Any]:
    import importlib as _il, sys as _sys
    from pathlib import Path as _P
    repo = _P(__file__).resolve().parent if "__file__" in globals() else _P.cwd()
    if str(repo) not in _sys.path:
        _sys.path.insert(0, str(repo))
    try:
        m = _il.import_module(nombre)
        funcs = [a for a in dir(m) if not a.startswith("_") and callable(getattr(m, a, None))]
        return {"nombre": nombre, "estado": "ACTIVO", "mensaje": "OK", "funciones": funcs[:15]}
    except Exception as e:
        return {"nombre": nombre, "estado": "ERROR", "mensaje": str(e), "funciones": []}


def procesar_dosier(ruta: str) -> ResultadoDosier:
    path = Path(ruta)
    try:
        c = path.read_text(encoding="utf-8", errors="ignore")
        return ResultadoDosier(ruta=ruta, nombre=path.name, bytes_procesados=len(c.encode()), exito=True)
    except Exception as e:
        return ResultadoDosier(ruta=ruta, nombre=path.name, bytes_procesados=0, exito=False, error=str(e))


def localizar_dosieres() -> List[str]:
    archivos = []
    for p in PATRONES_DOSIER:
        for path in REPO_PATH.rglob(p):
            if any(x in path.parts for x in EXCLUSIONES):
                continue
            archivos.append(str(path))
    return sorted(set(archivos))


# ── Orquestador ──────────────────────────────────────────────

class OrquestadorMaestro:

    def __init__(self) -> None:
        self.nodos: Dict[str, NodoEstado] = {}
        self.dosieres_asimilados: List[ResultadoDosier] = []
        self.motor: Optional[Any] = None
        self.biblioteca: Optional[Any] = None
        self.motor_filosofico: Optional[Any] = None
        self.motor_universal: Optional[Any] = None
        self.invariante_eukaris: Optional[Dict[str, Any]] = None

    def cargar_nodos_paralelo(self) -> None:
        log.info("Sincronizando nodos ROMEO-HYDRA...")
        for nombre in NODOS_NUCLEO:
            estado = cargar_modulo(nombre)
            self.nodos[nombre] = estado
            log.info("[NÚCLEO] %-25s → %-10s | %s", nombre, estado.estado, estado.mensaje)

        if self.nodos.get("romeo_engine") and self.nodos["romeo_engine"].modulo:
            self.motor = self.nodos["romeo_engine"].modulo
        if self.nodos.get("bibliotecario") and self.nodos["bibliotecario"].modulo:
            self.biblioteca = self.nodos["bibliotecario"].modulo

        try:
            from core.logica_filosofica import MotorLogicaFilosofica
            self.motor_filosofico = MotorLogicaFilosofica()
            log.info("[NÚCLEO] %-25s → ACTIVO     | MotorLogicaFilosofica", "logica_filosofica")
        except Exception as e:
            log.warning("logica_filosofica: %s", e)

        try:
            from core.razonamiento_universal import MotorRazonamientoUniversal
            self.motor_universal = MotorRazonamientoUniversal()
            log.info("[NÚCLEO] %-25s → ACTIVO     | MotorRazonamientoUniversal v%s",
                     "razonamiento_universal", getattr(self.motor_universal, "version", "?"))
        except Exception as e:
            log.warning("razonamiento_universal: %s", e)

        # Invariante Eukaris
        try:
            from core.eukaris_affirmations import compilar_en_nucleo
            self.invariante_eukaris = compilar_en_nucleo()
            total = self.invariante_eukaris["invariante"]["total_afirmaciones"]
            log.info("[NÚCLEO] %-25s → ACTIVO     | %d afirmaciones (Dra. Eukaris Zerpa)",
                     "eukaris_affirmations", total)
        except Exception as e:
            log.warning("eukaris_affirmations: %s", e)

        try:
            with ProcessPoolExecutor(max_workers=min(len(NODOS_NUCLEO), MAX_WORKERS_CPU)) as pool:
                futuros = {pool.submit(inicializar_nodo_worker, n): n for n in NODOS_NUCLEO}
                for f in as_completed(futuros):
                    r = f.result()
                    log.info("[PROC] %-25s → %-10s | %s", r["nombre"], r["estado"], r["mensaje"])
        except Exception as e:
            log.warning("Verificación multiproceso omitida: %s", e)

    def asimilar_dosieres_paralelo(self) -> None:
        rutas = localizar_dosieres()
        log.info("Procesando %d dosieres...", len(rutas))
        if not rutas:
            self.dosieres_asimilados = []
            return
        with ThreadPoolExecutor(max_workers=MAX_WORKERS_IO) as pool:
            self.dosieres_asimilados = list(pool.map(procesar_dosier, rutas))
        ok = sum(1 for r in self.dosieres_asimilados if r.exito)
        total = sum(r.bytes_procesados for r in self.dosieres_asimilados)
        log.info("Asimilación: %d/%d | %s bytes", ok, len(self.dosieres_asimilados), f"{total:,}")

    def detectar_intencion(self, consulta: str) -> str:
        n = normalizar_texto(consulta)
        if n in ("eukaris", "afirmaciones", "mantra", "regeneracion", "regeneración"):
            return "eukaris"
        if parece_matematica(consulta):
            return "math"
        return "universal"

    def responder_eukaris(self) -> ResultadoConsulta:
        inicio = time.perf_counter()
        if not self.invariante_eukaris:
            return ResultadoConsulta(
                status="error", intent="eukaris",
                error="Invariante Eukaris no cargado",
                elapsed_ms=(time.perf_counter() - inicio) * 1000,
            )
        return ResultadoConsulta(
            status="success",
            intent="eukaris",
            result={
                "mantra": self.invariante_eukaris["mantra_diario"],
                "total": self.invariante_eukaris["invariante"]["total_afirmaciones"],
                "meta": self.invariante_eukaris["invariante"]["meta"],
                "nota": self.invariante_eukaris["nota"],
            },
            source="core.eukaris_affirmations",
            elapsed_ms=(time.perf_counter() - inicio) * 1000,
        )

    def delegar_universal(self, consulta: str) -> ResultadoConsulta:
        inicio = time.perf_counter()
        if self.motor_universal is None:
            if self.motor_filosofico:
                try:
                    res = self.motor_filosofico.procesar(consulta)
                    return ResultadoConsulta(status="success", intent="filosofia", result=res,
                                             source="core.logica_filosofica",
                                             elapsed_ms=(time.perf_counter() - inicio) * 1000)
                except Exception:
                    pass
            return ResultadoConsulta(status="error", intent="universal",
                                     error="MotorRazonamientoUniversal no disponible",
                                     elapsed_ms=(time.perf_counter() - inicio) * 1000)
        try:
            res = self.motor_universal.procesar(consulta)
            dominio = res.get("dominio_detectado", res.get("dominio", "general"))
            return ResultadoConsulta(
                status="success",
                intent=dominio,
                result=res,
                source="core.razonamiento_universal.MotorRazonamientoUniversal",
                elapsed_ms=(time.perf_counter() - inicio) * 1000,
            )
        except Exception as exc:
            log.error("Error motor universal: %s", exc)
            return ResultadoConsulta(status="error", intent="universal", error=str(exc),
                                     elapsed_ms=(time.perf_counter() - inicio) * 1000)

    def delegar_romeo(self, consulta: str) -> ResultadoConsulta:
        inicio = time.perf_counter()
        if self.motor and hasattr(self.motor, "procesar"):
            try:
                res = self.motor.procesar(consulta)
                return ResultadoConsulta(status="success", intent="general", result=res,
                                         source="romeo_engine",
                                         elapsed_ms=(time.perf_counter() - inicio) * 1000)
            except Exception as e:
                log.error("romeo_engine: %s", e)
        if self.biblioteca and hasattr(self.biblioteca, "consultar"):
            try:
                res = self.biblioteca.consultar(consulta)
                return ResultadoConsulta(status="success", intent="general", result=res,
                                         source="bibliotecario",
                                         elapsed_ms=(time.perf_counter() - inicio) * 1000)
            except Exception as e:
                log.error("bibliotecario: %s", e)
        return ResultadoConsulta(status="success", intent="general",
                                 result=f"Consulta asimilada: '{consulta}'",
                                 source="orquestador_local",
                                 elapsed_ms=(time.perf_counter() - inicio) * 1000)

    def procesar(self, consulta: str) -> Dict[str, Any]:
        intencion = self.detectar_intencion(consulta)

        if intencion == "eukaris":
            return self.responder_eukaris().as_dict()

        if intencion == "math":
            res = resolver_matematica(consulta)
            if res.status == "success":
                return res.as_dict()
            log.warning("Math local falló (%s). Pasando a motor universal.", res.error)

        res = self.delegar_universal(consulta)
        if res.status == "success":
            return res.as_dict()

        return self.delegar_romeo(consulta).as_dict()

    def obtener_estado(self) -> Dict[str, Any]:
        return {
            "escala_pliegues": ESCALA_PLIEGUES,
            "nodos": {n: {"estado": nd.estado, "mensaje": nd.mensaje, "funciones": nd.funciones_expuestas[:10]}
                      for n, nd in self.nodos.items()},
            "dosieres": len(self.dosieres_asimilados),
            "motor_disponible": self.motor is not None,
            "biblioteca_disponible": self.biblioteca is not None,
            "motor_filosofico_disponible": self.motor_filosofico is not None,
            "motor_universal_disponible": self.motor_universal is not None,
            "eukaris_disponible": self.invariante_eukaris is not None,
            "eukaris_total_afirmaciones": (
                self.invariante_eukaris["invariante"]["total_afirmaciones"]
                if self.invariante_eukaris else 0
            ),
            "cpu_workers": MAX_WORKERS_CPU,
            "io_workers": MAX_WORKERS_IO,
        }

    def modo_interactivo(self) -> None:
        print("\n=== ORQUESTADOR MAESTRO ROMEO-HYDRA (UNIVERSAL + EUKARIS) ===")
        print("Matemáticas | Paradojas | Filosofía | Genética | Astrofísica | Geografía | Historia(lógica)")
        print("Eukaris: eukaris | afirmaciones | mantra | regeneracion")
        print("Escriba 'estado' o 'salir'.\n")
        while True:
            try:
                entrada = input("Premisa: ").strip()
                if not entrada:
                    continue
                if entrada.lower() in ("salir", "exit", "quit"):
                    print("[*] Apagando.")
                    break
                if entrada.lower() == "estado":
                    print(json.dumps(self.obtener_estado(), indent=2, ensure_ascii=False))
                    continue
                print(json.dumps(self.procesar(entrada), indent=2, ensure_ascii=False))
                print()
            except (KeyboardInterrupt, EOFError):
                print("\n[*] Interrupción.")
                break


def main() -> None:
    orch = OrquestadorMaestro()
    orch.cargar_nodos_paralelo()
    orch.asimilar_dosieres_paralelo()
    orch.modo_interactivo()


if __name__ == "__main__":
    main()
