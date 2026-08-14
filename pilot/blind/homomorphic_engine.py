# -*- coding: utf-8 -*-
"""
Motor PHE Paillier (parcialmente homomorfico aditivo).

NO es FHE (Fully Homomorphic Encryption).
Score = sum(w_i * d_i) se evalua sobre cifrados aditivos.

Modelo de llaves:
  - En produccion: la SOFIPO genera el par y SOLO entrega public_key a Romeo.
  - Romeo nunca debe poseer la privada en un despliegue real.
  - Este piloto puede simular ambos lados en un solo proceso (simulated_pilot).

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Sequence

try:
    from phe import paillier

    _HAS_PHE = True
except ImportError:
    _HAS_PHE = False
    paillier = None  # type: ignore


@dataclass
class PublicKeyView:
    """Lo unico que Romeo deberia recibir de la SOFIPO."""

    n: int

    def to_dict(self) -> dict[str, str]:
        return {"n": str(self.n), "scheme": "Paillier-PHE"}


class HomomorphicEngine:
    """
    Aplicacion de pesos sobre features cifradas: sum(w_i * Enc(d_i)).
    """

    def __init__(self) -> None:
        if not _HAS_PHE:
            raise ImportError(
                "Package 'phe' required on branch feat/fhe-next-level. "
                "pip install -r requirements-fhe.txt"
            )

    @staticmethod
    def sofipo_generate_keypair(n_length: int = 1024) -> tuple[Any, Any, PublicKeyView]:
        """
        Simula el lado SOFIPO: genera el par.
        En campo real esto corre SOLO en infraestructura de la SOFIPO.
        """
        public_key, private_key = paillier.generate_paillier_keypair(n_length=n_length)
        view = PublicKeyView(n=public_key.n)
        return public_key, private_key, view

    def encrypt_features(self, public_key: Any, features: Sequence[float]) -> list[Any]:
        """SOFIPO (o el cliente) cifra cada Di con su public_key."""
        return [public_key.encrypt(float(x)) for x in features]

    def blind_weighted_sum(
        self,
        encrypted_features: Sequence[Any],
        weights: Sequence[float],
    ) -> Any:
        """
        Romeo aplica pesos SIN la privada:
          Enc(sum w_i d_i) a partir de Enc(d_i).
        """
        if len(encrypted_features) != len(weights):
            raise ValueError("features y weights deben tener la misma longitud")
        acc = encrypted_features[0] * float(weights[0])
        for enc, w in zip(encrypted_features[1:], weights[1:]):
            acc = acc + (enc * float(w))
        return acc

    def sofipo_decrypt_score(self, private_key: Any, encrypted_score: Any) -> float:
        """Solo la SOFIPO (duena de la privada) recupera el score."""
        return float(private_key.decrypt(encrypted_score))
