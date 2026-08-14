# FOR EVALUATORS — FIAB / BIND / revision tecnica

**ROMEO-HYDRA · paquete 0.1.1**

Texto corto para jueces y revisores. Sin marketing.

---

## 1. Que es

Un paquete Python instalable que corre **offline**. Incluye:

- un controlador de estabilidad (Kernel Sigma)
- una capa de abstraccion orientada a esqueletos de verificacion
- tests de que no se filtren secretos en los rastros
- un kit de piloto de 30 dias que genera un ledger de evidencia

Autor: Luis Angel Vazquez Martinez. Empezo sin formacion formal en programacion. El codigo y el DOI existen y se pueden verificar.

---

## 2. Como verificarlo (< 3 min)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v
python -m pilot.run_offline_audit --days 7 --entity "EVAL"
```

Se espera: tests en verde, demo determinista, ledger en `pilot/output/`.

---

## 3. DOIs (Zenodo / CERN)

| Tipo | DOI |
|------|-----|
| Version | https://doi.org/10.5281/zenodo.21918611 |
| Concept | https://doi.org/10.5281/zenodo.21744014 |

---

## 4. Licencia

| Uso | Licencia |
|-----|----------|
| Investigacion, concurso, PoC | AGPL-3.0 |
| Produccion regulada | Comercial EMMOROR (contacto) |

emmororromeohydra@gmail.com

---

## 5. Que no se reclama

- No es sistema bancario en produccion
- No esta auditado por tercero ni certificado por CNBV
- La parte homomorfica es puente / conceptual, no libreria FHE de produccion
- No hay clientes de pago ni MRR al dia de hoy

---

## 6. Estructura util

| Ruta | Para que |
|------|----------|
| `romeo_hydra/` | Producto instalable |
| `tests/` | Suite de pruebas |
| `pilot/` | Kit de piloto offline 30 dias |
| `STATUS.md` | Estado comercial honesto |
| Resto | Laboratorio / experimentos |

---

## 7. Una linea

Codigo offline verificable, con DOI, listo para un piloto tecnico de 30 dias — no un producto terminado de banca.

---

Luis Angel Vazquez Martinez  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
