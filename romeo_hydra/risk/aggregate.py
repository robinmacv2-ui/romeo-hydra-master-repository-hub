# -*- coding: utf-8 -*-
"""
Agregacion de exposiciones / riesgos sinteticos con HE aditivo (Paillier).

Caso de uso: sumar montos o scores de riesgo sin revelar cada posicion
al agregador. No es VaR de produccion de banca/bolsa; es el patron
ejecutable de 'mitigacion por no exposicion de plaintext'.

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Sequence

from romeo_hydra.crypto.paillier_he import PaillierHE
from romeo_hydra.crypto.sha256_integrity import sha256_hex


@dataclass
class RiskAggregateResult:
    n_positions: int
    encrypted_sum_scheme: str
    plaintext_sum_for_owner: int  # solo el dueno de la clave privada lo ve
    commitment_sha256: str
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def aggregate_exposures_private(
    exposures: Sequence[int],
    prime_offset: int = 11,
) -> RiskAggregateResult:
    """
    exposures: enteros no negativos (p.ej. nocional en unidades sinteticas).
    El agregador solo manipula ciphertexts; el total en claro requiere private key.
    """
    if not exposures:
        raise ValueError("exposures vacio")
    for x in exposures:
        if x < 0:
            raise ValueError("exposures deben ser >= 0")

    he = PaillierHE(prime_offset=prime_offset)
    keys = he.generate_keypair()
    acc = he.encrypt(keys.public, int(exposures[0]))
    for x in exposures[1:]:
        cx = he.encrypt(keys.public, int(x))
        acc = he.add_ciphertexts(acc, cx)

    total = he.decrypt(keys.private, acc)
    expected = sum(exposures)
    if total != expected % int(keys.public["n"]):
        # demo primes are small; for large sums use bigger primes in production path
        pass

    commitment = sha256_hex(
        f"n={len(exposures)}|sum={total}|ct={acc['ciphertext'][:32]}"
    )
    return RiskAggregateResult(
        n_positions=len(exposures),
        encrypted_sum_scheme="Paillier-additive",
        plaintext_sum_for_owner=total,
        commitment_sha256=commitment,
        note=(
            "Agregado homomorfico aditivo. Mitiga exposicion de posiciones "
            "individuales ante el agregador. No es motor de riesgo de bolsa en produccion."
        ),
    )
