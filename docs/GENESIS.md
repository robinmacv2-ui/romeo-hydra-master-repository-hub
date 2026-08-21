# Modelo Génesis (estilo Satoshi) — ROMEO-HYDRA

**Acta de nacimiento criptográfica del Hub.**

Autor: Luis Angel Vazquez Martinez

---

## Qué hizo Satoshi (sin magia)

El bloque génesis de Bitcoin es el ancla inquebrantable: está quemado en el
código; todos los nodos honestos lo reconocen como verdad absoluta. Nadie puede
reescribir la historia sin romper el consenso matemático.

Romeo Hydra aplica el **mismo patrón** al perímetro del paquete y del Delta Ledger.

---

## 1. Bloque génesis congelado

| Campo | Valor |
|-------|--------|
| **GENESIS_HASH** | `503b0b26aea484ca4acc7dde7f86b6e4d44a08a1d4558193424955264101110e` |
| timestamp_utc | `2026-07-17T00:00:00Z` |
| hardware_note | first seal Celeron 2026-07-17; verified Termux aarch64 |
| doi_concept | `10.5281/zenodo.21744014` |
| message | No es folio CNBV. Offline. Fail-closed. Soberania del nucleo. |
| módulo | `romeo_hydra.genesis` |

El payload canónico se serializa con `sort_keys=True` y `separators=(",", ":")`.
**No modificar** el payload ni el literal `GENESIS_HASH` sin un hard-fork consciente
(todos los nodos tendrían que adoptar el nuevo génesis a la vez).

---

## 2. Regla de validación de cualquier nodo

Al arrancar, el software debe poder responder:

> ¿El bloque cero coincide exactamente con mi hash génesis oficial?

```python
from romeo_hydra.genesis import assert_genesis_or_die

assert_genesis_or_die()  # raises GenesisMismatchError → fail-closed
```

Si alguien altera una letra del payload embebido o del hash quemado, la
matemática detecta fraude y el nodo se bloquea.

También se invoca en la importación suave de `romeo_hydra` vía `get_info()`
(campo `genesis_ok`) y como raíz lógica del `AtomicLedgerWriter`.

---

## 3. Firmas de lanzamiento (equivalente a la clave de Satoshi)

- Releases con tag `v*`: workflow firma el wheel con **Sigstore** (OIDC keyless).
- El génesis **no** se firma en cada release: es constante del código.
- Quien descargue el paquete verifica: (a) génesis embebido == oficial,
  (b) artefacto firmado por el pipeline del repositorio autenticado.

---

## 4. Relación con el Delta Ledger

```
GENESIS_HASH  ←  bloque 0 (quemado)
     │
     ▼
COMMITTED entries (AtomicLedgerWriter)  ←  cada uno referencia prev hash
     │
     ▼
chain_ok() solo si no hay PENDING y cada HASH(payload) es válido
```

El génesis es el **prev** legítimo del primer COMMITTED de una cadena nueva.

---

## 5. Lo que no se afirma

- No es consenso global tipo Bitcoin (no hay red de mineros).
- No es prueba de trabajo.
- Es ancla de **integridad de linaje** del software y del ledger local/offline.

---

**Estado:** GENESIS_FROZEN · BOOT_VALIDATION · FAIL_CLOSED · CHAIN_ROOT_OK

Luis Angel Vazquez Martinez · 2026
