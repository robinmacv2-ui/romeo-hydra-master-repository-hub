[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0006--8163--3759-green)](https://orcid.org/0009-0006-8163-3759)

# ROMEO-HYDRA

**Capa de admisibilidad ex-ante y evidencia criptográfica para decisiones algorítmicas críticas.**

Offline · Fail-closed · Python 3.11 stdlib only · Formal DFA

---

## Qué es (sin humo)

HYDRA no afirma que una decisión de IA sea legalmente nula.  
Afirma algo más preciso y defendible:

> Cuando la trazabilidad y la acreditación de una decisión son requisitos regulatorios o de control interno, HYDRA impone una **condición técnica de admisibilidad ex-ante** y produce **evidencia criptográficamente encadenada**.

```
INPUT → PARSE → ADMISSIBILITY → PRE-RECEIPT
                                      ↓
                             ALLOW → DISPATCH → POST-RECEIPT → LEDGER
                                  or
                             DENY / HOLD → FAILURE_RECEIPT → LEDGER
```

## Quick start (entorno limpio)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL
```

## Documentos clave

| Documento              | Para qué                          |
|------------------------|-----------------------------------|
| `FOR_EVALUATORS.md`    | Jurado / aceleradoras / LOI       |
| `DOI_HISTORY.md`       | Acta de nacimiento + DOIs         |
| `STRUCTURE.md`         | Qué es producto vs laboratorio    |
| `docs/FHE_STATUS.md`   | Límites reales de cripto          |

## Qué NO es

- No es sistema bancario en producción  
- No está certificado por CNBV ni ninguna autoridad  
- No es un LLM  
- No genera folio CNBV oficial (folio interno de evidencia)

## Licencia

Dual: AGPL-3.0 (evaluación / PoC) · Comercial EMMOROR (producción)  
Contacto: emmororromeohydra@gmail.com

---

**Autor:** Luis Angel Vazquez Martinez  
**ORCID:** 0009-0006-8163-3759  
**Concept DOI:** https://doi.org/10.5281/zenodo.21744014
