# -*- coding: utf-8 -*-
"""
Runtime unificado de cifrado.

Reporta con honestidad que backends estan vivos:
  - sha256: siempre
  - rsa: cryptography o pure-demo
  - paillier: pure Python (HE aditivo real)
  - tfhe_native / helib_native: solo si libreria del sistema existe
"""

from __future__ import annotations

import ctypes.util
import json
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol, _HAS_CRYPTOGRAPHY
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
            "impl": "cryptography" if _HAS_CRYPTOGRAPHY else "pure-demo",
            "production_ready": _HAS_CRYPTOGRAPHY,
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
            "note": "Requiere libtfhe instalada en el sistema; el wheel Python no la incluye",
        },
        "helib_native": {
            "available": helib is not None,
            "library": helib,
            "note": "Requiere HElib instalada en el sistema; el wheel Python no la incluye",
        },
        "zenodo_doi": "timestamp de software, no certificacion criptografica",
        "honest_summary": (
            "SHA-256 + RSA + Paillier (aditivo) son ejecutables en este paquete. "
            "TFHE/HElib full circuit HE requieren bibliotecas nativas C++; "
            "si no estan, no se finge encrypt TFHE."
        ),
    }


@dataclass
class HERuntime:
    """Facade para demos reproducibles."""

    def status(self) -> dict[str, Any]:
        return he_status()

    def demo_stack(self, message: str = "romeo-hydra-pilot") -> dict[str, Any]:
        """Pipeline real: SHA-256 → RSA envelope → Paillier sum proof."""
        digest = sha256_hex(message)

        rsa = RSAProtocol(key_size=2048 if _HAS_CRYPTOGRAPHY else 512)
        keys = rsa.generate_keypair()
        # RSA solo cifra mensajes cortos; usamos el hash como payload tipico de protocolo
        payload = digest.encode("utf-8")
        if keys.backend == "pure-demo":
            payload = digest[:16].encode("utf-8")
        enc = rsa.encrypt(keys.public_pem, payload, backend=keys.backend)
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
            "rsa_backend": keys.backend,
            "paillier_17_plus_25": total,
            "paillier_homomorphic_ok": total == 42,
            "ledger_chain_hash": ledger_hash,
            "tfhe_native": he_status()["tfhe_native"]["available"],
            "helib_native": he_status()["helib_native"]["available"],
            "note": he_status()["honest_summary"],
        }
