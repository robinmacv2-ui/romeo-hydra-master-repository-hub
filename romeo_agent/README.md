# romeo_agent — Agente offline fail-closed (DFA)

Runtime de gobernanza local sobre el Master Hub.  
**No es un LLM. No llama APIs. Solo stdlib + pilot del hub.**

## Verbos (conjunto C)

| Verbo | Uso |
|-------|-----|
| `help` | Ayuda |
| `echo` | Eco |
| `pwd` | ROOT del hub |
| `status` | Estado del log |
| `ls` | Listar dir bajo ROOT |
| `cat` | Leer archivo ≤64KiB |
| `hash` | SHA-256 de texto |
| `hashfile` | SHA-256 de archivo |
| `log` | Últimas N entradas del log |
| `verify` | Buscar receipt en log |
| `score` | Scoring offline (pilot) |
| `audit` | Auditoría offline (pilot) |

## CLI

```bash
# Interactivo
python -m romeo_agent

# Una sola orden (no se queda colgado)
python -m romeo_agent -c "echo :: hola"
python -m romeo_agent -c "ls :: romeo_agent"
python -m romeo_agent -c "help ::"
python -m romeo_agent --help
```

## Política

- Fail-closed en gate
- Paths solo bajo ROOT (sin `..`, sin absolutas, sin `~`)
- Sin red / sin shell libre / sin APIs externas
