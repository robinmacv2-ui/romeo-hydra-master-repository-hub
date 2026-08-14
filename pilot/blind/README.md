# Blind scoring — PHE Paillier (rama feat/fhe-next-level)

Autor: Luis Angel Vazquez Martinez

## Nombre correcto

- **PHE** = Partially Homomorphic Encryption (Paillier, aditivo)
- **No digas FHE** en este piloto (FHE = circuitos arbitrarios / TFHE / HElib full)

## Install (Termux)

```bash
git fetch origin
git checkout feat/fhe-next-level
pip install -r requirements-fhe.txt
python -m pilot.run_blind_audit --entity SOFIPO-DEMO --n 20
ls pilot/output/blind_SOFIPO-DEMO_20.json
```

## Condiciones CNBV-safe

1. Ledger: `is_cnbv_certified: false`, `paillier_mode: simulated_pilot`
2. Produccion: SOFIPO genera llaves; Romeo solo recibe `public_key`
3. Folio interno ≠ folio CNBV

## Pitch (Claudia / evaluadores)

En main: ledger offline SHA-256, DOI 21922106, tfhe false, folio interno no CNBV.  
En esta rama: piloto **PHE Paillier** de scoring ciego — la SOFIPO cifra, Romeo aplica pesos sin desencriptar, el resultado solo lo ve quien tiene la privada. Cumplimiento por diseno del flujo de llaves, no por promesa de FHE de produccion.
