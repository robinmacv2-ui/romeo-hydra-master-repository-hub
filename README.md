# ROMEO-HYDRA

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21922106.svg)](https://doi.org/10.5281/zenodo.21922106)
[![Concept DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21744014.svg)](https://doi.org/10.5281/zenodo.21744014)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Comercial-green.svg)](#licencia)
[![Downloads](https://img.shields.io/github/downloads/robinmacv2-ui/romeo-hydra-master-repository-hub/total?label=downloads&logo=github)](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases)

Paquete Python **offline**, instalable, con DOI en Zenodo.  
Build ~55K (wheel + sdist). Corre en laptop, Git Bash y Termux aarch64.

> **Índice de todo el ecosistema:** [`HUB_INDEX.md`](./HUB_INDEX.md) — une **todos** los repositorios (Postulado, Partícula, CLC, Banking, Tarjeta Lógica, Manifiesto, etc.)  
> **Anexo Q (Contención Cuántica):** [`docs/ANEXO_Q_Contencion_Cuantica.md`](./docs/ANEXO_Q_Contencion_Cuantica.md)  
> **Evaluadores:** [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md) — 2 DOIs, que no se reclama, como verificar  
> **Auditoria limpia:** `bash scripts/audit_judge.sh`  
> **Reglas de equipo:** [`OPS_RULES.md`](./OPS_RULES.md)  
> **Cripto (honesto):** [`docs/FHE_STATUS.md`](./docs/FHE_STATUS.md)  
> **Protocolo IA (mínimo privilegio):** [`docs/AI_PROTOCOL.md`](./docs/AI_PROTOCOL.md)  
> **Build inmutable:** [`Dockerfile`](./Dockerfile) + [`.github/workflows/reproducible-build.yml`](./.github/workflows/reproducible-build.yml)  
> **Security audit:** [`security_audit/`](./security_audit/)

**DOI a citar:** [10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)  
**Concept:** [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)

Autor: **Luis Angel Vazquez Martinez**

---

## Que es (sin humo)

Codigo para evidencia offline (ledgers SHA-256), kernel de estabilidad y un puente **conceptual** hacia cifrado homomorfico.  
**No** es TFHE compilado dentro del wheel. **No** es folio CNBV. **No** hay clientes de pago todavia.

Incluye la capa formal de **ε-Invarianza + Partícula de Luis Ángel** y el **Anexo Q** de contención frente a interfaces cuánticas (propiedad de 0 escapes).

---

## Requisitos

- Python 3.11+ (3.10 puede funcionar; CI mental del proyecto es 3.11+)
- Git
- Terminal: Bash, PowerShell, Termux o Git Bash

---

## Guia rapida para evaluadores (< 3 min)

```bash
git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -U pip setuptools wheel
pip install -r requirements.txt
pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL
```

Prueba automatica en directorio aislado:

```bash
bash scripts/audit_judge.sh
```

Contenedor (receta inmutable, no-root):

```bash
docker build -t romeo-hydra:local .
docker run --rm romeo-hydra:local
```

---

## Ecosistema completo (HUB_INDEX)

Todos los repositorios del autor están indexados y conectados en:

**→ [`HUB_INDEX.md`](./HUB_INDEX.md)**

Incluye:
- Postulado de Invarianza Homeostática + Anexo Q (contención cuántica)
- Partícula de Luis Ángel
- TARJETA LÓGICA CUÁNTICA
- MANIFIESTO ONTOLÓGICO
- Geometría en agujeros negros
- Romeo Framework / Romeo Hydra Framework
- Romeo-BANKING / ROMEO-HYDRA-BANKING
- y el resto de nodos del ecosistema

---

## Estructura (auditoria de un vistazo)

| Ruta | Rol |
|------|-----|
| `romeo_hydra/` | Paquete instalable (kernel, abstraccion, cripto opcional) |
| `pilot/` | Evidencia offline **solo stdlib** (scoring / audit) |
| `native/` | Backend C++ CMake opcional (stub TFHE/HElib) |
| `tests/` | Tests (requiere `pip install pytest`) |
| `Dockerfile` | Multi-stage Alpine, user no-root, superficie mínima |
| `.github/workflows/reproducible-build.yml` | CI fail-closed: hashes, wheel, smoke, Sigstore en tags |
| `security_audit/` | Abogado del Diablo (power-loss, supply chain) |
| `docs/AI_PROTOCOL.md` | Protocolo de interacción con IA (ojos vendados, auditor, chaos) |
| `docs/ANEXO_Q_Contencion_Cuantica.md` | Capa de defensa cuántica (ε-Invarianza) |
| `HUB_INDEX.md` | **Índice de todos los repositorios del ecosistema** |
| `FOR_EVALUATORS.md` | Texto corto para jurado |
| `OPS_RULES.md` | No romper Termux / DOIs / main |
| `feat/fhe-next-level` | Rama separada: PHE Paillier (`phe`), no mezclar en main a la ligera |

---

## Air-gapped / offline

Tras `pip install` (o wheel + deps en USB), los pilotos de ledger **no** llaman APIs externas.  
Sirve para demos en red cerrada o edge. Eso no equivale a certificacion de seguridad de infraestructura critica.

---

## Licencia

- **AGPL-3.0** — investigacion, evaluacion, concursos, PoC
- **Comercial EMMOROR** — produccion regulada (contactar)

emmororromeohydra@gmail.com

---

## Lo que no finjo

- 0 MRR, 0 clientes de pago
- Wheel ≠ binario TFHE multi-MB
- Folio del piloto = **interno**, no CNBV
- DOI Zenodo = trazabilidad de software, no certificacion criptografica FIPS/SGS

---

Luis Angel Vazquez Martinez · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
