#!/usr/bin/env python3
"""
ROMEO-HYDRA — Sistema Inmunológico y Homeostasis
Inspecciona la coherencia del organismo digital, detecta daño y activa
respuesta inmune con regeneración desde el historial inmutable (Git)
o reconstrucción de emergencia.
"""

from __future__ import annotations

import os
import sys
import subprocess
import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple


# ---------------------------------------------------------------------------
# Configuración del sistema inmune
# ---------------------------------------------------------------------------

@dataclass
class TejidoCritico:
    nombre: str
    minimo_bytes: int = 50          # tamaño mínimo razonable
    requiere_ejecutable: bool = False


@dataclass
class ConfigInmune:
    tejidos: List[TejidoCritico] = field(default_factory=lambda: [
        TejidoCritico("columna_vertebral.py", minimo_bytes=200),
        TejidoCritico("automedicina.py", minimo_bytes=300),
        # Añade aquí futuros módulos críticos:
        # TejidoCritico("red_neuronal_nucleo.py", minimo_bytes=150),
    ])
    umbral_integridad: float = 0.8  # porcentaje mínimo de tejidos sanos


# ---------------------------------------------------------------------------
# Funciones de inspección
# ---------------------------------------------------------------------------

def calcular_hash_rapido(ruta: Path) -> str:
    """Hash SHA-256 de los primeros 4 KB (suficiente para detección rápida)."""
    try:
        with open(ruta, "rb") as f:
            return hashlib.sha256(f.read(4096)).hexdigest()[:16]
    except Exception:
        return "CORRUPTO"


def verificar_sintaxis_python(ruta: Path) -> bool:
    """Comprueba que el archivo Python sea sintácticamente válido."""
    try:
        resultado = subprocess.run(
            [sys.executable, "-m", "py_compile", str(ruta)],
            capture_output=True,
            timeout=5
        )
        return resultado.returncode == 0
    except Exception:
        return False


def inspeccionar_tejido(tejido: TejidoCritico) -> Tuple[bool, str]:
    """
    Realiza una inspección multicapa de un tejido.
    Retorna (sano: bool, diagnóstico: str)
    """
    ruta = Path(tejido.nombre)

    if not ruta.exists():
        return False, "AUSENTE"

    try:
        tamaño = ruta.stat().st_size
    except OSError:
        return False, "INACCESIBLE"

    if tamaño < tejido.minimo_bytes:
        return False, f"ATROFIADO ({tamaño} bytes)"

    if tejido.nombre.endswith(".py"):
        if not verificar_sintaxis_python(ruta):
            return False, "SINTAXIS CORRUPTA"

    hash_actual = calcular_hash_rapido(ruta)
    return True, f"INTEGRO (hash:{hash_actual})"


# ---------------------------------------------------------------------------
# Respuesta inmune / Regeneración
# ---------------------------------------------------------------------------

def intentar_regeneracion_git(archivos: List[str]) -> bool:
    """Intenta restaurar archivos desde el último commit (HEAD)."""
    if not Path(".git").exists():
        return False

    try:
        cmd = ["git", "checkout", "HEAD", "--"] + archivos
        resultado = subprocess.run(cmd, capture_output=True, timeout=10)
        return resultado.returncode == 0
    except Exception:
        return False


def regeneracion_emergencia() -> None:
    """
    Último recurso: si Git falla, se deja constancia y se prepara
    el terreno para una reconstrucción manual o desde backup externo.
    """
    print("[RESPUESTA INMUNE] Git no disponible o falló. Activando modo de supervivencia.")
    print("[NOTA] Se requiere intervención externa o reconstrucción desde ADN base.")


# ---------------------------------------------------------------------------
# Núcleo del sistema inmune
# ---------------------------------------------------------------------------

def main() -> int:
    cfg = ConfigInmune()
    print("[HOMEOSTASIS] Escaneando la estructura somática del organismo...")

    sanos = 0
    diagnosticos: List[str] = []
    dañados: List[str] = []

    for tejido in cfg.tejidos:
        sano, diag = inspeccionar_tejido(tejido)
        estado = "✓" if sano else "✗"
        diagnosticos.append(f"  {estado} {tejido.nombre}: {diag}")
        if sano:
            sanos += 1
        else:
            dañados.append(tejido.nombre)

    total = len(cfg.tejidos)
    ratio = sanos / total if total > 0 else 0.0

    print("\n[DIAGNÓSTICO DE TEJIDOS]")
    for d in diagnosticos:
        print(d)

    print(f"\n[INTEGRIDAD GLOBAL] {sanos}/{total} tejidos sanos ({ratio:.0%})")

    if ratio >= cfg.umbral_integridad:
        print("[ESTADO INTEGRAL] Tejido y bus central en perfecta estabilidad convexa.")
        return 0

    # --- Activación de respuesta inmune ---
    print("\n[REGENERACIÓN] Umbral de integridad incumplido. Activando respuesta inmune...")

    if dañados:
        print(f"[OBJETIVOS] Tejidos a restaurar: {', '.join(dañados)}")
        if intentar_regeneracion_git(dañados):
            print("[REGENERACIÓN COMPLETA] Tejido restaurado desde el historial inmutable (Git).")
            return 1
        else:
            regeneracion_emergencia()
            return 2

    return 1


if __name__ == "__main__":
    sys.exit(main())
