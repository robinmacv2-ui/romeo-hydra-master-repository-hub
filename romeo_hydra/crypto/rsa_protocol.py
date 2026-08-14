# -*- coding: utf-8 -*-
"""
Protocolo RSA ejecutable.

- Si `cryptography` esta instalado → RSA-OAEP-SHA256 (ruta fuerte).
- Si no (p.ej. Termux sin wheel) → RSA pure-Python demo (pow), documentado.

SHA-256 del plaintext siempre via hashlib (stdlib).
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
    def __init__(self, key_size: int = 2048) -> None:
        self.key_size = key_size if _HAS_CRYPTOGRAPHY else min(key_size, 512)

    def generate_keypair(self) -> RSAKeyPair:
        if _HAS_CRYPTOGRAPHY:
            private_key = rsa.generate_private_key(
                public_exponent=65537, key_size=max(self.key_size, 2048)
            )
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
        return self._pure_demo_keypair()

    def encrypt(self, public_pem: str, message: bytes, backend: str | None = None) -> dict[str, Any]:
        digest = sha256_hex(message)
        use = backend or ("cryptography" if _HAS_CRYPTOGRAPHY else "pure-demo")
        if use == "cryptography" and _HAS_CRYPTOGRAPHY:
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
        n, e = self._parse_demo_pub(public_pem)
        # pure-demo: solo payloads cortos
        if len(message) > 32:
            message = message[:32]
            digest = sha256_hex(message)
        m = int.from_bytes(message, "big")
        if m >= n:
            raise ValueError("mensaje demasiado largo para pure-demo RSA")
        c = pow(m, e, n)
        return {
            "alg": "RSA-raw-demo",
            "ciphertext_int": str(c),
            "plaintext_sha256": digest,
            "backend": "pure-demo",
            "warning": "Demo offline without cryptography; install cryptography for OAEP",
        }

    def decrypt(self, private_pem: str, package: dict[str, Any]) -> bytes:
        backend = package.get("backend", "cryptography")
        if backend == "cryptography" and _HAS_CRYPTOGRAPHY:
            private_key = serialization.load_pem_private_key(
                private_pem.encode("utf-8"), password=None
            )
            plaintext = private_key.decrypt(
                bytes.fromhex(package["ciphertext_hex"]),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                ),
            )
            if sha256_hex(plaintext) != package.get("plaintext_sha256"):
                raise ValueError("Integridad SHA-256 fallida")
            return plaintext
        n, d = self._parse_demo_priv(private_pem)
        m = pow(int(package["ciphertext_int"]), d, n)
        length = max(1, (m.bit_length() + 7) // 8)
        plaintext = m.to_bytes(length, "big")
        if sha256_hex(plaintext) != package.get("plaintext_sha256"):
            raise ValueError("Integridad SHA-256 fallida (pure-demo)")
        return plaintext

    def _pure_demo_keypair(self) -> RSAKeyPair:
        def is_prime(n: int) -> bool:
            if n < 2:
                return False
            if n % 2 == 0:
                return n == 2
            i = 3
            while i * i <= n:
                if n % i == 0:
                    return False
                i += 2
            return True

        def prime_near(start: int) -> int:
            n = start | 1
            while not is_prime(n):
                n += 2
            return n

        seed = int.from_bytes(os.urandom(4), "big")
        p = prime_near(30000 + (seed % 20000))
        q = prime_near(50000 + ((seed >> 8) % 20000))
        if p == q:
            q = prime_near(q + 1000)
        n = p * q
        phi = (p - 1) * (q - 1)
        e = 65537
        d = pow(e, -1, phi)
        pub = json.dumps({"n": str(n), "e": e, "demo": True})
        priv = json.dumps({"n": str(n), "d": str(d), "demo": True})
        return RSAKeyPair(public_pem=pub, private_pem=priv, backend="pure-demo")

    @staticmethod
    def _parse_demo_pub(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["e"])

    @staticmethod
    def _parse_demo_priv(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["d"])
