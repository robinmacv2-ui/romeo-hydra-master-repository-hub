#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.1 - Sistema Inmunologico
"""

from __future__ import annotations

import os
import sys
import subprocess
import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple

@dataclass
class Tejido:
    nombre: str
    minimo_bytes: int = 80
    critico: bool = True

@dataclass
class ConfigInmune:
    tejidos: List[Tejido] = field(default_factory=lambda: [
        Tejido("columna_vertebral_v21.py", minimo_bytes=1200, critico=True),
        Tejido("automedicina_v21.py", minimo_bytes=500, critico=True),
        Tejido("activar_romeo_hydra_v21.sh", minimo_bytes=300, critico=True),
        Tejido("vigilante_v21.py", minimo_bytes=200, critico=True),
        Tejido("memoria_inmunologica_v21.json", minimo_bytes=5, critico=False),
        Tejido("metricas_organismo_v21.json", minimo_bytes=5, critico=False),
    ])
    umbral: float = 0.70


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


def inspeccionar(t: Tejido) -> Tuple[bool, str]:
    ruta = Path(t.nombre)
    if not ruta.exists():
        return False, "AUSENTE"
    try:
        size = ruta.stat().st_size
    except OSError:
        return False, "INACCESIBLE"
    if size < t.minimo_bytes:
        return False, f"ATROFIADO ({size}B)"
    if not sintaxis_ok(ruta):
        return False, "SINTAXIS_CORRUPTA"
    return True, f"INTEGRO (h:{hash_rapido(ruta)})"


def regenerar(archivos: List[str]) -> bool:
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
    cfg = ConfigInmune()
    print("[HOMEOSTASIS V2.1] Escaneo multicapa del tejido digital...")

    sanos = 0
    danados = []
    for t in cfg.tejidos:
        ok, diag = inspeccionar(t)
        marca = "[OK]" if ok else "[X]"
        print(f"  {marca} {t.nombre}: {diag}")
        if ok:
            sanos += 1
        else:
            danados.append(t.nombre)

    total = len(cfg.tejidos)
    ratio = sanos / total if total else 0.0
    print(f"\n[INTEGRIDAD] {sanos}/{total} ({ratio:.0%})")

    if ratio >= cfg.umbral:
        print("[ESTADO] Estabilidad convexa alcanzada.")
        return 0

    print("[RESPUESTA INMUNE] Activando regeneracion desde ADN inmutable...")
    if danados and regenerar(danados):
        print("[REGENERACION] Tejido restaurado desde Git.")
        return 1

    print("[MODO SUPERVIVENCIA] Regeneracion fallida. Intervencion externa requerida.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
