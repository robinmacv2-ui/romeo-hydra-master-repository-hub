# REGULATORY MAPPING — ROMEO-HYDRA V3.1

This document does **not** claim that HYDRA is “compliant” with any regulation.  
It maps technical controls to regulatory *themes* so that a legal reviewer can evaluate applicability.

## Principle

```
REGULATORY REQUIREMENT
        ↓
CONTROL OBJECTIVE
        ↓
HYDRA IMPLEMENTATION
        ↓
EVIDENCE
        ↓
REMAINING GAP (legal review required)
```

## 1. Traceability / Event logging

| Item | Content |
|------|---------|
| **Theme** | Automatic recording of events relevant to a high-risk decision |
| **Reference (illustrative)** | EU AI Act Art. 12 (record-keeping), Art. 19 (logs) |
| **Control objective** | Every decision attempt leaves a verifiable, ordered record |
| **HYDRA implementation** | Chained ledger (`seq` + `prev_hash` + SHA-256 receipt) generated on both ALLOW and DENY paths |
| **Evidence** | `delta_ledger_registry.json`, adversarial tests of chain integrity |
| **Remaining gap** | Legal determination of whether the specific logging requirements of a given jurisdiction apply to the concrete use-case |

## 2. What HYDRA explicitly does **not** claim

- Automatic legal nullity of a decision that lacks a cryptographic receipt.
- Full compliance with CONDUSEF, CNSF, CNBV, LISF or the EU AI Act.
- That a receipt alone constitutes a valid administrative or contractual act.

HYDRA provides a **technical condition of admissibility** and **cryptographically chained evidence**.  
Legal consequences remain a matter for counsel and the applicable regime.
