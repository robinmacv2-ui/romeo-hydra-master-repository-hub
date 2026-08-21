#!/usr/bin/env python
"""
ROMEO-HYDRA - Sistema Inmunologico v3.1
Con recuperacion mas inteligente y mejor reporte.
"""

from __future__ import annotations
import sys
import subprocess
import hashlib
from pathlib import Path
from typing import List, Tuple
from romeo_utils import cargar_config

TEJIDOS_CRITICOS = [
    ("nucleo_v30.py", 1200),
    ("tejido_memoria.py", 300),
    ("tejido_sensorial.py", 250),
    ("motor_mitosis.py", 300),
    ("tcp_hydra_protocol.py", 800),
    ("monitor_federacion.py", 800),
    ("romeo_utils.py", 200),
    ("config_romeo.json", 50),
]

def hash_rapido(ruta: Path) -> str:
    try:
        return hashlib.sha256(ruta.read_bytes()[:4096]).hexdigest()[:12]
    except Exception:
        return "ERROR"

def sintaxis_ok(ruta: Path) -> bool:
    if ruta.suffix != ".py":
        return True
    try:
        r = subprocess.run(
            [sys.executable, "-m", "py_compile", str(ruta)],
            capture_output=True, timeout=8
        )
        return r.returncode == 0
    except Exception:
        return False

def inspeccionar(nombre: str, minimo: int) -> Tuple[bool, str]:
    ruta = Path(nombre)
    if not ruta.exists():
        return False, "AUSENTE"
    try:
        size = ruta.stat().st_size
    except OSError:
        return False, "INACCESIBLE"
    if size < minimo:
        return False, f"ATROFIADO ({size}B)"
    if not sintaxis_ok(ruta):
        return False, "SINTAXIS_CORRUPTA"
    return True, f"INTEGRO (h:{hash_rapido(ruta)})"

def intentar_restaurar(archivos: List[str]) -> bool:
    if not Path(".git").exists():
        return False
    try:
        r = subprocess.run(
            ["git", "checkout", "HEAD", "--"] + archivos,
            capture_output=True, timeout=15
        )
        return r.returncode == 0
    except Exception:
        return False

def main() -> int:
    print("[HOMEOSTASIS v3.1] Escaneo de integridad...")

    sanos = 0
    danados = []
    for nombre, minimo in TEJIDOS_CRITICOS:
        ok, diag = inspeccionar(nombre, minimo)
        marca = "[OK]" if ok else "[X]"
        print(f"  {marca} {nombre}: {diag}")
        if ok:
            sanos += 1
        else:
            danados.append(nombre)

    total = len(TEJIDOS_CRITICOS)
    ratio = sanos / total if total else 0.0
    print(f"\n[INTEGRIDAD] {sanos}/{total} ({ratio:.0%})")

    if not danados:
        print("[ESTADO] Todos los tejidos sanos.")
        return 0

    print(f"[RESPUESTA INMUNE] {len(danados)} tejido(s) danado(s). Intentando restaurar...")
    if intentar_restaurar(danados):
        print("[REGENERACION] Restauracion desde Git completada.")
        return 1
    else:
        print("[MODO SUPERVIVENCIA] No se pudo restaurar automaticamente.")
        print("                   Revisa los archivos manualmente o restaura desde backup.")
        return 2

if __name__ == "__main__":
    sys.exit(main())
