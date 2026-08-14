# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21918611.svg)](https://doi.org/10.5281/zenodo.21918611)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)

Codigo que corre offline. Empaqueteado. Con DOI en Zenodo.

> Evaluadores FIAB / BIND / concursos: [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md)  
> Estado real (sin humo): [`STATUS.md`](./STATUS.md)  
> Kit de piloto 30 dias: [`pilot/README.md`](./pilot/README.md)

---

## Que es esto (en corto)

Un intento de proteger datos **mientras se usan**, no solo cuando estan guardados, y de hacerlo sin depender de cloud.

Empece sin saber programar. En pocas semanas arme un paquete Python instalable, tests que pasan, un nodo de auditoria offline y registro en Zenodo. No es un producto bancario terminado. Es codigo que se puede instalar, correr y revisar.

---

## Como probarlo (3 minutos)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v
```

```bash
# Nodo de piloto offline (simula 30 dias de auditoria)
python -m pilot.run_offline_audit --days 30 --entity "SOFIPO-DEMO"
```

```python
from romeo_hydra import get_info, KernelConfig, KernelSigmaController
import numpy as np

print(get_info())
cfg = KernelConfig(state_dimension=64)
k = KernelSigmaController(cfg)
r = k.evaluate_and_collapse(np.zeros(64), np.random.randn(64) * 0.2)
print(r.final_entropy, r.hessian_ok)
```

---

## Que hay adentro (honesto)

| Parte | Que hace hoy |
|-------|----------------|
| `romeo_hydra/` | Paquete instalable: Kernel Sigma (estabilidad) + capa de abstraccion |
| `tests/` | Tests de estabilidad y de que no se filtren secretos en los rastros |
| `pilot/` | Kit para que una entidad pruebe 30 dias offline y genere evidencia |
| Resto del repo | Laboratorio: scripts, experimentos, bitacora. No es el producto |

**Sobre cifrado homomorfico (TFHE / HElib):** hay puentes y esqueletos. No es una libreria de produccion completa tipo Zama. El valor inmediato que si corre es el control de estabilidad, el rastro auditable y que funciona offline.

---

## DOIs

| Tipo | DOI |
|------|-----|
| Version (citar este) | [10.5281/zenodo.21918611](https://doi.org/10.5281/zenodo.21918611) |
| Concept | [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) |

---

## Licencia

- **AGPL-3.0** — investigacion, evaluacion, concursos, PoC interno
- **Comercial EMMOROR** — uso en produccion regulada (hay que contactar)

Contacto: emmororromeohydra@gmail.com

Detalle: [`LICENSE`](./LICENSE)

---

## Lo que no tengo (y no voy a fingir)

- 0 clientes de pago, 0 MRR
- No hay patente
- No hay empresa constituida todavia
- No hay dictamen ni certificacion de la CNBV
- No compito con quien levanto decenas de millones en FHE cloud; estoy en offline / edge

Si alguien quiere probar el nodo 30 dias con datos sinteticos o controlados, el kit de piloto esta listo. Plantilla de carta de intencion: [`pilot/LOI_TEMPLATE.md`](./pilot/LOI_TEMPLATE.md)

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
