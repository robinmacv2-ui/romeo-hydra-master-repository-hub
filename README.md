# ROMEO-HYDRA · Master Repository Hub

**Offline fail-closed admissibility layer + cryptographic evidence for algorithmic decisions**

Python ≥ 3.11 · DOI [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) · ORCID [0009-0006-8163-3759](https://orcid.org/0009-0006-8163-3759)

---

## Why this matters for Financial Regulation & Model Risk

ROMEO-HYDRA is an **ex-ante admissibility gate** that decides *allow / deny* on structured algorithmic actions **before** they execute, and always writes an immutable **SHA-256 evidence receipt** (lineage + policy).

- **Fail-closed by design** — unknown or out-of-policy actions are rejected; the process never crashes into an unsafe state.
- **Offline / edge-first** — no cloud dependency, no plaintext leakage to third parties.
- **Audit-ready** — every decision produces a verifiable ledger entry usable for Model Risk Management, AI inventory, internal audit and regulatory evidence packages.
- **Not a bank. Not CNBV/CNMV certified yet. Not an LLM.** It is the deterministic control plane that regulated entities need under the algorithmic decisions they already run.

Primary use cases for Financial Services / Big4 / RegTech:
- Pre-execution control of scoring, risk models, automated decisions
- Evidence chain for algorithmic accountability (AI Act / ISO 42001 alignment path)
- Sovereign / air-gapped environments where data cannot leave the perimeter

Full regulatory one-pager → [`docs/REGULATORY_BRIEF.md`](docs/REGULATORY_BRIEF.md)  
Evaluator quick start → [`docs/FOR_EVALUATORS.md`](docs/FOR_EVALUATORS.md)  
Product vs laboratory boundary → [`docs/STRUCTURE.md`](docs/STRUCTURE.md)

---

## 60-second reproduce

```bash
git clone --depth 1 https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python -m romeo_agent -c "status ::"
python -m romeo_agent -c "help ::"
```

Expect JSON with `"status": "allow"` + lineage block (architect, DOI, fail-closed policy).

Deny smoke (must not crash):
```bash
python -m romeo_agent -c "rm :: /tmp" 2>/dev/null || true
```

Pilot evidence:
```bash
python -m pilot.run_offline_audit --days 30 --entity EVAL
python -m pilot.run_scoring_audit --entity EVAL --n 20
```

---

## Product Surface (only this is evaluated)

```
romeo_hydra/     # installable package (kernel, crypto, evidence, metrics)
romeo_agent/     # offline DFA + ex-ante admissibility gate
pilot/           # SHA-256 ledgers + scoring / market-integrity audits
tests/           # unit + adversarial
scripts/         # smoke + judge audit
docs/            # regulatory brief, architecture, FHE status, ops rules
main.py
README.md
pyproject.toml
requirements.txt
CITATION.cff
```

Everything outside this surface is **Laboratory / lineage / historical** and is intentionally invisible to product evaluation.

---

## Authorship & Intellectual Property

**Author & Sole Titular:** Luis Angel Vazquez Martinez  
[![ORCID iD](https://img.shields.io/badge/ORCID-0009--0006--8163--3759-green?style=flat&logo=orcid)](https://orcid.org/0009-0006-8163-3759)
[![INDAUTOR](https://img.shields.io/badge/INDAUTOR-03--2026--081813295300--01-blue?style=flat&logo=shield)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub)

- **Work:** ROMEO-HYDRA (Ontological Framework, System & Source Code for AI Governance & Audit)
- **Registration:** `03-2026-081813295300-01` · 24 Aug 2026 · Computer Programs
- **Ownership:** 100% Luis Angel Vazquez Martinez

---

## License

Dual:
- **AGPL-3.0** — evaluation / non-commercial / research
- **Commercial EMMOROR** — regulated production deployments (contact for terms)

**Contact**  
Luis Angel Vazquez Martinez · robinmac.v2@gmail.com · emmororromeohydra@gmail.com  
LinkedIn: [luis-angel-vazquez-martinez](https://www.linkedin.com/in/luis-angel-vazquez-martinez-066ba9422)
