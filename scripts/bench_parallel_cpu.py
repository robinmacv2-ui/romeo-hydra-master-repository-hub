#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cronometro Romeo: serie vs paralelo CPU (muchos nucleos, cero NVIDIA).

    python scripts/bench_parallel_cpu.py

Escribe evidencia en pilot/output/parallel_cpu_bench.json
Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    try:
        from romeo_hydra.kernel.parallel_cpu import CPUParallelEngine
    except ImportError:
        sys.path.insert(0, ".")
        from romeo_hydra.kernel.parallel_cpu import CPUParallelEngine

    print("=== ROMEO-HYDRA ? Cronometro CPU (sin GPU) ===")
    print("Idea: mismas cuentas, mas manos al mismo tiempo.\n")

    engine = CPUParallelEngine()

    small = engine.benchmark(n_states=50, dim=32)
    print("--- Lote chico (50 estados, dim=32) ---")
    print(f"  Nucleos detectados : {small['cpu_count']}")
    print(f"  Workers usados     : {small['workers']}")
    print(f"  Tiempo SERIE       : {small['serial_s']} s")
    print(f"  Tiempo PARALELO    : {small['parallel_s']} s")
    print(f"  Speedup            : {small['speedup']}x")
    print()

    big = engine.benchmark(n_states=200, dim=64)
    print("--- Lote grande (200 estados, dim=64) ---")
    print(f"  Tiempo SERIE       : {big['serial_s']} s")
    print(f"  Tiempo PARALELO    : {big['parallel_s']} s")
    print(f"  Speedup            : {big['speedup']}x")
    print()

    report = {
        "pilot": "parallel_cpu_bench",
        "version": "0.1.2",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "hardware": {
            "is_gpu": False,
            "is_cuda": False,
            "is_cpu_multiprocess": True,
            "note": "Emulacion de throughput con nucleos CPU; no es GPU NVIDIA",
        },
        "small_batch": small,
        "large_batch": big,
        "author": "Luis Angel Vazquez Martinez",
    }
    tip = hashlib.sha256(
        json.dumps(report, sort_keys=True, default=str).encode()
    ).hexdigest()
    report["evidence_sha256"] = tip
    report["folio_interno"] = f"RH-CPU-{tip[:12].upper()}"
    report["folio_note"] = "Folio INTERNO de bench paralelo. NO es folio CNBV."

    out_dir = Path("pilot/output")
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "parallel_cpu_bench.json"
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Evidencia: {path}")
    print("Listo. Si paralelo < serie, repartir trabajo ayuda.")
    print("(En 1 nucleo efectivo el speedup puede ser ~1x.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
