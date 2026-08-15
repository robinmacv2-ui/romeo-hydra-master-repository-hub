# Security Audit — ROMEO-HYDRA Master Hub

Carpeta de **Abogado del Diablo**: reportes de auditoría generados bajo el
protocolo de mínimo privilegio (`docs/AI_PROTOCOL.md`).

## Contenido esperado

| Archivo | Rol |
|---------|-----|
| `power_loss_circuit_breaker.md` | Análisis power-loss entre Delta Ledger y Kernel Sigma + fail-closed |
| `deps.manifest.sha256` | Manifiesto de hashes de dependencias (opcional, política STRICT_DEPS) |
| `supply_chain_notes.md` | Notas sobre Dockerfile / CI / superficie de ataque |
| Reportes por módulo | Hallazgos de race conditions, forks, inconsistencias docs |

## Regla

- No almacenar secretos, claves privadas ni PII aquí.
- Los reportes son evidencia de gobernanza ex-ante, no certificaciones formales.
- Todo nuevo CI/Dockerfile debe pasar por el vector de supply chain del AI_PROTOCOL antes de merge.

Autor: Luis Angel Vazquez Martinez · 2026
