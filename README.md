# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)

Paquete Python **offline**, instalable (~55K). Laptop · Git Bash · Termux aarch64.

**Autor:** Luis Angel Vazquez Martinez  
**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)  
**Concept:** [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)

| Doc | Para qué |
|-----|----------|
| [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md) | Jurado FIAB / BIND / 500 LATAM |
| [`STRUCTURE.md`](./STRUCTURE.md) | Producto vs laboratorio |
| [`ECOSYSTEM.md`](./ECOSYSTEM.md) | Todos los repos del perfil |
| [`OPS_RULES.md`](./OPS_RULES.md) | Reglas Termux / DOI / push |
| [`docs/FHE_STATUS.md`](./docs/FHE_STATUS.md) | Cripto sin humo |
| [`docs/PRODUCT_VOICE.md`](./docs/PRODUCT_VOICE.md) | Tono de pitch para evaluadores |

---

## Qué es (sin humo)

- Ledgers de evidencia offline (SHA-256), folio **interno**
- Kernel de estabilidad + gateway de gobernanza opcional para modelos externos
- Puente **conceptual** a cifrado homomórfico (Paillier pure-Python; TFHE **no** va en el wheel)
- Genesis hash congelado (raíz de confianza fail-closed)
- CI reproducible fail-closed

**No** es TFHE compilado en el wheel. **No** es folio CNBV. **No** es un LLM. **No** hay MRR todavía (0 clientes de pago).

Este repo tiene ~300 archivos: muchos son **lab**. El producto que debe mirar un evaluador está en [`STRUCTURE.md`](./STRUCTURE.md).

Nombres como *PPRH*, *Kernel Sigma*, *PLAM* o *HPR* son **nomenclatura interna** de este proyecto, no estándares de industria.

---

## Guía rápida evaluadores (< 3 min)

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

Auditoría aislada: `bash scripts/audit_judge.sh`  
Tests: `pip install pytest && pytest tests/ -q` (34 tests esperados)

---

## Estructura (señal / ruido)

**Señal (producto):** `romeo_hydra/` · `pilot/` · `tests/` · `native/` · `scripts/` · `docs/` · `main.py`  
**Ruido (lab, no borrar):** scripts en raíz, `BITACORA_PERSONAL/`, prototipos — ver [`lab/README.md`](./lab/README.md)

---

## Licencia

AGPL-3.0 (evaluación/PoC) · Comercial EMMOROR (producción) · emmororromeohydra@gmail.com
