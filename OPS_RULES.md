# Reglas operativas ROMEO-HYDRA (no romper lo de esta noche)

Autor: Luis Angel Vazquez Martinez  
Para: socio de sistemas (Termux/Python) + admin de GitHub (DOIs/releases)

---

## Para el socio de sistemas (Termux / Python)

### 1. `cryptography` NUNCA es dependencia obligatoria en main

- En `pyproject.toml`, `dependencies` solo debe incluir lo que instale en **aarch64 Termux** sin Rust/maturin (hoy: `numpy`).
- `cryptography` = extra opcional: `pip install 'romeo-hydra[crypto]'` cuando haya wheel.
- Si un dia hay TFHE real compilado → rama **`fhe-full`**, no mezclar en `main` hasta que el smoke de Termux pase.

### 2. Los pilotos de evidencia NO importan `romeo_hydra`

Archivos sagrados (solo stdlib: `hashlib`, `json`, `argparse`, `pathlib`, `datetime`):

- `pilot/run_scoring_audit.py`
- `pilot/run_offline_audit.py`

Si vuelves a poner `from romeo_hydra import ...` ahi, en campo (Termux sin cryptography) regresa el `ModuleNotFoundError` de las 21:46 y se cae el demo.

### 3. Prueba de humo ANTES de cualquier push

```bash
cd /data/data/com.termux/files/home/romeo-hydra-master-repository-hub   # o tu ruta
bash scripts/smoke_termux.sh
```

O a mano:

```bash
python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
grep -R "NO es folio CNBV" pilot/output/ || grep -R "no es folio CNBV" pilot/output/
```

**Si no se generan los 2 JSON con `folio_note` dejando claro que NO es folio CNBV → no hagas push.**

---

## Para el admin de GitHub (DOIs / releases)

### 1. Congela DOIs

Solo estos dos van en `FOR_EVALUATORS.md` y pitch:

| Rol | DOI |
|-----|-----|
| **Version** | **10.5281/zenodo.21922106** |
| Concept | 10.5281/zenodo.21744014 |

- No publiques otro **Version DOI** hasta tener piloto con carta/LOI o cliente pagado.
- Cada DOI de version nuevo diluye el linaje.
- Los 11 del ecosistema ya estan en `DOI_HISTORY.md`. No hace falta mas en documentos de evaluacion.

### 2. Protege `main`

En GitHub:

**Settings → Branches → Add branch protection rule**

- Branch name pattern: `main`
- Require a pull request before merging
- Require status checks to pass (cuando haya CI)
- Restrict force pushes

Asi nadie borra con `git push --force` el trabajo de ledgers de esta noche.

### 3. Release = Tag + Wheel + Ledger

Cuando salga **v0.1.3** (o siguiente):

1. `git tag v0.1.3` (solo tras smoke OK)
2. Subir `romeo_hydra-0.1.3-py3-none-any.whl`
3. **Adjuntar como asset del release** al menos:
   - `scoring_SOFIPO-DEMO_20.json`
   - (recomendado) `offline_SOFIPO-DEMO_30d.json`

FIAB debe poder bajar **binario + evidencia** del mismo release, no solo buscar en `pilot/output/` del clone.

---

## Resumen en una linea

1 producto, 2 DOIs maestros, pilotos stdlib en Termux, release con wheel + ledger, `main` protegido.

---

Luis Angel Vazquez Martinez
