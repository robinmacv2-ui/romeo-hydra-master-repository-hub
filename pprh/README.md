# PPRH-HYDRA v3 — Phase C.1 Geometry + Entropy Gate

**Control-plane components for the Papiroflexia Criptográfica HYDRA system.**

## What this is

Mathematical and security-boundary modules that define:

| Module | Role |
|--------|------|
| `fold_geometry.py` | Deterministic generator of the HYDRA-FOLD-v1 protocol (22 → 88 → 704). Produces a geometric descriptor only. |
| `pprh_polarity.py` | Canonical 1→4 polarity map (L=1001 / D=0110) for the Romeo-Aedra grammar. |
| `puf/entropy_gate.py` | Fail-closed entropy budget gate. Blocks key derivation when conditional entropy is insufficient (PPRH_EC008). |

## What this is not

- Not a source of cryptographic entropy.
- Not a claim that 22 folds are physically realizable (that remains experimental).
- Not a complete fuzzy extractor or AES key pipeline.

## How to use

```python
from pprh.hydra.fold_geometry import FoldGeometry
from pprh.hydra.pprh_polarity import bifurcar_1_a_4
from pprh.hydra.puf.entropy_gate import require_authorization, evaluate_puf_security

# 1. Geometric descriptor (protocol ID)
geo = FoldGeometry()
vector = geo.generate_fold_vector()          # length 704
desc_hash = geo.descriptor_hash()            # SHA-256 of protocol params

# 2. Polarity
pol_L = bifurcar_1_a_4("L")                  # vector "1001"
pol_D = pol_L.dual()                         # vector "0110"

# 3. Entropy Gate (mandatory before any HKDF)
# Current experimental budget fails closed:
report = evaluate_puf_security(measured_hinf=33.9, helper_bits=495)
# report["authorized"] == False  →  PPRH_EC008

# Only when remaining > 0:
# require_authorization(measured_hinf=..., helper_bits=...)
```

## Integrity validation

```bash
pytest pprh/hydra/tests/test_fold_polarity_gate.py -v
# 13 passed
```

## Experimental status (Phase C)

```
H∞ measured        ≈ 33.9 bits
BCH46 helper leakage = 495 bits
safety margin        = 16 bits
remaining            ≈ -477.1 bits

→ KEY DERIVATION FORBIDDEN (PPRH_EC008)
```

Security must come from measured physical uncertainty that survives reconciliation. The 704-bit structure is a geometric descriptor, not 704 bits of security.

## License

Consistent with the parent ROMEO-HYDRA repository.
