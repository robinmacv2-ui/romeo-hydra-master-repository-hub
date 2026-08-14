# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)

Codigo offline. Empaquetado (~56K). DOI Zenodo. Vision de computo confidencial — bases ya ejecutables.

> Evaluadores: [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md)  
> Arquitectura (vision vs hoy): [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
> Estado cripto: [`docs/FHE_STATUS.md`](./docs/FHE_STATUS.md)  
> Kit piloto: [`pilot/README.md`](./pilot/README.md)

**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106) (v0.1.2)

---

## Que es (en corto)

Un intento de proteger datos **mientras se usan**, no solo en reposo, sin depender de cloud.

Empece sin saber programar. Hoy hay un paquete instalable, tests, piloto offline y registro en Zenodo. No es un producto bancario terminado.

---

## Arquitectura: objetivo vs v0.1.2

**Objetivo (a donde vamos):**  
Computo confidencial offline en dos capas — (1) calcular sobre datos cifrados (TFHE para logica rapida, HElib para aritmetica vectorial) y (2) anclar resultados con SHA-256 + RSA para integridad y autenticacion. La entidad no manda datos en claro; manda cifrado, recibe cifrado.

**Estado actual v0.1.2 (lo que un juez puede ejecutar hoy):**

| Pieza | Estado |
|-------|--------|
| SHA-256 | Real (`hashlib` + nativo C++ opcional) |
| RSA-OAEP-SHA256 | Real (`cryptography` / OpenSSL, se instala con pip como numpy) |
| HE parcial Paillier | Real — prueba de computo sobre cifrados (`Dec(Enc(a)*Enc(b))=a+b`) |
| Slot nativo TFHE/HElib | CMake + ctypes implementados; `available: false` hasta compilar las libs C++ |
| Kernel + piloto offline | Real — rastro de auditoria / scoring sintetico sin PII |

Detalle defendible: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Como probarlo

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"   # instala numpy + cryptography
python -m romeo_hydra
python -c "from romeo_hydra.crypto import HERuntime; print(HERuntime().demo_stack())"
pytest tests/ -v
python -m pilot.run_scoring_audit --entity "SOFIPO-DEMO" --n 20
```

Backend C++ (opcional):

```bash
cd native && mkdir -p build && cd build && cmake .. && cmake --build . && ./romeo_native_smoke
```

---

## Licencia

- **AGPL-3.0** — investigacion, evaluacion, concursos, PoC
- **Comercial EMMOROR** — produccion regulada (contactar)

emmororromeohydra@gmail.com

---

## Lo que no finjo

- 0 clientes de pago, 0 MRR
- No hay patente ni empresa constituida todavia
- No hay dictamen ni certificacion CNBV
- DOI Zenodo = trazabilidad de software, **no** certificacion criptografica (FIPS/SGS)
- TFHE/HElib de circuito completo **no** estan activos hasta link nativo

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
