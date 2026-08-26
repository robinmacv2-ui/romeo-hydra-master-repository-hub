from __future__ import annotations

import secrets

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


KEY_SIZE = 32       # AES-256
NONCE_SIZE = 12     # 96-bit nonce recomendado para GCM


def _validate_key(key: bytes) -> None:
    if not isinstance(key, bytes):
        raise TypeError("La clave debe ser bytes")

    if len(key) != KEY_SIZE:
        raise ValueError("La clave debe tener exactamente 32 bytes (AES-256)")


def _validate_nonce(nonce: bytes) -> None:
    if not isinstance(nonce, bytes):
        raise TypeError("El nonce debe ser bytes")

    if len(nonce) != NONCE_SIZE:
        raise ValueError("El nonce debe tener exactamente 12 bytes")


def generate_key() -> bytes:
    """
    Genera una clave AES-256 criptográficamente aleatoria.
    """
    return secrets.token_bytes(KEY_SIZE)


def encrypt(
    key: bytes,
    plaintext: bytes,
    aad: bytes | None = None,
) -> tuple[bytes, bytes]:
    """
    Cifra y autentica un payload mediante AES-256-GCM.

    Retorna:
        (nonce, ciphertext)

    El ciphertext contiene también el tag GCM.
    """
    _validate_key(key)

    if not isinstance(plaintext, bytes):
        raise TypeError("El plaintext debe ser bytes")

    if aad is not None and not isinstance(aad, bytes):
        raise TypeError("AAD debe ser bytes o None")

    nonce = secrets.token_bytes(NONCE_SIZE)

    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(
        nonce,
        plaintext,
        aad,
    )

    return nonce, ciphertext


def decrypt(
    key: bytes,
    nonce: bytes,
    ciphertext: bytes,
    aad: bytes | None = None,
) -> bytes:
    """
    Verifica y descifra un payload AES-256-GCM.

    Si ciphertext, nonce, AAD o clave no corresponden,
    AESGCM rechaza la operación mediante InvalidTag.
    """
    _validate_key(key)
    _validate_nonce(nonce)

    if not isinstance(ciphertext, bytes):
        raise TypeError("El ciphertext debe ser bytes")

    if aad is not None and not isinstance(aad, bytes):
        raise TypeError("AAD debe ser bytes o None")

    aesgcm = AESGCM(key)

    return aesgcm.decrypt(
        nonce,
        ciphertext,
        aad,
    )


__all__ = [
    "KEY_SIZE",
    "NONCE_SIZE",
    "InvalidTag",
    "generate_key",
    "encrypt",
    "decrypt",
]
