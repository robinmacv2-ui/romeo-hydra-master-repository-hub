# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)

Codigo que corre offline. Empaquetado (~56K: 28K wheel + 27K tar.gz). Con DOI en Zenodo.

> Evaluadores: [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md)  
> Estado real: [`STATUS.md`](./STATUS.md)  
> Kit piloto: [`pilot/README.md`](./pilot/README.md)  
> Historial de DOIs (anexo): [`DOI_HISTORY.md`](./DOI_HISTORY.md)

**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106) (v0.1.2)  
**Concept:** [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)

---

## Que es esto (en corto)

Un intento de proteger datos **mientras se usan**, no solo cuando estan guardados, y de hacerlo sin depender de cloud.

Empece sin saber programar. En pocas semanas arme un paquete Python instalable, tests que pasan, un nodo de auditoria offline y registro en Zenodo. No es un producto bancario terminado. Es codigo que se puede instalar, correr y revisar.

---

## Como probarlo

### Con internet (FIAB / laptop)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v
python -m pilot.run_scoring_audit --entity "SOFIPO-DEMO" --n 50
```

### Offline / edge (BIND / planta / Termux)

Baja antes el wheel del release v0.1.2 (27,913 bytes), luego sin red:

```bash
pip install --no-index --find-links=. romeo_hydra-0.1.2-py3-none-any.whl
python -c "from romeo_hydra import get_info; print(get_info())"
python -m romeo_hydra
```

Release: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/tag/v0.1.2

---

## Que hay adentro (honesto)

| Parte | Que hace hoy |
|-------|----------------|
| `romeo_hydra/` | Paquete instalable |
| `tests/` | Estabilidad + no filtrar secretos |
| `pilot/` | Piloto 30 dias + scoring sintetico |
| `DOI_HISTORY.md` | Trazabilidad de todos los DOIs (no son la cita principal) |
| Resto | Laboratorio |

**TFHE / HElib:** puentes / conceptual. Valor que corre hoy: offline, rastro, build pequeno.

---

## Licencia

- **AGPL-3.0** — investigacion, evaluacion, concursos, PoC
- **Comercial EMMOROR** — produccion regulada (contactar)

emmororromeohydra@gmail.com

---

## Lo que no tengo (y no finjo)

- 0 clientes de pago, 0 MRR
- No hay patente ni empresa constituida todavia
- No hay dictamen ni certificacion CNBV

LOI piloto: [`pilot/LOI_TEMPLATE.md`](./pilot/LOI_TEMPLATE.md)

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
