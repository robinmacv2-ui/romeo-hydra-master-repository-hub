# AUDIT DELTA — P1

**Interval:** `6bafb5e7cf38502de19500cd6ed0188e7caa1a60` → `9bff763f85e88d4b6029c3c29da39a2909e41170`  
**Repo:** `robinmacv2-ui/romeo-hydra-master-repository-hub`  
**Branch:** `main`  
**Date of delta analysis:** 2026-08-28  
**Method:** GitHub tree blob SHA comparison + commit file lists (static integrity)

---

## 1. Purpose

Establish that the audit object at HEAD `9bff763f` is **not** an opaque rewrite of the control-plane hardened at `6bafb5e7`.  
Separate:

| Scope | Expected |
|-------|----------|
| `pprh/` (code + tests) | **Unchanged** in this interval |
| `romeo-hydra-crypto/` | **Unchanged** in this interval |
| `evidencia/dataset/` | Documentation only may change |

This answers the integrity question raised in the methodological review: *what changed between the two SHAs, and did crypto move?*

---

## 2. Commit chain in the closed interval

Only **one** commit sits strictly after `6bafb5e7` up to `9bff763f` on `main` for this delta:

| SHA (short) | Full SHA | Message | Author date (UTC) |
|-------------|----------|---------|-------------------|
| `6bafb5e7` | `6bafb5e7cf38502de19500cd6ed0188e7caa1a60` | `fix(pprh): harden entropy gate (Decimal + GateResult) and reintroduce C.1 tree on main` | 2026-08-28T06:14:51Z |
| `9bff763f` | `9bff763f85e88d4b6029c3c29da39a2909e41170` | `docs(dataset): annotate physical media roles + add 10-cycle repeatability protocol` | 2026-08-28T07:48:24Z |

**Parent relationship:** `9bff763f` is the immediate successor of `6bafb5e7` on the audited line of `main` for this control-plane window (no intermediate commits between them in the list returned for `main` at analysis time).

---

## 3. Files touched by commit `9bff763f` (the only delta commit)

From the commit payload:

| Path | Status | + / − |
|------|--------|-------|
| `evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/DATASET_MANIFEST.md` | modified | +54 / −18 |
| `evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/REPEATABILITY_PROTOCOL_10.md` | **added** | +138 / 0 |

**Stats:** +192 / −18 (total 210).

**Not in the file list:** any path under `pprh/`, any path under `romeo-hydra-crypto/`.

---

## 4. Tree integrity — `pprh/`

Blob SHAs compared path-by-path at both commits:

| Path | Blob @ 6bafb5e7 | Blob @ 9bff763f | Match |
|------|-----------------|-----------------|-------|
| `pprh/README.md` | `06e08dbc…` | `06e08dbc…` | YES |
| `pprh/__init__.py` | `f99c449f…` | `f99c449f…` | YES |
| `pprh/hydra/__init__.py` | `5a9ade41…` | `5a9ade41…` | YES |
| `pprh/hydra/fold_geometry.py` | `b7fe9b71…` | `b7fe9b71…` | YES |
| `pprh/hydra/pprh_polarity.py` | `228ef8c3…` | `228ef8c3…` | YES |
| `pprh/hydra/puf/__init__.py` | `85dae65d…` | `85dae65d…` | YES |
| `pprh/hydra/puf/entropy_gate.py` | `fa571388…` | `fa571388…` | YES |
| `pprh/hydra/puf/feature_extraction.py` | `074d302f…` | `074d302f…` | YES |
| `pprh/hydra/tests/__init__.py` | `8baff0c6…` | `8baff0c6…` | YES |
| `pprh/hydra/tests/test_fold_polarity_gate.py` | `2b0ed646…` | `2b0ed646…` | YES |

**Result:** `pprh/` **byte-identical** across the interval.  
Entropy gate contract (R > 0, Decimal, GateResult, PPRH_EC008, zero crypto imports) is **unchanged** by `9bff763f`.

---

## 5. Tree integrity — `romeo-hydra-crypto/`

All listed blobs under `romeo-hydra-crypto/` (core, tests, scripts) have **identical blob SHAs** at `6bafb5e7` and `9bff763f`, including:

| Path (examples) | Blob (both SHAs) |
|-----------------|------------------|
| `core/envelope.py` | `78bc0aa2abfca9601bd54cc6831d88c4fe8d0658` |
| `core/pedersen.py` | `a8dd08546666012601b426b1404b88ab8723c02b` |
| `core/aead.py` | `64c8bce812270dfc18d6c8cf929ae46dc668a574` |
| `tests/test_envelope.py` | `f31c9b804e5cfe50aaecd379f0a31e2dfa3c4fb7` |
| `tests/test_pedersen.py` | `415b7f6679e5487ae6e22bddddb7e82e760f7986` |
| … (full tree count 23 entries) | identical |

**Result:** equivalent to:

```text
git diff 6bafb5e7 9bff763f -- romeo-hydra-crypto
# → empty
```

Claim **“crypto untouched in this interval”** is **PASS**.

---

## 6. Semantic summary of the only content change

### 6.1 `DATASET_MANIFEST.md`

Documentation expansions only:

- Role vocabulary: `folded` / `expanded` / `topography` / `scale` / `process`
- Annotated media table (capture IDs 13767–13773, 13782–13784, video 13781.mp4)
- Explicit: axis **a** = `candidate_measurement` (raw), not key material
- Link to repeatability protocol
- Non-claims reinforced (no PUF, no key derivation from media alone)

**No change** to residual formula, measured_hinf 33.9, helper 495, margin 16, remaining −477.1, best-case −475.3, or PPRH_EC008.

### 6.2 `REPEATABILITY_PROTOCOL_10.md` (new)

- Intra-instance 10-cycle fold/unfold observation protocol
- Log table + optional subjective scores
- Explicit: does **not** measure min-entropy, does **not** authorize key derivation, does **not** claim PUF
- Success = complete log only

---

## 7. What this delta does **not** prove

| Non-claim | Status |
|-----------|--------|
| HEAD crypto suite re-run at `9bff763f` | Still **PENDING LOCAL RUN** |
| pytest of `pprh` tests at operator machine | Still **PENDING LOCAL RUN** |
| Physical 10-cycle log executed | **DOCUMENTED / NOT EXECUTED** |
| Min-entropy / inter-instance uniqueness | **NOT VALIDATED** |

The delta only proves **integrity of the control-plane and crypto trees** between the two SHAs.

---

## 8. Gate contract frozen at both ends of the interval

At both `6bafb5e7` and `9bff763f`, `entropy_gate.py` blob `fa571388…` encodes:

```text
R = H_inf - helper - margin

R > 0  => ALLOWED
R <= 0 => PPRH_EC008   (includes R == 0 => BLOCK)
```

- `evaluate()` does not raise  
- `require_authorization()` raises `EntropyGateError` when blocked  
- Residual arithmetic uses `Decimal`  
- No imports of `romeo-hydra-crypto` / `core.envelope`

---

## 9. Verdict for P1

| Check | Result |
|-------|--------|
| Intermediate commits in interval | 1 (`9bff763f` only) |
| `pprh/` code/tests changed? | **NO** (identical blob SHAs) |
| `romeo-hydra-crypto/` changed? | **NO** (identical blob SHAs) |
| Only docs/dataset changed? | **YES** |
| Gate contract preserved? | **YES** |
| Crypto “untouched” claim for interval | **PASS** |

**P1 STATUS: PASS**

The audit object at `9bff763f` may be treated as the **same control-plane and same crypto tree** as at `6bafb5e7`, plus dataset documentation and the repeatability protocol file.

---

## 10. Reproduction commands (operator machine)

```bash
cd ~/ROMEO-HYDRA-MASTER/romeo-hydra-master-repository-hub
git fetch origin
git rev-parse 6bafb5e7cf38502de19500cd6ed0188e7caa1a60
git rev-parse 9bff763f85e88d4b6029c3c29da39a2909e41170

echo "=== commits in interval ==="
git log --oneline 6bafb5e7cf38502de19500cd6ed0188e7caa1a60..9bff763f85e88d4b6029c3c29da39a2909e41170

echo "=== pprh + dataset diff ==="
git diff 6bafb5e7cf38502de19500cd6ed0188e7caa1a60 9bff763f85e88d4b6029c3c29da39a2909e41170 -- pprh evidencia/dataset

echo "=== crypto diff (must be empty) ==="
git diff 6bafb5e7cf38502de19500cd6ed0188e7caa1a60 9bff763f85e88d4b6029c3c29da39a2909e41170 -- romeo-hydra-crypto
```

Expected:

- log: one commit `9bff763f`
- pprh diff: empty (or only if local dirty)
- evidencia/dataset: manifest + new protocol file
- crypto diff: **empty**

---

## 11. Evidence levels (reminder)

| Level | This P1 document |
|-------|------------------|
| Static tree / blob integrity | **PASS** |
| Local pytest / unittest at HEAD | **Not in scope of P1** |
| Physical validation | **Not in scope of P1** |

---

**File path:** `evidencia/audit/AUDIT_DELTA_6bafb5e7_9bff763f.md`  
**Project:** ROMEO-HYDRA / PPRH  
**Related HEAD:** `9bff763f85e88d4b6029c3c29da39a2909e41170`
