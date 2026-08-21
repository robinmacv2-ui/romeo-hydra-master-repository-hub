# JURY CHECKLIST — ROMEO-HYDRA

Author: Luis Angel Vazquez Martinez  
ORCID: 0009-0006-8163-3759  
Concept DOI: 10.5281/zenodo.21744014

---

## 1. Core claim (what must be true)

- Fail-closed admissibility gate (ex-ante)
- Cryptographic evidence (SHA-256 append-only ledger + lineage)
- Pure Python 3.11 **stdlib** for the core path
- Runs offline on Termux aarch64 / bare metal / clean venv
- No forced third-party dependencies for the product surface

## 2. Clean install (no numpy required)

```bash
mkdir -p /tmp/jury && cd /tmp/jury
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .          # installs ZERO third-party packages
python main.py
python -m pilot.run_offline_audit --days 30 --entity EVAL 2>/dev/null || true
```

If any step fails because of a missing package → the claim is broken.

## 3. Product Surface vs Laboratory

| Layer              | Location                          | Allowed deps     |
|--------------------|-----------------------------------|------------------|
| Product Surface    | src/romeo_hydra_gov, romeo_agent, core gate/ledger | stdlib only     |
| Laboratory         | kernel sigma demos, numpy experiments, native FHE bridges | optional [lab]  |

See `STRUCTURE.md`.

## 4. What is never claimed

- CNBV certification or any regulatory approval
- Production banking system
- Compiled TFHE / full FHE in default runtime
- LLM capabilities
- Automatic legal nullity of decisions

## 5. Evidence artefacts

- `delta_ledger*.jsonl` — append-only SHA-256 chain
- `pilot/output/*.json` + `.sha256` — reproducible audit receipts
- DOI on Zenodo for versioned snapshots

## 6. Contact

emmororromeohydra@gmail.com
