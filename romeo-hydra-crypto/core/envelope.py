from __future__ import annotations

import hashlib
import hmac
import json
from typing import Any

from core.pedersen import (
    P,
    Q,
    commit,
    verify as verify_pedersen,
)


CURRENT_VERSION = 1
VERSION = CURRENT_VERSION

# RFC 3526 MODP Group 14 = 2048-bit prime → 512 hex chars.
P_HEX_LENGTH = (P.bit_length() + 3) // 4

NONCE_HEX_LENGTH = 12 * 2       # 96-bit GCM nonce
DIGEST_HEX_LENGTH = 32 * 2      # SHA-256
COMMITMENT_HEX_LENGTH = P_HEX_LENGTH


ALLOWED_FIELDS = frozenset(
    {
        "version",
        "event_id",
        "nonce",
        "ciphertext",
        "aad",
        "payload_digest",
        "pedersen_commitment",
        "digest",
    }
)


def _is_hex(value: str, expected_length: int | None = None) -> bool:
    if not isinstance(value, str):
        return False
    if expected_length is not None and len(value) != expected_length:
        return False
    if len(value) % 2 != 0:
        return False
    if not value:
        return True
    return all(c in "0123456789abcdefABCDEF" for c in value)


def _canonical_json_bytes(data: dict[str, Any]) -> bytes:
    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def _canonical_base_data(envelope: dict[str, Any]) -> dict[str, Any]:
    """
    Campos del payload_digest.

    Excluye pedersen_commitment (randomness) y ambos digests
    (evitar recursión).
    """
    return {
        "version": envelope["version"],
        "event_id": envelope["event_id"],
        "nonce": envelope["nonce"],
        "ciphertext": envelope["ciphertext"],
        "aad": envelope["aad"],
    }


def _payload_digest(envelope: dict[str, Any]) -> bytes:
    return hashlib.sha256(
        _canonical_json_bytes(_canonical_base_data(envelope))
    ).digest()


def _envelope_digest(envelope: dict[str, Any]) -> str:
    """
    Integridad del sobre completo.

    Material = ALLOWED_FIELDS \ {digest}.
    Incluye payload_digest y pedersen_commitment (públicos).
    """
    material = {
        k: envelope[k]
        for k in sorted(ALLOWED_FIELDS)
        if k != "digest"
    }
    return hashlib.sha256(_canonical_json_bytes(material)).hexdigest()


def _validate_envelope_structure(data: Any) -> None:
    if not isinstance(data, dict):
        raise TypeError("El envelope debe ser un diccionario")

    keys = set(data.keys())
    if keys != ALLOWED_FIELDS:
        missing = ALLOWED_FIELDS - keys
        extra = keys - ALLOWED_FIELDS
        raise ValueError(
            "Estructura de envelope inválida. "
            f"Faltan: {sorted(missing)}, Extra: {sorted(extra)}"
        )

    if data["version"] != CURRENT_VERSION:
        raise ValueError(
            f"Versión de envelope no soportada: {data['version']}"
        )

    if not isinstance(data["event_id"], str) or not data["event_id"]:
        raise TypeError("event_id debe ser un string no vacío")

    if not _is_hex(data["nonce"], NONCE_HEX_LENGTH):
        raise ValueError(
            "El nonce debe contener exactamente 12 bytes en hexadecimal"
        )

    if not _is_hex(data["ciphertext"]):
        raise ValueError("El ciphertext debe ser hexadecimal válido")

    if not _is_hex(data["aad"]):
        raise ValueError("El AAD debe ser hexadecimal válido")

    if not _is_hex(data["payload_digest"], DIGEST_HEX_LENGTH):
        raise ValueError(
            "El payload_digest debe contener exactamente "
            "32 bytes en hexadecimal"
        )

    if not _is_hex(data["pedersen_commitment"], COMMITMENT_HEX_LENGTH):
        raise ValueError(
            "El pedersen_commitment debe contener exactamente "
            f"{P_HEX_LENGTH} caracteres hexadecimales"
        )

    commitment_int = int(data["pedersen_commitment"], 16)
    if not (1 <= commitment_int < P):
        raise ValueError(
            "El pedersen_commitment debe pertenecer a Z_p*"
        )

    if not _is_hex(data["digest"], DIGEST_HEX_LENGTH):
        raise ValueError(
            "El digest debe contener exactamente 32 bytes en hexadecimal"
        )


def seal(
    event_id: str,
    nonce: bytes,
    ciphertext: bytes,
    aad: bytes | None = None,
    r: int | None = None,
) -> tuple[dict[str, Any], int]:
    if not isinstance(event_id, str) or not event_id:
        raise TypeError("event_id debe ser un string no vacío")

    if not isinstance(nonce, bytes) or len(nonce) != 12:
        raise ValueError("El nonce debe ser de exactamente 12 bytes")

    if not isinstance(ciphertext, bytes):
        raise TypeError("El ciphertext debe ser bytes")

    if aad is not None and not isinstance(aad, bytes):
        raise TypeError("El AAD debe ser bytes o None")

    aad_hex = aad.hex() if aad is not None else ""

    base_data = {
        "version": CURRENT_VERSION,
        "event_id": event_id,
        "nonce": nonce.hex(),
        "ciphertext": ciphertext.hex(),
        "aad": aad_hex,
    }

    digest_bytes = hashlib.sha256(
        _canonical_json_bytes(base_data)
    ).digest()
    payload_digest_hex = digest_bytes.hex()

    m = int.from_bytes(digest_bytes, byteorder="big") % Q
    commitment_int, r_val = commit(m, r)

    pedersen_commitment_hex = format(
        commitment_int,
        f"0{COMMITMENT_HEX_LENGTH}x",
    )

    envelope: dict[str, Any] = {
        "version": CURRENT_VERSION,
        "event_id": event_id,
        "nonce": nonce.hex(),
        "ciphertext": ciphertext.hex(),
        "aad": aad_hex,
        "payload_digest": payload_digest_hex,
        "pedersen_commitment": pedersen_commitment_hex,
    }
    envelope["digest"] = _envelope_digest(envelope)

    _validate_envelope_structure(envelope)
    return envelope, r_val


def serialize(envelope: dict[str, Any]) -> str:
    if not isinstance(envelope, dict):
        raise TypeError("El envelope debe ser un diccionario")
    _validate_envelope_structure(envelope)
    return json.dumps(
        envelope,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )


def deserialize(raw_data: str | bytes) -> dict[str, Any]:
    if isinstance(raw_data, bytes):
        try:
            raw_data = raw_data.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(
                "El envelope no contiene UTF-8 válido"
            ) from exc

    if not isinstance(raw_data, str):
        raise TypeError(
            "El envelope serializado debe ser str o bytes"
        )

    try:
        data = json.loads(raw_data)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"JSON mal formado en envelope: {exc}"
        ) from exc

    _validate_envelope_structure(data)
    return data


def verify(
    envelope: dict[str, Any],
    r: int | None = None,
) -> bool:
    try:
        _validate_envelope_structure(envelope)
    except (ValueError, TypeError):
        return False

    try:
        expected_digest_bytes = _payload_digest(envelope)
    except (ValueError, TypeError):
        return False

    if not hmac.compare_digest(
        envelope["payload_digest"],
        expected_digest_bytes.hex(),
    ):
        return False

    expected_env_digest = _envelope_digest(envelope)
    if not hmac.compare_digest(
        envelope["digest"],
        expected_env_digest,
    ):
        return False

    # Sin opening: estructura + digests OK.
    if r is None:
        return True

    if not isinstance(r, int):
        return False
    if not (0 <= r < Q):
        return False

    m = int.from_bytes(expected_digest_bytes, byteorder="big") % Q

    try:
        commitment_int = int(envelope["pedersen_commitment"], 16)
    except ValueError:
        return False

    return bool(verify_pedersen(commitment_int, m, r))


__all__ = [
    "ALLOWED_FIELDS",
    "CURRENT_VERSION",
    "VERSION",
    "COMMITMENT_HEX_LENGTH",
    "DIGEST_HEX_LENGTH",
    "NONCE_HEX_LENGTH",
    "deserialize",
    "seal",
    "serialize",
    "verify",
]
