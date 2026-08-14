# PILOT KIT — ROMEO-HYDRA Offline (30 dias)

Objetivo concreto de la critica: **1 piloto con una SOFIPO** usando el nodo
offline para auditar scoring / decisiones, con rastro y sin cloud.

Esto no es certificacion CNBV. No evita multas por si solo. Es evidencia
tecnica para una carta de intencion (LOI).

---

## Dos modos

| Comando | Para que |
|---------|----------|
| `python -m pilot.run_offline_audit --days 30 --entity "SOFIPO-X"` | Nodo de estabilidad + ledger general |
| `python -m pilot.run_scoring_audit --entity "SOFIPO-X" --n 50` | Auditoria de **scoring** con decisiones sinteticas |

Salida en `pilot/output/`:

- `audit_ledger.jsonl` / `scoring_ledger.jsonl`
- `pilot_summary.json` / `scoring_summary.json`
- `evidence_bundle.md` (modo audit general)

---

## Como correrlo

```bash
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"

# Estabilidad + rastro
python -m pilot.run_offline_audit --days 30 --entity "SOFIPO-DEMO"

# Scoring offline (el angulo comercial de la critica)
python -m pilot.run_scoring_audit --entity "SOFIPO-DEMO" --n 50

pytest tests/ -v
```

---

## Que resuelve para una SOFIPO (piloto)

| Dolor | Que muestra el nodo |
|-------|---------------------|
| Necesitan rastro de decisiones | Ledger append-only con hash y folio sintetico |
| No quieren exponer PII en el rastro | `pii_stored: false` |
| Zonas sin internet / edge | Todo offline |
| Preparar revision interna | Summary + bundle legible |

---

## Que NO promete

- No es dictamen legal de la CNBV
- No es folio oficial de la Comision
- No sustituye compliance ni evita 100,000 UDIs por magia
- No es un modelo de credit scoring de produccion
- Homomorphic layer del paquete es puente, no FHE de produccion

---

## LOI

Plantilla: [`LOI_TEMPLATE.md`](./LOI_TEMPLATE.md)



---

Luis Angel Vazquez Martinez  
robinmac.v2@gmail.com
