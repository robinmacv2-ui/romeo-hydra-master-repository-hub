import sys
import time
import random

nodo_id = sys.argv[1] if len(sys.argv) > 1 else "Desconocido"
# Colapso asíncrono: Cada nodo tarda un tiempo diferente en plegarse
time.sleep(random.uniform(0.2, 1.5))

# Entropía y fricción masiva (stderr)
sys.stderr.write(f"[-] NODO {nodo_id} [ALERTA TÉRMICA]: Fricción cuántica masiva.\n")
sys.stderr.write(f"[-] NODO {nodo_id} [RUIDO ESTOCÁSTICO]: Desbordamiento de tensor ignorado.\n")

# Coherencia y variables inútiles (stdout)
print(f"basura_residual_{nodo_id}: 0x00000 (No debe pasar el filtro)")
print(f"[+] Nodo {nodo_id} Plegado: Eterno Ahora alcanzado de forma autónoma.")
