import threading
import subprocess
import time
import sys
import os

class OrquestadorMaestroRomeo:
    def __init__(self):
        self.modulos = [
            "romeo_engine.py",
            "sensor_hardware.py"
        ]
        self.procesos = []

    def iniciar_nodo(self, modulo):
        if not os.path.exists(modulo):
            print(f"[ADVERTENCIA] El módulo {modulo} no se encuentra de forma local.")
            return
        print(f"[NÚCLEO] Desplegando nodo soberano: {modulo}")
        try:
            p = subprocess.Popen([sys.executable, modulo])
            self.procesos.append(p)
        except Exception as e:
            print(f"[ERROR] Fallo al sincronizar {modulo}: {e}")

    def arrancar_orquesta(self):
        print("==================================================")
        print("  INICIANDO ORQUESTA MAESTRA DE ROMEO-HYDRA (MAIN)")
        print("==================================================")
        for mod in self.modulos:
            t = threading.Thread(target=self.iniciar_nodo, args=(mod,))
            t.start()
        print("[SISTEMA] Todos los subsistemas están en resonancia.")

    def silenciar_sistema(self):
        print("\n[SISTEMA] Desconectando la orquesta...")
        for p in self.procesos:
            p.terminate()
        print("[SISTEMA] Núcleo en reposo seguro.")

if __name__ == '__main__':
    orquestador = OrquestadorMaestroRomeo()
    orquestador.arrancar_orquesta()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        orquestador.silenciar_sistema()
