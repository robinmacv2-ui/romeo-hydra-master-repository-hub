# Termux — instalacion y demos (sin ruff)

Autor: Luis Angel Vazquez Martinez

## Que significan los errores de la captura

| Error | Causa | Arreglo |
|-------|--------|--------|
| `Failed to build 'ruff'` / maturin | `ruff` se compila con Rust; en Termux ARM suele fallar | **No** instales `.[dev]` completo; instala pytest a mano |
| `No module named 'pilot'` | `pilot/` no iba como paquete instalado / falta `__init__.py` | `PYTHONPATH=.` desde la raiz del repo |
| `pytest: command not found` | pytest no instalado | `pip install pytest` |

## Instalacion recomendada en Termux

```bash
cd ~/romeo-hydra-master-repository-hub   # o tu ruta

pip install -U pip setuptools wheel
pip install numpy cryptography pytest

# Editable SIN el extra [dev] (evita ruff/maturin)
pip install -e .

# Comprobar nucleo
python -c "from romeo_hydra import get_info; print(get_info()['version'], get_info()['crypto'])"
```

## Demos (siempre desde la raiz del repo)

```bash
cd ~/romeo-hydra-master-repository-hub
export PYTHONPATH=.

python -m pilot
python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
python -m pilot.run_market_integrity_audit --symbol DEMO --n 15

python -c "from romeo_hydra.crypto import HERuntime; print(HERuntime().demo_stack())"

pytest tests/test_crypto_real.py tests/test_market_risk_energy.py -v
```

Si `run_offline_audit` no existe en tu clone, actualiza:

```bash
git pull origin main
```

## Alternativa sin -m pilot

```bash
python pilot/run_scoring_audit.py --entity SOFIPO-DEMO --n 20
```

## No uses en Termux (por ahora)

```bash
pip install -e ".[dev]"   # tira de ruff → maturin → falla en muchos ARM
```
