# FOR EVALUATORS — FIAB / BIND / 500 LATAM

**ROMEO-HYDRA · 0.1.2**

Autor: **Luis Angel Vazquez Martinez**

---

## 1. Que es

Paquete Python offline (~55K sdist/wheel class), instalable en Termux aarch64 y en laptop.

Incluye kernel de estabilidad, tests de no-filtrado, pilotos de evidencia (scoring/audit/market sinteticos).

---

## 2. DOIs maestros (solo estos)

| Rol | DOI |
|-----|-----|
| **Version** | **10.5281/zenodo.21922106** |
| Concept | 10.5281/zenodo.21744014 |

---

## 3. Que SI puedes verificar hoy

```bash
pip install numpy && pip install -e .
export PYTHONPATH=.
python -c "from romeo_hydra import get_info; print(get_info()['version'], get_info()['wheel_is_compiled_tfhe'])"
python -m pilot.run_scoring_audit --entity EVAL --n 20
ls pilot/output/
```

- `wheel_is_compiled_tfhe` debe ser **False**
- El JSON de salida tiene `folio_interno` y dice explicitamente que **no es folio CNBV**

---

## 4. Frase oficial (usar esta)

v0.1.2 es un build Python puro de ~55K, DOI 21922106, que corre offline en Termux aarch64 sin dependencias de Rust. Implementa un puente conceptual a FHE (HElib/TFHE) para diseno de scoring auditable, **no** una libreria FHE compilada de produccion. El piloto genera un ledger de evidencia con **folio interno verificable**, no un folio CNBV oficial, listo para contrastar requisitos de visitas — no para suplantar registros regulatorios.

---

## 5. Que no se reclama

- No es sistema bancario / bursatil en produccion
- No esta certificado por CNBV; el folio del pilot **no** es folio CNBV
- El wheel **no** contiene TFHE/HElib compilados (pesarian multi-MB)
- No hay clientes de pago ni MRR
- Homomorfico full (circuitos TFHE) = slot nativo CMake, no runtime del wheel

---

## 6. Build forense

Release v0.1.2: wheel ~28K + tar.gz ~27K ≈ 55K. Eso es **paquete Python**, no binario FHE aarch64.

---

Luis Angel Vazquez Martinez  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
