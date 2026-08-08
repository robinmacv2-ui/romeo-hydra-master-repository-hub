import sys
import time
import random

nodo_id = sys.argv[1] if len(sys.argv) > 1 else "000"
# Este es el gradiente químico/matemático que recibe del entorno
presion_morfogenetica = int(sys.argv[2]) if len(sys.argv) > 2 else 0

time.sleep(random.uniform(0.1, 0.8)) # Asincronía natural

# La célula no piensa, evalúa la gravedad de su entorno local
if presion_morfogenetica >= 80:
    organo = "NÚCLEO CEREBRAL (Procesamiento Central)"
elif presion_morfogenetica >= 40:
    organo = "NÚCLEO CARDÍACO (Bombeo de Datos)"
else:
    organo = "TERMINAL SENSORIAL (Receptor de Borde)"

# Generamos ruido estocástico natural por el esfuerzo de plegamiento (al stderr)
sys.stderr.write(f"[-] NODO {nodo_id} [Fricción de Plegamiento]: Tensión al {presion_morfogenetica}%\n")

# Emitimos la coherencia diferenciada por el canal ortogonal (al stdout)
print(f"[+] Nodo {nodo_id} asimilado por el entorno: {organo} [Gradiente: {presion_morfogenetica}%]")
