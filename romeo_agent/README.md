# romeo_agent — Agente offline fail-closed (DFA)

> Runtime de gobernanza local sobre el Master Hub ROMEO-HYDRA.  
> **No es un LLM.** No llama APIs cloud. Todo se ejecuta en el mismo proceso y sobre el árbol del repo.

**Autor:** Luis Angel Vazquez Martinez  
**Licencia:** AGPL-3.0 / Comercial EMMOROR  
**Hub:** [romeo-hydra-master-repository-hub](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub)

---

## Qué es

Un **autómata finito determinista (DFA)** con gate ex-ante que solo admite un conjunto cerrado de verbos.  
Cualquier entrada fuera del lenguaje es rechazada antes de despachar herramientas.

```
ESPERANDO ──► (parse + is_admissible)
                │
        ┌───────┴───────┐
        ▼               ▼
   EJECUTANDO        RECHAZADO
        │               │
        └───────┬───────┘
                ▼
           ESPERANDO
```

- **Fail-closed**: si el predicado de admisibilidad falla → deny + receipt + log.
- **O(1)** en el gate (`admissible.py`).
- **Receipts** SHA-256 (16 hex) de cada entrada de log.
- Log append-only: `pilot/output/agent_log.jsonl`.

---

## Instalación (desde el hub)

```bash
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && pip install -e .
```

---

## Uso interactivo

```bash
python -m romeo_agent
```

```
ROMEO agent offline (DFA)
Sintaxis: verbo :: ENTIDAD k=v
Ej: echo :: hola | hash :: secreto | score :: EVAL n=5 | status :: ledger | exit
agent> 
```

### Verbos admisibles (conjunto C)

| Verbo | Descripción | Ejemplo |
|-------|-------------|--------|
| `echo` | Eco de texto | `echo :: hola mundo` |
| `status` | Estado del log del agente | `status :: ledger` |
| `hash` | SHA-256 de texto | `hash :: secreto` |
| `hashfile` | SHA-256 de archivo bajo ROOT | `hashfile :: requirements.txt` |
| `score` | Scoring offline (pilot) | `score :: EVAL n=5` |
| `audit` | Auditoría offline N días | `audit :: EVAL n=7` |

Cualquier otro verbo → `gate.status = deny`.

---

## API programática

```python
from romeo_agent import run, is_admissible, VERBOS_ADMISIBLES

result = run("score :: EVAL n=5")
print(result["gate"]["status"])   # "allow" | "deny"
print(result.get("receipt"))      # hash de la entrada
```

---

## Estructura del paquete

```text
romeo_agent/
├── __init__.py      # exports públicos
├── __main__.py      # python -m romeo_agent
├── admissible.py    # gate ex-ante (conjunto C + rangos)
├── parser.py        # parser neutral (sin side-effects)
├── runtime.py       # bucle DFA + receipts + log
├── tools.py         # tools solo tras is_admissible()
└── README.md        # este archivo
```

---

## Principios de diseño

1. **Gate antes de tools** — defensa en profundidad.
2. **Sin red** — no hay llamadas HTTP/cloud.
3. **Paths acotados** — `hashfile` rechaza `..`, rutas absolutas y `~`.
4. **Rango acotado** — `n` en score/audit ∈ [1, 1000].
5. **Entity alfanumérica** para score/audit.
6. **Todo se loguea** (allow y deny) con receipt determinista.

---

## Relación con el producto

- Vive **dentro** del Master Hub (capa PRODUCTO).
- Usa `pilot/` para score y audit.
- No importa el kernel ni el gateway de `romeo_hydra` en el camino crítico del gate.
- Documentado en [`STRUCTURE.md`](../STRUCTURE.md) y [`HUB_INDEX.md`](../HUB_INDEX.md).

---

**Luis Angel Vazquez Martinez**  
emmororromeohydra@gmail.com
