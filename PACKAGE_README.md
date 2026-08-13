# ROMEO-HYDRA 0.1.0 — TRL-5

**Ontological Framework & Biomimetic Computing Engine**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![TRL](https://img.shields.io/badge/TRL-5-orange.svg)](https://en.wikipedia.org/wiki/Technology_readiness_level)

> Paradigm shift from brute-force hardware scaling to **ontological coherence**.

## Qué es esto (UMR TRL-5)

Paquete Python limpio e instalable que expone el núcleo estable de ROMEO-HYDRA:

- **Kernel Sigma V∞** — controlador de estabilidad con proyección, criba 6k, métricas de Hessiano y adaptador mimético multi-espectro.
- **Romeo Abstraction Layer** — pliegue conceptual ↔ generación de esqueletos C++ orientados a verificación de circuitos (estilo TFHE).
- **Cerebro Resonador 72/19** — módulo de resonancia ontológica.

Nivel **TRL-5**: validación de componentes en entorno relevante (ejecutable offline, determinista, auditable).

## Instalación

```bash
# Desde el repositorio (recomendado para desarrollo)
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e .

# O solo las dependencias mínimas
pip install numpy
```

## Uso rápido (demo reproducible)

```bash
python -m romeo_hydra
```

O desde código:

```python
import numpy as np
from romeo_hydra import (
    KernelConfig,
    KernelSigmaController,
    RomeoAbstractionLayer,
    get_info,
)

print(get_info())

# Kernel de estabilidad
cfg = KernelConfig(state_dimension=64)
kernel = KernelSigmaController(cfg)
current = np.zeros(64)
candidate = np.random.randn(64) * 0.2
result = kernel.evaluate_and_collapse(current, candidate)
print(result.final_entropy, result.hessian_ok)

# Capa de abstracción
romeo = RomeoAbstractionLayer()
print(romeo.fold_high_level("coherencia lógica convexa"))
```

## Estructura del paquete

```
romeo_hydra/
├── __init__.py          # API pública + metadatos TRL-5
├── __main__.py          # CLI mínima (python -m romeo_hydra)
├── py.typed
├── core/
│   ├── romeo_abstraction.py
│   ├── tfhe_core.py
│   └── romeo_tfhe_bridge.py
└── kernel/
    ├── sigma_chameleon.py   # Kernel Sigma + MimeticSurfaceAdapter
    └── cerebro_7219.py
```

## Licencia Dual

- **AGPL-3.0** → investigación, academia, evaluación y uso no comercial.
- **Comercial EMMOROR** → producción en entidades financieras / reguladas (CNBV y equivalentes).

Contacto comercial: **emmororromeohydra@gmail.com**

## Citación

```bibtex
@software{romeo_hydra_2026,
  author       = {Vázquez Martínez, Luis Ángel},
  title        = {ROMEO-HYDRA: Ontological Framework \& Biomimetic Computing Engine},
  version      = {0.1.0},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.21744014},
  url          = {https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub}
}
```

## Estado

- **TRL-5** alcanzado (componente validado en entorno relevante).
- API pública estable para el núcleo.
- Listo para integración en los repositorios con DOI de Zenodo como dependencia o submodule ligero.

---

*Hace 45 días no sabía programar. Este es el resultado de no detenerse.*
