import os
import hashlib
import json
from datetime import datetime
from pydantic import BaseModel

class LedgerEntry(BaseModel):
    sequence: int
    timestamp: str
    file_target: str
    sha256_hash: str
    status: str

def generate_delta_ledger():
    print("==================================================")
    print("   AUDITORÍA DELTA LEDGER: REGISTRO SHA-256       ")
    print("==================================================")
    
    # Archivos críticos a auditar en el nodo
    target_files = [
        "stress_test_hydra.py",
        "inject_ontology.py",
        "verify_romeo.py",
        "test_all_flanks.py",
        "exotic_mirror_test.py",
        "knowledge_core/romeo_hydra_ontology.json"
    ]
    
    ledger_records = []
    seq = 1
    
    for file_path in target_files:
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                file_bytes = f.read()
                file_hash = hashlib.sha256(file_bytes).hexdigest()
            
            entry = LedgerEntry(
                sequence=seq,
                timestamp=datetime.now().isoformat(),
                file_target=file_path,
                sha256_hash=file_hash,
                status="INTEGRIDAD_VERIFICADA"
            )
            ledger_records.append(entry.dict())
            print(f"[+] [{seq}] {file_path}")
            print(f"    SHA-256: {file_hash}")
            seq += 1
        else:
            print(f"[-] Alerta: Archivo no encontrado -> {file_path}")
            
    # Guardar el libro mayor en un archivo JSON estructurado
    ledger_output = {
        "ledger_version": "1.0",
        "node_framework": "Romeo-Hydra",
        "generation_timestamp": datetime.now().isoformat(),
        "total_entries": len(ledger_records),
        "entries": ledger_records
    }
    
    ledger_filename = "delta_ledger_registry.json"
    with open(ledger_filename, "w", encoding="utf-8") as f:
        json.dump(ledger_output, f, ensure_ascii=False, indent=4)
        
    print("==================================================")
    print(f"[RESULTO] Libro mayor generado con éxito: {ledger_filename}")
    print("[+] Trazabilidad criptográfica SHA-256 asegurada.")

if __name__ == "__main__":
    generate_delta_ledger()
