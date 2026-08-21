# Protocolo de interacción con IA (ojos vendados)

Este documento refuerza la Regla Cero del Protocolo PPRH.

## Principio

Cualquier modelo de lenguaje (LLM) que interactúe con el ecosistema ROMEO-HYDRA se trata como un **consultor con ojos vendados**:

- Puede proponer acciones o textos.
- Nunca tiene acceso directo al Kernel Sigma ni al Delta Ledger.
- Toda propuesta pasa obligatoriamente por el **RomeoGateway** antes de ejecutarse.

## Flujo obligatorio

```
LLM (propuesta) 
    ↓
RomeoGateway.validate_llm_output()
    ↓
Kernel Sigma (evaluación matemática)
    ↓
¿Aprobado? 
    ├─ Sí → AtomicLedgerWriter (PENDING → COMMITTED) → Acción permitida
    └─ No → Rechazo + registro de evidencia de rechazo
```

## Reglas para asistentes de código (Cursor, Windsurf, Copilot, etc.)

1. Nunca generes código que trate a ROMEO-HYDRA como chatbot o generador de texto.
2. Siempre parte de `docs/PPRH_PROTOCOL.md` y de la clase `romeo_hydra.gateway.RomeoGateway`.
3. Mantén Kernel Sigma y Delta Ledger fuera del alcance del modelo de IA.
4. Preferir fail-closed sobre fail-open.
5. Cero dependencias de nubes corporativas en el núcleo.

## Estado

PROTOCOLO ACTIVO · MÍNIMO PRIVILEGIO · FAIL-CLOSED

Luis Angel Vazquez Martinez · 2026
