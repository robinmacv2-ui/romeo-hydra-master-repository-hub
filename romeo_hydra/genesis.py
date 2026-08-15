# -*- coding: utf-8 -*-
"""
Genesis block — ancla inmutable estilo Satoshi para ROMEO-HYDRA.

El hash génesis está quemado en el código. Cualquier nodo que arranque
debe verificar que el bloque cero coincide. Si no → fail-closed.

Acta de nacimiento criptográfica:
  timestamp_utc: 2026-07-17T00:00:00Z
  hardware: Celeron (primer sello) / verificado Termux aarch64
  doi_concept: 10.5281/zenodo.21744014

Author: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict

# ---------------------------------------------------------------------------
# Payload canónico (orden de claves fijo vía sort_keys). NO MODIFICAR.
# Cambiar una sola letra cambia el hash y rompe la cadena de todos los nodos.
# ---------------------------------------------------------------------------
GENESIS_PAYLOAD: Dict[str, Any] = {
    "author": "Luis Angel Vazquez Martinez",
    "doi_concept": "10.5281/zenodo.21744014",
    "hardware_note": "first seal Celeron 2026-07-17; verified Termux aarch64",
    "message": "No es folio CNBV. Offline. Fail-closed. Soberania del nucleo.",
    "network": "romeo-hydra",
    "role": "genesis",
    "timestamp_utc": "2026-07-17T00:00:00Z",
}

# Hash génesis oficial — quemado a fuego (equivalente al block hash del génesis de Bitcoin).
# Recalcular solo con el payload canónico; el valor literal es la regla de validación.
GENESIS_HASH = "503b0b26aea484ca4acc7dde7f86b6e4d44a08a1d4558193424955264101110e"

GENESIS_PREV = "0" * 64  # raíz: no hay bloque anterior


def _canonical_bytes(payload: Dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def compute_genesis_hash(payload: Dict[str, Any] | None = None) -> str:
    """SHA-256 del payload génesis canónico (o de un candidato a validar)."""
    return hashlib.sha256(_canonical_bytes(payload or GENESIS_PAYLOAD)).hexdigest()


def verify_genesis(expected: str = GENESIS_HASH) -> bool:
    """
    Pregunta obligatoria de arranque:
      ¿El bloque cero coincide exactamente con el hash génesis oficial?
    """
    return compute_genesis_hash() == expected


class GenesisMismatchError(RuntimeError):
    """Fail-closed: el nodo no puede operar si el génesis no coincide."""


def assert_genesis_or_die() -> str:
    """
    Validación de arranque. Si el hash embebido no reproduce el payload
    canónico, el proceso aborta (fail-closed).
    Returns GENESIS_HASH si OK.
    """
    actual = compute_genesis_hash()
    if actual != GENESIS_HASH:
        raise GenesisMismatchError(
            f"GENESIS MISMATCH: expected {GENESIS_HASH}, got {actual}. "
            "Cadena ilegítima — nodo bloqueado (fail-closed)."
        )
    return GENESIS_HASH


def genesis_block() -> Dict[str, Any]:
    """Bloque cero materializado (solo lectura / evidencia)."""
    return {
        "status": "GENESIS",
        "prev": GENESIS_PREV,
        "hash": GENESIS_HASH,
        "payload": dict(GENESIS_PAYLOAD),
        "rule": "any honest node must match GENESIS_HASH exactly",
    }


def chain_starts_from_genesis(prev_hash: str) -> bool:
    """True si el eslabón anterior es el génesis o la raíz nula aceptada solo antes del génesis."""
    return prev_hash in (GENESIS_HASH, GENESIS_PREV)
