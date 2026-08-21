# romeo_hydra.evidence

Sella eventos JSON **externos** (n8n, Cortex XSOAR, webhooks) en el ledger atómico.

- `source_system` obligatorio (quién actuó)
- `decision_by_romeo_hydra` siempre `false`
- `evidence_note`: evidencia externa, no decisión de ROMEO-HYDRA
- `schema_version`: ver tabla abajo
- Import de `romeo_hydra`: únicamente `AtomicLedgerWriter` — no gateway, no kernel

No detecta amenazas ni ejecuta acciones de seguridad.

## schema_version

| Versión | Significado |
|---------|-------------|
| `"1"` | Esquema inicial de producto. Obligatorios: `source_system`, `event_type`, `summary`. El sealer añade `kind`, `recorder`, `recorded_at`, `decision_by_romeo_hydra=false`, `evidence_note`. Opcionales: `occurred_at`, `actor`, `external_id`, `details`. |

Si el payload cambia de forma incompatible, subir a `"2"` y documentar aquí. Lectores antiguos pueden ramificar por versión.

## Fixture n8n

Ejemplo de payload ya mapeado desde un workflow n8n:

`tests/fixtures/n8n_webhook_ip_blocked.json`
