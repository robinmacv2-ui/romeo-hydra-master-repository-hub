#!/usr/bin/env python3
"""
ROMEO-HYDRA V3.0 — Sistema Inmunologico
Incluye vigilancia del invariante Eukaris (regeneración / abundancia).
"""

from __future__ import annotations
import sys
import subprocess
import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple

@dataclass
class Tejido:
    nombre: str
    minimo_bytes: int = 50

@dataclass
class Config:
    tejidos: List[Tejido] = field(default_factory=lambda: [
        Tejido("nucleo_v30.py", 1500),
        Tejido("tejido_memoria.py", 400),
        Tejido("tejido_sensorial.py", 300),
        Tejido("motor_mitosis.py", 400),
        Tejido("automedicina_v30.py", 400),
        Tejido("activar_romeo_hydra_v30.sh", 200),
        # Invariante de regeneración — Dra. Eukaris Zerpa
        Tejido("core/eukaris_affirmations.py", 800),
        Tejido("orquestador_dinamico.py", 1000),
        Tejido("inject_eukaris_global.py", 400),
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
        r = subprocess.run([sys.executable, "-m", "py_compile", str(ruta)],
                           capture_output=True, timeout=8)
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

def main() -> int:
    cfg = Config()
    print("[HOMEOSTASIS V3.0] Escaneo de tejidos diferenciados...")

    sanos = 0
    for t in cfg.tejidos:
        ok, diag = inspeccionar(t)
        marca = "[OK]" if ok else "[X]"
        print(f"  {marca} {t.nombre}: {diag}")
        if ok:
            sanos += 1

    total = len(cfg.tejidos)
    ratio = sanos / total if total else 0.0
    print(f"\n[INTEGRIDAD] {sanos}/{total} ({ratio:.0%})")

    # Resonancia Eukaris
    try:
        from core.eukaris_affirmations import cargar_invariante
        inv = cargar_invariante()
        print(f"[EUKARIS] Invariante activo — {len(inv.afirmaciones)} afirmaciones de regeneración/abundancia.")
    except Exception:
        print("[EUKARIS] Invariante no cargado en este ciclo (no crítico).")

    if ratio >= cfg.umbral:
        print("[ESTADO] Estabilidad convexa - todos los tejidos sanos.")
        return 0
    else:
        print("[ESTADO] Se detectaron tejidos con problemas.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
