# ROMEO-HYDRA 0.1.3 — Core stdlib-first

**Offline fail-closed admissibility layer + cryptographic evidence**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)

## Qué es esto

Paquete Python del núcleo estable de ROMEO-HYDRA:

- **Fail-closed gate** (admisibilidad ex-ante)
- **RDD Receipt + Lineage** (evidencia criptográfica)
- **Append-only SHA-256 ledger**
- Core path = **pure Python 3.11 stdlib** (cero dependencias forzadas)

Laboratory extras (numpy, etc.) son opcionales y no forman parte del product surface.

## Instalación (core limpio)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .          # ZERO third-party packages
python main.py
```

## Laboratory only (opcional)

```bash
pip install -e ".[lab]"    # añade numpy para experimentos
pip install -e ".[dev]"    # pytest
```

## Licencia Dual

- **AGPL-3.0** → investigación, academia, evaluación y uso no comercial.
- **Comercial EMMOROR** → producción en entidades financieras / reguladas.

Contacto comercial: **emmororromeohydra@gmail.com**

## Citación

```bibtex
@software{romeo_hydra_2026,
  author       = {Vázquez Martínez, Luis Ángel},
  title        = {ROMEO-HYDRA: Offline Fail-Closed Admissibility Layer},
  version      = {0.1.3},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.21744014},
  url          = {https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub}
}
```
