# P4 — Cierre local de auditoría (`audit_close_head.sh`)

Script único para convertir **PENDING LOCAL RUN** en **PASS/FAIL** medible en la máquina del operador.

## Qué hace

1. `git fetch` + `pull --ff-only origin main` (opcional `--no-pull`)
2. Imprime `HEAD` y branch
3. `pytest pprh/hydra/tests/test_fold_polarity_gate.py -v`
4. `python -m unittest discover -s tests -q` dentro de `romeo-hydra-crypto`
5. Smoke `ENVELOPE_CRYPTO_OK` (seal / verify / serialize / digest)
6. `grep` anti-import crypto desde `pprh/`
7. Existencia de `DATASET_MANIFEST.md`, `REPEATABILITY_PROTOCOL_10.md`, delta P1
8. `git diff <gate-sha> HEAD -- romeo-hydra-crypto` (debe ser vacío)

Escribe: `evidencia/audit/AUDIT_LOCAL_RUN.txt`

## Qué no hace

- No valida min-entropía física
- No ejecuta el protocolo de 10 ciclos
- No modifica `measured_hinf` ni limpia PPRH_EC008
- No cambia el contrato R > 0

## Uso (Git Bash / Linux)

```bash
cd ~/ROMEO-HYDRA-MASTER/romeo-hydra-master-repository-hub
git pull origin main
bash scripts/audit_close_head.sh
```

Opciones:

```bash
bash scripts/audit_close_head.sh --no-pull
bash scripts/audit_close_head.sh --gate-sha 6bafb5e7cf38502de19500cd6ed0188e7caa1a60
```

## Criterio de aceptación P4

| Check | Esperado |
|-------|----------|
| pytest pprh | PASS |
| crypto unittest | PASS |
| crypto smoke | ENVELOPE_CRYPTO_OK |
| grep pprh | sin hits |
| manifest + protocol | presentes |
| crypto diff vs gate SHA | vacío |
| OVERALL | PASS |

Si OVERALL = FAIL, archiva el `AUDIT_LOCAL_RUN.txt` y corrige antes de elevar el estado de auditoría.

## Relación con P1

P1 demostró integridad estática entre `6bafb5e7` y `9bff763f`.  
P4 demuestra ejecución en **tu** HEAD local en el momento del run.
