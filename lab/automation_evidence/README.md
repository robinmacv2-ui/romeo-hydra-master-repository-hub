# LAB — automation_evidence

**Estado:** laboratorio (no producto).  
**Rol:** sellar en el ledger atómico de ROMEO-HYDRA eventos JSON **externos** (n8n, Cortex XSOAR, etc.).

## Qué hace

1. Recibe un evento producido por un tercero (`source_system` obligatorio).
2. Lo normaliza y le añade `evidence_note`:
   > Evidencia de un evento externo, no una decisión tomada por ROMEO-HYDRA.
3. Lo escribe con `AtomicLedgerWriter` (PENDING → COMMITTED + genesis).

## Qué **no** hace

- Detectar amenazas
- Bloquear IPs / orquestar firewalls
- Aprobar o rechazar la decisión del SOAR/n8n
- Sustituir un SIEM o un folio CNBV

ROMEO-HYDRA aquí es solo **registrador de evidencia**, no actor de seguridad.

## Esquema mínimo del evento

```json
{
  "source_system": "n8n",
  "event_type": "ip_blocked",
  "summary": "Blocked 203.0.113.10 after playbook brute_force_v2",
  "occurred_at": "2026-08-17T03:00:00+00:00",
  "actor": "playbook:brute_force_v2",
  "external_id": "exec-12345",
  "details": {
    "ip": "203.0.113.10",
    "reason": "repeated_auth_failures"
  }
}
```

Campos obligatorios: `source_system`, `event_type`, `summary`.

## Uso rápido

```python
from pathlib import Path
from lab.automation_evidence import AutomationEvidenceSealer

sealer = AutomationEvidenceSealer(Path("pilot/output/automation_evidence.jsonl"))
result = sealer.seal({
    "source_system": "cortex_xsoar",
    "event_type": "ip_blocked",
    "summary": "SOAR blocked 198.51.100.7",
    "details": {"ip": "198.51.100.7", "ticket": "INC-9001"},
})
assert result.ok and result.chain_ok
print(result.evidence_note)
```

## Tests

```bash
pytest tests/test_lab_automation_evidence.py -q
```

## Promoción a producto (pendiente)

Antes de mover a `romeo_hydra/`:

- [ ] Tests de integración con pilot outputs / smoke Termux
- [ ] Revisión OPS_RULES (sin deps nuevas obligatorias — ya cumple)
- [ ] Decisión de path de ledger por defecto y retención
- [ ] Documentar en FOR_EVALUATORS solo si el jurado debe verlo
- [ ] No mezclar con gateway/PPRH hasta tener contrato estable

Ver también: [`docs/PRODUCT_VOICE.md`](../../docs/PRODUCT_VOICE.md), [`STRUCTURE.md`](../../STRUCTURE.md).
