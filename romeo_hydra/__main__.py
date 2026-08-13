# -*- coding: utf-8 -*-
"""CLI mínima de ROMEO-HYDRA 0.1.0 (TRL-5)."""

from __future__ import annotations

import sys
import numpy as np

from romeo_hydra import (
    __version__,
    __trl__,
    get_info,
    KernelConfig,
    KernelSigmaController,
    RomeoAbstractionLayer,
)


def main() -> int:
    print("═" * 60)
    print(f"  ROMEO-HYDRA v{__version__}  |  TRL-{__trl__}")
    print("═" * 60)

    info = get_info()
    for k, v in info.items():
        print(f"  {k:18}: {v}")

    print("\n[1] Kernel Sigma — prueba de estabilidad rápida")
    cfg = KernelConfig(state_dimension=32, error_tolerance=0.08)
    kernel = KernelSigmaController(cfg)

    current = np.zeros(32, dtype=np.float64)
    candidate = np.random.randn(32) * 0.3
    result = kernel.evaluate_and_collapse(current, candidate)

    print(f"  original_entropy : {result.original_entropy:.6f}")
    print(f"  final_entropy    : {result.final_entropy:.6f}")
    print(f"  projected        : {result.projected}")
    print(f"  hessian_ok       : {result.hessian_ok}")
    print(f"  config_fp        : {result.config_fingerprint}")

    print("\n[2] Abstraction Layer — esqueleto conceptual")
    romeo = RomeoAbstractionLayer()
    folded = romeo.fold_high_level("validación de coherencia ontológica")
    print(f"  status           : {folded['status']}")
    print(f"  representation   : {folded['representation']}")

    print("\n✓ UMR TRL-5 ejecutada correctamente.")
    print("  Para uso comercial contactar: emmororromeohydra@gmail.com")
    print("═" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
