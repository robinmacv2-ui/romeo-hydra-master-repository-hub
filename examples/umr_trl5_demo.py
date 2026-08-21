#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UMR TRL-5 - Unidad Mínima Reproducible de ROMEO-HYDRA 0.1.0
===========================================================
Ejecuta: python examples/umr_trl5_demo.py

Demuestra:
1. Kernel Sigma (estabilidad + proyección)
2. Adaptador mimético multi-espectro
3. Abstraction Layer (pliegue conceptual)
4. Metadatos de paquete y DOI
"""

from __future__ import annotations

import sys
import numpy as np

try:
    from romeo_hydra import (
        __version__,
        __trl__,
        get_info,
        KernelConfig,
        KernelSigmaController,
        MimeticSurfaceAdapter,
        EnvironmentSpectrum,
        RomeoAbstractionLayer,
    )
except ImportError:
    print("ERROR: Instala el paquete primero -> pip install -e .")
    sys.exit(1)


def run_umr() -> None:
    print("????????????????????????????????????????????????????????????")
    print("?     ROMEO-HYDRA 0.1.0 - UMR TRL-5 (Reproducible)         ?")
    print("????????????????????????????????????????????????????????????\n")

    # 0. Metadatos
    info = get_info()
    print("[0] Metadatos del paquete")
    for k, v in info.items():
        print(f"    {k:16} = {v}")

    # 1. Kernel Sigma
    print("\n[1] Kernel Sigma - evaluate_and_collapse")
    cfg = KernelConfig(state_dimension=48, error_tolerance=0.07, hessian_tau=0.05)
    kernel = KernelSigmaController(cfg)
    rng = np.random.default_rng(42)  # semilla fija -> reproducible
    current = np.zeros(48)
    candidate = rng.normal(0, 0.25, 48)
    result = kernel.evaluate_and_collapse(current, candidate)

    print(f"    original_entropy   = {result.original_entropy:.6f}")
    print(f"    final_entropy      = {result.final_entropy:.6f}")
    print(f"    projected          = {result.projected}")
    print(f"    hessian_ok         = {result.hessian_ok}")
    print(f"    max_eigenvalue     = {result.max_eigenvalue:.4f}")
    print(f"    config_fingerprint = {result.config_fingerprint}")

    # 2. Core + Adaptador mimético
    print("\n[2] CoreState + MimeticSurfaceAdapter")
    core, adapter = kernel.collapse_to_core(current, candidate)
    print(f"    core_sha256        = {core.compute_sha256()[:24]}?")
    print(f"    entropy            = {core.entropy:.6f}")

    spectrum, stress = adapter.sense_environment(noise_level=0.1, latency_ms=15)
    phenotype = adapter.project(spectrum)
    print(f"    spectrum           = {spectrum.value}")
    print(f"    stress             = {stress.value}")
    print(f"    phenotype keys     = {list(phenotype.keys()) if isinstance(phenotype, dict) else type(phenotype)}")

    # 3. Abstraction Layer
    print("\n[3] Romeo Abstraction Layer")
    romeo = RomeoAbstractionLayer()
    folded = romeo.fold_high_level("coherencia lógico-convexa bajo flujo homeostático")
    verified = romeo.verify_homomorphic_circuit("stub AES-like gate verification")
    print(f"    fold status        = {folded['status']}")
    print(f"    verified           = {verified['verified']}")
    print(f"    privacy            = {verified['privacy']}")

    print("\n? UMR TRL-5 completada con éxito.")
    print("  Determinista (seed=42) ? Offline ? Auditable")
    print("  Licencia dual: AGPL-3.0 / Comercial EMMOROR")
    print("  Contacto comercial: emmororromeohydra@gmail.com\n")


if __name__ == "__main__":
    run_umr()
