import numpy as np
from romeo_hydra.kernel.sigma_chameleon import (
    KernelConfig,
    KernelSigmaController,
    EnvironmentSpectrum,
)

if __name__ == "__main__":
    np.random.seed(42)

    cfg = KernelConfig(state_dimension=128, error_tolerance=0.02)
    kernel = KernelSigmaController(cfg)

    estado = np.random.randn(128)
    candidato = estado + np.random.randn(128) * 0.09

    core, chameleon = kernel.collapse_to_core(estado, candidato, local_N=2.5e8)

    print("Core SHA-256:", core.compute_sha256())
    print("\n--- HUMAN AUDIT ---")
    print(chameleon.project(EnvironmentSpectrum.HUMAN_AUDIT))
    print("\n--- STEALTH ---")
    print(chameleon.project(EnvironmentSpectrum.STEALTH_NEUTRAL, extra={"node_id": "hydra-01"}))
