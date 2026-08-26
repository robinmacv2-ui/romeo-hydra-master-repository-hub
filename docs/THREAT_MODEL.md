# THREAT MODEL — ROMEO-HYDRA v0.2.1

Núcleo offline fail-closed + firma digital asimétrica RSA-SHA256 (pure Python).

| ID | Amenaza | Control | Estado |
|----|---------|---------|--------|
| T1 | Path traversal | Path.resolve + relative_to(ROOT) | Mitigado |
| T2 | Verbo fuera de conjunto | VERB_CLOSED_SET | Mitigado |
| T3 | Prompt injection | Regex formal | Mitigado |
| T4 | Rotura de cadena | verify_integrity SHA-256 | Mitigado |
| T5 | Escalada de privilegios | ROLE_CAPS | Mitigado |
| T6 | Parse permisivo | AST frozen | Mitigado |
| T7 | Dependencias | stdlib only | Mitigado |
| T8 | DFA inválido | TRANSITIONS → DENY | Mitigado |
| T9 | Ledger vacío | prev_hash = 64 ceros | Mitigado |
| T10 | Falsificación de recibo | Firma RSA | **Mitigado v0.2.1** |
| T11 | Clave privada filtrada | mode 0600 | Mitigado |
| T12 | Sustitución clave pública | n embebido en recibo | Mitigado |

Residual: RSA-1024 demo (usar 2048+ en producción). Sin CA externa. Single-writer.

Principio: Fail-closed. Cualquier fallo → DENY + receipt firmado.
