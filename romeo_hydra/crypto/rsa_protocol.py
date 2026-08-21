# -*- coding: utf-8 -*-
"""RSA: cryptography if present, else pure-demo. Never hard-require cryptography."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex

_HAS_CRYPTOGRAPHY = False
try:
    from cryptography.hazmat.primitives.asymmetric import rsa, padding  # type: ignore
    from cryptography.hazmat.primitives import hashes, serialization  # type: ignore

    _HAS_CRYPTOGRAPHY = True
except ImportError:
    rsa = padding = hashes = serialization = None  # type: ignore


@dataclass
class RSAKeyPair:
    public_pem: str
    private_pem: str
    backend: str


class RSAProtocol:
    def __init__(self, key_size: int = 2048) -> None:
        self.key_size = key_size if _HAS_CRYPTOGRAPHY else 512

    def generate_keypair(self) -> RSAKeyPair:
        if _HAS_CRYPTOGRAPHY:
            private_key = rsa.generate_private_key(public_exponent=65537, key_size=max(2048, self.key_size))
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
        if len(message) > 32:
            message = message[:32]
            digest = sha256_hex(message)
        n, e = self._parse_demo_pub(public_pem)
        m = int.from_bytes(message, "big")
        if m >= n:
            raise ValueError("message too long for pure-demo RSA")
        return {
            "alg": "RSA-raw-demo",
            "ciphertext_int": str(pow(m, e, n)),
            "plaintext_sha256": digest,
            "backend": "pure-demo",
            "warning": "pure-demo; install cryptography for OAEP when possible",
        }

    def decrypt(self, private_pem: str, package: dict[str, Any]) -> bytes:
        backend = package.get("backend", "cryptography")
        if backend == "cryptography" and _HAS_CRYPTOGRAPHY:
            private_key = serialization.load_pem_private_key(private_pem.encode("utf-8"), password=None)
            plaintext = private_key.decrypt(
                bytes.fromhex(package["ciphertext_hex"]),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                ),
            )
            if sha256_hex(plaintext) != package.get("plaintext_sha256"):
                raise ValueError("SHA-256 integrity failed")
            return plaintext
        n, d = self._parse_demo_priv(private_pem)
        m = pow(int(package["ciphertext_int"]), d, n)
        length = max(1, (m.bit_length() + 7) // 8)
        plaintext = m.to_bytes(length, "big")
        if sha256_hex(plaintext) != package.get("plaintext_sha256"):
            raise ValueError("SHA-256 integrity failed (pure-demo)")
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
        return RSAKeyPair(
            public_pem=json.dumps({"n": str(n), "e": e, "demo": True}),
            private_pem=json.dumps({"n": str(n), "d": str(d), "demo": True}),
            backend="pure-demo",
        )

    @staticmethod
    def _parse_demo_pub(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["e"])

    @staticmethod
    def _parse_demo_priv(blob: str) -> tuple[int, int]:
        data = json.loads(blob)
        return int(data["n"]), int(data["d"])
