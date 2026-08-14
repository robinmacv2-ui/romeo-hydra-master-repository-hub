# FHE / Crypto — estado real (sin humo)

Autor: Luis Angel Vazquez Martinez

## Que es ejecutable HOY en el paquete Python

| Componente | Real | Notas |
|------------|------|-------|
| **SHA-256** | Si | `hashlib` — integridad y ledger encadenado |
| **RSA** | Si | Preferencia `cryptography` (OAEP-SHA256); fallback pure-demo |
| **Paillier (HE aditivo)** | Si | Pure Python — `Dec(Enc(a)*Enc(b)) = a+b` verificable |
| **TFHE (circuitos booleanos)** | Solo si hay **libtfhe** en el sistema | El wheel de ~28K **no** trae libtfhe |
| **HElib (BGV/CKKS)** | Solo si hay **HElib** en el sistema | Idem |

## Que NO es

- Zenodo DOI **no** es certificacion criptografica suiza ni auditoria FIPS/Common Criteria.
- Generar esqueletos C++ con `bootsXOR` **no** es lo mismo que ejecutar bootstrapping TFHE.
- Paillier **no** es TFHE: solo sumas sobre cifrados, no circuitos arbitrarios.

## Como verificar en 30 segundos

```bash
pip install -e ".[dev]"   # opcional: pip install cryptography
python -c "from romeo_hydra.crypto import HERuntime; print(HERuntime().demo_stack())"
pytest tests/test_crypto_real.py -v
```

Debes ver `paillier_homomorphic_ok: True` y `rsa_roundtrip_ok: True`.

## Camino a TFHE/HElib nativo (Termux / Linux)

1. Compilar e instalar [TFHE](https://github.com/tfhe/tfhe) o TFHE-rs / Concrete.
2. Compilar e instalar [HElib](https://github.com/homenc/HElib).
3. `he_status()["tfhe_native"]["available"]` pasara a `True` cuando `ctypes` encuentre la libreria.
4. Hasta entonces el runtime **no inventa** ciphertexts TFHE.

## Frase segura para evaluadores

> Integridad SHA-256, protocolo RSA y HE parcial Paillier son ejecutables y testeados en el paquete. TFHE/HElib a nivel de circuito completo dependen de bibliotecas nativas C++; el diseno del puente y los esqueletos estan listos, el enlace nativo es el siguiente escalon de ingenieria — no una afirmacion de produccion actual.
