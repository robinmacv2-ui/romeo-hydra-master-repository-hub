# Estructura del Master Hub — producto vs laboratorio

Autor: Luis Angel Vazquez Martinez  
Repo: romeo-hydra-master-repository-hub (~300 archivos; no se borra historia)

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
romeo_hydra/           # paquete pip (kernel, core, crypto, metrics, risk, evidence)
pilot/                 # ledgers offline stdlib
tests/                 # pytest
native/                # CMake opcional (stub; TFHE no shippeado)
scripts/               # smoke, audit_judge, bench_parallel_cpu
docs/                  # FHE_STATUS, TERMUX, GENESIS, PRODUCT_VOICE, …
examples/
requirements.txt       # solo numpy en main
pyproject.toml
main.py
README.md
FOR_EVALUATORS.md
OPS_RULES.md
STRUCTURE.md
ECOSYSTEM.md
DOI_HISTORY.md
CITATION.cff
LICENSE
Dockerfile
.github/workflows/     # CI fail-closed
security_audit/        # STRICT_DEPS, power-loss notes
```

Instalación evaluador: ver README → “Guía rápida”.

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

En pitch y docs de jurado, preferir las columnas de la derecha o frases genéricas (“stability kernel”, “optional governance gateway”, “conceptual HE bridge”).

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

**Política a medio plazo (sin rewrite agresivo):**

1. Nuevos experimentos → `lab/<tema>/`.
2. Cuando madure → promover a `romeo_hydra/` o `pilot/` con test.
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

---

## Checklist antes de push a main

```bash
bash scripts/smoke_termux.sh
pytest tests/ -q
```

Ver [`OPS_RULES.md`](./OPS_RULES.md).

---

Luis Angel Vazquez Martinez
