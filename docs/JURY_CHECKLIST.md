# JURY CHECKLIST — ROMEO-HYDRA (Master Hub)

**Author:** Luis Angel Vazquez Martinez  
**ORCID:** 0009-0006-8163-3759  
**Concept DOI:** 10.5281/zenodo.21744014

---

## 1. Core claim (must be true)

- Fail-closed admissibility gate (ex-ante)
- Cryptographic evidence (SHA-256 append-only ledger + lineage)
- Pure Python 3.11 **stdlib** for the product surface
- Runs offline on Termux aarch64 / bare metal / clean venv
- No forced third-party dependencies for the product surface

---

## 2. Clean install (≤ 3 minutes)

```bash
mkdir -p /tmp/jury && cd /tmp/jury
git clone --depth 1 https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .          # must install ZERO third-party packages
python main.py
```

If any step fails because of a missing package → **claim broken**.

---

## 3. Agent probes (allow / deny)

```bash
# ALLOW
python -m romeo_agent -c "status ::"
python -m romeo_agent -c "help ::"
python -m romeo_agent -c "echo :: jury"

# DENY (verb outside closed set) — must still emit receipt
python -m romeo_agent -c "rm :: /tmp" 2>/dev/null || true
```

| Probe | Pass if |
|-------|--------|
| `status ::` | `"status": "allow"` + lineage with policy fail-closed |
| `help ::` | lists admissible verbs |
| illegal verb | `deny` + reason + receipt (fail-closed, not crash) |

Optional pilot:

```bash
python -m pilot.run_offline_audit --days 7 --entity EVAL 2>/dev/null || true
```

---

## 4. Product Surface vs Laboratory

| Layer | Location | Allowed deps |
|-------|----------|--------------|
| **Product Surface** | `romeo_agent/`, `pilot/`, `src/`, `core/`, `tests/`, `main.py`, jury docs | **stdlib only** |
| **Laboratory** | `lab/` (simulations, satellites, experimental, assets, logs) | optional; **not** in jury path |

See `STRUCTURE.md`. Evaluators judge **only** the Product Surface.

---

## 5. What is never claimed

- CNBV certification or any regulatory approval
- Production banking system
- Compiled TFHE / full FHE in default runtime
- LLM capabilities
- Automatic legal nullity of decisions

---

## 6. Evidence artefacts

- `pilot/output/*.jsonl` / receipts — append-only SHA-256 chain
- Lineage block in agent JSON (architect, DOI, policy)
- Zenodo concept DOI: 10.5281/zenodo.21744014

---

## 7. Sister MRUs

| Repo | Role |
|------|------|
| [hydra-genesis-zero](https://github.com/robinmacv2-ui/hydra-genesis-zero) | Pure kernel, no pip |
| [romeo-hydra-quantik](https://github.com/robinmacv2-ui/romeo-hydra-quantik) | Public door |

---

## Contact

emmororromeohydra@gmail.com · robinmac.v2@gmail.com
