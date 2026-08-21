# Termux aarch64

Autor: Luis Angel Vazquez Martinez

Ver reglas de equipo: [`OPS_RULES.md`](../OPS_RULES.md)

## Install (core = pure stdlib)

```bash
cd ~/romeo-hydra-master-repository-hub   # o ruta real
git fetch origin && git reset --hard origin/main
python3 -m venv .venv && source .venv/bin/activate
pip install -e .          # ZERO third-party packages required
# NO se necesita numpy para el núcleo fail-closed
```

## Laboratory only (optional)

```bash
pip install -e ".[lab]"   # instala numpy para experimentos científicos
# cryptography solo si hay wheel: pip install -e ".[crypto]"
```

## Smoke obligatorio

```bash
bash scripts/smoke_termux.sh
```

Debe crear JSON en `pilot/output/` con disclaimer **NO es folio CNBV**.

## Frase honesta FIAB / Jurado

v0.1.3 = build Python 3.11, core stdlib-only, DOI concept 21744014.  
Numpy es extra de laboratorio, no dependencia del núcleo.  
Ledger con **folio interno**, no folio CNBV.
