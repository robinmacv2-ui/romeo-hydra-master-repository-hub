# -*- coding: utf-8 -*-
"""
Capa criptografica ejecutable de ROMEO-HYDRA.

Real hoy:
  - SHA-256 (integridad)
  - RSA (sobre / firma de protocolo)
  - Paillier (HE parcial aditivo, pure Python)

TFHE / HElib:
  - Puente + esqueletos C++ (ya en core/)
  - Runtime nativo solo si la libreria del sistema esta instalada
  - Si no, status claro: no simular cifrado TFHE falso

Autor: Luis Angel Vazquez Martinez
"""

from romeo_hydra.crypto.sha256_integrity import sha256_hex, sha256_file, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol, RSAKeyPair
from romeo_hydra.crypto.paillier_he import PaillierHE, PaillierKeyPair
from romeo_hydra.crypto.he_runtime import HERuntime, he_status

__all__ = [
    "sha256_hex",
    "sha256_file",
    "chain_hash",
    "RSAProtocol",
    "RSAKeyPair",
    "PaillierHE",
    "PaillierKeyPair",
    "HERuntime",
    "he_status",
]
