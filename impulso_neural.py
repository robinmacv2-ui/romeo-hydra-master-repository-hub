import sys
import time

nodo = sys.argv[1] if len(sys.argv) > 1 else "CEREBRO_PRIMARIO"
time.sleep(0.2)

# El impulso fluye por el canal ortogonal puro
print(f"[NEURONA ACTIVA] >> Nodo {nodo}: Conexión sináptica establecida. Canales ortogonales abiertos.")
