# -*- coding: utf-8 -*-
"""Runtime unificado: Python crypto + optional C++ native backend."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol
from romeo_hydra.crypto.paillier_he import PaillierHE
from romeo_hydra.crypto.native_loader import load_native, native_status


def he_status() -> dict[str, Any]:
    native = native_status()
    return {
        "sha256": {"available": True, "impl": "hashlib"},
        "rsa": {
            "available": True,
            "impl": "cryptography",
            "alg": "RSA-OAEP-SHA256",
            "production_ready": True,
            "installed_via": "pip dependency (like numpy)",
        },
        "paillier_additive_he": {
            "available": True,
            "impl": "pure-python",
            "property": "Dec(Enc(a)*Enc(b)) = a+b",
            "is_tfhe": False,
            "is_full_he": False,
        },
        "native_cpp": native,
        "tfhe_native": {
            "available": bool(native.get("has_tfhe")),
            "via": "libromeo_native" if native.get("loaded") else None,
            "selfcheck": native.get("tfhe_selfcheck"),
            "note": "Build native/ with system libtfhe to enable",
        },
        "helib_native": {
            "available": bool(native.get("has_helib")),
            "via": "libromeo_native" if native.get("loaded") else None,
            "selfcheck": native.get("helib_selfcheck"),
            "note": "Build native/ with system HElib to enable",
        },
        "zenodo_doi": "software timestamp only — not a cryptographic certification",
        "honest_summary": (
            "pip install pulls numpy + cryptography. "
            "SHA-256, RSA-OAEP, Paillier additive HE run without C++. "
            "Optional CMake libromeo_native adds C ABI + TFHE/HElib link flags when libs exist."
        ),
    }


@dataclass
class HERuntime:
    def status(self) -> dict[str, Any]:
        return he_status()

    def demo_stack(self, message: str = "romeo-hydra-pilot") -> dict[str, Any]:
        digest = sha256_hex(message)

        rsa = RSAProtocol(key_size=2048)
        keys = rsa.generate_keypair()
        payload = digest.encode("utf-8")
        enc = rsa.encrypt(keys.public_pem, payload)
        dec = rsa.decrypt(keys.private_pem, enc)

        phe = PaillierHE(prime_offset=42)
        pk = phe.generate_keypair()
        c1 = phe.encrypt(pk.public, 17)
        c2 = phe.encrypt(pk.public, 25)
        c_sum = phe.add_ciphertexts(c1, c2)
        total = phe.decrypt(pk.private, c_sum)

        ledger_prev = "0" * 64
        entry = json.dumps({"msg_sha256": digest, "paillier_sum": total}, sort_keys=True)
        ledger_hash = chain_hash(ledger_prev, entry)

        native = native_status()
        return {
            "sha256": digest,
            "rsa_roundtrip_ok": dec == payload,
            "rsa_backend": "cryptography",
            "rsa_alg": "RSA-OAEP-SHA256",
            "paillier_17_plus_25": total,
            "paillier_homomorphic_ok": total == 42,
            "ledger_chain_hash": ledger_hash,
            "native_loaded": native.get("loaded"),
            "tfhe_native": bool(native.get("has_tfhe")),
            "helib_native": bool(native.get("has_helib")),
            "note": he_status()["honest_summary"],
        }
