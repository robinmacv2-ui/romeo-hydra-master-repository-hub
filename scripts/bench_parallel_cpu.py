#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cronómetro Romeo: serie (1 por 1) vs paralelo CPU (muchos a la vez).
Sin GPU. Solo pega y corre:

    python scripts/bench_parallel_cpu.py

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import sys

def main() -> int:
    try:
        from romeo_hydra.kernel.parallel_cpu import CPUParallelEngine
    except ImportError:
        # Por si se corre sin instalar el paquete
        sys.path.insert(0, ".")
        from romeo_hydra.kernel.parallel_cpu import CPUParallelEngine

    print("=== ROMEO-HYDRA · Cronómetro CPU (sin GPU) ===")
    print("Idea: mismas cuentas, más manos al mismo tiempo.\n")

    engine = CPUParallelEngine()  # usa todos los núcleos disponibles

    # Prueba chica (rápida en Termux)
    small = engine.benchmark(n_states=50, dim=32)
    print("--- Lote chico (50 estados, dim=32) ---")
    print(f"  Núcleos detectados : {small['cpu_count']}")
    print(f"  Workers usados     : {small['workers']}")
    print(f"  Tiempo SERIE       : {small['serial_s']} s")
    print(f"  Tiempo PARALELO    : {small['parallel_s']} s")
    print(f"  Speedup            : {small['speedup']}x")
    print()

    # Prueba más pesada (mejor para PC / prima con buena compu)
    big = engine.benchmark(n_states=200, dim=64)
    print("--- Lote grande (200 estados, dim=64) ---")
    print(f"  Tiempo SERIE       : {big['serial_s']} s")
    print(f"  Tiempo PARALELO    : {big['parallel_s']} s")
    print(f"  Speedup            : {big['speedup']}x")
    print()
    print("Listo. Si paralelo < serie, el repartir trabajo sí ayuda.")
    print("(En celulares con 1 solo núcleo efectivo el speedup puede ser ~1x.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
