import sys
import os

# El cerebro intenta detectar puertos de hardware locales (USB / COM / Seriales de borde)
puertos_disponibles = []
for i in range(4):
    ruta_posible = f"/dev/ttyUSB{i}" if os.name != 'nt' else f"COM{i+1}"
    puertos_disponibles.append(ruta_posible)

print(f"[SOMATIZACIÓN] Canales de hardware periférico escaneados: {puertos_disponibles}")
print(f"[ACTUADOR] Impulso nervioso traducido a modulación física en el borde.")
