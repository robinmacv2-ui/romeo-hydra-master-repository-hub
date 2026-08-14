# -*- coding: utf-8 -*-
"""Runtime cripto: funciona sin cryptography (Termux); usa OAEP si esta disponible."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol, _HAS_CRYPTOGRAPHY
from romeo_hydra.crypto.paillier_he import PaillierHE

try:
    from romeo_hydra.crypto.native_loader import native_status
except Exception:  # noqa: BLE001
    def native_status() -> dict[str, Any]:
        return {"loaded": False, "error": "native_loader unavailable"}


def he_status() -> dict[str, Any]:
    native = native_status()
    return {
        "sha256": {"available": True, "impl": "hashlib"},
        "rsa": {
            "available": True,
            "impl": "cryptography" if _HAS_CRYPTOGRAPHY else "pure-demo",
            "alg": "RSA-OAEP-SHA256" if _HAS_CRYPTOGRAPHY else "RSA-raw-demo",
            "production_ready": _HAS_CRYPTOGRAPHY,
            "note": (
                "cryptography optional: pip install 'romeo-hydra[crypto]' "
                "when wheels exist (not required on Termux)"
            ),
        },
        "paillier_additive_he": {
            "available": True,
            "impl": "pure-python",
            "is_tfhe": False,
            "is_full_he": False,
        },
        "native_cpp": native,
        "tfhe_native": {
            "available": bool(native.get("has_tfhe")),
            "note": "CMake stub/link; wheel does not ship TFHE",
        },
        "helib_native": {
            "available": bool(native.get("has_helib")),
            "note": "CMake stub/link; wheel does not ship HElib",
        },
        "wheel_note": (
            "~28K wheel is pure Python packaging — not a compiled TFHE binary "
            "(real libtfhe aarch64 is multi-MB)"
        ),
        "honest_summary": (
            "SHA-256 always. RSA via cryptography if installed else pure-demo. "
            "Paillier additive HE pure Python. TFHE/HElib not inside the wheel."
        ),
    }


@dataclass
class HERuntime:
    def status(self) -> dict[str, Any]:
        return he_status()

    def demo_stack(self, message: str = "romeo-hydra-pilot") -> dict[str, Any]:
        digest = sha256_hex(message)
        rsa = RSAProtocol()
        keys = rsa.generate_keypair()
        payload = digest.encode("utf-8") if keys.backend == "cryptography" else digest[:16].encode("utf-8")
        enc = rsa.encrypt(keys.public_pem, payload, backend=keys.backend)
        dec = rsa.decrypt(keys.private_pem, enc)

        phe = PaillierHE(prime_offset=42)
        pk = phe.generate_keypair()
        c_sum = phe.add_ciphertexts(
            phe.encrypt(pk.public, 17), phe.encrypt(pk.public, 25)
        )
        total = phe.decrypt(pk.private, c_sum)

        ledger_hash = chain_hash("0" * 64, json.dumps({"sha": digest, "sum": total}))
        return {
            "sha256": digest,
            "rsa_roundtrip_ok": dec == payload,
            "rsa_backend": keys.backend,
            "paillier_homomorphic_ok": total == 42,
            "ledger_chain_hash": ledger_hash,
            "tfhe_in_wheel": False,
            "note": he_status()["honest_summary"],
        }
