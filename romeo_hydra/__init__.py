# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA 0.1.1 (TRL-5)
=========================
Ontological Framework & Biomimetic Computing Engine.

Núcleo público estable para investigación y evaluación comercial.

Licencia Dual:
  - AGPL-3.0  → uso académico / investigación / evaluación
  - Comercial EMMOROR → producción en entidades reguladas (requiere licencia)

Autor: Luis Ángel Vázquez Martínez
DOI Concept: https://doi.org/10.5281/zenodo.21744014
"""

from __future__ import annotations

__version__ = "0.1.1"
__trl__ = "5"
__status__ = "TRL-5: Component validation in relevant environment"
__author__ = "Luis Ángel Vázquez Martínez"
__license__ = "AGPL-3.0-or-later / Comercial EMMOROR"

# ── Core (Abstracción + TFHE + HElib BGV/CKKS) ───────────────────────────────
from romeo_hydra.core import (
    RomeoAbstractionLayer,
    TFHECore,
    HElibCore,
    RomeoTFHEBridge,
)

# ── Kernel Sigma (Controlador de estabilidad + adaptador mimético) ────────────
from romeo_hydra.kernel import (
    KernelConfig,
    KernelSigmaController,
    CoreState,
    MimeticSurfaceAdapter,
    EnvironmentSpectrum,
    CerebroResonador7219,
    ModulacionResonante7219,
    ANGLE_PENTAGONS_72,
    PRIME_ANCHOR_19,
)

__all__ = [
    # Meta
    "__version__",
    "__trl__",
    "__status__",
    # Core
    "RomeoAbstractionLayer",
    "TFHECore",
    "HElibCore",
    "RomeoTFHEBridge",
    # Kernel
    "KernelConfig",
    "KernelSigmaController",
    "CoreState",
    "MimeticSurfaceAdapter",
    "EnvironmentSpectrum",
    "CerebroResonador7219",
    "ModulacionResonante7219",
    "ANGLE_PENTAGONS_72",
    "PRIME_ANCHOR_19",
]


def get_info() -> dict:
    """Información rápida del paquete (útil para auditoría y demos)."""
    return {
        "name": "romeo-hydra",
        "version": __version__,
        "trl": __trl__,
        "status": __status__,
        "author": __author__,
        "license": __license__,
        "doi_concept": "10.5281/zenodo.21744014",
        "python_requires": ">=3.11",
        "he_backends": ["TFHE", "HElib (BGV/CKKS)"],
    }
