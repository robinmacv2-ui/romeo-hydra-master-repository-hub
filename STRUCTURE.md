# Estructura del Master Hub — producto vs laboratorio

Autor: Luis Angel Vazquez Martinez  
Repo: romeo-hydra-master-repository-hub (~300 archivos; no se borra historia)

---

## Principio

| Zona | Que es | Para quien |
|------|--------|------------|
| **PRODUCTO** | Instalable, testeable, documentado para jurado | FIAB / BIND / 500 LATAM |
| **LAB** | Experimentos, scripts sueltos, bitacoras, assets | Autor / linaje |
| **SATELITES** | Submodulos / clones de otros repos DOI | Trazabilidad |

---

## PRODUCTO (mirar solo esto en evaluacion)

```text
romeo_hydra/           # paquete pip (kernel, core, crypto, metrics, risk)
pilot/                 # ledgers offline stdlib (+ blind en rama fhe)
tests/                 # pytest
native/                # CMake libromeo_native (opcional)
scripts/               # smoke, audit_judge, bench_parallel_cpu
docs/                  # FHE_STATUS, TERMUX, whitepapers
examples/
requirements.txt
pyproject.toml
main.py
README.md
FOR_EVALUATORS.md
OPS_RULES.md
ARCHITECTURE.md
ECOSYSTEM.md
DOI_HISTORY.md
CITATION.cff
LICENSE
```

Instalacion evaluador: ver README seccion "Guia rapida".

---

## LAB (ruido controlado — no borrar)

Archivos y carpetas en la raiz que **no** son la superficie de producto:

| Patron / carpeta | Contenido tipico |
|------------------|------------------|
| `BITACORA_PERSONAL/` | Notas personales |
| `algorithms/`, `core/`, `src/`, `romeo/`, `romeo_hydra_core/` | Prototipos y capas legacy |
| `security_audit/`, `outreach/` | Auditorias y mensajes |
| `activar_*.sh`, `automedicina*.py`, `banking_*.py`, `api_sigma.py`, … | Scripts de experimento en raiz |
| `*.jpg`, assets geometricos | Material visual |
| `02_Codigo/` | Historico |

**Politica a medio plazo (sin rewrite agresivo):**

1. Nuevos experimentos → crear bajo `lab/<tema>/` (no mas scripts sueltos en raiz).
2. Cuando un experimento madure → promover a `romeo_hydra/` o `pilot/` con test.
3. No `git filter-repo` masivo hasta tener tag de backup y tiempo; el indice basta para el jurado.

Indice vivo del lab: [`lab/README.md`](./lab/README.md).

---

## SATELITES (otros repos, no el producto)

Listados en [`ECOSYSTEM.md`](./ECOSYSTEM.md).  
DOIs satelite solo en [`DOI_HISTORY.md`](./DOI_HISTORY.md).

---

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Producto estable + lab conviviendo; pilotos stdlib; sin cryptography obligatoria |
| `feat/fhe-next-level` | PHE Paillier (`phe`); no mezclar a main sin smoke Termux |

---

## Checklist socio de sistemas

Antes de push a main:

```bash
bash scripts/smoke_termux.sh
# o
python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
```

Ver [`OPS_RULES.md`](./OPS_RULES.md).

---

Luis Angel Vazquez Martinez
