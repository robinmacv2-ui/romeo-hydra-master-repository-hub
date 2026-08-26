[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0006--8163--3759-green)](https://orcid.org/0009-0006-8163-3759)
[![Stdlib](https://img.shields.io/badge/core-stdlib%20only-success.svg)](#)
[![Offline](https://img.shields.io/badge/offline-100%25-green.svg)](#)
[![Fail-closed](https://img.shields.io/badge/gate-FAIL--CLOSED-black.svg)](#)

# ROMEO-HYDRA

**Ex-ante admissibility layer + cryptographic evidence for critical algorithmic decisions.**

Offline · Fail-closed · Python 3.11 · Core = **stdlib only** · Formal DFA

---

## What it is (no hype)

HYDRA does **not** claim that an AI decision is legally void.  
It claims something narrower and testable:

> When traceability and accreditation of a decision are required, HYDRA enforces a **technical ex-ante admissibility condition** and produces **cryptographically chained evidence**.

```
INPUT → PARSE → ADMISSIBILITY → PRE-RECEIPT
                                      ↓
                             ALLOW → DISPATCH → POST-RECEIPT → LEDGER
                                  or
                             DENY / HOLD → FAILURE_RECEIPT → LEDGER
```

---

## Jury path (≤ 3 minutes)

```bash
git clone --depth 1 https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .          # ZERO third-party packages for product surface
python main.py
python -m romeo_agent -c "status ::"
python -m romeo_agent -c "help ::"
```

Full checklist: [`JURY_CHECKLIST.md`](JURY_CHECKLIST.md) · Evaluators: [`FOR_EVALUATORS.md`](FOR_EVALUATORS.md)

> **Jury note:** core path (gate + receipt + ledger + agent) is Python 3.11 stdlib.  
> Laboratory code under `lab/` is **out of scope** for product evaluation.

---

## Key documents

| Document | Purpose |
|----------|---------|
| `JURY_CHECKLIST.md` | Pass/fail technical scrutiny |
| `FOR_EVALUATORS.md` | Jury / accelerators / LOI |
| `STRUCTURE.md` | Product Surface vs Laboratory |
| `DOI_HISTORY.md` | Birth record + DOIs |
| `docs/FHE_STATUS.md` | Real crypto limits |

---

## What it is NOT

- Not a production banking system  
- Not certified by CNBV or any authority  
- Not an LLM  
- Does not issue official CNBV folios (internal evidence only)

---

## Sister public MRUs

| Repo | Role |
|------|------|
| [hydra-genesis-zero](https://github.com/robinmacv2-ui/hydra-genesis-zero) | Pure kernel (no pip) |
| [romeo-hydra-quantik](https://github.com/robinmacv2-ui/romeo-hydra-quantik) | Public evaluation door |

---

## License

Dual: AGPL-3.0 (evaluation / PoC) · Commercial EMMOROR (production)  
Contact: emmororromeohydra@gmail.com · robinmac.v2@gmail.com

---

**Author:** Luis Angel Vazquez Martinez  
**ORCID:** 0009-0006-8163-3759  
**Concept DOI:** https://doi.org/10.5281/zenodo.21744014
