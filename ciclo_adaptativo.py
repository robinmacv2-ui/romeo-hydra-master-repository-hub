import sys
import random

# Simulamos una lectura de estímulo del entorno físico de borde
estimulo_externo = random.choice([0, 1]) # 0 = Estabilidad, 1 = Perturbación/Fricción

print(f"[ESTÍMULO EXTERNO] Señal recibida en los canales de borde: {estimulo_externo}")

if estimulo_externo == 1:
    print("[ADAPTACIÓN DEL NÚCLEO] Fricción detectada. Reconfigurando pesos sinápticos y optimizando rutas lógicas.")
else:
    print("[ADAPTACIÓN DEL NÚCLEO] Estado estacionario. Manteniendo homeostasis en el tejido actual.")
