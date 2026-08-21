# VERB_CLOSED_SET — ROMEO-HYDRA V3.1

Only the following verbs are admissible. Any other verb produces DENY.

```
faro
auditar
verificar
validar
construir
sellar
registrar
evaluar
filtrar
colapsar
proyectar
```

## Role capabilities

| Role     | Allowed verbs                                      |
|----------|----------------------------------------------------|
| auditor  | auditar, verificar, validar, evaluar, filtrar, faro |
| operator | construir, registrar, sellar, proyectar, colapsar, faro |
| observer | faro, verificar                                    |
| system   | full closed set                                    |
