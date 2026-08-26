# FOR EVALUATORS — ROMEO-HYDRA

**One page for jury / accelerator / LOI reviewers.**

---

## 60-second claim

Offline, fail-closed, stdlib-only admissibility gate that **allows or denies** structured commands *before* execution and writes **SHA-256 lineage + receipts** either way.

Not a bank. Not CNBV-certified. Not an LLM.

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

DENY smoke:

```bash
python -m romeo_agent -c "rm :: /tmp" 2>/dev/null || true
```

Expect: deny + reason + receipt (process must not crash).

---

## Where to look

| Path | Why |
|------|-----|
| `romeo_agent/` | Parser, admissibility, tools, runtime |
| `pilot/` | Offline audit / evidence |
| `JURY_CHECKLIST.md` | Full pass/fail table |
| `STRUCTURE.md` | What is product vs `lab/` |
| `lab/` | **Ignore for product scoring** |

---

## Pure kernel alternative

No install path: [hydra-genesis-zero](https://github.com/robinmacv2-ui/hydra-genesis-zero) → `python3 main.py`

---

## Contact

Luis Angel Vazquez Martinez · ORCID 0009-0006-8163-3759  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
