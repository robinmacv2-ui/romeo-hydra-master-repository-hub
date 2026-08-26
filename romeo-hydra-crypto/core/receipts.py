from __future__ import annotations

import re
import secrets
import time
from dataclasses import dataclass, asdict
from typing import Sequence

from .canonical import canonical_json, sha256_hex


GENESIS_HASH = "0" * 64
HASH_PATTERN = re.compile(r"^[0-9a-f]{64}$")


def is_sha256(value: str) -> bool:
    """
    Comprueba que value tenga exactamente el formato
    hexadecimal de un SHA-256.
    """
    return (
        isinstance(value, str)
        and HASH_PATTERN.fullmatch(value) is not None
    )


def validate_hash(value: str, field: str) -> None:
    if not is_sha256(value):
        raise ValueError(
            f"{field} no contiene un SHA-256 valido"
        )


@dataclass(frozen=True)
class Receipt:
    """
    Registro inmutable de una decisión/evento.

    La inmutabilidad del dataclass es una protección de
    aplicación, NO una garantía criptográfica por sí misma.
    """

    version: int
    timestamp: int
    record_hash: str
    previous_hash: str
    nonce: str

    def __post_init__(self) -> None:

        if self.version < 1:
            raise ValueError(
                "version invalida"
            )

        if self.timestamp <= 0:
            raise ValueError(
                "timestamp invalido"
            )

        validate_hash(
            self.record_hash,
            "record_hash",
        )

        validate_hash(
            self.previous_hash,
            "previous_hash",
        )

        if not self.nonce:
            raise ValueError(
                "nonce vacio"
            )

    def to_dict(self) -> dict:
        return asdict(self)

    def canonical_bytes(self) -> bytes:
        return canonical_json(
            self.to_dict()
        )

    def digest(self) -> str:
        return sha256_hex(
            self.canonical_bytes()
        )


def create_receipt(
    record_hash: str,
    previous_hash: str = GENESIS_HASH,
) -> Receipt:

    validate_hash(
        record_hash,
        "record_hash",
    )

    validate_hash(
        previous_hash,
        "previous_hash",
    )

    return Receipt(
        version=1,
        timestamp=int(time.time()),
        record_hash=record_hash,
        previous_hash=previous_hash,
        nonce=secrets.token_hex(16),
    )


def verify_chain(
    receipts: Sequence[Receipt],
) -> bool:
    """
    Verifica continuidad criptográfica de una cadena.

    Propiedades comprobadas:

    R1.previous_hash == GENESIS_HASH

    R(n).previous_hash == digest(R(n-1))
    """

    if not receipts:
        return False

    previous = GENESIS_HASH

    try:

        for receipt in receipts:

            if not isinstance(
                receipt,
                Receipt,
            ):
                return False

            if receipt.previous_hash != previous:
                return False

            # Fuerza validación estructural.
            receipt.__post_init__()

            previous = receipt.digest()

        return True

    except (
        TypeError,
        ValueError,
    ):
        return False
