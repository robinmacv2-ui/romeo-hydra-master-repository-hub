# Termux aarch64

Autor: Luis Angel Vazquez Martinez

Ver reglas de equipo: [`OPS_RULES.md`](../OPS_RULES.md)

## Install (sin Rust)

```bash
cd ~/romeo-hydra-master-repository-hub   # o ruta real
git fetch origin && git reset --hard origin/main
pip install numpy
pip install -e .
# NO: pip install -e ".[dev]"  (ruff/maturin)
# cryptography solo si hay wheel: pip install 'romeo-hydra[crypto]'
```

## Smoke obligatorio

```bash
bash scripts/smoke_termux.sh
```

Debe crear JSON en `pilot/output/` con disclaimer **NO es folio CNBV**.

## Frase honesta FIAB

v0.1.2 = build Python puro ~55K, DOI 21922106, offline en Termux sin Rust.  
Puente conceptual a FHE — **no** TFHE compilado en el wheel.  
Ledger con **folio interno**, no folio CNBV.
