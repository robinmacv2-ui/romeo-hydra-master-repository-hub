# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)

Paquete Python **offline**, instalable, con DOI. Build ~55K. Laptop · Git Bash · Termux aarch64.

**Autor:** Luis Angel Vazquez Martinez  
**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)

| Doc | Para que |
|-----|----------|
| [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md) | Jurado FIAB / BIND |
| [`STRUCTURE.md`](./STRUCTURE.md) | Producto vs laboratorio en este repo |
| [`ECOSYSTEM.md`](./ECOSYSTEM.md) | **Todos** los repos de github.com/robinmacv2-ui |
| [`OPS_RULES.md`](./OPS_RULES.md) | Reglas Termux / DOI / push |
| [`docs/FHE_STATUS.md`](./docs/FHE_STATUS.md) | Cripto sin humo |

---

## Que es (sin humo)

Evidencia offline (ledgers SHA-256), kernel de estabilidad, paralelo CPU (sin GPU), puente conceptual a HE.  
**No** es TFHE en el wheel. **No** es folio CNBV. **No** hay MRR todavia.

Este repo tiene ~300 archivos: muchos son **lab**. El producto es la tabla de [`STRUCTURE.md`](./STRUCTURE.md).

---

## Guia rapida evaluadores (< 3 min)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt && pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL
```

Auditoria aislada: `bash scripts/audit_judge.sh`

---

## Estructura (senal / ruido)

**Senal (producto):** `romeo_hydra/` · `pilot/` · `tests/` · `native/` · `scripts/` · `docs/` · `main.py`  
**Ruido (lab, no borrar):** scripts en raiz, `BITACORA_PERSONAL/`, prototipos — ver [`lab/README.md`](./lab/README.md)

**Otros repos del perfil:** [`ECOSYSTEM.md`](./ECOSYSTEM.md)

---

## Licencia

AGPL-3.0 (evaluacion/PoC) · Comercial EMMOROR (produccion) · emmororromeohydra@gmail.com

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
