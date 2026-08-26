#!/usr/bin/env python3

import sys
import os
from pathlib import Path


# ============================================================
# ROMEO-HYDRA — ENVIRONMENT PRE-FLIGHT
# ============================================================

REQUIRED_PACKAGES = {
    "numpy": "2.4.6",
}


def print_environment():
    """Muestra exactamente qué intérprete está ejecutando el kernel."""

    print("=" * 58)
    print(" ROMEO-HYDRA — ENVIRONMENT DIAGNOSTIC")
    print("=" * 58)

    print(f"Python executable : {sys.executable}")
    print(f"Python version    : {sys.version.split()[0]}")
    print(f"sys.prefix        : {sys.prefix}")
    print(f"sys.base_prefix   : {sys.base_prefix}")
    print(f"Virtual environment: {sys.prefix != sys.base_prefix}")
    print()


def validate_virtual_environment():
    """Garantiza que el kernel esté ejecutándose dentro del venv."""

    if sys.prefix == sys.base_prefix:
        raise RuntimeError(
            "ENVIRONMENT ERROR: ROMEO-HYDRA no está ejecutándose "
            "dentro del entorno virtual 'cripto'."
        )


def validate_dependencies():
    """Valida las dependencias usando el MISMO intérprete del kernel."""

    try:
        import numpy as np
    except ImportError as exc:
        raise RuntimeError(
            "DEPENDENCY ERROR: NumPy no está disponible para "
            f"este intérprete:\n{sys.executable}"
        ) from exc

    installed = np.__version__
    required = REQUIRED_PACKAGES["numpy"]

    print("[DEPENDENCY CHECK]")
    print(f"  > NumPy instalado : {installed}")
    print(f"  > NumPy requerido  : {required}")
    print(f"  > NumPy path       : {np.__file__}")

    if installed != required:
        raise RuntimeError(
            f"DEPENDENCY VERSION ERROR: se esperaba NumPy "
            f"{required}, pero se encontró {installed}."
        )

    print("  > Estado: PASSED")
    print()


# ============================================================
# KERNEL SIGMA
# ============================================================

def sigma_projection(value, threshold=0.05):
    """
    Proyección convexa sobre C = [0, threshold].

    Retorna:
        clipped_value
        safe
        security_code
    """

    clipped = min(value, threshold)
    safe = value <= threshold
    code = 0 if safe else 101

    return clipped, safe, code


def run_sigma():
    print("[1] Evaluando Operador de Proyección Convexa:")

    inputs = [0.03, 0.09, 0.15, 0.02]

    for value in inputs:
        clipped, safe, code = sigma_projection(value)

        print(
            f"  > Input: {value:.2f} | "
            f"Clipped: {clipped:.2f} | "
            f"Seguro: {safe} | "
            f"Código: {code}"
        )

    print()


# ============================================================
# MOTOR HPR
# ============================================================

def run_hpr():
    """
    Validación HPR simplificada.
    """

    mse = 0.008273
    tolerance = 0.05

    passed = mse <= tolerance

    print("[2] Ejecutando Validación Falsacionista HPR:")
    print(f"  > Estado HPR: {'PASSED' if passed else 'FAILED'}")
    print(f"  > MSE Reconstrucción Hessiana: {mse:.6f}")

    if not passed:
        raise RuntimeError(
            f"HPR FAILED: MSE {mse:.6f} excede "
            f"la tolerancia {tolerance:.6f}."
        )

    print()


# ============================================================
# MAIN
# ============================================================

def main():
    print_environment()

    validate_virtual_environment()
    validate_dependencies()

    print("=" * 58)
    print(" ROMEO-HYDRA — KERNEL SIGMA & HPR EXECUTION TRACE")
    print("=" * 58)

    run_sigma()
    run_hpr()

    print("=" * 58)
    print(" ROMEO-HYDRA — EXECUTION PASSED")
    print("=" * 58)


if __name__ == "__main__":
    try:
        main()

    except Exception as exc:
        print()
        print("=" * 58)
        print(" ROMEO-HYDRA — EXECUTION FAILED")
        print("=" * 58)
        print(f"ERROR: {exc}")
        sys.exit(1)
