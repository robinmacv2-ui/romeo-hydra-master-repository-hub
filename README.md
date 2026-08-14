# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21918611.svg)](https://doi.org/10.5281/zenodo.21918611)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![TRL](https://img.shields.io/badge/TRL-6-brightgreen.svg)](https://en.wikipedia.org/wiki/Technology_readiness_level)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![GitHub all releases](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)
[![Latest release downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/latest/total?label=latest)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/latest)

**Ontological Framework & Biomimetic Computing Engine**

> Hace 45 días no sabía programar. Hoy hay un paquete instalable, tests que pasan, Version DOI de Zenodo y un núcleo determinista offline.

---

## Producto (lo que instalas)

```bash
pip install -e .
# o desde el wheel del release:
# pip install https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/download/v0.1.2/romeo_hydra-0.1.2-py3-none-any.whl
```

```bash
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v          # 7 passed
```

```python
from romeo_hydra import get_info, KernelConfig, KernelSigmaController
import numpy as np

print(get_info())  # version, trl, doi_version, ...
cfg = KernelConfig(state_dimension=64)
k = KernelSigmaController(cfg)
r = k.evaluate_and_collapse(np.zeros(64), np.random.randn(64)*0.2)
print(r.final_entropy, r.hessian_ok)
```

Documentación del paquete: [`PACKAGE_README.md`](./PACKAGE_README.md)

| DOI | Uso |
|-----|-----|
| **10.5281/zenodo.21918611** | Version DOI (citar esto en pitch / data room) |
| **10.5281/zenodo.21744014** | Concept DOI |

---

## Qué es esto

ROMEO-HYDRA intenta resolver dos problemas a la vez:

1. **Proteger la información mientras se usa** (no solo cuando está guardada).
2. **Hacerlo con el menor impacto energético posible.**

El repositorio contiene:
- **Paquete Python limpio** (`romeo_hydra/`) → Kernel Sigma + Abstraction Layer
- Código experimental, scripts de orquestación, puentes C++/TFHE y material de investigación
- Interfaz y componentes de gobernanza

No es un producto terminado de producción bancaria.  
Es un sistema verificable en TRL-6 con licencia dual lista para evaluación comercial.

---

## Licencia Dual

- **AGPL-3.0** → investigación, academia, evaluación
- **Comercial EMMOROR** → producción en entidades reguladas

Contacto: **emmororromeohydra@gmail.com**

---

## Origen

Hace 45 días no sabía programar.  
No venía de una carrera técnica. No tenía mentor.

La arquitectura nació de una necesidad concreta: el dato en uso es vulnerable y la IA procesa información sensible sin gobernanza real.

Documento completo: [`ORIGEN_Y_TRAYECTORIA.md`](./ORIGEN_Y_TRAYECTORIA.md)

**Luis Ángel Vázquez Martínez** · Agosto 2026
