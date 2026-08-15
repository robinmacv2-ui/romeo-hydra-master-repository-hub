# Auditoría: Power-Loss entre Delta Ledger y Kernel Sigma

**Rol de la IA:** Analista de fallos deterministas (caja blanca sobre flujo de orquestación, no sobre código fuente completo del núcleo).

**Alcance:** Interrupción de energía entre escritura del ledger y confirmación del controlador de proyección (Kernel Sigma).

---

## Vector de fallo

1. El orquestador solicita una transición de estado.
2. Se escribe un delta en el ledger (append JSONL / bloque).
3. **Power-loss** antes de que el Kernel Sigma emita el hash de traza inmutable / collapse result.
4. Tras reinicio: el ledger tiene un delta “huérfano” sin fingerprint de configuración ni confirmación de proyección.

Riesgo: desincronización de estado, posible doble aplicación del delta al reintentar, o aceptación de un estado no proyectado (entropía > tolerancia).

---

## Mecanismo de recuperación Fail-Closed (Circuit Breaker)

### Diseño propuesto (agnóstico)

1. **Two-phase append**
   - Fase A: escribir registro `PENDING` con `op_id`, payload, timestamp.
   - Fase B: tras `evaluate_and_collapse` + `generate_immutable_trace`, reescribir o anexar registro `COMMITTED` con `trace_hash` y `config_fingerprint`.

2. **Al arranque (recovery)**
   - Escanear cola de `PENDING` sin `COMMITTED` emparejado.
   - Política fail-closed: **no aplicar** el delta al estado vivo; mover a `quarantine/` o marcar `ABORTED`.
   - Solo reintentar si el operador (o un proceso de reconciliación firmado) emite un comando explícito de re-ejecución.

3. **Idempotencia**
   - Cada delta lleva `op_id` determinista (hash del payload + prev_hash).
   - Si `op_id` ya existe en estado `COMMITTED`, el reintento es no-op.

4. **Umbral de circuito**
   - Si el número de `PENDING` huérfanos supera N (configurable), el orquestador entra en modo **OPEN**: solo lectura + auditoría; no acepta nuevas escrituras hasta reconciliación manual.

### Pseudocódigo mínimo

```
on_boot:
  pending = scan_ledger(status=PENDING)
  if len(pending) > CIRCUIT_THRESHOLD:
    mode = OPEN  # fail-closed
    return
  for rec in pending:
    mark(rec, ABORTED)   # no auto-commit
    append_quarantine(rec)

on_transition(payload):
  if mode == OPEN: reject
  op_id = H(payload || prev_hash)
  if exists_committed(op_id): return idempotent_ok
  append(PENDING, op_id, payload)
  result = kernel.evaluate_and_collapse(...)
  trace = kernel.generate_immutable_trace(result)
  append(COMMITTED, op_id, trace, config_fingerprint)
```

---

## Relación con axiomas

| Axioma | Cumplimiento |
|--------|--------------|
| Validación de flujos (A1) | Análisis explícito del hueco escritura→confirmación |
| Circuit Breaker / fail-closed (A2) | Modo OPEN + ABORT de PENDING |
| Inmutabilidad (A3) | Solo COMMITTED con trace_hash cuenta para el estado vivo |
| Soberanía / offline (A4) | Recuperación local, sin dependencia de nube |

---

## Estado de implementación en el Hub

- Diseño documentado aquí como requisito de orquestación.
- Pilotos actuales (`pilot/run_*`) son evidencia offline stdlib y no implementan aún two-phase PENDING/COMMITTED.
- Próximo incremento de ingeniería: aplicar el patrón en la capa de append del Delta Ledger sin exponer el Kernel a la IA generadora.

---

Luis Angel Vazquez Martinez · 2026
