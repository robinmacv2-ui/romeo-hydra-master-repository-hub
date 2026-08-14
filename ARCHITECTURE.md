# Arquitectura ROMEO-HYDRA — vision y estado

Autor: Luis Angel Vazquez Martinez

Este documento tiene **dos lecturas** del mismo diseno: tecnico y de negocio.  
Ambas son ambiciosas. Ninguna inventa el presente.

---

## 1. Para el juez tecnico (FIAB / BIND ingenieria)

### Arquitectura objetivo (doble capa)

1. **Capa de computo sobre cifrados (objetivo TFHE + HElib)**  
   - TFHE: evaluaciones logicas / a nivel de bit, orientadas a edge.  
   - HElib (BGV/CKKS): aritmetica vectorial y cargas numericas mas densas.  
   - Offline: sin enviar plaintext a la nube.

2. **Capa de anclaje (SHA-256 + RSA)**  
   - SHA-256: integridad del ledger / evidencia.  
   - RSA: autenticacion asimetria del paquete o del resultado.

### Estado v0.1.2 (medible hoy)

| Componente | Implementacion | Como verificar |
|------------|----------------|----------------|
| SHA-256 | Python `hashlib` + SHA nativo en `libromeo_native` | `sha256_hex`, `romeo_native_smoke` |
| RSA-OAEP-SHA256 | `cryptography` (dep de pip, OpenSSL) | `tests/test_crypto_real.py` |
| HE aditivo | Paillier pure Python | `paillier_homomorphic_ok == True` |
| TFHE / HElib full | Slot CMake + ctypes; link si hay libs del sistema | `he_status()["tfhe_native"]` |
| Piloto offline | Ledger scoring / audit sin PII | `python -m pilot.run_scoring_audit` |

**No afirmamos:** infraestructura de grado militar, FHE de produccion bancaria, ni certificacion suiza por tener DOI Zenodo.

**Si afirmamos:** bases criptograficas ejecutables + diseno del puente nativo + piloto offline reproducible.

Frase corta tecnica:

> Arquitectura objetivo: computo confidencial offline.  
> Estado v0.1.2: integridad SHA-256 y firma/cifrado RSA reales via OpenSSL (`cryptography`) + HE aditivo Paillier como prueba de computo sobre cifrados.  
> El slot nativo TFHE/HElib esta implementado (CMake/ctypes) y reporta `available: false` hasta compilar las libs C++.

---

## 2. Para el juez de negocio / RegTech

**Problema habitual:** “mandame tus datos y te digo el riesgo”.  
**Propuesta de ROMEO-HYDRA:** “no me mandes datos en claro; calculamos sobre cifrado y anclamos el resultado”.

- **Offline / edge:** util donde no hay cloud confiable o no debe salir informacion.  
- **Rastro auditable:** SHA-256 en ledgers de decision (piloto de scoring sintetico ya corre).  
- **Camino a FHE completo:** no es marketing vacio — hay ABI C++ y status honesto; falta el link a libs nativas y el producto regulado.

Valor hoy: demostracion instalable + honestidad de alcance.  
Valor manana (si se cierra piloto + nativo FHE): computo de riesgo/scoring sin exposicion de plaintext.

---

## 3. Mapa de carpetas relevante

| Ruta | Rol |
|------|-----|
| `romeo_hydra/crypto/` | SHA-256, RSA, Paillier, `HERuntime`, loader nativo |
| `native/` | CMake → `libromeo_native` (stub o link TFHE/HElib) |
| `pilot/` | Piloto 30 dias / scoring offline |
| `docs/FHE_STATUS.md` | Frontera cripto sin humo |

---

Luis Angel Vazquez Martinez
