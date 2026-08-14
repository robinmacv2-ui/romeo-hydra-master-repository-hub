# FOR EVALUATORS — FIAB / BIND / Data Room

**ROMEO-HYDRA v0.1.1+ · TRL-6**

This document is the 60-second briefing for contest judges, technical reviewers and investment committees.

---

## 1. What it is (one paragraph)

ROMEO-HYDRA is an **ontological + biomimetic computing engine** focused on protecting data **while it is being used** (not only at rest), with emphasis on low-energy / edge operation. The public core is a clean, installable Python package that exposes:

- **Kernel Sigma** — stability controller with projection, 6k sieve, Hessian metrics and multi-spectrum mimetic adapter
- **Romeo Abstraction Layer** — conceptual fold → low-level verification skeletons (TFHE/HElib style)

It is dual-licensed (AGPL-3.0 for research/evaluation · Comercial EMMOROR for regulated production).

---

## 2. How to verify in < 3 minutes

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v
```

Expected: **7 tests passed**, deterministic demo, offline execution.

---

## 3. Persistent identifiers (cite these)

| Type | DOI |
|------|-----|
| **Version DOI (recommended for citation)** | https://doi.org/10.5281/zenodo.21918611 |
| Concept DOI | https://doi.org/10.5281/zenodo.21744014 |

Registered via Zenodo (CERN).

---

## 4. Technology Readiness

- **TRL-6**: Component demonstrated in relevant environment
  - Installable package
  - Deterministic UMR
  - Passing no-plaintext-leak + stability tests
  - Version DOI published
- Path to TRL-7: regulated PoC / synthetic CNBV-style flows (roadmap)

---

## 5. Dual License (clear for commercial evaluation)

| Use case | License |
|----------|---------|
| Research, academia, contest evaluation, internal PoC | **AGPL-3.0** |
| Production in regulated entities (banking, fintech, CNBV-like) | **Comercial EMMOROR** (contact required) |

Commercial contact: **emmororromeohydra@gmail.com**

---

## 6. What is *not* claimed

- Not a finished production banking system
- Not audited by a third-party for certification yet
- Homomorphic components are currently conceptual / bridge-level (not full production TFHE library)

Honesty about scope is intentional and auditable.

---

## 7. Repository structure (for reviewers)

| Path | Purpose |
|------|---------|
| `romeo_hydra/` | **Product core** (installable package) |
| `tests/` | TRL-6 test suite (no-plaintext-leak + stability) |
| `examples/` | Minimal reproducible demo |
| `PACKAGE_README.md` | Package documentation |
| `FOR_EVALUATORS.md` | This file |
| Everything else | Research lab, experiments, orchestration scripts |

---

## 8. One-line value proposition for FIAB / BIND

> Offline-capable, DOI-backed, dual-licensed kernel for data-in-use protection and ontological governance — ready for regulated evaluation in LATAM fintech/banking contexts.

---

**Author:** Luis Ángel Vázquez Martínez  
**Email:** robinmac.v2@gmail.com · emmororromeohydra@gmail.com  
**Repo:** https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
