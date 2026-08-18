# ROMEO-HYDRA V3.1

**Capa de admisibilidad y trazabilidad criptográfica para decisiones algorítmicas críticas.**

Offline · Fail-closed · Python 3.11 stdlib only · Formal DFA

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
```

## Regulatory posture

See `docs/regulatory/REGULATORY_MAPPING.md`.  
HYDRA maps to logging/traceability obligations (e.g. EU AI Act Art. 12 & 19) as a **technical control**, not as a claim of automatic compliance or legal nullity.
