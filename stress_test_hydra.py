import time
import threading
import sys
import numpy as np
from pydantic import BaseModel

class StressConfig(BaseModel):
    threads: int = 8
    matrix_size: int = 100

def workload_node(thread_id, results, errors):
    try:
        start_time = time.time()
        for _ in range(100):
            a = np.random.rand(StressConfig().matrix_size, StressConfig().matrix_size)
            b = np.random.rand(StressConfig().matrix_size, StressConfig().matrix_size)
            _ = np.dot(a, b)
        duration = time.time() - start_time
        results.append(duration)
    except Exception as e:
        errors.append(str(e))

def run_maximum_stress():
    print("==================================================")
    print("   INICIANDO PRUEBA DE ESTRÉS: ROMEO-HYDRA        ")
    print("==================================================")
    print(f"[!] Nodo activo en: {sys.executable}")
    print(f"[!] Desplegando {StressConfig().threads} hilos concurrentes...\n")

    results = []
    errors = []
    threads_list = []

    start_global = time.time()

    for i in range(StressConfig().threads):
        t = threading.Thread(target=workload_node, args=(i, results, errors))
        threads_list.append(t)
        t.start()

    for t in threads_list:
        t.join()

    total_time = time.time() - start_global

    print("==================================================")
    print("             RESULTADOS DE LA PRUEBA              ")
    print("==================================================")
    print(f"[+] Hilos ejecutados con éxito: {len(results)}/{StressConfig().threads}")
    print(f"[+] Errores registrados: {len(errors)}")
    print(f"[+] Tiempo total de procesamiento: {total_time:.4f} segundos")
    if len(results) > 0:
        print(f"[+] Promedio por hilo: {np.mean(results):.4f} segundos")
    
    if len(errors) == 0:
        print("\n[RESULTO] ESTADO: CONVEXIDAD MANTENIDA. Éxito rotundo.")
    else:
        print(f"\n[ALERTA] Se detectaron inestabilidades: {errors}")

if __name__ == "__main__":
    run_maximum_stress()
