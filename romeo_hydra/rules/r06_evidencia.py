import json
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone

# Aseguramos que busque el índice en la raíz donde lo generaste
INDICE = Path("indice_omega_v1.jsonl")

def buscar_evidencia(query: str, top_k: int = 3):
    query = query.lower().strip()
    hits = []
    
    if not INDICE.exists():
        return {"regla": "R06_FALLBACK", "error": f"Índice no encontrado en {INDICE}"}

    with open(INDICE, "r", encoding="utf-8") as f:
        for line in f:
            try:
                doc = json.loads(line)
                # Extraemos de la llave correcta: "contenido"
                texto = doc.get("contenido", "").lower()
                
                if query in texto:
                    chunk_hash = doc.get("chunk_hash") or sha256(texto.encode()).hexdigest()[:16]
                    hits.append({
                        "chunk_hash": chunk_hash,
                        "origen": doc.get("doc_id", "conocimiento_trino"), # Llave correcta: doc_id
                        "fragmento": doc.get("contenido", "")[:400],
                        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds")
                    })
                    if len(hits) >= top_k:
                        break
            except Exception:
                continue

    if not hits:
        return {
            "regla": "R06_FALLBACK", 
            "query": query, 
            "huella": sha256(query.encode()).hexdigest()[:16],
            "nota": "No se encontró evidencia inmutable para esta consulta."
        }

    # Sello WORM del dictamen completo
    payload = json.dumps(hits[0], sort_keys=True).encode()
    return {
        "regla": "R06_EVIDENCIA_DOCUMENTAL",
        "query": query,
        "hits": hits,
        "huella": sha256(payload).hexdigest(),
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "nota": "Evidencia WORM - fragmento inmutable extraído del índice omega"
    }

if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "delta ledger"
    print(json.dumps(buscar_evidencia(q), indent=2, ensure_ascii=False))
