# romeo_hydra.evidence

Sella eventos JSON **externos** (n8n, Cortex XSOAR, webhooks) en el ledger atómico.

- `source_system` obligatorio (quién actuó)
- `decision_by_romeo_hydra` siempre `false`
- `evidence_note`: evidencia externa, no decisión de ROMEO-HYDRA
- `schema_version`: `"1"` (contrato versionado)
- Import de `romeo_hydra`: únicamente `AtomicLedgerWriter` — no gateway, no kernel

No detecta amenazas ni ejecuta acciones de seguridad.
