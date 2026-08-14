# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA 0.1.2
=================
Paquete publico: Kernel Sigma + abstraccion + cripto ejecutable.

Cripto real hoy: SHA-256, RSA, Paillier (HE aditivo).
TFHE/HElib nativo: solo si la libreria C++ esta en el sistema.

Autor: Luis Angel Vazquez Martinez
DOI Version: https://doi.org/10.5281/zenodo.21922106
DOI Concept: https://doi.org/10.5281/zenodo.21744014
"""

from __future__ import annotations

__version__ = "0.1.2"
__trl__ = "6"
__status__ = "paquete instalable + tests + DOI; cripto SHA256/RSA/Paillier real; TFHE/HElib nativo opcional"
__author__ = "Luis Angel Vazquez Martinez"
__license__ = "AGPL-3.0-or-later / Comercial EMMOROR"
__doi_concept__ = "10.5281/zenodo.21744014"
__doi_version__ = "10.5281/zenodo.21922106"

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

from romeo_hydra.crypto import (
    sha256_hex,
    RSAProtocol,
    PaillierHE,
    HERuntime,
    he_status,
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
    "sha256_hex",
    "RSAProtocol",
    "PaillierHE",
    "HERuntime",
    "he_status",
]


def get_info() -> dict:
    st = he_status()
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
        "crypto": {
            "sha256": True,
            "rsa": st["rsa"]["impl"],
            "paillier_additive_he": True,
            "tfhe_native": st["tfhe_native"]["available"],
            "helib_native": st["helib_native"]["available"],
        },
        "honest_note": st["honest_summary"],
    }
