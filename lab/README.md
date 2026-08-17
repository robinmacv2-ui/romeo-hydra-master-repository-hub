# LAB — zona de experimentos (no es el producto)

Autor: Luis Angel Vazquez Martinez

Esta carpeta es el **punto de entrada documentado** del laboratorio.  
Muchos experimentos historicos siguen en la **raiz del repo** (no se borraron).

## Regla nueva

Todo experimento **nuevo** va aqui:

```text
lab/
  <tema>/
    README.md      # que es, como correrlo, estado
    *.py / *.sh
```

Ejemplos de temas: `homeostasis/`, `banking-stress/`, `tfhe-bridge/`, `hardware/`.

## Como orientarse en la raiz (legado)

| Si buscas… | Empieza por… |
|------------|----------------|
| Producto instalable | `romeo_hydra/`, `main.py` |
| Ledgers / pilotos | `pilot/` |
| Paralelo CPU | `romeo_hydra/kernel/parallel_cpu.py`, `scripts/bench_parallel_cpu.py` |
| Notas personales | `BITACORA_PERSONAL/` |
| Activadores shell | `activar_*.sh` en raiz (legado) |
| Banking omega scripts | `banking_*.py` en raiz (legado) |
| Ontologia formal | repos satelite en `ECOSYSTEM.md` |

## Promocion a producto

1. Tiene test en `tests/`
2. No rompe Termux smoke
3. Documentado en README o FOR_EVALUATORS si es demo de jurado
4. Sin reclamar CNBV / TFHE compilado en wheel

---

Luis Angel Vazquez Martinez
