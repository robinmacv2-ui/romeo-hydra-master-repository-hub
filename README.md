# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)

Paquete Python **offline**, instalable, con DOI en Zenodo.  
Kernel de gobernanza + **contención cuántica (Anexo Q / P_LAM / ε-Invarianza)** en el músculo.

> **Índice de todo el ecosistema:** [`HUB_INDEX.md`](./HUB_INDEX.md)  
> **White paper contención cuántica:** [`docs/WHITEPAPER_CONTENCION_CUANTICA.md`](./docs/WHITEPAPER_CONTENCION_CUANTICA.md)  
> **Anexo Q (resumen):** [`docs/ANEXO_Q_Contencion_Cuantica.md`](./docs/ANEXO_Q_Contencion_Cuantica.md)  
> **Evaluadores:** [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md)  
> **Submódulos (todos los repos):** `bash scripts/init_all_submodules.sh`  
> **Auditoria limpia:** `bash scripts/audit_judge.sh`  
> **Ops:** [`OPS_RULES.md`](./OPS_RULES.md)

**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)  
**Concept:** [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)

Autor: **Luis Angel Vazquez Martinez**

---

## Qué es (sin humo)

Código para evidencia offline (ledgers SHA-256), kernel de estabilidad y contención determinista derivada del Postulado de Invarianza Homeostática.  
**No** es TFHE compilado dentro del wheel. **No** es folio CNBV. **No** hay clientes de pago todavía. **No** es un LLM.

Incluye en el **kernel muscle**:

- `KernelSigmaController` — estabilización / proyección
- `PLAMQuantumWrapper` — operador P_LAM + bifurcación 1→4 + 0 escapes (Anexo Q)

---

## Contención cuántica (API)

```python
import numpy as np
from romeo_hydra import PLAMQuantumWrapper, PLAMConfig, plam_quantum_wrapper

plam = PLAMQuantumWrapper(PLAMConfig(eps=1e-3, state_dimension=128))
r = plam.contain(np.random.randn(128))
print(r.status, r.blocked, r.mode)  # safe | containment | blocked
```

Implementación: `romeo_hydra/kernel/plam_quantum.py`  
White paper: `docs/WHITEPAPER_CONTENCION_CUANTICA.md`

---

## Guía rápida

```bash
git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt && pip install -e .
python main.py
```

Inicializar / actualizar **todos** los submódulos del ecosistema:

```bash
bash scripts/init_all_submodules.sh
```

---

## Ecosistema (federación)

Todos los repositorios están indexados y declarados como submódulos en `.gitmodules`:

- Postulado-invarianza-homeostatica (Anexo Q canónico)
- Partícula de Luis Ángel
- TARJETA LÓGICA CUÁNTICA
- MANIFIESTO ONTOLÓGICO
- Geometría en agujeros negros
- Romeo Framework / Romeo Hydra Framework / hydra.master
- Romeo-BANKING / ROMEO-HYDRA-BANKING
- LOOPER-STATION
- romeo-hydra (núcleo original)

Mapa completo → [`HUB_INDEX.md`](./HUB_INDEX.md)

---

## Licencia

- **AGPL-3.0** — investigación, evaluación, concursos, PoC
- **Comercial EMMOROR** — producción regulada (contactar)

emmororromeohydra@gmail.com

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
