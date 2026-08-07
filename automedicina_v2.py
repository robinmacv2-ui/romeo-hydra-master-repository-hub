#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.0 — Sistema Inmunológico con Mutación Autónoma
"""

from __future__ import annotations

import os
import sys
import subprocess
import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple, Dict


@dataclass
class Tejido:
    nombre: str
    minimo_bytes: int = 100
    critico: bool = True


@dataclass
class ConfigInmuneV2:
    tejidos: List[Tejido] = field(default_factory=lambda: [
        Tejido("columna_vertebral_v2.py", minimo_bytes=800, critico=True),
        Tejido("automedicina_v2.py", minimo_bytes=400, critico=True),
        Tejido("memoria_inmunologica.json", minimo_bytes=10, critico=False),
    ])
    umbral_integridad: float = 0.75


def hash_rapido(ruta: Path) -> str:
    try:
        data = ruta.read_bytes()[:4096]
        return hashlib.sha256(data).hexdigest()[:12]
    except Exception:
        return "ERROR"


def verificar_sintaxis(ruta: Path) -> bool:
    if not ruta.suffix == ".py":
        return True
    try:
        r = subprocess.run(
            [sys.executable, "-m", "py_compile", str(ruta)],
            capture_output=True, timeout=6
        )
        return r.returncode == 0
    except Exception:
        return False


def inspeccionar(tejido: Tejido) -> Tuple[bool, str]:
    ruta = Path(tejido.nombre)
    if not ruta.exists():
        return False, "AUSENTE"
    try:
        size = ruta.stat().st_size
    except OSError:
        return False, "INACCESIBLE"
    if size < tejido.minimo_bytes:
        return False, f"ATROFIADO ({size}B)"
    if not verificar_sintaxis(ruta):
        return False, "SINTAXIS_CORRUPTA"
    return True, f"INTEGRO (h:{hash_rapido(ruta)})"


def regenerar_desde_git(archivos: List[str]) -> bool:
    if not Path(".git").exists():
        return False
    try:
        r = subprocess.run(
            ["git", "checkout", "HEAD", "--"] + archivos,
            capture_output=True, timeout=12
        )
        return r.returncode == 0
    except Exception:
        return False


def main() -> int:
    cfg = ConfigInmuneV2()
    print("[HOMEOSTASIS V2.0] Escaneo multicapa del tejido digital...")

    sanos = 0
    dañados = []
    for t in cfg.tejidos:
        ok, diag = inspeccionar(t)
        marca = "[OK]" if ok else "[X]"
        print(f"  {marca} {t.nombre}: {diag}")
        if ok:
            sanos += 1
        else:
            dañados.append(t.nombre)

    total = len(cfg.tejidos)
    ratio = sanos / total if total else 0.0
    print(f"\n[INTEGRIDAD] {sanos}/{total} ({ratio:.0%})")

    if ratio >= cfg.umbral_integridad:
        print("[ESTADO] Estabilidad convexa alcanzada.")
        return 0

    print("[RESPUESTA INMUNE] Activando regeneración + mutación preventiva...")
    if dañados and regenerar_desde_git(dañados):
        print("[REGENERACIÓN] Tejido restaurado desde ADN inmutable (Git).")
        return 1

    print("[MODO SUPERVIVENCIA] Regeneración Git fallida. Se requiere reconstrucción externa.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
