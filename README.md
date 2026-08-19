[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0006--8163--3759-green)](https://orcid.org/0009-0006-8163-3759)

# ROMEO-HYDRA V3.1

**Capa de admisibilidad y trazabilidad criptográfica para decisiones algorítmicas críticas.**

Validado en ARM64 hostil, desplegable en bare-metal enterprise.

Offline · Fail-closed · Python 3.11 stdlib only · Formal DFA

![Release](https://img.shields.io/badge/release-v3.1-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![License](https://img.shields.io/badge/license-Dual%20(GPL--3.0%20%2F%20Commercial)-orange)
![Python](https://img.shields.io/badge/python-3.11%20stdlib-yellow)
![Platform](https://img.shields.io/badge/platform-ARM64%20%7C%20x86%20%7C%20bare--metal-lightgrey)

**License: Dual (GPL-3.0 / Commercial)**

---

## Qué es

HYDRA no afirma que una decisión de IA sea legalmente nula sin receipt.  
Afirma algo más preciso y defendible:

> Cuando la trazabilidad y la acreditación de una decisión son requisitos regulatorios, contractuales o de control interno aplicables, HYDRA impone una **condición técnica de admisibilidad ex-ante** y produce **evidencia criptográficamente encadenada** de cómo se tomó (o se denegó) la decisión.

Flujo canónico:

```
INPUT
  ↓
PARSE (verb::entity)
  ↓
ADMISSIBILITY (closed verbs + role capabilities + ROOT confinement)
  ↓
PRE-RECEIPT condition
  ↓
ALLOW → DISPATCH → POST-RECEIPT → LEDGER
   or
DENY / HOLD → FAILURE_RECEIPT → LEDGER
```

## Principio operativo (V3.1)

```
NO PRE_RECEIPT / TRACEABILITY_FAILURE
        ↓
DECISION_NOT_ADMISSIBLE
        ↓
DENY / HOLD
        ↓
GENERATE FAILURE_RECEIPT
```

Nunca se afirma “acto nulo”. Se afirma **decisión no admisible por falta de evidencia ex-ante**.

## Quick start

```bash
cd romeo-hydra-core
python main.py "auditar::poliza_001" auditor
python -m unittest tests.test_hydra_v3 -v
# o
./run_all_tests.sh
```

## Estructura

```
romeo-hydra-core/
├── pilot/faro.py          # Formal DFA + closed verbs + capabilities
├── main.py                # Orchestrator (parse → admit → receipt → dispatch)
├── tests/                 # Adversarial tests
├── THREAT_MODEL.md
├── delta_ledger_registry.json
docs/
├── regulatory/REGULATORY_MAPPING.md
└── technical/VALIDATION.md
evidence/
run_all_tests.sh
```

## Regulatory posture

See `docs/regulatory/REGULATORY_MAPPING.md`.  
HYDRA maps to logging/traceability obligations (e.g. EU AI Act Art. 12 & 19) as a **technical control**, not as a claim of automatic compliance or legal nullity.

## License

**Dual (GPL-3.0 / Commercial)**  
- GPL-3.0 for open use, research and audit.  
- Commercial license available for enterprise deployment, redistribution and closed integration.
