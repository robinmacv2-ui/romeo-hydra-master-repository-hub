# -*- coding: utf-8 -*-
"""Crypto layer - imports must not hard-fail without cryptography."""

from romeo_hydra.crypto.sha256_integrity import sha256_hex, sha256_file, chain_hash

try:
    from romeo_hydra.crypto.rsa_protocol import RSAProtocol, RSAKeyPair
except Exception:  # noqa: BLE001
    RSAProtocol = None  # type: ignore
    RSAKeyPair = None  # type: ignore

try:
    from romeo_hydra.crypto.paillier_he import PaillierHE, PaillierKeyPair
except Exception:  # noqa: BLE001
    PaillierHE = None  # type: ignore
    PaillierKeyPair = None  # type: ignore

try:
    from romeo_hydra.crypto.hydra_vault import HydraVault
except Exception:  # noqa: BLE001
    HydraVault = None  # type: ignore

try:
    from romeo_hydra.crypto.he_runtime import HERuntime, he_status
except Exception:  # noqa: BLE001
    HERuntime = None  # type: ignore

    def he_status():
        return {"sha256": True, "cryptography": False}

try:
    from romeo_hydra.crypto.native_loader import load_native, native_status, native_sha256_hex
except Exception:  # noqa: BLE001
    load_native = None  # type: ignore
    native_status = lambda: {"loaded": False}  # type: ignore
    native_sha256_hex = None  # type: ignore

__all__ = [
    "sha256_hex",
    "sha256_file",
    "chain_hash",
    "RSAProtocol",
    "RSAKeyPair",
    "PaillierHE",
    "PaillierKeyPair",
    "HydraVault",
    "HERuntime",
    "he_status",
    "load_native",
    "native_status",
    "native_sha256_hex",
]
