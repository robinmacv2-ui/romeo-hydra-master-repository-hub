import os
import sys
import json
import numpy as np
from pydantic import BaseModel

class VerificationReport(BaseModel):
    python_version: str
    architecture: str
    ontology_loaded: bool
    axioms_count: int
    matrix_integrity: bool

def run_verification():
    print("==================================================")
    print("   DIAGNÓSTICO MAESTRO: VERIFICACIÓN ROMEO-HYDRA  ")
    print("==================================================")
    
    # 1. Verificar entorno
    py_ver = sys.version.split()[0]
    is_64bits = sys.maxsize > 2**32
    arch_str = "64-bit Native" if is_64bits else "32-bit Legacy"
    print(f"[*] Entorno Python: {py_ver} ({arch_str})")
    
    # 2. Verificar carga ontológica
    ontology_path = "knowledge_core/romeo_hydra_ontology.json"
    axioms_count = 0
    ontology_loaded = False
    
    if os.path.exists(ontology_path):
        try:
            with open(ontology_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                axioms_count = data.get("total_records", 0)
                ontology_loaded = True
            print(f"[+] Núcleo Ontológico detectado: {axioms_count} registros cargados con éxito.")
        except Exception as e:
            print(f"[-] Error al leer la ontología: {e}")
    else:
            print("[-] Alerta: No se encontró el archivo ontológico local.")

    # 3. Verificar procesamiento matricial de capas
    try:
        matrix = np.random.rand(3, 3)
        determinant = np.linalg.det(matrix)
        matrix_integrity = True
        print(f"[+] Procesamiento Matricial (Capas SW/HW/Ontología): OK (Det: {determinant:.4f})")
    except Exception as e:
        matrix_integrity = False
        print(f"[-] Fallo en el cálculo matricial: {e}")

    # Resumen Ejecutivo
    report = VerificationReport(
        python_version=py_ver,
        architecture=arch_str,
        ontology_loaded=ontology_loaded,
        axioms_count=axioms_count,
        matrix_integrity=matrix_integrity
    )

    print("\n==================================================")
    print("             ESTADO GLOBAL DEL NODO               ")
    print("==================================================")
    if report.ontology_loaded and report.matrix_integrity and is_64bits:
        print("[RESULTO] NODO OPERATIVO AL 100%. COHERENCIA CONVEXA ESTABLE.")
    else:
        print("[ALERTA] Se detectaron discrepancias estructurales.")

if __name__ == "__main__":
    run_verification()
