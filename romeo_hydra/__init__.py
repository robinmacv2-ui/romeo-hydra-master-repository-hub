# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA 0.1.1
=================
Paquete publico: Kernel Sigma + capa de abstraccion.
Corre offline. Con tests. Con DOI en Zenodo.

Licencia dual:
  - AGPL-3.0  → investigacion / evaluacion / concursos
  - Comercial EMMOROR → produccion regulada (requiere contacto)

Autor: Luis Angel Vazquez Martinez
DOI Concept: https://doi.org/10.5281/zenodo.21744014
DOI Version: https://doi.org/10.5281/zenodo.21918611
"""

from __future__ import annotations

__version__ = "0.1.1"
__trl__ = "6"
__status__ = "paquete instalable + tests + DOI version; piloto offline disponible"
__author__ = "Luis Angel Vazquez Martinez"
__license__ = "AGPL-3.0-or-later / Comercial EMMOROR"
__doi_concept__ = "10.5281/zenodo.21744014"
__doi_version__ = "10.5281/zenodo.21918611"

from romeo_hydra.core import (
    RomeoAbstractionLayer,
    TFHECore,
    HElibCore,
    RomeoTFHEBridge,
)

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
    "__version__",
    "__trl__",
    "__status__",
    "__doi_concept__",
    "__doi_version__",
    "RomeoAbstractionLayer",
    "TFHECore",
    "HElibCore",
    "RomeoTFHEBridge",
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
    """Metadatos del paquete (auditoria y demos)."""
    return {
        "name": "romeo-hydra",
        "version": __version__,
        "trl": __trl__,
        "status": __status__,
        "author": __author__,
        "license": __license__,
        "doi_concept": __doi_concept__,
        "doi_version": __doi_version__,
        "python_requires": ">=3.11",
        "he_backends": ["TFHE (bridge)", "HElib (bridge)"],
        "honest_note": "Homomorphic layer is bridge/conceptual; core value is offline stability + audit trail",
    }
