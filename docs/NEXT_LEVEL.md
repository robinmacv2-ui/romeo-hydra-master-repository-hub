# Siguiente nivel ROMEO-HYDRA — ciberseguridad de mercado, riesgo, energia

Autor: Luis Angel Vazquez Martinez

## Principio

No pretendemos ser el matching engine de una bolsa ni un SOC de grado militar.  
Si atacamos tres problemas donde el nucleo offline + cripto ya ayuda y es **ejecutable**.

---

## 1. Ciberseguridad orientada a mercados (integridad, no vigilancia total)

**Dolor real:** manipular o alterar el historial de ordenes / evidencia post-trade.  
**Respuesta ROMEO (v0.1.2+):**

- Ledger de eventos sinteticos encadenado con **SHA-256**
- **Sello RSA** del tip del ledger
- Paquete de evidencia exportable (`pilot/run_market_integrity_audit.py`)

**No es:** conexion a BMV/NYSE, deteccion de spoofing en tiempo real, colocation.

**Si es:** patron de integridad y no repudiacion reproducible offline — base para auditores y para un piloto con un intermediario.

```bash
python -m pilot.run_market_integrity_audit --symbol DEMO --n 30
```

---

## 2. Mitigacion de riesgo por no exposicion

**Dolor:** el agregador de riesgo ve todas las posiciones en claro.  
**Respuesta:** suma homomorfica aditiva (Paillier) de exposiciones.

```python
from romeo_hydra.risk import aggregate_exposures_private
print(aggregate_exposures_private([10, 20, 5]))
```

El agregador opera ciphertexts; el total en claro solo con clave privada.  
Mitiga fugas de inventory / posicion. **No** reemplaza motores VaR/FRTB de produccion.

Camino siguiente: mayores primos Paillier o slot TFHE/HElib nativo para reglas mas ricas.

---

## 3. Energia y huella de carbono (argumento de producto)

**Dolor:** FHE/analytics en cloud = instancias siempre encendidas.  
**Respuesta:** computo **edge bajo demanda** + modelo proxy kWh / CO2e.

```python
from romeo_hydra.metrics import estimate_run, compare_edge_vs_cloud_proxy
print(compare_edge_vs_cloud_proxy(edge_duration_s=2.5))
```

El piloto de mercado ya adjunta `energy` y comparacion vs 1h de VM proxy.  
Es modelo de orden de magnitud (no ISO 14064). Sirve para decir con numeros:
**burst local vs idle cloud**.

---

## 4. Roadmap corto (30-60 dias) sin humo

| Prioridad | Entrega | Por que |
|-----------|---------|---------|
| P0 | 1 LOI piloto (SOFIPO o intermediario) | Valor comercial |
| P1 | Usar `run_market_integrity_audit` en demos FIAB | Ciber + mercado |
| P1 | Reportar energy ratio en pitch (con disclaimer) | ESG / costo |
| P2 | Paillier con primos mayores o backend nativo TFHE | Mas capacidad HE |
| P2 | Firma RSA detached (private key fuera del paquete) | Operacion real |
| P3 | Conectar a datos de un solo cliente bajo NDA | Validacion |

---

## 5. Frases seguras

**Tecnico:**  
> Demostramos integridad de secuencia, sello RSA, agregacion HE aditiva y proxy energetico edge. TFHE/HElib full siguen el slot nativo.

**Negocio:**  
> Menos datos en claro en el agregador, evidencia auditable offline, y un argumento cuantificado de energia frente a siempre-encendido en cloud.

---

Luis Angel Vazquez Martinez
