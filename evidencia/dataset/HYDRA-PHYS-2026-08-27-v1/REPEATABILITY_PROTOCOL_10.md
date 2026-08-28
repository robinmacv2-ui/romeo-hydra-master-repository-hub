# REPEATABILITY PROTOCOL 10 — Intra-instance fold / unfold

**Dataset:** `HYDRA-PHYS-2026-08-27-v1`  
**Specimen:** same physical sheet (grid paper accordion)  
**Goal:** Observe how residual texture (axis **a** / `candidate_measurement`) changes across 10 controlled cycles on **one** instance.

**This protocol does not measure min-entropy.**  
**This protocol does not authorize key derivation.**  
**This protocol does not claim PUF quality.**

It only produces a structured observation log so that later analysis can talk about *repeatability* with data instead of narrative.

---

## 1. Scope

| Item | Value |
|------|-------|
| Cycles | 10 |
| Action per cycle | Fold to compact accordion → unfold / expand to open zigzag → return to a defined “home” pose |
| Same specimen | Yes (intra-instance only) |
| Environment | Record room temp / humidity if a simple sensor or weather note is available; otherwise note “uncontrolled indoor” |
| Lighting | Prefer the same lamp / same side light for all stills |
| Camera | Same device, fixed resolution if possible; no heavy filters |

---

## 2. Definitions

| Term | Meaning |
|------|---------|
| **Home pose** | Sheet fully expanded on the table, accordion lines visible, same orientation (e.g. grid upright, label corner bottom-left) |
| **Compact pose** | Accordion compressed to the smallest stable stack you use in demos (~1 cm³ class) |
| **Cycle k** | Home → compact → home, for k = 1 … 10 |
| **Observation** | Qualitative notes + optional photo IDs; optional crude scores (see §4) |

Axis **a** here means *visible residual plastic texture / micro-wrinkles*, recorded as **candidate_measurement (raw)**, never as key material.

---

## 3. Procedure (per cycle)

1. Place sheet in **home pose**. Take still `CYC{k:02d}_HOME` (role: `expanded` or `topography`).
2. Fold carefully along existing pico/valle lines to **compact pose**. Take still `CYC{k:02d}_COMPACT` (role: `folded`).
3. Unfold back to **home pose** without forcing new creases outside the established set.
4. Take still `CYC{k:02d}_HOME_AFTER` (role: `topography`).
5. Fill one row in the log table (§5).
6. Wait ~30–60 s (optional, reduces heat/handling bias) before cycle k+1.

After cycle 10: one wide shot of the sheet + optional short video (~5–10 s) panning residual relief.

---

## 4. Optional crude scores (not entropy)

Use only if you want numbers later; they are **subjective scaffolds**, not NIST metrics.

| Score | Scale | Question |
|-------|-------|----------|
| crease_clarity | 1–5 | Are the main 22-class lines still sharp? |
| residual_relief | 1–5 | How strong is the waffle / micro-wrinkle texture vs cycle 1? |
| new_damage | 0–2 | 0 = none, 1 = minor tear/shine, 2 = structural damage |
| handling_ease | 1–5 | How easy to refold on the same lines? |

Do **not** convert these scores into bits or keys.

---

## 5. Log table (copy and fill)

| Cycle | Timestamp | Temp/RH note | crease_clarity | residual_relief | new_damage | handling_ease | Photo IDs | Free note |
|------:|-----------|--------------|----------------|-----------------|------------|---------------|-----------|-----------|
| 1 | | | | | | | | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |
| 6 | | | | | | | | |
| 7 | | | | | | | | |
| 8 | | | | | | | | |
| 9 | | | | | | | | |
| 10 | | | | | | | | |

**Session header (fill once)**

```text
DATASET_ID:     HYDRA-PHYS-2026-08-27-v1
SPECIMEN_ID:    (e.g. sheet-01)
OPERATOR:       Luis Angel Vazquez Martinez
DATE_LOCAL:     YYYY-MM-DD
PLACE:          (city / room)
CAMERA:         (phone model)
LIGHT:          (e.g. desk lamp left)
ENV:            uncontrolled indoor | temp=__°C RH=__%
```

---

## 6. Pass / fail for *this protocol only*

| Outcome | Meaning |
|---------|---------|
| **Log complete** | All 10 cycles have timestamp + at least one note or photo ID |
| **Structural fail** | Sheet tears or cannot follow original fold lines by cycle ≤ 10 |
| **Not applicable** | Do not mark “entropy pass” or “PUF pass” — those are out of scope |

A complete log is success for Phase-1 *observation*. It does not move the Entropy Gate.

---

## 7. After the 10 cycles

1. Store photos under a local folder, e.g.  
   `evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/repeatability_10/`
2. Keep the filled log (markdown or CSV) next to them.
3. Optionally update `DATASET_MANIFEST.md` media table with new capture IDs and roles.
4. **Do not** change `measured_hinf_bits` or clear PPRH_EC008 based on this protocol alone.

---

## 8. Link to the gate

```
fold / residual texture (axis a)
    → candidate_measurement (raw)
    → [future] feature extraction + min-entropy study
    → entropy_gate (R > 0?)
         → NO  → PPRH_EC008
         → YES → only then integration toward crypto
```

This file only strengthens the **top** of that chain with disciplined observation.

---

Author: Luis Angel Vazquez Martinez  
Project: ROMEO-HYDRA  
Related: `DATASET_MANIFEST.md` · tag `v3.0.0-c1-geometry-gate` · entropy gate Option 1 (R > 0)
