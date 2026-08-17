# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA 0.1.3
=================
Offline, installable Python package for SHA-256 evidence ledgers,
a stability/governance kernel, and an optional conceptual HE bridge.

Not an LLM. Not a compiled TFHE library. Not a CNBV folio.

Product surface for evaluators: install, pilots, tests, genesis root,
CI. Internal module names (PPRH, Kernel Sigma, PLAM, HPR, etc.) are
*project-specific* nomenclature — not industry standards.

Author: Luis Angel Vazquez Martinez
DOI Version: 10.5281/zenodo.21922106
"""

from __future__ import annotations

__version__ = "0.1.3"
__trl__ = "6"
__status__ = (
    "offline installable; genesis root + SHA-256 ledgers + "
    "stability kernel + optional HE bridge; not an LLM"
)
__author__ = "Luis Angel Vazquez Martinez"
__license__ = "AGPL-3.0-or-later / Comercial EMMOROR"
__doi_concept__ = "10.5281/zenodo.21744014"
__doi_version__ = "10.5281/zenodo.21922106"

from romeo_hydra.genesis import (
    GENESIS_HASH,
    GENESIS_PAYLOAD,
    GenesisMismatchError,
    assert_genesis_or_die,
    genesis_block,
    verify_genesis,
)

from romeo_hydra.core import (
    RomeoAbstractionLayer,
    TFHECore,
    HElibCore,
    RomeoTFHEBridge,
    AtomicLedgerWriter,
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
    PLAMConfig,
    PLAMResult,
    PLAMQuantumWrapper,
    BifurcationMode,
    ContainmentStatus,
    plam_quantum_wrapper,
    # Dossier Matemático Supremo (lab math core — API kept for compatibility)
    AXIOM_I,
    AXIOM_II,
    AXIOM_III,
    SigmaThresholds,
    DEFAULT_THRESHOLDS,
    double_well_potential,
    double_well_hessian_analytical,
    structural_potential_sigma,
    structural_hessian_sigma,
    balance_functional,
    HPRResult,
    HPREngine,
    numerical_jacobian,
    hessian_vector_product,
    kronecker_inverse_blocks,
    PPRHPhase,
    PPRHState,
    PPRHProtocol,
    validate_block_chain,
    make_block,
    DossierMathCore,
)

from romeo_hydra.gateway import RomeoGateway, create_gateway, ValidationResult

try:
    from romeo_hydra.crypto import (
        sha256_hex,
        RSAProtocol,
        PaillierHE,
        HERuntime,
        he_status,
    )
    _CRYPTO_OK = True
except Exception:  # noqa: BLE001
    _CRYPTO_OK = False

    def sha256_hex(data):  # type: ignore
        import hashlib
        if isinstance(data, str):
            data = data.encode()
        return hashlib.sha256(data).hexdigest()

    def he_status():  # type: ignore
        return {"sha256": True, "crypto_module": False}

    HERuntime = None  # type: ignore
    RSAProtocol = None  # type: ignore
    PaillierHE = None  # type: ignore

__all__ = [
    "__version__",
    "__trl__",
    "__doi_concept__",
    "__doi_version__",
    "GENESIS_HASH",
    "GENESIS_PAYLOAD",
    "GenesisMismatchError",
    "assert_genesis_or_die",
    "verify_genesis",
    "genesis_block",
    "RomeoAbstractionLayer",
    "TFHECore",
    "HElibCore",
    "RomeoTFHEBridge",
    "AtomicLedgerWriter",
    "KernelConfig",
    "KernelSigmaController",
    "CoreState",
    "MimeticSurfaceAdapter",
    "EnvironmentSpectrum",
    "CerebroResonador7219",
    "ModulacionResonante7219",
    "ANGLE_PENTAGONS_72",
    "PRIME_ANCHOR_19",
    "PLAMConfig",
    "PLAMResult",
    "PLAMQuantumWrapper",
    "BifurcationMode",
    "ContainmentStatus",
    "plam_quantum_wrapper",
    "AXIOM_I",
    "AXIOM_II",
    "AXIOM_III",
    "SigmaThresholds",
    "DEFAULT_THRESHOLDS",
    "double_well_potential",
    "double_well_hessian_analytical",
    "structural_potential_sigma",
    "structural_hessian_sigma",
    "balance_functional",
    "HPRResult",
    "HPREngine",
    "numerical_jacobian",
    "hessian_vector_product",
    "kronecker_inverse_blocks",
    "PPRHPhase",
    "PPRHState",
    "PPRHProtocol",
    "validate_block_chain",
    "make_block",
    "DossierMathCore",
    "RomeoGateway",
    "create_gateway",
    "ValidationResult",
    "sha256_hex",
    "get_info",
]

if _CRYPTO_OK:
    __all__ += ["RSAProtocol", "PaillierHE", "HERuntime", "he_status"]


def get_info() -> dict:
    """Public metadata for evaluators and operators (no secrets)."""
    genesis_ok = verify_genesis()
    info = {
        "name": "romeo-hydra",
        "version": __version__,
        "trl": __trl__,
        "status": __status__,
        "author": __author__,
        "doi_version": __doi_version__,
        "doi_concept": __doi_concept__,
        "genesis_hash": GENESIS_HASH,
        "genesis_ok": genesis_ok,
        "genesis_timestamp_utc": GENESIS_PAYLOAD["timestamp_utc"],
        "wheel_is_compiled_tfhe": False,
        "role": (
            "Offline evidence + stability kernel + optional governance "
            "gateway for external models — not an LLM"
        ),
        "nomenclature_note": (
            "Names such as PPRH, Kernel Sigma, PLAM, HPR, and "
            "DossierMathCore are internal module names of this project, "
            "not external industry standards."
        ),
        "lab_modules_present": True,
        "honest_note": (
            "Pure-Python package. Not a multi-MB compiled TFHE library. "
            "Not a language model. Pilot ledgers are internal evidence, "
            "not CNBV folios. Genesis hash is the frozen root of trust. "
            "Seeking first offline pilot LOI; 0 paying customers / $0 MRR."
        ),
    }
    if _CRYPTO_OK:
        try:
            info["crypto"] = he_status()
        except Exception as e:  # noqa: BLE001
            info["crypto"] = {"error": str(e)}
    else:
        info["crypto"] = {"available": False, "reason": "romeo_hydra.crypto not importable"}
    return info
