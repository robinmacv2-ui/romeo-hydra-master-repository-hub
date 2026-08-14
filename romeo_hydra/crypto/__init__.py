# -*- coding: utf-8 -*-
"""
Capa criptografica ejecutable de ROMEO-HYDRA.

Pip instala: numpy + cryptography.
Opcional: libromeo_native (CMake) para backend C++.

Autor: Luis Angel Vazquez Martinez
"""

from romeo_hydra.crypto.sha256_integrity import sha256_hex, sha256_file, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol, RSAKeyPair
from romeo_hydra.crypto.paillier_he import PaillierHE, PaillierKeyPair
from romeo_hydra.crypto.he_runtime import HERuntime, he_status
from romeo_hydra.crypto.native_loader import load_native, native_status, native_sha256_hex

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
    "load_native",
    "native_status",
    "native_sha256_hex",
]
