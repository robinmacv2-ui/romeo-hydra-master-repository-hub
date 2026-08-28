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

---

## 3. Media inventory (source material)

Still images (examples from capture session):

- 13767.jpg … 13773.jpg and subsequent close-ups
- Scale shots with 1-peso coins
- Top and side views of the compact bundle

Video sequences:

- Folding process (grid paper → accordion)
- Expand / contract cycles (spring behaviour)
- Stress / residual topography manipulation

**Note:** Binary media files are not stored inside this manifest. They remain in the local evidence pack and/or external storage. This file only declares identity, naming and measured parameters.

---

## 4. Canonical names (use exactly)

| Name | Meaning |
|------|---------|
| HYDRA-FOLD-v1 | Fold protocol (22 → 88 → 704) |
| Base22 | 22 macro folds (pico/valle) |
| Matrix88 | Intermediate expansion |
| Micro704 | 704-bit geometric descriptor (protocol ID, not security bits) |
| descriptor_hash | SHA-256 of protocol parameters only |
| measured_hinf | Measured min-entropy of the physical response |
| helper_bits | Bits leaked by the error-correction helper data |
| remaining | measured_hinf − helper_bits − safety_margin |
| PPRH_EC008 | Entropy-gate fail-closed error code |
| Polaridad L / D | L = 1001, D = 0110 (1→4 map) |
| RECIBO-v3 | Target receipt schema (future integration) |

---

## 5. Entropy budget (experimental, Phase C.1)

```
measured_hinf     ≈  33.9 bits
helper_bits       = 495 bits   (BCH-class helper leakage estimate)
safety_margin     =  16 bits
remaining         ≈ −477.1 bits
```

**Decision of the Entropy Gate:**

```
remaining ≤ 0  →  KEY DERIVATION FORBIDDEN  (PPRH_EC008)
```

The 704-bit structure is a **geometric descriptor**, not 704 bits of cryptographic strength.
Security must come from measured physical uncertainty that survives reconciliation.

---

## 6. Relation to software layers

| Layer | Location / tag | Role |
|-------|----------------|------|
| Digital envelope | `romeo-hydra-crypto/` · tag `crypto-envelope-v1.0.0-checkpoint` | Canonical seal / verify / Pedersen / digests (60 tests) |
| Geometry + gate | `pprh/hydra/` · tag `v3.0.0-c1-geometry-gate` | FoldGeometry, polarity, entropy_gate (13 tests) |
| This dataset | `evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/` | Empirical physical specimen declaration |

---

## 7. Explicit non-claims

- This dataset does **not** claim a finished Physical Unclonable Function (PUF).
- This dataset does **not** authorize key derivation.
- This dataset does **not** constitute regulatory certification or legal evidence by itself.
- descriptor_hash is a protocol identifier, not a physical entropy proof.
- Media prove fold geometry and scale; they do not yet prove uniqueness or inter-device distance.

---

## 8. Next measurements required (to move remaining > 0)

1. Feature extraction from stills / video (fold density, residual plastic stress, local topography).
2. Reproducibility and uniqueness statistics across multiple specimens / sessions.
3. Revised measured_hinf from real scans.
4. Reduction of helper_bits (better code or lower noise).
5. Only then re-evaluate the Entropy Gate.

---

## 9. Integrity of this manifest

File path in hub:

```
evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/DATASET_MANIFEST.md
```

Commit message of introduction:

```
docs(dataset): add HYDRA-PHYS-2026-08-27-v1 physical prototype manifest
```

Author: Luis Angel Vazquez Martinez  
Project: ROMEO-HYDRA  
License: consistent with parent repository (AGPL-3.0 evaluation / commercial EMMOROR)
