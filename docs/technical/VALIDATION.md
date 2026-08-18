# VALIDATION.md — ROMEO-HYDRA V3.1

## How to reproduce

```bash
cd romeo-hydra-core
python -m unittest tests.test_hydra_v3 -v
python main.py "auditar::poliza_001" auditor
python main.py "rm::/tmp" operator
```

## Adversarial tests (must PASS)

| Test | Expected |
|------|----------|
| Closed verb outside set | DENY |
| Capability violation | DENY |
| Path escape | DENY |
| Receipt chain monotonicity | seq increases, prev_hash links |
| Empty / malformed | DENY |

## Levels of assertion

- **Nivel A (demostrado)**: lo que los tests ejecutan y verifican.
- **Nivel B (inferencia técnica)**: integridad de cadena verificable offline.
- **Nivel C (posicionamiento jurídico)**: la evidencia *puede contribuir* a demostrar obligaciones de trazabilidad; requiere revisión legal.
