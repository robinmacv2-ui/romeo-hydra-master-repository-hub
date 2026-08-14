# -*- coding: utf-8 -*-
"""
Protocolo RSA ejecutable (dependencia: cryptography, como numpy).

RSA-OAEP + SHA-256. Integridad del plaintext con hashlib.sha256.
No es FHE. Es cifrado asimetrico clasico de protocolo.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

from romeo_hydra.crypto.sha256_integrity import sha256_hex


@dataclass
class RSAKeyPair:
    public_pem: str
    private_pem: str
    backend: str = "cryptography"


class RSAProtocol:
    """Cifrado y descifrado RSA-OAEP-SHA256 + hash de integridad."""

    def __init__(self, key_size: int = 2048) -> None:
        if key_size < 2048:
            raise ValueError("key_size minimo 2048 para ruta de produccion")
        self.key_size = key_size

    def generate_keypair(self) -> RSAKeyPair:
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

    def encrypt(self, public_pem: str, message: bytes, backend: str = "cryptography") -> dict[str, Any]:
        digest = sha256_hex(message)
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

    def decrypt(self, private_pem: str, package: dict[str, Any]) -> bytes:
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
