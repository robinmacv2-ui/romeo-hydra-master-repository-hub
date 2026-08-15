# Security Audit — ROMEO-HYDRA Master Hub

Carpeta de **Abogado del Diablo**: reportes y anclas de integridad bajo
`docs/AI_PROTOCOL.md`.

## Contenido

| Archivo | Rol |
|---------|-----|
| `power_loss_circuit_breaker.md` | Diseño PENDING/COMMITTED + Circuit Breaker |
| `power_loss_recovery_test.md` | Cómo sobrevive a kill -9 / power-loss |
| `deps.manifest.sha256` | Huella SHA-256 de `requirements.txt` (STRICT_DEPS=1) |
| `supply_chain_notes.md` | Dockerfile / CI / superficie de ataque |

## Código asociado

- `romeo_hydra/core/storage/atomic_writer.py` — escritura atómica de dos fases
- `tests/test_atomic_writer.py` — pruebas de sanitización y `chain_ok`

## Regla

- No almacenar secretos, claves privadas ni PII aquí.
- Tras cambiar `requirements.txt`: `sha256sum requirements.txt | tee security_audit/deps.manifest.sha256 requirements.txt.sha256`
- Todo nuevo CI/Dockerfile pasa por el vector de supply chain del AI_PROTOCOL.

**Estado:** ATOMIC_WRITER_INTEGRATED · POWER_LOSS_RECOVERY_DOCUMENTED · STRICT_DEPS=1 · CHAIN_OK: TRUE

Autor: Luis Angel Vazquez Martinez · 2026
