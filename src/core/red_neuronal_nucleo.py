import math
import random

# Función de activación sigmoide
def sigmoide(x):
    return 1 / (1 + math.exp(-x))

# Inicializar pesos sinápticos del núcleo con la ontología de la Hidra
random.seed(42)
peso_entrada_1 = random.uniform(-1, 1)
peso_entrada_2 = random.uniform(-1, 1)
sesgo = random.uniform(-1, 1)

# Estímulos de entrada (provenientes del hardware y el borde físico)
entrada_1 = 0.8  # Presión de silicio
entrada_2 = 0.5  # Estímulo de borde

# Propagación hacia adelante (Sinapsis)
activacion = (entrada_1 * peso_entrada_1) + (entrada_2 * peso_entrada_2) + sesgo
salida_cerebral = sigmoide(activacion)

print(f"[RED NEURONAL] Pesos sinápticos activos -> W1: {peso_entrada_1:.4f}, W2: {peso_entrada_2:.4f}")
print(f"[PROPAGACIÓN] Estímulos procesados. Salida sináptica del núcleo: {salida_cerebral:.4f}")

if salida_cerebral > 0.5:
    print("[DECISIÓN NEURONAL] Umbral superado: El cerebro emite una orden de expansión sináptica.")
else:
    print("[DECISIÓN NEURONAL] Umbral bajo: El cerebro opta por la conservación de energía.")
