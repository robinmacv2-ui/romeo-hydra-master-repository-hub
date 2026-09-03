# FOR EVALUATORS — ROMEO-HYDRA

**One page for jury / accelerator / LOI / Financial Regulation / Big4 reviewers.**

---

## 60-second claim

Offline, fail-closed, deterministic admissibility gate that **allows or denies** structured algorithmic actions *before* execution and always writes **SHA-256 lineage + receipts**.

Designed as the control plane in front of models and pipelines that already exist in regulated environments.

**Not** a bank. **Not** CNBV/CNMV-certified. **Not** an LLM.

---

## Why a Financial Regulation / Model Risk professional should care

- Ex-ante control (not just post-hoc explainability)
- Immutable evidence package for every decision
- Offline / no data-exfiltration design
- Clear product surface vs laboratory boundary
- Dual licence ready for commercial regulated use (EMMOROR)

Full regulatory one-pager: [`REGULATORY_BRIEF.md`](./REGULATORY_BRIEF.md)

---

## Reproduce (copy-paste)

```bash
git clone --depth 1 https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python -m romeo_agent -c "status ::"
python -m romeo_agent -c "help ::"
```

Expect: JSON with `"status": "allow"` and a `lineage` block (architect, DOI, policy fail-closed).

DENY smoke (process must not crash):

```bash
python -m romeo_agent -c "rm :: /tmp" 2>/dev/null || true
```

Pilot evidence:

```bash
python -m pilot.run_offline_audit --days 30 --entity EVAL
python -m pilot.run_scoring_audit --entity EVAL --n 20
```

---

## Where to look (product surface only)

| Path | Why |
|------|-----|
| `romeo_agent/` | Parser, admissibility gate, tools, runtime |
| `pilot/` | Offline audit / evidence ledgers |
| `docs/REGULATORY_BRIEF.md` | Financial Regulation one-pager |
| `docs/STRUCTURE.md` | Product vs laboratory boundary |
| `docs/ARCHITECTURE.md` | Technical + business reading |
| `JURY_CHECKLIST.md` | Full pass/fail table |
| `lab/` and everything else | **Ignore for product scoring** |

---

## Pure kernel alternative

No-install path: [hydra-genesis-zero](https://github.com/robinmacv2-ui/hydra-genesis-zero) → `python3 main.py`

---

## Contact

Luis Angel Vazquez Martinez · ORCID 0009-0006-8163-3759  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
