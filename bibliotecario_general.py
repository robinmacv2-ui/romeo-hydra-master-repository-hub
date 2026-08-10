#!/usr/bin/env python3
"""
=============================================================================
Framework: ROMEO-HYDRA
Component: INFINITY ORCHESTRATOR / Bibliotecario General
Author: Luis Angel Vazquez Martinez
Version: 10.1.0 — Hardened Sovereign Edition (Micro-Inferencia Local)

Refuerzos Integrados:
- Cerebro Trino: Validación AST y cálculo de entropía de Shannon.
- Hydra Mesh: Ejecución asíncrona aislada (Subprocesos -I).
- Chronos Ledger: WORM encadenado con Merkle Root y validación HMAC.
- Puente HTTP Local: Inferencia auditada vía TinyLlama para Edge Hardware.
=============================================================================
"""

from __future__ import annotations

import argparse
import ast
import asyncio
import hashlib
import hmac
import importlib
import json
import logging
import math
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import urllib.error
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    import numpy as np
    NUMPY_OK = True
except ImportError:
    NUMPY_OK = False


# ============================================================================
# CONFIGURACIÓN CENTRALIZADA
# ============================================================================

AUTOR_DEFAULT = "Luis Angel Vazquez Martinez"

DIRS_EXCLUIDOS: Set[str] = {
    ".git", "__pycache__", "venv", "hydra_env", "hydra_env_64", ".venv",
    "node_modules", ".idea", "dist", "build", "backups", ".mypy_cache",
    "infinity_cache", "romeo_hydra.egg-info"
}

PALABRAS_RIESGO = {
    "tarot", "horóscopo", "azar", "ilegal", "kyc", "aml",
    "fraude", "destruir", "hack", "exploit", "bypass",
    "ransomware", "keylogger",
}

MODULOS_CRITICOS = [
    ("kernel_sigma", "KernelSigmaController"),
    ("romeo_engine", "RomeoEngine"),
    ("sensor_hardware", "sensor"),
    ("romeo_hydra_nucleus", "RomeoHydraNucleus"),
    ("romeo_hydra", None),
]

MAX_OUTPUT = 4000
MAX_SOURCE = 2_000_000
DEFAULT_TIMEOUT = 30

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [HYDRA-∞] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("infinity")


# ============================================================================
# UTILIDADES CRIPTOGRÁFICAS
# ============================================================================

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_text(data: str) -> str:
    return sha256_bytes(data.encode("utf-8"))

def safe_json(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except (TypeError, ValueError):
        return str(value)

def hmac_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


# ============================================================================
# 1. CHRONOS LEDGER (WORM ENCADENADO)
# ============================================================================

class ChronosLedger:
    GENESIS = "GENESIS"

    def __init__(self, ruta: Path):
        self.ruta = ruta.resolve()
        self.ruta.parent.mkdir(parents=True, exist_ok=True)
        self.chain: List[Dict[str, Any]] = []
        self.integridad_ok = self._cargar_y_validar()

    @staticmethod
    def _canonical(payload: Dict[str, Any]) -> bytes:
        return json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    def _hash_payload(self, payload: Dict[str, Any]) -> str:
        return sha256_bytes(self._canonical(payload))

    def _cargar_y_validar(self) -> bool:
        if not self.ruta.exists():
            return True
        ok = True
        prev = self.GENESIS
        self.chain.clear()
        try:
            with self.ruta.open("r", encoding="utf-8") as f:
                for lineno, line in enumerate(f, 1):
                    if not line.strip(): continue
                    try:
                        entry = json.loads(line)
                        stored = entry.pop("hash_sha256")
                        if entry.get("prev_hash") != prev:
                            raise ValueError("prev_hash inválido")
                        calculated = self._hash_payload(entry)
                        if not hmac_compare(stored, calculated):
                            raise ValueError("hash_sha256 inválido")
                        entry["hash_sha256"] = stored
                        self.chain.append(entry)
                        prev = stored
                    except Exception as exc:
                        logger.error("Ledger inválido en línea %d: %s", lineno, exc)
                        ok = False
                        break
        except OSError as exc:
            logger.error("No se pudo leer ledger: %s", exc)
            return False
        return ok

    def _merkle_root(self) -> str:
        if not self.chain: return "0" * 64
        hashes = [entry["hash_sha256"] for entry in self.chain[-16:]]
        while len(hashes) > 1:
            if len(hashes) % 2: hashes.append(hashes[-1])
            hashes = [sha256_text(hashes[i] + hashes[i + 1]) for i in range(0, len(hashes), 2)]
        return hashes[0]

    def registrar(self, evento: str, datos: Dict[str, Any], autor: str = AUTOR_DEFAULT) -> Dict[str, Any]:
        if not self.integridad_ok:
            raise RuntimeError("Ledger comprometido: se bloquean nuevas escrituras.")
        
        prev_hash = self.chain[-1]["hash_sha256"] if self.chain else self.GENESIS
        payload = {
            "ts": utc_now(),
            "evento": str(evento),
            "autor": str(autor),
            "datos": safe_json(datos),
            "prev_hash": prev_hash,
            "merkle_root": self._merkle_root(),
        }
        entry = dict(payload)
        entry["hash_sha256"] = self._hash_payload(payload)
        
        line = json.dumps(entry, ensure_ascii=False, separators=(",", ":")) + "\n"
        with self.ruta.open("a", encoding="utf-8") as f:
            f.write(line)
            f.flush()
            os.fsync(f.fileno())
        
        self.chain.append(entry)
        return entry


# ============================================================================
# 2. CEREBRO TRINO (ANÁLISIS SINTÁCTICO Y ENTROPÍA)
# ============================================================================

@dataclass
class ResultadoVision:
    coherencia: float
    veredicto: str
    hash_traza: str
    explicacion: str
    entropia: float
    complejidad: int
    riesgos: List[str]
    topologia: str = "∞ nodos / fractal"
    bloqueos: List[str] = None

    def __post_init__(self):
        if self.riesgos is None: self.riesgos = []
        if self.bloqueos is None: self.bloqueos = []

class CerebroTrino:
    IMPORTS_PELIGROSOS = {"subprocess", "ctypes", "multiprocessing", "socket", "requests", "urllib", "http", "ftplib", "paramiko"}
    CALLS_PELIGROSAS = {"eval", "exec", "compile", "__import__", "breakpoint"}

    def analizar(self, codigo: str, path: str) -> ResultadoVision:
        if len(codigo.encode("utf-8", errors="ignore")) > MAX_SOURCE:
            return ResultadoVision(0, "BLOQUEADO_TAMANIO", sha256_text(codigo)[:16], f"Fuente supera {MAX_SOURCE} bytes", 0, 0, ["source_too_large"], bloqueos=["source_too_large"])

        try:
            tree = ast.parse(codigo, filename=path)
        except SyntaxError as e:
            return ResultadoVision(0, "ERROR_SINTACTICO", sha256_text(codigo)[:16], str(e), 0, 0, ["syntax_error"], ["syntax_error"])

        complejidad = sum(isinstance(node, (ast.If, ast.For, ast.While, ast.Try, ast.ExceptHandler, ast.With, ast.AsyncFor, ast.Match)) for node in ast.walk(tree))
        entropia = self._shannon(codigo)
        riesgos = {palabra for palabra in PALABRAS_RIESGO if palabra in codigo.lower()}
        bloqueos: Set[str] = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root = alias.name.split(".")[0]
                    if root in self.IMPORTS_PELIGROSOS: bloqueos.add(f"import:{root}")
            elif isinstance(node, ast.ImportFrom):
                root = (node.module or "").split(".")[0]
                if root in self.IMPORTS_PELIGROSOS: bloqueos.add(f"import:{root}")
            elif isinstance(node, ast.Call):
                name = None
                if isinstance(node.func, ast.Name): name = node.func.id
                elif isinstance(node.func, ast.Attribute): name = node.func.attr
                if name in self.CALLS_PELIGROSAS: bloqueos.add(f"call:{name}")

        penalizacion = (len(riesgos) * 8 + len(bloqueos) * 20 + complejidad * 0.5 + max(0.0, entropia - 4.5) * 4)
        coherencia = max(0.0, min(100.0, 100.0 - penalizacion))

        if bloqueos: veredicto = "BLOQUEADO"
        elif coherencia > 75: veredicto = "CONVERGENTE"
        elif coherencia > 40: veredicto = "DIVERGENTE"
        else: veredicto = "CORRUPTO"

        explicacion = f"Entropía {entropia:.2f}, Complejidad {complejidad}, Riesgos: {sorted(riesgos) or 'ninguno'}, Bloqueos: {sorted(bloqueos) or 'ninguno'}"

        return ResultadoVision(
            coherencia=coherencia, veredicto=veredicto, hash_traza=sha256_text(codigo)[:16],
            explicacion=explicacion, entropia=entropia, complejidad=complejidad,
            riesgos=sorted(riesgos), bloqueos=sorted(bloqueos)
        )

    @staticmethod
    def _shannon(s: str) -> float:
        if not s: return 0.0
        freq = Counter(s)
        n = len(s)
        return -sum((c / n) * math.log2(c / n) for c in freq.values())


# ============================================================================
# 3. HYDRA-MESH (EJECUCIÓN AISLADA Y ASÍNCRONA)
# ============================================================================

@dataclass
class ResultadoEjecucion:
    script: str
    returncode: Optional[int]
    stdout: str
    stderr: str
    duracion: float
    timeout: bool = False
    error: Optional[str] = None
    vision: Optional[ResultadoVision] = None

    @property
    def exitoso(self) -> bool:
        return not self.timeout and self.error is None and self.returncode == 0

class HydraMesh:
    def __init__(self, max_workers: int = 4):
        self.pool = ThreadPoolExecutor(max_workers=max(1, min(max_workers, 16)))

    async def ejecutar(self, script_path: Path, root: Path, timeout: int = DEFAULT_TIMEOUT, vision: Optional[ResultadoVision] = None, allow_unsafe: bool = False) -> ResultadoEjecucion:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.pool, self._sync_run, script_path, root, timeout, vision, allow_unsafe)

    @staticmethod
    def _sync_run(script_path: Path, root: Path, timeout: int, vision: Optional[ResultadoVision], allow_unsafe: bool) -> ResultadoEjecucion:
        start = time.monotonic()
        try:
            if not script_path.is_file(): raise FileNotFoundError(script_path)
            script_path, root = script_path.resolve(), root.resolve()
            
            if root != script_path and root not in script_path.parents:
                raise PermissionError("El script está fuera del root autorizado.")

            if vision and vision.bloqueos and not allow_unsafe:
                return ResultadoEjecucion(
                    str(script_path), None, "", "", time.monotonic() - start,
                    error="Ejecución bloqueada por análisis AST: " + ", ".join(vision.bloqueos), vision=vision
                )

            env = {
                "PATH": os.environ.get("PATH", ""),
                "PYTHONIOENCODING": "utf-8",
                "PYTHONDONTWRITEBYTECODE": "1",
            }
            cmd = [sys.executable, "-I", str(script_path)]
            proc = subprocess.run(
                cmd, cwd=str(root), env=env, stdin=subprocess.DEVNULL,
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=max(1, min(int(timeout), 300)), check=False
            )
            return ResultadoEjecucion(str(script_path), proc.returncode, proc.stdout[-MAX_OUTPUT:], proc.stderr[-MAX_OUTPUT:], time.monotonic() - start, vision=vision)

        except subprocess.TimeoutExpired as e:
            return ResultadoEjecucion(str(script_path), None, str(e.stdout or "")[-MAX_OUTPUT:], str(e.stderr or "")[-MAX_OUTPUT:], time.monotonic() - start, timeout=True, error="timeout", vision=vision)
        except OSError as e:
            return ResultadoEjecucion(str(script_path), None, "", "", time.monotonic() - start, error=str(e), vision=vision)


# ============================================================================
# 4. BIBLIOTECARIO GENERAL INFINITY
# ============================================================================

class BibliotecarioGeneral:
    def __init__(self, autor: str = AUTOR_DEFAULT) -> None:
        self.directorio = Path.cwd().resolve()
        if str(self.directorio) not in sys.path:
            sys.path.insert(0, str(self.directorio))

        self.subsistemas: Dict[str, Any] = {}
        self.biblioteca_scripts: List[str] = []
        self.carpetas_indizadas: List[str] = []
        self.hashes_scripts: Dict[str, str] = {}
        
        self.autor = autor
        self.dir_backups = self.directorio / "backups"
        self.ledger = ChronosLedger(self.directorio / "delta_ledger.jsonl")
        self.cerebro = CerebroTrino()
        self.mesh = HydraMesh(max_workers=4)
        
        self.kernel = None
        self.topologia = None

        self.inicializar_biblioteca()

    def inicializar_biblioteca(self) -> None:
        logger.info("=" * 70)
        logger.info("INFINITY ORCHESTRATOR - ROMEO-HYDRA v10.1.0")
        logger.info("WORM Encadenado + Validación AST + Inferencia Edge (TinyLlama)")
        logger.info("=" * 70)

        self._reindizar()
        logger.info("Carpetas activas indizadas: %d", len(self.carpetas_indizadas))
        logger.info("Scripts Python detectados: %d", len(self.biblioteca_scripts))

        for mod_name, class_name in MODULOS_CRITICOS:
            self._vincular_subsistema(mod_name, class_name)

        if not self.ledger.integridad_ok:
            logger.critical("¡ALERTA! La cadena de custodia del Ledger está comprometida.")

        self.ledger.registrar(
            "arranque_bibliotecario_infinity",
            {
                "version": "10.1.0-Hardened",
                "scripts_indizados": len(self.biblioteca_scripts),
                "subsistemas": list(self.subsistemas.keys()),
                "integridad_ledger": self.ledger.integridad_ok
            },
            autor=self.autor,
        )

    def _vincular_subsistema(self, mod_name: str, class_name: str) -> None:
        try:
            mod = importlib.import_module(mod_name)
            self.subsistemas[mod_name] = mod
            logger.info("Subsistema vinculado: %s", mod_name)
            
            if mod_name == "kernel_sigma" and hasattr(mod, "KernelSigmaController"):
                cfg_class = getattr(mod, "KernelConfig", None)
                self.kernel = mod.KernelSigmaController(cfg_class()) if cfg_class else None
            
            if mod_name in ("romeo_hydra_nucleus", "romeo_hydra") and hasattr(mod, "HydraTopology") and not self.topologia:
                self.topologia = mod.HydraTopology()
        except Exception as e:
            logger.debug("Subsistema '%s' no disponible/falló: %s", mod_name, e)

    def _reindizar(self) -> None:
        scripts, carpetas = [], []
        for root, dirs, files in os.walk(self.directorio):
            dirs[:] = [d for d in dirs if d not in DIRS_EXCLUIDOS and not d.startswith(".")]
            rel_dir = os.path.relpath(root, self.directorio).replace("\\", "/")
            if rel_dir != ".": carpetas.append(rel_dir)
            for f in files:
                if f.endswith(".py"):
                    scripts.append(os.path.relpath(os.path.join(root, f), self.directorio).replace("\\", "/"))

        self.biblioteca_scripts, self.carpetas_indizadas = sorted(scripts), sorted(carpetas)
        self.hashes_scripts = {rel: sha256_bytes((self.directorio / rel).read_bytes()) for rel in self.biblioteca_scripts if (self.directorio / rel).exists()}

    def _resolver_script(self, script_rel: str) -> Optional[Path]:
        script_rel = script_rel.strip()
        if script_rel not in self.biblioteca_scripts:
            logger.error("Script '%s' no indizado o prohibido (Path Traversal Bloqueado).", script_rel)
            return None
        ruta_abs = (self.directorio / script_rel).resolve()
        try:
            ruta_abs.relative_to(self.directorio)
            return ruta_abs
        except ValueError:
            return None

    # --- COMANDOS CLI ---

    def cmd_status(self) -> None:
        logger.info("[ESTADO INFINITY]")
        logger.info("  Directorio raíz   : %s", self.directorio)
        logger.info("  Scripts indizados : %d", len(self.biblioteca_scripts))
        logger.info("  Módulos en RAM    : %s", list(self.subsistemas.keys()) or "Ninguno")
        logger.info("  Integridad WORM   : %s", "VALIDADA" if self.ledger.integridad_ok else "COMPROMETIDA")
        logger.info("  Entradas Ledger   : %d", len(self.ledger.chain))

    def cmd_listar(self) -> None:
        logger.info("[UNIVERSO PYTHON INDIZADO]")
        for i, s in enumerate(self.biblioteca_scripts, 1):
            logger.info("  %03d. %s", i, s)

    def cmd_leer(self, script_rel: str) -> None:
        ruta = self._resolver_script(script_rel)
        if ruta:
            lineas = ruta.read_text(encoding="utf-8", errors="replace").splitlines()
            logger.info("[LECTURA] %s (%d líneas)", script_rel, len(lineas))
            for i, l in enumerate(lineas[:300], 1): print(f"{i:>4} | {l}")

    def cmd_ejecutar(self, script_rel: str) -> None:
        ruta = self._resolver_script(script_rel)
        if not ruta: return

        codigo = ruta.read_text(encoding="utf-8", errors="replace")
        vision = self.cerebro.analizar(codigo, str(ruta))
        
        logger.info("[CEREBRO TRINO] Evaluando AST para '%s'...", script_rel)
        logger.info("  Coherencia : %s%%", vision.coherencia)
        logger.info("  Veredicto  : %s", vision.veredicto)
        logger.info("  Bloqueos   : %s", vision.bloqueos or "Ninguno")

        resultado = asyncio.run(self.mesh.ejecutar(ruta, self.directorio, DEFAULT_TIMEOUT, vision, allow_unsafe=False))
        
        print("-" * 75)
        if resultado.error:
            print(f"BLOQUEO/ERROR: {resultado.error}")
        elif resultado.timeout:
            print(f"TIMEOUT: Proceso excedió {DEFAULT_TIMEOUT}s y fue aniquilado.")
        else:
            print(f"CÓDIGO DE SALIDA: {resultado.returncode} | DURACIÓN: {resultado.duracion:.3f}s")
            if resultado.stdout: print("--- STDOUT ---\n" + resultado.stdout.strip())
            if resultado.stderr: print("--- STDERR ---\n" + resultado.stderr.strip())
        print("-" * 75)

        self.ledger.registrar("ejecucion_aislada", {
            "script": script_rel, "veredicto_ast": vision.veredicto, "returncode": resultado.returncode,
            "error": resultado.error, "duracion": resultado.duracion
        }, autor=self.autor)

    def cmd_regenerar(self, script_rel: str) -> None:
        ruta = self._resolver_script(script_rel)
        if not ruta: return

        codigo = ruta.read_text(encoding="utf-8", errors="replace")
        vision = self.cerebro.analizar(codigo, str(ruta))

        # Backup WORM
        marca = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        destino = self.dir_backups / marca / script_rel
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ruta, destino)

        cabecera = f'''#!/usr/bin/env python3\n"""\nROMEO-HYDRA INFINITY REGENERATION\nScript: {script_rel}\nAutor: {self.autor}\nFecha: {utc_now()}\nCoherencia AST: {vision.coherencia}%\nVeredicto: {vision.veredicto}\nTraza SHA-256: {vision.hash_traza}\n"""\n'''
        
        contenido_limpio = "\n".join(codigo.splitlines(keepends=True)[1:]) if codigo.startswith("#!") else codigo
        ruta.write_text(cabecera + contenido_limpio, encoding="utf-8")
        
        logger.info("[REGENERACIÓN] Sello criptográfico inyectado en '%s'. Backup preservado en %s", script_rel, destino)
        self._reindizar()
        self.ledger.registrar("regeneracion_segura", {"script": script_rel, "hash_traza": vision.hash_traza}, autor=self.autor)

    def cmd_inferir(self, prompt: str) -> None:
        if not prompt:
            logger.error("Especifica la premisa para la IA. Ejemplo: inferir Explica la gravedad.")
            return

        # Filtro Ex-Ante: Evaluación estructural del prompt
        vision = self.cerebro.analizar(prompt, "prompt_humano")
        if vision.veredicto == "BLOQUEADO":
            logger.warning("[BLOQUEO KERNEL] El prompt contiene vectores no autorizados: %s", vision.bloqueos)
            return

        logger.info("[OLLAMA LOCAL] Interrogando al nodo micro-estocástico (TinyLlama). Esperando respuesta...")
        url = "http://localhost:11434/api/generate"
        payload = {"model": "tinyllama", "prompt": prompt, "stream": False}
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        inicio = time.monotonic()
        try:
            with urllib.request.urlopen(req) as response:
                resultado = json.loads(response.read().decode("utf-8"))
                respuesta_texto = resultado.get("response", "")
                duracion = time.monotonic() - inicio

                print("-" * 75)
                print(f"🧠 [TINYLLAMA] Respuesta ({duracion:.2f}s):")
                print(respuesta_texto.strip())
                print("-" * 75)

                # Sello WORM
                self.ledger.registrar("inferencia_ollama", {
                    "prompt": prompt,
                    "modelo": "tinyllama",
                    "duracion_seg": round(duracion, 3),
                    "respuesta_hash": sha256_text(respuesta_texto)[:16]
                }, autor=self.autor)

        except urllib.error.URLError as e:
            logger.error("[FALLO DE ENLACE] ¿Está el nodo Ollama corriendo en tu máquina local? Error: %s", e)

    def cmd_ayuda(self) -> None:
        logger.info("[COMANDOS INFINITY ORCHESTRATOR]")
        print("  status            → Muestra el diagnóstico y la integridad del WORM Ledger")
        print("  listar            → Muestra la biblioteca purificada de scripts")
        print("  leer <script>     → Lee seguro previniendo Path Traversal")
        print("  ejecutar <script> → Audita el AST y ejecuta en subproceso asíncrono (-I)")
        print("  regenerar <script>→ Inyecta sellos de gobernanza creando respaldos inmutables")
        print("  inferir <premisa> → Filtra prompt vía AST, consulta al nodo local (TinyLlama) y sella en WORM")
        print("  ledger [n]        → Imprime los últimos n bloques del Chronos Ledger")
        print("  salir             → Finaliza operaciones de Caja Blanca")

    def ejecutar_comando(self, entrada: str) -> None:
        partes = entrada.strip().split(" ", 1)
        cmd = partes[0].lower()
        arg = partes[1].strip() if len(partes) > 1 else ""

        despachador = {
            "status": lambda: self.cmd_status(),
            "listar": lambda: self.cmd_listar(),
            "leer": lambda: self.cmd_leer(arg) if arg else logger.error("Falta script."),
            "ejecutar": lambda: self.cmd_ejecutar(arg) if arg else logger.error("Falta script."),
            "regenerar": lambda: self.cmd_regenerar(arg) if arg else logger.error("Falta script."),
            "inferir": lambda: self.cmd_inferir(arg) if arg else logger.error("Falta premisa."),
            "ledger": lambda: [print(json.dumps(e, indent=2)) for e in self.ledger.ultimas(int(arg) if arg.isdigit() else 5)],
            "ayuda": lambda: self.cmd_ayuda(),
        }

        if handler := despachador.get(cmd):
            handler()
        else:
            logger.warning("Premisa desconocida o comando no registrado en el framework: '%s'", cmd)

    def apagar(self) -> None:
        logger.info("Cerrando Infinity Orchestrator. Consolidando raíz de Merkle...")
        self.ledger.registrar("apagado_sistema", {"root_final": self.ledger._merkle_root()}, autor=self.autor)


# ============================================================================
# BOOT SEQUENCE
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="ROMEO-HYDRA Infinity Orchestrator")
    parser.add_argument("comando", nargs="*", help="Comando directo (ej. 'status', 'ejecutar script.py')")
    args = parser.parse_args()

    bibliotecario = BibliotecarioGeneral()

    if args.comando:
        bibliotecario.ejecutar_comando(" ".join(args.comando))
    else:
        try:
            while True:
                entrada = input("\n[HYDRA-∞] >>> ")
                if not entrada.strip(): continue
                if entrada.lower() in {"salir", "exit", "quit"}:
                    bibliotecario.apagar()
                    break
                bibliotecario.ejecutar_comando(entrada)
        except KeyboardInterrupt:
            print()
            bibliotecario.apagar()

if __name__ == "__main__":
    main()