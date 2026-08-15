# Protocolo de Interacción con IA — ROMEO-HYDRA

**Principio rector:** Tratar a la IA como *Consultor Externo con Ojos Vendados*.  
Se aplica el **Mínimo Privilegio** no solo al código, sino al flujo de información hacia el modelo.

Autor: Luis Angel Vazquez Martinez  
Aplicable a: Kernel Sigma, Delta Ledger, ecosistema Romeo Hydra Master Repository Hub.

---

## 1. Motor de Inferencia Ciego (Blind Inference Engine)

Objetivo: generar código **agnóstico** y reutilizable sin filtrar lógica propietaria del núcleo (Sigma) ni del Delta Ledger.

### Reglas de prompting

| Incorrecto (expone dominio) | Correcto (contrato de interfaz) |
|-----------------------------|---------------------------------|
| “Escribe una función de ledger para Romeo Hydra” | “Escribe una implementación en [C/Rust/Go/Python] de una estructura de datos circular que cumpla con este trait/interfaz, optimizando para lecturas O(1) y garantizando que no haya desbordamiento de memoria.” |
| “Firma una transacción de Romeo Hydra con Ed25519” | “Implementa una función envolvente (wrapper) para la librería libsodium / cryptography que maneje la serialización de un array de bytes genérico y devuelva una firma detached, incluyendo manejo de errores para buffers nulos.” |
| “Implementa el Kernel Sigma” | “Implementa un controlador de proyección de estado con tolerancia ε, verificación de estabilidad hessiana y huella SHA-256 determinista de la configuración.” |

### Beneficio estructural para el repo

- Código generado → carpeta `/utils` o `/lib` (o `romeo_hydra/crypto/`, `native/`) **independiente** de la lógica central.
- El núcleo propietario (Kernel Sigma, orquestación del Delta Ledger) permanece a oscuras.
- Versionado separado de utilidades genéricas vs. lógica de misión crítica.

### Checklist antes de pedir código a la IA

1. ¿El prompt menciona nombres de dominio internos (Romeo, Sigma, Delta Ledger, Hydra)? → Reescribir a contratos abstractos.
2. ¿Pide firmas / cifrado sobre objetos de negocio? → Pedir solo wrappers de librería + serialización de bytes.
3. ¿El resultado puede vivir en una carpeta agnóstica? → Sí → aceptar; No → reescribir prompt.

---

## 2. Rol de Auditor de Seguridad (“Abogado del Diablo”)

El Master Repository Hub es el centro neurálgico. La IA debe atacar la **orquestación**, no solo unidades aisladas.

### Vectores obligatorios de análisis

**A. Reentrada y estado / race conditions**

```
Tengo un sistema donde el Delta Ledger actualiza estados en paralelo.
Analiza este pseudocódigo de sincronización en busca de condiciones de carrera
(race conditions) o ataques de “Double Spend” a nivel de memoria,
asumiendo que el atacante controla el orden de llegada de los paquetes.
```

**B. Teoría de juegos / consenso**

```
Si este sistema utiliza un mecanismo de consenso o validación por firmas,
¿cómo podría un grupo de nodos coludidos crear una bifurcación (fork) invisible
si el Delta Ledger no tiene un checkpoint global inmediato?
Evalúa el riesgo de ataques de eclipse.
```

**C. Inconsistencias documentación ↔ arquitectura**

```
Compara la sección de “Seguridad” / promesas técnicas de mi README
(o ARCHITECTURE.md / OPS_RULES.md) con la sección de “Arquitectura de Red”
o TOPOLOGY.md. Encuentra una promesa técnica en la documentación que no sea
soportada lógicamente por la estructura de red o de componentes descrita.
```

**D. Power-loss / Circuit Breaker**

```
Actúa como un analista de fallos deterministas. En este flujo de orquestación,
identifica dónde una interrupción de energía (Power-Loss) entre la escritura
del ledger y la confirmación del controlador de proyección podría causar
desincronización de estado. Propón un mecanismo de recuperación fail-closed.
```

Ver informe materializado: `security_audit/power_loss_circuit_breaker.md`.

### Uso del README / docs como vector

- Siempre entregar a la IA los documentos públicos (README, ARCHITECTURE, OPS_RULES, docs/FHE_STATUS, docs/TOPOLOGY) y forzar la búsqueda de promesas no respaldadas.
- Nunca entregar el código fuente completo del Kernel Sigma ni del orquestador en la misma sesión que el análisis de amenazas de alto nivel.

---

## 3. Generador de Tests de Estrés (Chaos Engineering)

Tercera función oficial de la IA sobre este repositorio.

### Ejemplos de prompts de fallo

**Saturación de deserializador / fail-closed**

```
Genera un script en Python o Bash que sature el puerto de escucha del controlador
de proyección (o del protocolo TCP de red) con paquetes malformados que imiten
el encabezado de una firma Ed25519 / SHA-256 pero con payload aleatorio.
El objetivo es probar si el deserializador falla de forma segura (fail-closed)
o si causa un panic / excepción no controlada.
```

**Otros escenarios recomendados**

- Inyección de estados con entropía por encima de `error_tolerance`.
- Reordenamiento arbitrario de entradas al ledger (simulación de reordenamiento de red).
- Corrupción de fingerprints de configuración y verificación de que la cadena de trazas inmutables se rompe correctamente.
- Stress de `pilot/run_scoring_audit` y `pilot/run_offline_audit` con volúmenes anómalos sin romper la propiedad “solo stdlib”.

Los scripts generados deben vivir preferentemente en `tests/` o `scripts/` y no importar lógica propietaria innecesaria.

---

## 4. Cadena de suministro (Supply Chain) — Build Recipe Inmutable

### Estado actual (cerrado el Delta Gap)

| Artefacto | Ubicación |
|-----------|-----------|
| Dockerfile multi-stage (Alpine, no-root) | `Dockerfile` |
| Contexto mínimo de build | `.dockerignore` |
| CI reproducible + fail-closed + Sigstore en tags | `.github/workflows/reproducible-build.yml` |
| Notas de superficie de ataque | `security_audit/supply_chain_notes.md` |

### Auditoría continua con IA

```
Analiza este archivo YAML de despliegue / GitHub Actions / Dockerfile / Makefile.
¿Hay alguna forma de que un atacante inyecte una dependencia maliciosa en el
binario final sin disparar alertas de hash (SHA-256 del release o del wheel)?
```

Cualquier cambio futuro a CI/Dockerfile debe pasar por este vector antes de merge a `main`.

---

## 5. Resumen operativo (una página)

| Función de la IA | Qué se le da | Qué nunca se le da | Salida esperada |
|------------------|--------------|--------------------|-----------------|
| Inferencia ciega | Contratos de interfaz, traits, firmas de función genéricas | Nombres de dominio interno, lógica de negocio Sigma/Delta | Código en `/utils`, `romeo_hydra/crypto/`, `native/` |
| Auditor de seguridad | Pseudocódigo de sincronización, README + ARCHITECTURE | Código fuente completo del núcleo | Hallazgos de race conditions, forks, inconsistencias docs |
| Chaos / stress | Descripción de puertos, formatos de paquete, tolerancias | Credenciales, claves privadas, datos reales | Scripts en `tests/` o `scripts/` que prueben fail-closed |
| Supply chain | YAML, Dockerfile, Makefile, pyproject.toml | Secretos de CI | Análisis de inyección de dependencias sin alerta de hash |

**Conclusión del protocolo:**  
Se mantiene la soberanía del código (Kernel Sigma y orquestación a oscuras) mientras se extrae el máximo de capacidad analítica del modelo. El Hub incluye ahora receta de construcción inmutable y CI fail-closed.

---

Luis Angel Vazquez Martinez · 2026  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
