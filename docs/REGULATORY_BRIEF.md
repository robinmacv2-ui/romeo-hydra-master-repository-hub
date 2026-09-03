# REGULATORY BRIEF — ROMEO-HYDRA

**Audience:** Financial Regulation, Model Risk, AI Governance, Big4 Advisory (KPMG / CNMV / CNBV path)  
**Author:** Luis Angel Vazquez Martinez · ORCID 0009-0006-8163-3759  
**Version:** Product surface 0.1.x · Concept DOI 10.5281/zenodo.21744014

---

## 1. The problem we solve

Regulated entities already run algorithmic decisions (scoring, pricing, credit, AML, model outputs).  
The control gap is almost always the same:

- Decisions happen **without an explicit, immutable, pre-execution gate**.
- Evidence of *why* an action was allowed or denied is incomplete or reconstructible after the fact.
- Cloud-dependent or black-box systems create data-exfiltration and audit friction.
- “Explainability after the fact” is weaker than **admissibility before the fact**.

---

## 2. What ROMEO-HYDRA is

An **offline, fail-closed admissibility layer** that:

1. Receives a structured command / decision request.
2. Evaluates it against a deterministic policy (DFA + allow-list of verbs + context).
3. **Allows or denies** *before* any side-effect.
4. Always emits a **SHA-256 receipt + lineage** (who, what, policy version, outcome).

It is **not**:
- A bank or payment system
- A CNBV / CNMV authorised entity
- An LLM or generative model
- A full FHE production stack (Paillier additive HE + SHA-256 + RSA are present; full TFHE is a native slot)

It **is** the control plane that sits in front of the models and pipelines you already have.

---

## 3. Why this is attractive for Financial Regulation roles

| Capability | Regulatory / Advisory relevance |
|------------|---------------------------------|
| Ex-ante gate (fail-closed) | Prevents unauthorised algorithmic actions; supports Model Risk Management |
| Immutable SHA-256 ledger | Evidence package for internal audit, external examiners, AI inventory |
| Offline / edge-first | Data residency, sovereignty, air-gapped environments |
| Deterministic + reproducible | Auditability and testability preferred over stochastic black boxes |
| Dual licence (AGPL eval / EMMOROR commercial) | Clear path from PoC to regulated production |
| ISO 42001 alignment path | AI Management System thinking already in the architecture |

---

## 4. 60-second verification (copy-paste)

```bash
git clone --depth 1 https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python -m romeo_agent -c "status ::"
python -m romeo_agent -c "help ::"
# Deny must not crash:
python -m romeo_agent -c "rm :: /tmp" 2>/dev/null || true
```

Pilot ledgers:
```bash
python -m pilot.run_offline_audit --days 30 --entity EVAL
python -m pilot.run_scoring_audit --entity EVAL --n 20
```

---

## 5. Honest scope & next steps

**Today:** Reproducible, installable control plane + evidence pilot. Suitable for technical due diligence, LOI, or limited internal pilot.

**Not claimed:** Production banking licence, CNBV folio, full FHE at scale, or multi-year MRR.

**Natural next steps with a regulated partner / Big4:**
1. Map existing model inventory → admissible verbs + policy.
2. Run parallel evidence ledger for 30–90 days on synthetic or shadow traffic.
3. Gap analysis vs local regulatory expectations (CNBV circulars, CNMV guidelines, AI Act).
4. Commercial EMMOROR licence + integration support.

---

## 6. Contact for regulatory / commercial conversation

Luis Angel Vazquez Martinez  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com  
LinkedIn: https://www.linkedin.com/in/luis-angel-vazquez-martinez-066ba9422  
Tel: +52 56 5015 3935

Repository (product surface only): https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
