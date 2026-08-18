# Estructura del Master Hub — producto vs laboratorio

**Autor:** Luis Angel Vazquez Martinez  
**Repo:** [romeo-hydra-master-repository-hub](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub)  
(~400 archivos; no se borra historia)

---

## Principio

| Zona | Qué es | Para quién |
|------|--------|------------|
| **PRODUCTO** | Instalable, testeable, documentado para jurado | FIAB / BIND / 500 LATAM / YC |
| **LAB** | Experimentos, scripts sueltos, bitácoras, assets | Autor / linaje |
| **SATÉLITES** | Otros repos DOI del mismo perfil | Trazabilidad |

---

## PRODUCTO (mirar solo esto en evaluación)

```text
romeo_hydra/           # paquete pip (kernel, core, crypto, metrics, risk, evidence, gateway)
romeo_agent/           # agente offline DFA + gate ex-ante fail-closed
pilot/                 # ledgers offline stdlib + scoring + auditoría
tests/                 # pytest
native/                # CMake opcional (stub; TFHE no shippeado)
scripts/               # smoke, audit_judge, bench_parallel_cpu
docs/                  # FHE_STATUS, TERMUX, GENESIS, PRODUCT_VOICE, PPRH, TOPOLOGY…
examples/
requirements.txt       # solo numpy en main
pyproject.toml
main.py
README.md
FOR_EVALUATORS.md
OPS_RULES.md
STRUCTURE.md
ECOSYSTEM.md
HUB_INDEX.md
DOI_HISTORY.md
CITATION.cff
LICENSE
Dockerfile
.github/workflows/     # CI fail-closed
security_audit/        # STRICT_DEPS, power-loss notes
```

Instalación evaluador: ver README → “Guía rápida”.

### romeo_agent (producto)

- Runtime DFA offline: ESPERANDO → EJECUTANDO | RECHAZADO → ESPERANDO.
- Gate ex-ante (`admissible.py`) sobre conjunto cerrado de verbos.
- Tools: echo, status, hash, hashfile, score, audit.
- Receipts SHA-256 + log append-only en `pilot/output/agent_log.jsonl`.
- Documentación: [`romeo_agent/README.md`](./romeo_agent/README.md).

### evidence (producto)

- `romeo_hydra.evidence.automation` — sella eventos externos (n8n/SOAR) en el ledger.
- No es detección de amenazas ni firewall; solo evidencia con `decision_by_romeo_hydra: false`.
- `schema_version` actual: `"1"`.
- Import de `romeo_hydra`: únicamente `AtomicLedgerWriter` (no gateway / kernel).

### Nomenclatura interna (no son estándares de industria)

Estos nombres aparecen en el código y en docs de lab. Son **propios del proyecto**:

| Nombre interno | Lectura neutra para evaluadores |
|----------------|----------------------------------|
| PPRH Protocol | Gateway / control plane de gobernanza (implementación propia) |
| Kernel Sigma | Módulo de estabilidad / métricas del kernel |
| PLAM / ε-Invarianza / Anexo Q | Investigación de contención; no feature de producto empaquetado |
| HPR / Dossier Matemático Supremo | Núcleo matemático experimental del lab → API técnica, no pitch |
| HydraVault | Contenedor demo de números con Paillier pure-Python |
| DFA / Gate C | Autómata del agente offline + conjunto admisible de verbos |

En pitch y docs de jurado, preferir las columnas de la derecha o frases genéricas (“stability kernel”, “optional governance gateway”, “conceptual HE bridge”, “offline DFA agent”).

---

## LAB (ruido controlado — no borrar)

| Patrón / carpeta | Contenido típico |
|------------------|------------------|
| `BITACORA_PERSONAL/` | Notas personales |
| `algorithms/`, `core/`, `src/`, `romeo/`, `romeo_hydra_core/` | Prototipos y capas legacy |
| `lab/automation_evidence/` | Shim → `romeo_hydra.evidence` (no añadir lógica nueva) |
| `outreach/` | Mensajes y kit YC |
| `activar_*.sh`, `automedicina*.py`, `banking_*.py`, … | Scripts de experimento en raíz |
| `02_Codigo/` | Histórico |
| `receipts/` | Candidatos y finales de experimentos de gate |

**Política a medio plazo (sin rewrite agresivo):**

1. Nuevos experimentos → `lab/<tema>/`.
2. Cuando madure → promover a `romeo_hydra/` o `pilot/` o `romeo_agent/` con test.
3. No `git filter-repo` masivo hasta tag de backup.

---

## SATÉLITES

Listados en [`ECOSYSTEM.md`](./ECOSYSTEM.md).  
DOIs satélite solo en [`DOI_HISTORY.md`](./DOI_HISTORY.md).

---

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Producto estable + lab conviviendo; pilotos stdlib; sin cryptography obligatoria |
| `feat/fhe-next-level` | PHE Paillier (`phe`); no mezclar a main sin smoke Termux |
| `release/topology-fold-v0.2.0` | Topología de plegado de información |

---

## Checklist antes de push a main

```bash
bash scripts/smoke_termux.sh
pytest tests/ -q
python -m romeo_agent   # smoke interactivo opcional
```

Ver [`OPS_RULES.md`](./OPS_RULES.md).

---

**Luis Angel Vazquez Martinez**
