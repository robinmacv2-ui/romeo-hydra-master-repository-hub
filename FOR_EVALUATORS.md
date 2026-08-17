# FOR EVALUATORS — FIAB / BIND / 500 LATAM / YC

**ROMEO-HYDRA · 0.1.3**

Autor: **Luis Angel Vazquez Martinez**

---

## 0. YC Application Kit

Ready-to-paste answers + checklist:

**[`outreach/YC_APPLICATION.md`](./outreach/YC_APPLICATION.md)**

---

## 1. Qué es

Paquete Python offline (~55K wheel+sdist), reproducible en entorno limpio (venv / Termux aarch64).

Entrega verificable:

- Kernel de estabilidad + gateway de gobernanza opcional (no es un LLM)
- Pilotos de evidencia SHA-256 (stdlib only)
- Genesis hash congelado (fail-closed)
- DOI Zenodo + CI reproducible
- Documentación explícita de límites
- Sellado de eventos de automatización externa (`romeo_hydra.evidence`, schema v1)

Nombres de módulos internos (*PPRH*, *Kernel Sigma*, *PLAM*, *HPR*, etc.) son **nomenclatura propia del proyecto**, no estándares de la industria.

## 1b. Caso de uso de producto: evidencia de automatización externa

`romeo_hydra.evidence` permite **registrar** (no decidir) un evento JSON producido por un sistema externo — por ejemplo la salida de un workflow n8n o un playbook SOAR que bloqueó una IP.

- Obliga `source_system` (quién actuó).
- Fuerza `decision_by_romeo_hydra: false` y un `evidence_note` explícito.
- Escribe en el ledger atómico existente (`schema_version: "1"`).
- **No** es detección de amenazas, firewall ni folio CNBV.

Demostración mínima:

```bash
python -c "
from pathlib import Path
import json
from romeo_hydra.evidence import AutomationEvidenceSealer
event = json.loads(Path('tests/fixtures/n8n_webhook_ip_blocked.json').read_text())
r = AutomationEvidenceSealer(Path('pilot/output/automation_evidence.jsonl')).seal(event)
print(r.ok, r.chain_ok, r.evidence_note)
"
```

## 2. DOIs maestros (solo estos dos)

| Rol | DOI |
|-----|-----|
| **Version** | **[10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)** |
| Concept | [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) |

Historial satélite (teoría/ontología, no producto): [`DOI_HISTORY.md`](./DOI_HISTORY.md)

---

## 3. Prueba del juez (entorno limpio)

```bash
mkdir -p /tmp/auditoria_jurado && cd /tmp/auditoria_jurado
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip setuptools wheel
pip install -r requirements.txt && pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
python -m pilot.run_offline_audit --days 30 --entity EVAL
```

O: `bash scripts/audit_judge.sh`

**Esperado:** JSON en `pilot/output/` con `folio_note` que dice **NO es folio CNBV** y flags de TFHE/full HE en **false**.

---

## 4. Frase oficial

Build Python puro ~55K, DOI 21922106, offline (incl. Termux aarch64) sin depender de Rust. Implementa integridad SHA-256 y un puente conceptual a HE; **no** es una librería TFHE compilada de producción. El piloto genera ledger con **folio interno**, no un folio CNBV oficial. Hoy: 0 clientes de pago / $0 MRR; buscando primera LOI de piloto offline.

---

## 5. Qué no se reclama

- No es sistema bancario/bursátil en producción
- No está certificado por CNBV ni ninguna autoridad
- El wheel no contiene TFHE/HElib compilados
- 0 clientes de pago / 0 MRR
- Homomórfico “full” = investigación / rama nativa, no el runtime por defecto de `main`
- No es un LLM ni un chatbot
- `romeo_hydra.evidence` no decide ni ejecuta acciones de seguridad; solo registra eventos externos

---

## 6. Dónde mirar (producto) y qué ignorar (lab)

| Mirar | Ignorar en evaluación |
|-------|------------------------|
| `romeo_hydra/`, `pilot/`, `tests/`, `scripts/`, `docs/FHE_STATUS.md` | Scripts sueltos en raíz, `BITACORA_PERSONAL/`, prototipos, repos satélite de teoría |
| [`STRUCTURE.md`](./STRUCTURE.md) | Nombres grandilocuentes en carpetas de lab |
| `romeo_hydra/evidence/` | `lab/automation_evidence/` (shim con fecha de caducidad) |

---

## 7. Licencia

AGPL-3.0 (evaluación/PoC) · Comercial EMMOROR (producción) · emmororromeohydra@gmail.com

---

Luis Angel Vazquez Martinez  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
