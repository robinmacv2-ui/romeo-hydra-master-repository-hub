# ROMEO-HYDRA 0.1.1 — TRL-5/6

**Ontological Framework & Biomimetic Computing Engine**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![TRL](https://img.shields.io/badge/TRL-5%2F6-orange.svg)](https://en.wikipedia.org/wiki/Technology_readiness_level)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Tests](https://img.shields.io/badge/tests-no--plaintext--leak-success.svg)](#tests-trl-6)

> Paradigm shift from brute-force hardware scaling to **ontological coherence**.

## Qué es esto

Paquete Python limpio e instalable del núcleo estable de ROMEO-HYDRA:

- **Kernel Sigma V∞** — controlador de estabilidad, proyección, criba 6k, Hessiano y adaptador mimético multi-espectro.
- **Romeo Abstraction Layer** — pliegue conceptual ↔ esqueletos C++ orientados a verificación de circuitos (estilo TFHE/HElib).
- **Cerebro Resonador 72/19** — módulo de resonancia ontológica.

**TRL-5 sellado** · **TRL-6 en curso** (tests de no-exposición de plaintext + estabilidad).

## Instalación

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e .
# opcional: tests
pip install -e ".[dev]"
pytest tests/ -q
```

## Uso rápido

```bash
python -m romeo_hydra
python examples/umr_trl5_demo.py
```

```python
from romeo_hydra import get_info, KernelConfig, KernelSigmaController, RomeoAbstractionLayer
import numpy as np

print(get_info())

cfg = KernelConfig(state_dimension=64)
kernel = KernelSigmaController(cfg)
result = kernel.evaluate_and_collapse(np.zeros(64), np.random.randn(64)*0.2)
print(result.final_entropy, result.hessian_ok)
```

## Tests TRL-6

```bash
pytest tests/test_no_plaintext_leak.py tests/test_kernel_stability.py -v
```

Cubre:
- Determinismo del hash de CoreState
- Ningún fenotipo del adaptador mimético contiene secretos en claro
- Abstraction Layer no genera stubs con claves
- Proyección correcta del Kernel cuando la entropía supera la tolerancia

## Licencia Dual

- **AGPL-3.0** → investigación, academia, evaluación y uso no comercial.
- **Comercial EMMOROR** → producción en entidades financieras / reguladas.

Contacto comercial: **emmororromeohydra@gmail.com**

## Citación

```bibtex
@software{romeo_hydra_2026,
  author       = {Vázquez Martínez, Luis Ángel},
  title        = {ROMEO-HYDRA: Ontological Framework \& Biomimetic Computing Engine},
  version      = {0.1.1},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.21744014},
  url          = {https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub}
}
```

---

*Hace 45 días no sabía programar. Este es el resultado de no detenerse.*
