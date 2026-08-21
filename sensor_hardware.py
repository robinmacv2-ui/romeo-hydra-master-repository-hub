import sys
import platform
import os

# El cerebro recopila el estado físico real del equipo (Hardware)
sistema = platform.system()
procesador = platform.processor()
nucleos = os.cpu_count()

print(f"[HARDWARE DETECTADO] SO: {sistema} | Procesador: {procesador} | Núcleos lógicos: {nucleos}")
