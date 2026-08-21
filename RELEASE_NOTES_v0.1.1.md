# ROMEO-HYDRA v0.1.1 — TRL-5 → TRL-6 Ready

**Fecha:** 2026-08-12  
**Tag recomendado:** `v0.1.1`  
**DOI Concept:** [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)

## Resumen

Primera versión empaquetada e instalable del núcleo ROMEO-HYDRA con:

- Paquete Python limpio (`pip install -e .`)
- CLI: `python -m romeo_hydra`
- UMR reproducible (`examples/umr_trl5_demo.py`)
- Suite de tests TRL-6 (no-plaintext-leak + estabilidad del Kernel)
- Licencia dual AGPL-3.0 / Comercial EMMOROR
- Metadatos de versión, TRL y DOI expuestos en `get_info()`

## Cómo publicar este release (para generar DOI de versión en Zenodo)

1. Ve a: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/new
2. **Choose a tag** → escribe `v0.1.1` → Create new tag on publish
3. **Release title:** `ROMEO-HYDRA v0.1.1 — TRL-5/6 Core Package`
4. Pega el contenido de este archivo en la descripción
5. Marca como **latest release**
6. Publish release

Zenodo (si el repo está ON) generará automáticamente un **Version DOI**.

## Badges recomendados para README

```markdown
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![TRL](https://img.shields.io/badge/TRL-5%2F6-orange.svg)](https://en.wikipedia.org/wiki/Technology_readiness_level)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
```

## Contenido del paquete

- `romeo_hydra.core` — Abstraction Layer + TFHE/HElib conceptual
- `romeo_hydra.kernel` — Kernel Sigma V∞ + MimeticSurfaceAdapter
- Tests de no-exposición de plaintext (crítico para banca)
- CLI y demo UMR determinista

## Instalación

```bash
pip install -e git+https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git@v0.1.1#egg=romeo-hydra
```

## Contacto comercial

emmororromeohydra@gmail.com
