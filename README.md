# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21918611.svg)](https://doi.org/10.5281/zenodo.21918611)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![TRL](https://img.shields.io/badge/TRL-6-brightgreen.svg)](https://en.wikipedia.org/wiki/Technology_readiness_level)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![GitHub all releases](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)
[![Latest release](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/latest/total?label=latest)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/latest)

**Ontological Framework & Biomimetic Computing Engine**  
Protecting data **in use** · Offline / Edge capable · Dual-licensed · Zenodo DOI

> **For FIAB / BIND / contest evaluators:** start here → [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md)

---

## Install & verify (3 minutes)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v          # expected: 7 passed
```

```python
from romeo_hydra import get_info, KernelConfig, KernelSigmaController
import numpy as np

print(get_info())  # version, trl=6, doi_version, ...
cfg = KernelConfig(state_dimension=64)
k = KernelSigmaController(cfg)
r = k.evaluate_and_collapse(np.zeros(64), np.random.randn(64) * 0.2)
print(r.final_entropy, r.hessian_ok)
```

---

## Identifiers

| Type | DOI |
|------|-----|
| **Version DOI** (cite this) | [10.5281/zenodo.21918611](https://doi.org/10.5281/zenodo.21918611) |
| Concept DOI | [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) |

---

## What it is

ROMEO-HYDRA addresses two problems simultaneously:

1. Protecting information **while it is being processed** (data-in-use), not only at rest.
2. Doing so with minimal energy impact (edge / offline capable).

Public core (`romeo_hydra/`):
- **Kernel Sigma** — stability controller + mimetic multi-spectrum adapter
- **Romeo Abstraction Layer** — conceptual fold → verification skeletons (TFHE/HElib style)

The rest of the repository is the research laboratory (experiments, orchestration, personal trajectory). The product is the installable package.

---

## License (Dual)

| Path | Scope |
|------|--------|
| **AGPL-3.0** | Research, academia, contest evaluation, internal PoC |
| **Comercial EMMOROR** | Production in regulated entities (banking / fintech / CNBV-like) |

Commercial contact: **emmororromeohydra@gmail.com**

Full notice: [`LICENSE`](./LICENSE)

---

## Structure for reviewers

| Path | Role |
|------|------|
| `romeo_hydra/` | **Product** (installable package) |
| `tests/` | TRL-6 suite |
| `examples/` | Minimal reproducible demo |
| `FOR_EVALUATORS.md` | Briefing for judges & committees |
| `PACKAGE_README.md` | Package documentation |
| Other folders / scripts | Research lab |

---

## Origin

45 days ago the author did not know how to program.  
This repository is the result of not stopping.

Full trajectory: [`ORIGEN_Y_TRAYECTORIA.md`](./ORIGEN_Y_TRAYECTORIA.md)

**Luis Ángel Vázquez Martínez** · 2026  
`robinmac.v2@gmail.com` · `emmororromeohydra@gmail.com`
