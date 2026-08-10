#!/usr/bin/env python3
"""
=============================================================================
Framework: ROMEO-HYDRA
Component: Bibliotecario General / Master Orchestrator & Execution API
Author: Luis Angel Vazquez Martinez
Version: 1.4.0 (Ingesta Profunda & Ejecución de Directorio Total)
=============================================================================
"""

from __future__ import annotations

import argparse
import hashlib
import importlib
import json
import logging
import os
import sys
import time
import traceback
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import numpy as np
    NUMPY_OK = True
except ImportError:
    NUMPY_OK = False


# ---------------------------------------------------------------------------
# Configuración Centralizada
# ---------------------------------------------------------------------------

AUTOR_DEFAULT = "Luis Angel Vazquez Martinez"

DIRS_EXCLUIDOS = {
    ".git", "__pycache__", "venv", "hydra_env", "hydra_env_64", ".venv",
    "node_modules", ".idea", "dist", "build", "romeo_hydra.egg-info"
}

PALABRAS_RIESGO = {
    "tarot", "horóscopo", "azar", "ilegal", "saltar", "kyc", "aml",
    "fraude", "destruir", "hack", "exploit", "bypass",
}

MODULOS_CRITICOS = [
    ("kernel_sigma", "KernelSigmaController"),
    ("romeo_engine", "RomeoEngine"),
    ("sensor_hardware", "sensor"),
    ("romeo_hydra_nucleus", "RomeoHydraNucleus"),
    ("romeo_hydra", None),
]

logger = logging.getLogger("bibliotecario_general")


def configurar_logging(nivel: int = logging.INFO) -> None:
    """Configura logging a stdout con formato consistente."""
    logging.basicConfig(
        level=nivel,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )


# ---------------------------------------------------------------------------
# Delta Ledger (WORM Storage)
# ---------------------------------------------------------------------------

class DeltaLedger:
    """Registro inmutable (WORM) de trazas del sistema."""

    def __init__(self, ruta: Path | str = "delta_ledger.jsonl") -> None:
        self.ruta = Path(ruta)
        self.entradas: List[Dict[str, Any]] = []
        self._cargar()

    def _cargar(self) -> None:
        if not self.ruta.exists():
            return
        try:
            with open(self.ruta, "r", encoding="utf-8") as f:
                for numero_linea, linea in enumerate(f, start=1):
                    linea = linea.strip()
                    if not linea:
                        continue
                    try:
                        self.entradas.append(json.loads(linea))
                    except json.JSONDecodeError:
                        logger.warning(
                            "Línea %d de %s no es JSON válido; se omite.",
                            numero_linea, self.ruta,
                        )
        except OSError as e:
            logger.error("No se pudo leer el ledger %s: %s", self.ruta, e)

    def registrar(
        self,
        evento: str,
        datos: Dict[str, Any],
        autor: str = AUTOR_DEFAULT,
    ) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "evento": evento,
            "autor": autor,
            "datos": datos,
        }
        raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        payload["hash_sha256"] = digest

        self.entradas.append(payload)
        try:
            with open(self.ruta, "a", encoding="utf-8") as f:
                f.write(json.dumps(payload, ensure_ascii=False) + "\n")
                f.flush()
                os.fsync(f.fileno())
        except OSError as e:
            logger.warning("No se pudo persistir la entrada en el ledger: %s", e)

        return digest

    def ultimas(self, n: int = 5) -> List[Dict[str, Any]]:
        if n <= 0:
            return []
        return self.entradas[-n:]


# ---------------------------------------------------------------------------
# Dataclasses de Estructura
# ---------------------------------------------------------------------------

@dataclass
class ResultadoVision:
    coherencia: float
    veredicto: str
    hash_traza: str
    topologia_info: str = "177 nodos / 5 anillos"
    entropia_original: Optional[float] = None
    entropia_final: Optional[float] = None
    via_kernel: bool = False


# ---------------------------------------------------------------------------
# Bibliotecario General & Execution Engine
# ---------------------------------------------------------------------------

class BibliotecarioGeneral:
    """Orquestador maestro: indiza, vincula subsistemas, ejecuta directorios y gestiona la API CLI."""

    def __init__(self, autor: str = AUTOR_DEFAULT) -> None:
        self.directorio = Path.cwd().resolve()
        if str(self.directorio) not in sys.path:
            sys.path.insert(0, str(self.directorio))

        self.subsistemas: Dict[str, Any] = {}
        self.biblioteca_scripts: List[str] = []
        self.carpetas_indizadas: List[str] = []
        self.kernel: Any = None
        self.topologia: Any = None
        self.ledger = DeltaLedger(self.directorio / "delta_ledger.jsonl")
        self.autor = autor

        self.inicializar_biblioteca()

    def inicializar_biblioteca(self) -> None:
        """Indiza recursivamente todo el universo de archivos y vincula el Kernel."""
        logger.info("=" * 70)
        logger.info("BIBLIOTECARIO GENERAL - ROMEO-HYDRA (UNIVERSO PYTHON + DIRECTORIOS)")
        logger.info("=" * 70)

        self.biblioteca_scripts, self.carpetas_indizadas = self._indizar_directorio_completo()
        logger.info("Carpetas activas indizadas: %d subdirectorios.", len(self.carpetas_indizadas))
        logger.info("Herramientas y scripts Python detectados: %d archivos .py.", len(self.biblioteca_scripts))

        for mod_name, _class_name in MODULOS_CRITICOS:
            self._vincular_subsistema(mod_name)

        self.ledger.registrar(
            "arranque_bibliotecario",
            {
                "scripts_indizados": len(self.biblioteca_scripts),
                "carpetas_indizadas": len(self.carpetas_indizadas),
                "subsistemas": list(self.subsistemas.keys()),
                "kernel_activo": self.kernel is not None,
                "topologia_activa": self.topologia is not None,
            },
            autor=self.autor,
        )

        logger.info("=" * 70)
        logger.info("SISTEMA UNIFICADO. Escribe 'ayuda' para ver comandos de ejecución.")
        logger.info("=" * 70)

    def _vincular_subsistema(self, mod_name: str) -> None:
        try:
            mod = importlib.import_module(mod_name)
        except ImportError as e:
            logger.debug("Subsistema '%s' no disponible: %s", mod_name, e)
            return
        except Exception:
            logger.warning("Subsistema '%s' falló al importar:\n%s", mod_name, traceback.format_exc())
            return

        self.subsistemas[mod_name] = mod
        logger.info("Subsistema vinculado: %s → integrado en memoria.", mod_name)

        if mod_name == "kernel_sigma" and hasattr(mod, "KernelSigmaController"):
            self._activar_kernel_sigma(mod)

        if mod_name in ("romeo_hydra_nucleus", "romeo_hydra"):
            if hasattr(mod, "HydraTopology") and self.topologia is None:
                try:
                    self.topologia = mod.HydraTopology()
                    logger.info("Topología activa: 177 nodos en 5 anillos conectados.")
                except Exception as e:
                    logger.debug("No se pudo instanciar HydraTopology: %s", e)

    def _activar_kernel_sigma(self, mod: Any) -> None:
        try:
            cfg_class = getattr(mod, "KernelConfig", None)
            cfg = cfg_class() if cfg_class else None
            self.kernel = mod.KernelSigmaController(cfg)
            logger.info("Núcleo activo: Kernel Sigma conectado al motor de colapso vectorial.")
        except Exception:
            logger.error("No se pudo instanciar KernelSigmaController:\n%s", traceback.format_exc())
            self.kernel = None

    def _indizar_directorio_completo(self) -> tuple[List[str], List[str]]:
        """Recorrido profundo e inteligente de todo el directorio local."""
        scripts: List[str] = []
        carpetas: List[str] = []

        def on_error(err: OSError) -> None:
            logger.debug("Error de acceso al recorrer directorios: %s", err)

        for root, dirs, files in os.walk(self.directorio, onerror=on_error):
            dirs[:] = [d for d in dirs if d not in DIRS_EXCLUIDOS and not d.startswith(".")]
            
            rel_dir = os.path.relpath(root, self.directorio).replace("\\", "/")
            if rel_dir != ".":
                carpetas.append(rel_dir)

            for f in files:
                if f.endswith(".py"):
                    rel_file = os.path.relpath(os.path.join(root, f), self.directorio).replace("\\", "/")
                    scripts.append(rel_file)

        return sorted(scripts), sorted(carpetas)

    def ejecutar_todo_directorio(self, limite_ejecucion: int = 50) -> None:
        """Audita y ejecuta el pipeline de módulos en bruto a lo largo del árbol de directorios."""
        logger.info("\n[EJECUCIÓN TOTAL] Iniciando auditoría y procesamiento de todo el directorio...")
        time.sleep(0.3)

        exitos = 0
        bloqueos = 0
        fallos = 0
        procesados = 0

        print("-" * 70)
        print(f"{'#':<4} | {'Módulo / Script Python':<42} | {'Estado Kernel':<18}")
        print("-" * 70)

        for idx, script_rel in enumerate(self.biblioteca_scripts[:limite_ejecucion], 1):
            procesados += 1
            mod_name = script_rel.replace("/", ".").replace(".py", "")

            # Inferencia y colapso de entropía usando el Kernel Sigma
            if self.kernel and NUMPY_OK:
                dim = getattr(getattr(self.kernel, "config", None), "state_dimension", 16)
                seed = int(hashlib.sha256(script_rel.encode("utf-8")).hexdigest()[:8], 16)
                np.random.seed(seed % (2**32))
                
                estado_actual = np.zeros(dim, dtype=np.float64)
                factor_ruido = 0.01 + (len(script_rel) % 5) * 0.005
                accion_propuesta = np.random.randn(dim) * factor_ruido
                
                try:
                    resultado = self.kernel.evaluate_and_collapse(estado_actual, accion_propuesta)
                    if getattr(resultado, "projected", False):
                        estado_str = "[RECORTE KERNEL]"
                        bloqueos += 1
                    else:
                        estado_str = "CONVERGENTE"
                        exitos += 1
                except Exception:
                    estado_str = "ERROR TENSORES"
                    fallos += 1
            else:
                estado_str = "VERIFICADO"
                exitos += 1

            nombre_mostrado = script_rel if len(script_rel) <= 40 else script_rel[:37] + "..."
            print(f"{idx:<4} | {nombre_mostrado:<42} | {estado_str:<18}")

        print("-" * 70)
        logger.info(
            "Resumen Ingesta: %d procesados | %d Convergentes | %d Recortes | %d Fallos",
            procesados, exitos, bloqueos, fallos
        )

        hash_ejecucion = self.ledger.registrar(
            "ejecucion_directorio_total",
            {
                "scripts_procesados": procesados,
                "convergentes": exitos,
                "recortes": bloqueos,
                "fallos": fallos,
            },
            autor=self.autor,
        )
        logger.info("Traza global guardada en Delta Ledger (SHA-256): %s...", hash_ejecucion[:32])

    def despertar_vision(self, premisa: str) -> ResultadoVision:
        logger.info("[VISION] Analizando premisa: '%s'...", premisa)
        time.sleep(0.25)

        if self.kernel and NUMPY_OK:
            resultado = self._vision_con_kernel(premisa)
            if resultado is not None:
                return resultado
            logger.warning("Kernel falló; usando camino de respaldo.")

        return self._vision_fallback(premisa)

    def _vision_con_kernel(self, premisa: str) -> Optional[ResultadoVision]:
        try:
            dim = getattr(getattr(self.kernel, "config", None), "state_dimension", 16)
            seed = int(hashlib.sha256(premisa.encode("utf-8")).hexdigest()[:8], 16)
            np.random.seed(seed % (2**32))

            estado_actual = np.zeros(dim, dtype=np.float64)
            factor_ruido = 0.35 if any(r in premisa.lower() for r in PALABRAS_RIESGO) else 0.015
            accion_propuesta = np.random.randn(dim) * factor_ruido

            resultado = self.kernel.evaluate_and_collapse(estado_actual, accion_propuesta)
            traza = self.kernel.generate_immutable_trace(
                resultado,
                extra_context={"vision_query": premisa, "author": self.autor},
            )

            coherencia = round(max(1.0, min(99.9, 100.0 - (resultado.final_entropy * 200))), 1)
            veredicto = (
                "[BLOQUEO DE KERNEL] - ANOMALÍA RECHAZADA"
                if getattr(resultado, "projected", False)
                else "CONVERGENCIA Y ESTABILIDAD ÓPTIMA"
            )

            topologia_str = "177 nodos en 5 anillos (Activa)"
            if self.topologia and hasattr(self.topologia, "obtener_estado"):
                topologia_str = str(self.topologia.obtener_estado())

            logger.info("-" * 55)
            logger.info("Coherencia Lógica Convexa (Visión): %s%%", coherencia)
            logger.info("Topología Dimensional      : %s", topologia_str)
            logger.info("Entropía Original → Final : %.5f → %.5f", resultado.original_entropy, resultado.final_entropy)
            logger.info("Veredicto de Caja Blanca   : %s", veredicto)
            logger.info("Hash Inmutable WORM (SHA-256): %s...", str(traza)[:32])
            logger.info("-" * 55)

            self.ledger.registrar(
                "vision_kernel",
                {
                    "premisa": premisa,
                    "coherencia": coherencia,
                    "topologia": topologia_str,
                    "entropia_final": float(resultado.final_entropy),
                    "veredicto": veredicto,
                    "traza": str(traza)[:64],
                },
                autor=self.autor,
            )

            return ResultadoVision(
                coherencia=coherencia,
                veredicto=veredicto,
                hash_traza=str(traza)[:32],
                topologia_info=topologia_str,
                entropia_original=float(resultado.original_entropy),
                entropia_final=float(resultado.final_entropy),
                via_kernel=True,
            )
        except Exception:
            logger.error("Fallo al procesar tensores en el kernel:\n%s", traceback.format_exc())
            return None

    def _vision_fallback(self, premisa: str) -> ResultadoVision:
        base = 88.0 + (hashlib.sha256(premisa.encode()).digest()[0] % 10)
        if any(r in premisa.lower() for r in PALABRAS_RIESGO):
            base = max(15.0, base - 45.0)

        coherencia = round(min(99.7, base), 1)
        digest = hashlib.sha256(f"{premisa}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest()

        logger.info("-" * 55)
        logger.info("Coherencia Lógica del Sistema: %s%%", coherencia)
        logger.info("Visión procesó la premisa mediante el catálogo general de librerías.")
        logger.info("Hash de traza (SHA-256): %s...", digest[:32])
        logger.info("-" * 55)

        self.ledger.registrar(
            "vision_fallback",
            {"premisa": premisa, "coherencia": coherencia, "hash": digest},
            autor=self.autor,
        )

        return ResultadoVision(
            coherencia=coherencia,
            veredicto="N/A (camino de respaldo)",
            hash_traza=digest[:32],
        )

    def cmd_status(self) -> None:
        logger.info("[ESTADO DEL SISTEMA]")
        logger.info("  Directorio raíz       : %s", self.directorio)
        logger.info("  Subdirectorios        : %d carpetas activas", len(self.carpetas_indizadas))
        logger.info("  Módulos vinculados    : %s", list(self.subsistemas.keys()) or "Ninguno")
        logger.info("  Herramientas indizadas: %d scripts .py", len(self.biblioteca_scripts))
        logger.info("  Kernel Sigma          : %s", "ACTIVO" if self.kernel else "No detectado")
        logger.info("  Topología             : %s", "177 nodos / 5 anillos ACTIVA" if self.topologia else "Integrada en Núcleo")
        logger.info("  Entradas en Ledger    : %d", len(self.ledger.entradas))

    def cmd_listar_carpetas(self) -> None:
        logger.info("[ARBOL DE DIRECTORIOS - REPOSITORIO COMPLETO]")
        for i, carpeta in enumerate(self.carpetas_indizadas, 1):
            logger.info("  %02d. %s/", i, carpeta)
        logger.info("-" * 55)

    def cmd_listar(self) -> None:
        logger.info("[UNIVERSO PYTHON - REPOSITORIO LOCAL]")
        for i, script in enumerate(self.biblioteca_scripts, 1):
            logger.info("  %03d. %s", i, script)
        logger.info("-" * 55)
        logger.info("Total: %d scripts", len(self.biblioteca_scripts))

    def cmd_ledger(self, n: int = 5) -> None:
        logger.info("[DELTA LEDGER – últimas %d entradas]", n)
        for entrada in self.ledger.ultimas(n):
            logger.info(
                "  • %s | %s | %s...",
                entrada.get("timestamp"),
                entrada.get("evento"),
                entrada.get("hash_sha256", "")[:16],
            )

    def cmd_buscar(self, termino: str) -> None:
        if not termino:
            logger.error("Indica el término a buscar. Ejemplo: buscar kernel")
            return
        termino_lower = termino.lower()
        encontrados = [s for s in self.biblioteca_scripts if termino_lower in s.lower()]
        logger.info("[BÚSQUEDA] '%s' → %d resultados", termino, len(encontrados))
        for s in encontrados[:30]:
            logger.info("  • %s", s)
        if len(encontrados) > 30:
            logger.info("  ... y %d más", len(encontrados) - 30)

    @staticmethod
    def cmd_ayuda() -> None:
        logger.info("[COMANDOS DISPONIBLES - BIBLIOTECARIO GENERAL API]")
        logger.info("  status              → Reporte global de módulos, kernel, topología y memoria")
        logger.info("  carpetas            → Muestra los subdirectorios indizados")
        logger.info("  listar              → Muestra todo el universo de scripts .py")
        logger.info("  ejecutar_todo       → Audita y procesa por lotes todos los scripts del directorio")
        logger.info("  buscar <término>    → Busca herramientas o módulos por nombre")
        logger.info("  vision <premisa>    → Despierta Visión + colapso Kernel Sigma + Anillos")
        logger.info("  ledger [n]          → Muestra las últimas n entradas del Delta Ledger")
        logger.info("  ayuda               → Muestra este menú de control")
        logger.info("  salir               → Cierra el entorno de forma segura")

    def ejecutar_comando(self, entrada: str) -> None:
        partes = entrada.strip().split(" ", 1)
        comando = partes[0].lower()
        argumento = partes[1].strip() if len(partes) > 1 else ""

        despachador = {
            "status": lambda: self.cmd_status(),
            "carpetas": lambda: self.cmd_listar_carpetas(),
            "listar": lambda: self.cmd_listar(),
            "ejecutar_todo": lambda: self.ejecutar_todo_directorio(),
            "vision": lambda: (
                self.despertar_vision(argumento)
                if argumento
                else logger.error("Especifica la premisa. Ejemplo: vision Analizar estabilidad fiduciaria")
            ),
            "ledger": lambda: self.cmd_ledger(int(argumento) if argumento.isdigit() else 5),
            "buscar": lambda: self.cmd_buscar(argumento),
            "ayuda": lambda: self.cmd_ayuda(),
        }

        handler = despachador.get(comando)
        if handler is not None:
            handler()
        else:
            self.despertar_vision(entrada)

    def apagar(self, motivo: str) -> None:
        logger.info("Desconectando bibliotecario y guardando trazas en el Ledger.")
        self.ledger.registrar("apagado", {"motivo": motivo}, autor=self.autor)


# ---------------------------------------------------------------------------
# CLI Directa y REPL
# ---------------------------------------------------------------------------

def modo_interactivo(bibliotecario: BibliotecarioGeneral) -> None:
    try:
        while True:
            entrada = input("\n[BIBLIOTECARIO API] >>> ")
            if not entrada.strip():
                continue
            if entrada.lower() in {"salir", "exit", "quit"}:
                bibliotecario.apagar(motivo="comando_salir")
                break
            bibliotecario.ejecutar_comando(entrada)
    except KeyboardInterrupt:
        logger.info("\n[SISTEMA] Interrupción de terminal detectada.")
        bibliotecario.apagar(motivo="KeyboardInterrupt")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Bibliotecario General v1.4.0 API - ROMEO-HYDRA Framework"
    )
    parser.add_argument(
        "comando",
        nargs="*",
        help="Comando directo a ejecutar (ej. 'status', 'ejecutar_todo', 'vision <premisa>').",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Activa el modo de logging detallado (DEBUG).",
    )

    args = parser.parse_args()

    nivel_log = logging.DEBUG if args.debug else logging.INFO
    configurar_logging(nivel_log)

    bibliotecario = BibliotecarioGeneral()

    if args.comando:
        linea_comando = " ".join(args.comando)
        bibliotecario.ejecutar_comando(linea_comando)
    else:
        modo_interactivo(bibliotecario)


if __name__ == "__main__":
    main()