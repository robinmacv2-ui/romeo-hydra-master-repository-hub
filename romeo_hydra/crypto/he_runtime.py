# -*- coding: utf-8 -*-
"""
Runtime unificado de cifrado.

Al instalar el paquete (pip install / pip install -e .) se bajan:
  - numpy
  - cryptography

Asi RSA-OAEP es siempre la ruta real, igual que numpy para el kernel.
"""

from __future__ import annotations

import ctypes.util
import json
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol
from romeo_hydra.crypto.paillier_he import PaillierHE


def _find_lib(names: list[str]) -> str | None:
    for name in names:
        path = ctypes.util.find_library(name)
        if path:
            return path
    return None


def he_status() -> dict[str, Any]:
    tfhe = _find_lib(["tfhe", "tfhe-spqlios-fma", "tfhe-fft"])
    helib = _find_lib(["helib", "HElib"])
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
        "tfhe_native": {
            "available": tfhe is not None,
            "library": tfhe,
            "note": "Optional C++ backend. Build from native/ — not shipped inside the Python wheel",
        },
        "helib_native": {
            "available": helib is not None,
            "library": helib,
            "note": "Optional C++ backend. Build from native/ — not shipped inside the Python wheel",
        },
        "zenodo_doi": "software timestamp only — not a cryptographic certification (not FIPS/SGS)",
        "honest_summary": (
            "On pip install: numpy + cryptography are pulled automatically. "
            "SHA-256, RSA-OAEP and Paillier additive HE run in pure install. "
            "Full TFHE/HElib circuit HE needs native libs built separately; "
            "status reports true/false without faking ciphertexts."
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

        return {
            "sha256": digest,
            "rsa_roundtrip_ok": dec == payload,
            "rsa_backend": "cryptography",
            "rsa_alg": "RSA-OAEP-SHA256",
            "paillier_17_plus_25": total,
            "paillier_homomorphic_ok": total == 42,
            "ledger_chain_hash": ledger_hash,
            "tfhe_native": he_status()["tfhe_native"]["available"],
            "helib_native": he_status()["helib_native"]["available"],
            "note": he_status()["honest_summary"],
        }
