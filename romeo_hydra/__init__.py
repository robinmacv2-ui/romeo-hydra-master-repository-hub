# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA 0.1.2
=================
Offline package. SHA-256 always. Crypto extras optional for Termux.
Genesis block frozen (Satoshi model).

Author: Luis Angel Vazquez Martinez
DOI Version: 10.5281/zenodo.21922106
"""

from __future__ import annotations

__version__ = "0.1.2"
__trl__ = "6"
__status__ = "offline installable; SHA256+ledger; FHE bridge not compiled TFHE in wheel"
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
)

# Crypto is soft-imported so missing optional pieces never break import
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
    "sha256_hex",
    "get_info",
]

if _CRYPTO_OK:
    __all__ += ["RSAProtocol", "PaillierHE", "HERuntime", "he_status"]


def get_info() -> dict:
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
        "honest_note": (
            "Pure-Python package (~55K sdist/wheel class). "
            "Not a multi-MB compiled TFHE library. "
            "Pilot ledgers are internal evidence, not CNBV folios. "
            "Genesis hash is the frozen root of trust (Satoshi model)."
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
