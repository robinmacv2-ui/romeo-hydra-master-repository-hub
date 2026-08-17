# HUB INDEX — Ecosistema ROMEO-HYDRA

**Master:** https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub  
**Indice completo de repos:** [`ECOSYSTEM.md`](./ECOSYSTEM.md)  
**Producto vs lab:** [`STRUCTURE.md`](./STRUCTURE.md)

Autor: **Luis Angel Vazquez Martinez**  
Licencia hub: AGPL-3.0 / Comercial EMMOROR

---

## Nucleo ejecutable (producto)

| Item | Valor |
|------|--------|
| Repo | romeo-hydra-master-repository-hub |
| Paquete | `romeo_hydra` 0.1.2 |
| DOI Version | **10.5281/zenodo.21922106** |
| DOI Concept | **10.5281/zenodo.21744014** |
| Evaluadores | [`FOR_EVALUATORS.md`](./FOR_EVALUATORS.md) |

```bash
pip install -r requirements.txt && pip install -e .
python main.py
python -m pilot.run_scoring_audit --entity EVAL --n 20
```

---

## Mapa rapido de capas

1. **Producto** — este hub (`romeo_hydra/`, `pilot/`, `tests/`)
2. **Linaje codigo** — romeo-hydra, Romeo_Framework, Romeo_Hydra_Framework, hydra.master
3. **Linaje DOI teoria** — Postulado, Particula, Tarjeta, Manifiesto, Geomitria
4. **Banking exploratorio** — Romeo-BANKING, ROMEO-HYDRA-BANKING
5. **Otros** — LOOPER-STATION, -clean

Detalle y URLs: [`ECOSYSTEM.md`](./ECOSYSTEM.md)  
DOIs satelite: [`DOI_HISTORY.md`](./DOI_HISTORY.md)

---

## Submodulos

```bash
git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
```

No requerido para la prueba de humo del producto.

---

Luis Angel Vazquez Martinez
