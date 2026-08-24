# Ecosistema robinmacv2-ui — indice de repositorios

Autor: **Luis Angel Vazquez Martinez**  
Perfil: https://github.com/robinmacv2-ui  
LinkedIn: https://www.linkedin.com/in/luis-angel-vazquez-martinez-066ba9422  
Email: robinmac.v2@gmail.com  
Tel: +52 56 5015 3935  
Hub maestro: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub

Este archivo **indexa** todos los repos publicos. No borra historia.

---

## Capa 0 — Producto evaluable (usar esto en FIAB / BIND)

| Repo | Rol | DOI / nota |
|------|-----|------------|
| **[romeo-hydra-master-repository-hub](https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub)** | Producto 0.1.2: `romeo_hydra/`, `pilot/`, tests, native, docs | Version **10.5281/zenodo.21922106** · Concept **10.5281/zenodo.21744014** |
| **[romeo-hydra-core](https://github.com/robinmacv2-ui/romeo-hydra-core)** | Agente DFA offline fail-closed · stdlib only | **[v0.1.0](https://github.com/robinmacv2-ui/romeo-hydra-core/releases/tag/v0.1.0)** |

Superficie de producto dentro del hub: ver [`STRUCTURE.md`](./STRUCTURE.md).

---

## Capa 1 — Nucleos de codigo (linaje tecnico)

| Repo | Rol |
|------|-----|
| [romeo-hydra](https://github.com/robinmacv2-ui/romeo-hydra) | Nucleo original · DOI 10.5281/zenodo.21406719 |
| [Romeo_Framework](https://github.com/robinmacv2-ui/Romeo_Framework) | Metodologia reproducible · DOI 10.5281/zenodo.21404126 |
| [Romeo_Hydra_Framework](https://github.com/robinmacv2-ui/Romeo_Hydra_Framework) | Nucleo consolidado (TS / legacy) |
| [hydra.master](https://github.com/robinmacv2-ui/hydra.master) | Variante TypeScript |
| [-clean](https://github.com/robinmacv2-ui/-clean) | Auxiliar / limpieza |

---

## Capa 2 — Formalismos / ontologia (DOI satelite)

| Repo | DOI |
|------|-----|
| [Postulado-invarianza-homeostatica](https://github.com/robinmacv2-ui/Postulado-invarianza-homeostatica) | 10.5281/zenodo.21741578 |
| [Part-cula-de-Luis-ngel-](https://github.com/robinmacv2-ui/Part-cula-de-Luis-ngel-) | 10.5281/zenodo.21728587 |
| [TARJETA-L-GICA-CUANTICA](https://github.com/robinmacv2-ui/TARJETA-L-GICA-CUANTICA) | 10.5281/zenodo.21697259 |
| [MANIFIESTO-ONTOLOGICO](https://github.com/robinmacv2-ui/MANIFIESTO-ONTOLOGICO) | 10.5281/zenodo.21709670 |
| [Geomitria-en-agujeros-negros](https://github.com/robinmacv2-ui/Geomitria-en-agujeros-negros) | 10.5281/zenodo.21728530 |

**Regla:** estos NO se citan como producto en FIAB. Van en [`DOI_HISTORY.md`](./DOI_HISTORY.md) como linaje.

---

## Capa 3 — Banking / gobernanza (exploratorio)

| Repo | Rol |
|------|-----|
| [Romeo-BANKING](https://github.com/robinmacv2-ui/Romeo-BANKING) | Gobernanza auditable (exploratorio) |
| [ROMEO-HYDRA-BANKING](https://github.com/robinmacv2-ui/ROMEO-HYDRA-BANKING) | Extension bancaria (exploratorio) |

No son certificacion CNBV ni producto de produccion.

---

## Capa 4 — Fuera de linea critica

| Repo | Rol |
|------|-----|
| [LOOPER-STATION](https://github.com/robinmacv2-ui/LOOPER-STATION) | Musica / looper |

---

## Mapa mental (una mirada)

```text
robinmacv2-ui
├── PRODUCTO (evaluar aqui)
│   ├── romeo-hydra-master-repository-hub
│   │     romeo_hydra/  pilot/  tests/  native/  docs/
│   └── romeo-hydra-core v0.1.0  (agente standalone)
├── LINAJE CODIGO
│   romeo-hydra · Romeo_Framework · Romeo_Hydra_Framework · hydra.master
├── LINAJE DOI / TEORIA
│   Postulado · Particula · Tarjeta · Manifiesto · Geomitria
├── BANKING (exploratorio)
│   Romeo-BANKING · ROMEO-HYDRA-BANKING
└── OTROS
    LOOPER-STATION · -clean
```

---

## Submodulos en el hub

Si `.gitmodules` apunta a satelites DOI:

```bash
git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git
```

Evaluadores **no** necesitan submodulos para el smoke de producto (`requirements.txt` + `pilot/`).

---

**Luis Angel Vazquez Martinez**  
Email: robinmac.v2@gmail.com · Tel: +52 56 5015 3935  
LinkedIn: https://www.linkedin.com/in/luis-angel-vazquez-martinez-066ba9422  
Core: https://github.com/robinmacv2-ui/romeo-hydra-core/releases/tag/v0.1.0
