# Termux aarch64 — sin Rust, sin mentir

Autor: Luis Angel Vazquez Martinez

## Install

```bash
cd ~/romeo-hydra-master-repository-hub
git fetch origin && git reset --hard origin/main

pip install -U pip setuptools wheel
pip install numpy          # unica dep dura
# NO: pip install -e ".[dev]"   # ruff/maturin falla en ARM
# OPCIONAL si hay wheel: pip install cryptography
pip install -e .
pip install pytest         # solo tests

export PYTHONPATH=.
```

## Demos que DEBEN generar ledger

```bash
python -c "from romeo_hydra import get_info; print(get_info())"

python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
ls pilot/output/
```

## Frase honesta (FIAB / BIND)

v0.1.2 es un build Python puro (~55K), DOI 10.5281/zenodo.21922106, que corre offline en Termux aarch64 sin depender de Rust. Implementa integridad SHA-256 y un puente conceptual a FHE (HElib/TFHE); **no** es una libreria TFHE compilada de produccion (eso pesaria multi-MB). El piloto genera un **ledger de evidencia con folio interno**, no un folio CNBV oficial.
