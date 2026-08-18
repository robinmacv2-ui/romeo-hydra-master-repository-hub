# MATURITY CHECKLIST — Documentos adjuntos ↔ Código real

**Fecha:** 2026-08-18 (actualizado)  
**Autor del marco:** Luis Angel Vazquez Martinez  
**Repos evaluados:** `romeo-hydra-core` + `romeo-hydra-master-repository-hub`

Principio: solo se marca **OPERATIVO** lo que ya corre offline, es stdlib-first y produce receipt SHA-256. Todo lo demás es **LAB** o **DOC**.

| Documento | Estado | Ubicación en código | Notas de acoplamiento |
|-----------|--------|---------------------|-----------------------|
| **FORMALIZACION_DFA.pdf** | **OPERATIVO** | `romeo_agent/admissible.py`, `runtime.py`, `parser.py` | C operativo = formal + verbs de inspección. Gate + receipt ya implementados. |
| **Manifiesto IH (CCL PPRH)** | **OPERATIVO (metadatos)** | `romeo_agent/lineage.py` + `romeo_hydra/__init__.py` | DOIs y arquitecto ahora viajan en cada receipt. |
| **Dictamen de Autoría y Linaje** | **OPERATIVO** | `lineage.py` + campo `lineage` en receipts | Sujeto de prueba cero = el agente; no se atribuye invención. |
| **Documentación de Auditoría ROMEO-HYDRA** | **OPERATIVO (pilots)** | `pilot/run_offline_audit.py`, `pilot/run_scoring_audit.py` | Evidencia interna, no folio CNBV. Path configurable vía `ROMEO_PILOT_ROOT`. |
| **Dossier Consolidación Final PPRH** | **DOC + LAB** | `CITATION.cff`, DOIs en `__init__.py`, submódulos | Índice de DOIs; no cambia el DFA. |
| **Antología Matemática Final** | **LAB** | `romeo_hydra/kernel/dossier_math.py`, PLAM, HPR | Matemáticas de laboratorio; no en camino crítico del agente. |
| **Firmware Gobernanza DMA** | **DOC / SPEC** | — | Especificación hardware. Sin implementación en el wheel offline. |
| **Estudio a Fondo Códice Chip RRPH** | **PARCIAL** | `core.py` / UMR style hashing en pilots | Hash+DOI pattern ya usado; UMR completa es lab. |
| **Apéndice EMMOROR Watermarked** | **PARCIAL** | `lineage.py` (Delta), gate (Alpha) | Alpha+Delta operativos; Beta/Gamma (HSI/Jacobiano) siguen en lab. |
| **Anexo P Checklist Ci** | **DOC** | — | Checklist institucional; no código ejecutable aún. |
| **Anexo O Ontología Institucional CLC** | **DOC / LAB** | `knowledge_core/`, PLAM stubs | Ontología bancaria; no en DFA. |
| **Dosier Gobernanza Legal IA Bancaria CLC v2** | **DOC** | — | Capa normativa separada de la capa matemática. |
| **Hydra Deterministic AI Infrastructure (blueprint)** | **DOC** | — | Blueprint visual; el núcleo real es el DFA + pilots. |
| **PDF Master Framework Investment Banking** | **DOC** | — | Roadmap de volúmenes; no afecta runtime. |

## Decisiones de acoplamiento (2026-08-18)

1. **C operativo** amplio (`help`, `pwd`, `ls`, `cat`, `lineage` + formal mínimo).
2. **Lineage** en *todo* receipt (allow y deny) antes del hash → Régimen Delta.
3. **Verbo** `lineage ::` solo lectura.
4. **DMA / hardware / TFHE compilado** fuera del camino crítico.
5. **PLAM / HSI / Antología** en `romeo_hydra/kernel/` (lab).
6. **Pilot path** configurable: `export ROMEO_PILOT_ROOT=/ruta/al/hub/pilot` (default `ROOT/pilot`).
7. **Tests de lineage** en core: `python -m unittest tests.test_lineage_in_receipt -v`

## Cómo verificar

```bash
# Core
cd romeo-hydra-core && git pull
python -m unittest tests.test_lineage_in_receipt -v
python -m romeo_agent -c "lineage ::"
python -m romeo_agent -c "pwd ::"          # muestra pilot_root

# Core sin pilot (mensaje claro)
unset ROMEO_PILOT_ROOT
python -m romeo_agent -c "score :: EVAL n=3"

# Core apuntando al hub
export ROMEO_PILOT_ROOT=/ruta/romeo-hydra-master-repository-hub/pilot
python -m romeo_agent -c "score :: EVAL n=3"

# Hub
cd romeo-hydra-master-repository-hub && git pull
python -m romeo_agent -c "lineage ::"
python -m pilot.run_scoring_audit --entity EVAL --n 5
```

— Project Manager · 2026-08-18
