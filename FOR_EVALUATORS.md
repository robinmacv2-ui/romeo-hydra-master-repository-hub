# FOR EVALUATORS — FIAB / BIND / 500 LATAM

**ROMEO-HYDRA · paquete 0.1.2**

Texto corto para jueces y revisores. Sin marketing.

Autor: **Luis Angel Vazquez Martinez**

---

## 1. Que es

Un paquete Python instalable que corre **offline**. Incluye:

- un controlador de estabilidad (Kernel Sigma)
- una capa de abstraccion orientada a esqueletos de verificacion
- tests de que no se filtren secretos en los rastros
- un kit de piloto de 30 dias (auditoria general + scoring sintetico)

Empece sin formacion formal en programacion. El codigo, el build y el DOI existen y se pueden verificar.

---

## 2. DOIs maestros (solo estos dos)

| Rol | DOI |
|-----|-----|
| **Version a citar (v0.1.2)** | **[10.5281/zenodo.21922106](https://doi.org/10.5281/zenodo.21922106)** |
| Concept (todas las versiones del hub) | [10.5281/zenodo.21744014](https://doi.org/10.5281/zenodo.21744014) |

Historial completo del ecosistema (satelites + versiones anteriores): [`DOI_HISTORY.md`](./DOI_HISTORY.md)

No hay que citar 11 DOIs. Hay que citar **uno de version** y, si hace falta, el de concepto.

---

## 3. Prueba forense del build (~56K)

Release **v0.1.2**:

| Artefacto | Peso |
|-----------|------|
| `romeo_hydra-0.1.2-py3-none-any.whl` | **27,913 bytes** (~28K) |
| `romeo_hydra-0.1.2.tar.gz` | **27,362 bytes** (~27K) |
| **Total** | **~55.3K** |

- Wheel: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/download/v0.1.2/romeo_hydra-0.1.2-py3-none-any.whl
- Tar.gz: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/download/v0.1.2/romeo_hydra-0.1.2.tar.gz
- Release: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/releases/tag/v0.1.2

Validacion en edge (release notes): Termux ARM64, MINGW64 x86_64, PowerShell nativo. Sin Docker obligatorio ni 8GB en cloud.

---

## 4. Verificacion en dos modos

### Modo A — FIAB / con internet (~3 min)

```bash
git clone https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
cd romeo-hydra-master-repository-hub
pip install -e ".[dev]"
python -m romeo_hydra
python examples/umr_trl5_demo.py
pytest tests/ -v
python -m pilot.run_scoring_audit --entity "EVAL" --n 20
```

### Modo B — BIND / planta / offline

Bajar antes el wheel (28K) a USB o carpeta local. Luego sin red:

```bash
pip install --no-index --find-links=. romeo_hydra-0.1.2-py3-none-any.whl
python -c "from romeo_hydra import get_info; print(get_info())"
python -m romeo_hydra
```

Objetivo: la prueba no exige cloud en el momento de la evaluacion.

---

## 5. Que no se reclama

- No es sistema bancario en produccion
- No esta auditado por tercero ni certificado por CNBV
- La parte homomorfica es puente / conceptual (no libreria FHE de produccion)
- No hay clientes de pago ni MRR

---

## 6. Licencia

| Uso | Licencia |
|-----|----------|
| Investigacion, concurso, PoC | AGPL-3.0 |
| Produccion regulada | Comercial EMMOROR (contacto) |

emmororromeohydra@gmail.com

---

## 7. Estructura util

| Ruta | Para que |
|------|----------|
| `romeo_hydra/` | Producto instalable |
| `tests/` | Suite de pruebas |
| `pilot/` | Kit piloto offline + scoring sintetico |
| `STATUS.md` | Estado comercial honesto |
| `DOI_HISTORY.md` | Trazabilidad de todos los DOIs (anexo) |
| Release v0.1.2 | Build forense ~56K |
| Resto | Laboratorio |

---

## 8. Una linea

Codigo offline verificable, build ~56K, DOI **10.5281/zenodo.21922106**, listo para un piloto tecnico de 30 dias — no un producto terminado de banca.

---

Luis Angel Vazquez Martinez  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
