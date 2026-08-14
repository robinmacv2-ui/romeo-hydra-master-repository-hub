# PILOT KIT — ROMEO-HYDRA Offline (30 días)

**Objetivo:** que una SOFIPO / entidad regulada pueda correr un nodo offline
por 30 días y generar evidencia auditable, sin cloud y sin exponer datos en claro.

> Esto **no** es certificación CNBV ni producto bancario terminado.
> Es un piloto técnico reproducible para validación y carta de intención.

---

## Qué resuelve el piloto

| Dolor | Qué demuestra el nodo |
|-------|------------------------|
| Datos en uso expuestos | Kernel + abstraction layer operan sin revelar plaintext en rastros |
| Dependencia de cloud | Todo corre offline (Termux ARM64 / laptop / edge) |
| Falta de rastro auditable | Genera `audit_ledger.jsonl` con hash, timestamp y folio sintético |
| Coste de inspección | Entrega un paquete de evidencia listo para revisión interna |

---

## Requisitos

- Python ≥ 3.11
- `pip install -e .` desde la raíz del repo (o el wheel del release)
- Sin internet durante la ejecución del piloto

---

## Cómo correr el piloto (5 minutos)

```bash
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"

# 1) Demo mínima reproducible
python -m romeo_hydra
python examples/umr_trl5_demo.py

# 2) Nodo de auditoría offline (piloto)
python -m pilot.run_offline_audit --days 30 --entity "SOFIPO-DEMO"

# 3) Tests de no-exposición
pytest tests/ -v
```

Salida esperada en `pilot/output/`:

- `audit_ledger.jsonl` — rastro append-only
- `pilot_summary.json` — resumen ejecutivo
- `evidence_bundle.md` — paquete para revisión interna

---

## Qué NO promete este piloto

- No sustituye un dictamen legal de la CNBV
- No es homologación ni autorización
- No procesa datos reales de clientes sin acuerdo y control de la entidad
- Homomorphic layer actual es bridge/conceptual; el valor inmediato es el
  control de estabilidad + rastro + offline offline

---

## Carta de intención (LOI)

Plantilla lista: [`pilot/LOI_TEMPLATE.md`](./LOI_TEMPLATE.md)

Una LOI firmada ("probamos 30 días offline") es el activo que convierte
valor técnico en valor comercial para FIAB / BIND / fondos.

---

## Contacto piloto

Luis Ángel Vázquez Martínez  
emmororromeohydra@gmail.com · robinmac.v2@gmail.com
