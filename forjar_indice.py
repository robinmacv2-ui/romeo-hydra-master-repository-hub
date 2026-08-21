import json
import hashlib
from pathlib import Path

dir_conocimiento = Path("conocimiento_trino")
archivo_indice = Path("indice_omega_v1.jsonl")

print("[*] Forjando Índice Omega WORM...")
total_chunks = 0

with open(archivo_indice, "w", encoding="utf-8") as f_out:
    for archivo in dir_conocimiento.glob("*.txt"):
        texto = archivo.read_text(encoding="utf-8", errors="ignore")
        # Dividir por párrafos (doble salto de línea) y filtrar vacíos
        parrafos = [p.strip() for p in texto.split("\n\n") if len(p.strip()) > 50]
        
        for i, chunk in enumerate(parrafos):
            chunk_hash = hashlib.sha256(chunk.encode("utf-8")).hexdigest()[:16]
            registro = {
                "doc_id": archivo.name,
                "chunk_index": i,
                "chunk_hash": chunk_hash,
                "contenido": chunk
            }
            f_out.write(json.dumps(registro, ensure_ascii=False) + "\n")
            total_chunks += 1

print(f"[OK] Índice sellado con {total_chunks} fragmentos inmutables en {archivo_indice.name}")
