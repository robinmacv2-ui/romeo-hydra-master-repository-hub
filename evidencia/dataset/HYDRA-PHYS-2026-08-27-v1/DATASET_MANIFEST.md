# DATASET MANIFEST — HYDRA-PHYS-2026-08-27-v1

**Status:** Experimental physical prototype (empirical fold demonstration).
**Not a cryptographic entropy source. Not a certified PUF.**

---

## 1. Identity

| Field | Value |
|-------|-------|
| DATASET_ID | `HYDRA-PHYS-2026-08-27-v1` |
| Date (local) | 2026-08-27 |
| Author | Luis Angel Vazquez Martinez |
| ORCID | 0009-0006-8163-3759 |
| Project | ROMEO-HYDRA / Papiroflexia Criptografica HYDRA v3 |
| Protocol | HYDRA-FOLD-v1 |
| Related release | `v3.0.0-c1-geometry-gate` |
| Related checkpoint | `crypto-envelope-v1.0.0-checkpoint` |
| Repeatability protocol | `REPEATABILITY_PROTOCOL_10.md` (same folder) |

---

## 2. Physical specimen

| Field | Value |
|-------|-------|
| PROTOTYPE | `paper_accordion_1cm3` |
| MATERIAL | Grid paper (light green / yellow) |
| FOLD_STYLE | Accordion / pico-valle (mountain-valley) |
| MACRO_FOLDS (Base22) | 22 |
| INTERMEDIATE (Matrix88) | 88 |
| MICRO_DESCRIPTOR (Micro704) | 704 bits (geometric protocol ID only) |
| COMPRESSED_VOLUME | approx. 1 cm3 |
| SCALE_REFERENCE | 2 x Mexican 1-peso coin (diameter approx. 21 mm) |
| STATES_CAPTURED | folded (compact), expanded (zigzag spring), stress topography |
| AXIS_A (conceptual) | Residual plastic tension + micro-wrinkles after fold — **candidate_measurement (raw)**, not a key |

---

## 3. Media inventory (annotated)

Binary files stay in the local evidence pack / external storage. This table only **declares identity and role** for audit.

### 3.1 Role vocabulary (use exactly)

| Role | Meaning |
|------|---------|
| `folded` | Compact accordion / stacked form |
| `expanded` | Open zigzag / spring form |
| `topography` | Residual relief, waffle / micro-wrinkle surface (axis **a** visible) |
| `scale` | Shot with 1-peso coin(s) for size reference |
| `process` | Folding or manipulation sequence (video) |

### 3.2 Stills (examples from capture sessions)

| Capture ID | Role(s) | Notes |
|------------|---------|-------|
| 13767.jpg … 13773.jpg | `folded`, `scale` | Compact bundle; coin scale shots |
| 13782.jpg | `topography` | Held sheet; residual grid + wrinkles |
| 13783.jpg | `topography` | Held sheet; strong waffle relief |
| 13784.jpg | `topography` | Held sheet; dense micro-relief |
| (prior close-ups in session) | `folded`, `topography` | Side / top views of compact form |

### 3.3 Video

| Capture ID | Role(s) | Duration (approx.) | Notes |
|------------|---------|--------------------|-------|
| 13781.mp4 | `process`, `topography` | ~9 s | Accordion on table → hand grips edge → tilt shows residual grid / wrinkles |
| (earlier session clips) | `process`, `expanded`, `folded` | — | Fold construction; expand/contract spring cycles |

### 3.4 What this media supports (and does not)

**Supports**

- Empirical existence of pico/valle accordion on grid paper.
- Observable residual texture after fold (axis **a** as *raw visual candidate*).
- Scale order of magnitude (~1 cm³ compact form with coin reference in other stills).

**Does not support**

- Min-entropy claims (NIST SP 800-90B or otherwise).
- Intra-instance repeatability statistics (see protocol file).
- Inter-instance uniqueness.
- Key derivation or PUF product claims.

---

## 4. Canonical names (use exactly)

| Name | Meaning |
|------|---------|
| HYDRA-FOLD-v1 | Fold protocol (22 → 88 → 704) |
| Base22 | 22 macro folds (pico/valle) |
| Matrix88 | Intermediate expansion |
| Micro704 | 704-bit geometric descriptor (protocol ID, not security bits) |
| descriptor_hash | SHA-256 of protocol parameters only |
| candidate_measurement | Raw physical response (e.g. residual texture / axis **a**) — **not** a key |
| estimated_entropy | TBD until measured; do not hard-code 256 |
| measured_hinf | Measured min-entropy of the physical response (when available) |
| helper_bits | Bits leaked by the error-correction helper data |
| remaining / residual | derived: measured_hinf − helper_bits − safety_margin |
| PPRH_EC008 | Entropy-gate fail-closed **error code** (string) |
| Polaridad L / D | L = 1001, D = 0110 (1→4 map) |
| RECIBO-v3 | Target receipt schema (future integration) |

---

## 5. Entropy evaluation (experimental, Phase C.1)

Canonical rule (identical in code, tests, README):

```
R = H_inf - helper_bits - safety_margin

R > 0  => ALLOWED
R <= 0 => PPRH_EC008  (KEY_DERIVATION_FORBIDDEN)

R == 0 => BLOCK
```

```yaml
entropy_evaluation:
  measured_hinf_bits: 33.9
  measurement_uncertainty_bits: 1.8
  helper_bits: 495
  safety_margin_bits: 16

  derived:
    remaining_bits: -477.1
    formula: "measured_hinf_bits - helper_bits - safety_margin_bits"
    remaining_best_case_bits: -475.3   # 33.9 + 1.8 - 495 - 16

  decision:
    error_code: "PPRH_EC008"
    gate_status: "KEY_DERIVATION_FORBIDDEN"
    rule: "remaining > 0 required for authorization"
```

Even the upper end of measurement uncertainty remains negative:

```
33.9 + 1.8 - 495 - 16 = -475.3 < 0
```

Therefore there is **no** justification to enable key derivation for this dataset.

The 704-bit structure is a **geometric descriptor**, not 704 bits of cryptographic strength.

---

## 6. Relation to software layers

| Layer | Location / tag | Role |
|-------|----------------|------|
| Digital envelope | `romeo-hydra-crypto/` · tag `crypto-envelope-v1.0.0-checkpoint` | Canonical seal / verify / Pedersen / digests (60 tests) |
| Geometry + gate | `pprh/hydra/` · tag `v3.0.0-c1-geometry-gate` + harden on main | FoldGeometry, polarity, entropy_gate |
| This dataset | `evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/` | Empirical physical specimen + media roles |

Architecture direction (must not invert):

```
fold ──► GateResult ──► integration ──► crypto
```

`pprh` must not import `romeo-hydra-crypto`.

---

## 7. Explicit non-claims

- This dataset does **not** claim a finished Physical Unclonable Function (PUF).
- This dataset does **not** authorize key derivation.
- This dataset does **not** constitute regulatory certification or legal evidence by itself.
- descriptor_hash is a protocol identifier, not a physical entropy proof.
- Media prove fold geometry, residual texture visibility, and scale; they do not yet prove uniqueness or inter-device distance.
- Axis **a** is a **candidate_measurement** (raw), not key material.

---

## 8. Next measurements required (to move remaining > 0)

1. Feature extraction from stills / video (fold density, residual plastic stress, local topography).
2. **Intra-instance repeatability** — execute `REPEATABILITY_PROTOCOL_10.md` and log results.
3. Inter-instance uniqueness (multiple specimens).
4. Revised measured_hinf from real scans (e.g. path toward NIST SP 800-90B-class analysis).
5. Reduction of helper_bits (better code or lower noise).
6. Only then re-evaluate the Entropy Gate.

---

## 9. Integrity of this manifest

File path in hub:

```
evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/DATASET_MANIFEST.md
evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/REPEATABILITY_PROTOCOL_10.md
```

Author: Luis Angel Vazquez Martinez  
Project: ROMEO-HYDRA  
License: consistent with parent repository (AGPL-3.0 evaluation / commercial EMMOROR)
