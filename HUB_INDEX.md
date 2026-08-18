# HUB INDEX — Ecosistema ROMEO-HYDRA

> **Master Hub** · Control plane de gobernanza offline + evidencia SHA-256 + kernel de estabilidad  
> Autor: **Luis Angel Vazquez Martinez**  
> Licencia: AGPL-3.0 (evaluación/PoC) · Comercial EMMOROR (producción)

| Recurso | Enlace |
|---------|--------|
| **Repositorio** | [romeo-hydra-master-repository-hub](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub) |
| **Core agent v0.1.0** | [romeo-hydra-core](https://github.com/robinmacv2-ui/romeo-hydra-core/releases/tag/v0.1.0) |
| **Índice completo de repos** | [`ECOSYSTEM.md`](./ECOSYSTEM.md) |
| **Producto vs laboratorio** | [`STRUCTURE.md`](./STRUCTURE.md) |
| **Para evaluadores** | [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md) |
| **Estado honesto** | [`STATUS.md`](./STATUS.md) |
| **Reglas operativas** | [`OPS_RULES.md`](./OPS_RULES.md) |

---

## 1. Núcleo ejecutable (producto evaluable)

| Ítem | Valor |
|------|--------|
| Paquete | `romeo_hydra` **0.1.2** |
| DOI Version | **[10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)** |
| DOI Concept | **[10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014)** |
| Python | ≥ 3.11 · offline · Termux aarch64 |
| Dependencia principal | `numpy` (cryptography opcional) |
| Agente offline | `romeo_agent` (DFA + gate fail-closed) |

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt && pip install -e .

# Smoke de producto
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL

# Agente offline (DFA)
python -m romeo_agent
```

Auditoría aislada para jurado: `bash scripts/audit_judge.sh`  
Tests: `pytest tests/ -q`

---

## 2. Mapa de capas (señal / ruido)

| Capa | Contenido | Para quién |
|------|-----------|------------|
| **0 · PRODUCTO** | `romeo_hydra/`, `romeo_agent/`, `pilot/`, `tests/`, `native/`, `docs/`, `scripts/` | Evaluadores (FIAB / BIND / 500 LATAM / YC) |
| **1 · LINAJE CÓDIGO** | romeo-hydra · Romeo_Framework · Romeo_Hydra_Framework · hydra.master | Trazabilidad técnica |
| **2 · LINAJE DOI / TEORÍA** | Postulado · Partícula · Tarjeta · Manifiesto · Geometría | Ontología (no producto) |
| **3 · BANKING (exploratorio)** | Romeo-BANKING · ROMEO-HYDRA-BANKING | Experimentos de gobernanza |
| **4 · OTROS** | LOOPER-STATION · -clean | Fuera de línea crítica |

Detalle completo de URLs y DOIs: [`ECOSYSTEM.md`](./ECOSYSTEM.md)  
Historial de DOIs satélite: [`DOI_HISTORY.md`](./DOI_HISTORY.md)

---

## 3. Superficie de producto (lo que debe mirar un evaluador)

```text
romeo_hydra/          # paquete pip: kernel, crypto (Paillier), evidence, metrics, risk, gateway
romeo_agent/          # agente offline DFA + gate ex-ante (fail-closed)
pilot/                # ledgers SHA-256 + scoring + auditoría offline
tests/                # pytest (estabilidad, no-leak, genesis, vault…)
native/               # CMake opcional (stubs; TFHE no shippeado en wheel)
scripts/              # smoke_termux, audit_judge, bench
docs/                 # FHE_STATUS, GENESIS, PPRH, TOPOLOGY, PRODUCT_VOICE…
main.py
pyproject.toml
requirements.txt
FOR_EVALUATORS.md
STRUCTURE.md
```

**No** es un LLM. **No** es folio CNBV. **No** hay TFHE compilado en el wheel. **No** hay MRR todavía.

---

## 4. Agente ROMEO (romeo_agent)

Runtime offline fail-closed sobre el hub:

- **DFA**: ESPERANDO → EJECUTANDO | RECHAZADO → ESPERANDO
- **Gate ex-ante** (`admissible.py`): solo verbos del conjunto C = {score, audit, hash, hashfile, status, echo, help, pwd, ls, cat, log, verify}
- **Parser neutral** + tools de profundidad (hash, score, audit, etc.)
- **Receipts** SHA-256 truncados + log append-only en `pilot/output/agent_log.jsonl`

Sintaxis: `verbo :: ENTIDAD k=v`  
Ejemplos: `echo :: hola` · `hash :: secreto` · `score :: EVAL n=5` · `status :: ledger`

Core standalone: [romeo-hydra-core v0.1.0](https://github.com/robinmacv2-ui/romeo-hydra-core/releases/tag/v0.1.0)

---

## 5. Submódulos

```bash
git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
```

**No requerido** para la prueba de humo del producto ni para el agente.

---

## 6. Citas recomendadas

- **Código / versión**: DOI 10.5281/zenodo.21922106  
- **Concepto**: DOI 10.5281/zenodo.21744014  
- Formato CFF: [`CITATION.cff`](./CITATION.cff)

---

**Luis Angel Vazquez Martinez** (`robinmacv2-ui`)

- Email: [robinmac.v2@gmail.com](mailto:robinmac.v2@gmail.com)
- LinkedIn: [luis-angel-vazquez-martinez](https://www.linkedin.com/in/luis-angel-vazquez-martinez-066ba9422)
- Tel: +52 56 5015 3935
- GitHub: [robinmacv2-ui](https://github.com/robinmacv2-ui)
