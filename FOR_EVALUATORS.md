# FOR EVALUATORS — FIAB / BIND / 500 LATAM

**ROMEO-HYDRA · 0.1.2**

Autor: **Luis Angel Vazquez Martinez**

---

## 1. Que es

Paquete Python offline (~55K wheel+sdist class), reproducible en entorno limpio (venv).

Entrega: kernel, pilotos de evidencia SHA-256, DOI Zenodo, documentacion de limites.

---

## 2. DOIs maestros (solo estos dos)

| Rol | DOI |
|-----|-----|
| **Version** | **[10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)** |
| Concept | [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) |

Historial satelite: [`DOI_HISTORY.md`](./DOI_HISTORY.md)

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

O en un comando: `bash scripts/audit_judge.sh`

Esperado: JSON en `pilot/output/` con `folio_note` que dice **NO es folio CNBV** y `tfhe_full` / equivalencias en **false**.

---

## 4. Frase oficial

v0.1.2 es un build Python puro ~55K, DOI 21922106, que corre offline (incl. Termux aarch64) sin depender de Rust. Implementa integridad SHA-256 y un puente conceptual a FHE; **no** es una libreria TFHE compilada de produccion. El piloto genera ledger con **folio interno**, no un folio CNBV oficial.

---

## 5. Que no se reclama

- No es sistema bancario/bursatil en produccion
- No esta certificado por CNBV
- El wheel no contiene TFHE/HElib compilados
- 0 clientes de pago / 0 MRR
- Homomorfico full = rama/slot nativo, no el runtime por defecto de main

---

## 6. Licencia

AGPL-3.0 (evaluacion/PoC) · Comercial EMMOROR (produccion) · emmororromeohydra@gmail.com

---

Luis Angel Vazquez Martinez  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
