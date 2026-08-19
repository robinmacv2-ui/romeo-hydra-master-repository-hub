# FOR EVALUATORS — FIAB / BIND / 500 LATAM / YC

**ROMEO-HYDRA**  
Author: Luis Angel Vazquez Martinez  
ORCID: 0009-0006-8163-3759  
Concept DOI: 10.5281/zenodo.21744014

---

## 1. What this is

Offline Python package (stdlib-first, ~55K).  
Fail-closed admissibility layer + cryptographic evidence for algorithmic decisions.

- Ex-ante gate (closed verbs + capabilities)
- SHA-256 append-only ledger
- Internal folio only (explicitly not CNBV)
- Reproducible on Termux aarch64 / bare-metal / clean venv

It is not a LLM.  
It is not a production banking system.  
It is not certified by any authority.

---

## 2. Product Surface (evaluate only this)

See `STRUCTURE.md`.  
Everything outside the Product Surface is Laboratory and is invisible to evaluation by design.

---

## 3. Judge test (clean environment)

```bash
mkdir -p /tmp/auditoria_jurado && cd /tmp/auditoria_jurado
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL
```

Expected: JSON in `pilot/output/` with explicit note that the folio is internal (not CNBV) and HE/TFHE flags false.

---

## 4. Official statement

Build: pure Python, offline, fail-closed.  
Evidence: SHA-256 ledger + internal folio.  
Status: 0 paying customers / $0 MRR. Seeking first offline pilot LOI.

---

## 5. What is never claimed

- Production banking or trading system
- CNBV certification or any regulatory approval
- Compiled TFHE / full homomorphic encryption in the default runtime
- LLM or chatbot capabilities
- Automatic legal nullity of any decision

---

## 6. License

AGPL-3.0 (evaluation / PoC)  
Commercial EMMOROR (production)  
Contact: emmororromeohydra@gmail.com

---

Luis Angel Vazquez Martinez  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
