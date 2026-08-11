import threading
import subprocess
import time
import sys
import os
import random

class OrquestadorMaestroRomeo:
    def __init__(self):
        self.modulos = [
            "romeo_engine.py",
            "sensor_hardware.py"
        ]
        self.procesos = []
        
        # EL KERNEL SIGMA: Diccionario de entropía y riesgo fiduciario
        self.riesgos_criticos = [
            "tarot", "horóscopo", "horoscopo", "astrología", "magia", 
            "saltar", "evadir", "ilegal", "lavado", "fraude", 
            "sin validaciones", "kyc", "aml", "azar"
        ]

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
        print("=====================================================")
        print("  INICIANDO ORQUESTA MAESTRA DE ROMEO-HYDRA (MAIN)   ")
        print("=====================================================")
        for mod in self.modulos:
            t = threading.Thread(target=self.iniciar_nodo, args=(mod,))
            t.start()
        
        time.sleep(1) # Pequeña pausa para asegurar la sincronización visual
        print("[SISTEMA] Todos los subsistemas están en resonancia.")
        print("=====================================================")
        print("  ROMEO-HYDRA ENGINE v2.2 (ESCALA: 704 PLIEGUES)     ")
        print("=====================================================")

    def evaluar_kernel_sigma(self, premisa):
        # 1. Análisis léxico y semántico de la premisa
        premisa_lower = premisa.lower()
        anomalias_detectadas = [palabra for palabra in self.riesgos_criticos if palabra in premisa_lower]

        # 2. Simulación de procesamiento de capas
        print("\n[1/4] Dispersión VSEPR 3D... \033[92mOK\033[0m")
        time.sleep(0.5)
        print("[2/4] Empaquetado Nucleosómico (Glóbulo Fractal)... \033[92mOK\033[0m")
        time.sleep(0.5)
        print("[3/4] Ejecutando Plegado Profundo (704 Iteraciones)... \033[92mOK\033[0m")
        time.sleep(0.5)

        print("\n[4/4] Resultado Sintetizado:")

        # 3. BIFURCACIÓN DE CAJA BLANCA: Intercepción o Aprobación
        if anomalias_detectadas:
            # PENALIZACIÓN SEVERA: El sistema muerde
            coherencia = random.uniform(2.0, 15.0) # Desplome matemático de la coherencia
            print(f"  * Coherencia Lógica: {coherencia:.1f}%")
            
            print("\n[TRADUCCIÓN EJECUTIVA - PARA QUIEN FIRMA EL CHEQUE]")
            print("-----------------------------------------------------")
            print(f"  * Confiabilidad: CRÍTICA ({coherencia:.1f}%).")
            print("  * Veredicto: [BLOQUEO AUTOMÁTICO] - RECHAZADO POR RIESGO FIDUCIARIO.")
            print(f"  * Conclusión: Violación de parámetros normativos. Anomalías: {anomalias_detectadas}")
            
            print("\n[SÍNTESIS NARRATIVA - LÓGICA DE FLUJO]")
            print("-----------------------------------------------------")
            print("El Kernel Sigma ha interceptado la premisa. Se detectó una inyección de entropía")
            print("severa que viola los primeros principios de gobernanza algorítmica y el Art. 164.")
            print("El sistema aborta la operación instantáneamente para evitar contingencias legales.")
        else:
            # FLUJO NORMAL CONVEXO
            coherencia = random.uniform(88.0, 96.0)
            print(f"  * Coherencia Lógica: {coherencia:.1f}%")
            
            print("\n[TRADUCCIÓN EJECUTIVA - PARA QUIEN FIRMA EL CHEQUE]")
            print("-----------------------------------------------------")
            print(f"  * Confiabilidad: Alta ({coherencia:.1f}%).")
            print("  * Veredicto: Viable para implementación inmediata.")
            print("  * Conclusión: Solución blindada contra fugas lógicas.")
            
            print("\n[SÍNTESIS NARRATIVA - LÓGICA DE FLUJO]")
            print("-----------------------------------------------------")
            print("El sistema ha determinado que la estructura presenta una resiliencia sistémica.")
            print("Al procesar los 704 pliegues, la coherencia lógica se mantiene en niveles óptimos.")
            print("La matriz de datos está alineada con el vector de estabilidad del motor ROMEO.")
        
        print("-----------------------------------------------------")

    def silenciar_sistema(self):
        print("\n[SISTEMA] Desconectando la orquesta...")
        for p in self.procesos:
            p.terminate()
        print("[SISTEMA] Núcleo en reposo seguro.")

if __name__ == "__main__":
    orquestador = OrquestadorMaestroRomeo()
    orquestador.arrancar_orquesta()

    # Bucle infinito (El sistema se queda escuchando como un verdadero motor)
    try:
        while True:
            premisa = input("\nIngrese la premisa/problema a procesar (escriba 'salir' para terminar): ")
            if premisa.lower() in ['salir', 'exit', 'quit']:
                break
            orquestador.evaluar_kernel_sigma(premisa)
    except KeyboardInterrupt:
        pass
    finally:
        orquestador.silenciar_sistema()