# -*- coding: utf-8 -*-
"""
Protocolo RSA ejecutable.

Preferencia: paquete `cryptography` (RSA-OAEP SHA-256).
Fallback: implementacion minima con pow() para demos offline sin deps extra.

No es FHE. Es cifrado asimétrico clasico + integridad SHA-256 del mensaje.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex

_HAS_CRYPTOGRAPHY = False
try:
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.primitives import hashes, serialization

    _HAS_CRYPTOGRAPHY = True
except ImportError:
    pass


@dataclass
class RSAKeyPair:
    public_pem: str
    private_pem: str
    backend: str  # "cryptography" | "pure-demo"


class RSAProtocol:
    """Cifrado y descifrado RSA + hash de integridad del plaintext."""

    def __init__(self, key_size: int = 2048) -> None:
        self.key_size = key_size

    def generate_keypair(self) -> RSAKeyPair:
        if _HAS_CRYPTOGRAPHY:
            private_key = rsa.generate_private_key(public_exponent=65537, key_size=self.key_size)
            public_key = private_key.public_key()
            priv_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            ).decode("utf-8")
            pub_pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ).decode("utf-8")
            return RSAKeyPair(public_pem=pub_pem, private_pem=priv_pem, backend="cryptography")

        # Fallback demo: modulo pequeno solo para tests offline sin cryptography.
        # NO usar en produccion (key_size efectivo ~512 bits toy).
        return self._pure_demo_keypair()

    def encrypt(self, public_pem: str, message: bytes, backend: str = "cryptography") -> dict[str, Any]:
        digest = sha256_hex(message)
        if backend == "cryptography" and _HAS_CRYPTOGRAPHY:
            public_key = serialization.load_pem_public_key(public_pem.encode("utf-8"))
            ciphertext = public_key.encrypt(
                message,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                ),
            )
            return {
                "alg": "RSA-OAEP-SHA256",
                "ciphertext_hex": ciphertext.hex(),
                "plaintext_sha256": digest,
                "backend": "cryptography",
            }

        # pure-demo path
        n, e = self._parse_demo_pub(public_pem)
        m = int.from_bytes(message, "big")
        if m >= n:
            raise ValueError("Mensaje demasiado largo para clave demo pure; use cryptography")
        c = pow(m, e, n)
        return {
            "alg": "RSA-raw-demo",
            "ciphertext_int": str(c),
            "plaintext_sha256": digest,
            "backend": "pure-demo",
            "warning": "Demo only — install cryptography for RSA-OAEP production path",
        }

    def decrypt(self, private_pem: str, package: dict[str, Any]) -> bytes:
        backend = package.get("backend", "cryptography")
        if backend == "cryptography" and _HAS_CRYPTOGRAPHY:
            private_key = serialization.load_pem_private_key(
                private_pem.encode("utf-8"), password=None
            )
            ciphertext = bytes.fromhex(package["ciphertext_hex"])
            plaintext = private_key.decrypt(
                ciphertext,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                ),
            )
            if sha256_hex(plaintext) != package.get("plaintext_sha256"):
                raise ValueError("Integridad SHA-256 fallida tras descifrado RSA")
            return plaintext

        n, d = self._parse_demo_priv(private_pem)
        c = int(package["ciphertext_int"])
        m = pow(c, d, n)
        length = (m.bit_length() + 7) // 8
        plaintext = m.to_bytes(length, "big")
        if sha256_hex(plaintext) != package.get("plaintext_sha256"):
            raise ValueError("Integridad SHA-256 fallida (demo RSA)")
        return plaintext

    def _pure_demo_keypair(self) -> RSAKeyPair:
        # Primes fijos pequenos solo para CI offline — documentado como demo.
        p, q = 65537, 65539  # bad for security; demo structure only
        # Use slightly better random-ish from os.urandom derived candidates
        def _prime_near(start: int) -> int:
            n = start | 1
            while not self._is_prime(n):
                n += 2
            return n

        seed = int.from_bytes(os.urandom(4), "big")
        p = _prime_near(30000 + (seed % 20000))
        q = _prime_near(50000 + ((seed >> 8) % 20000))
        if p == q:
            q = _prime_near(q + 1000)
        n = p * q
        phi = (p - 1) * (q - 1)
        e = 65537
        d = pow(e, -1, phi)
        pub = json.dumps({"n": str(n), "e": e, "demo": True})
        priv = json.dumps({"n": str(n), "d": str(d), "demo": True})
        return RSAKeyPair(public_pem=pub, private_pem=priv, backend="pure-demo")

    @staticmethod
    def _is_prime(n: int) -> bool:
        if n < 2:
            return False
        if n % 2 == 0:
            return n == 2
        r = int(n**0.5) + 1
        for i in range(3, r, 2):
            if n % i == 0:
                return False
        return True

    @staticmethod
    def _parse_demo_pub(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["e"])

    @staticmethod
    def _parse_demo_priv(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["d"])
