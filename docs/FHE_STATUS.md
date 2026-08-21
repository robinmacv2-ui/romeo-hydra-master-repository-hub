# FHE / Crypto — estado real (v0.1.2)

Autor: Luis Angel Vazquez Martinez

## Instalacion (deps automaticas como numpy)

```bash
pip install -e .
# o desde el wheel del release
```

Pip instala automaticamente:

| Paquete | Para que |
|---------|----------|
| **numpy** | Kernel Sigma |
| **cryptography** | RSA-OAEP-SHA256 real |

No hace falta `pip install cryptography` aparte.

## Que corre sin compilar C++

| Componente | Real | Via |
|------------|------|-----|
| SHA-256 | Si | hashlib |
| RSA-OAEP-SHA256 | Si | cryptography (dep de pip) |
| Paillier HE aditivo | Si | pure Python |
| TFHE circuito completo | Solo si hay libtfhe en el SO | native opcional |
| HElib BGV/CKKS | Solo si hay HElib en el SO | native opcional |

## Verificacion

```bash
pip install -e ".[dev]"
python -c "from romeo_hydra.crypto import HERuntime; print(HERuntime().demo_stack())"
pytest tests/test_crypto_real.py -v
```

Esperado: `rsa_roundtrip_ok=True`, `paillier_homomorphic_ok=True`.

## Zenodo / "Suiza"

- DOI Zenodo = **trazabilidad / timestamp de software** (CERN).
- **No** es certificacion criptografica (FIPS 140-3, SGS, etc.).
- Frase segura: *Trazabilidad con DOI Zenodo v0.1.2. Primitivas RSA via cryptography (OpenSSL).*

## Frase para evaluadores FIAB / BIND

> Al instalar el paquete se bajan numpy y cryptography. SHA-256, RSA-OAEP y HE parcial Paillier son ejecutables y testeados. TFHE/HElib de circuito completo son backend nativo opcional; si la lib no esta, el status lo dice y no se inventan ciphertexts.
