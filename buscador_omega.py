#!/usr/bin/env python3
"""
ROMEO-HYDRA - Buscador Omega (Cerebro Trino)
Motor de búsqueda iterativo y local. Escanea la memoria WORM
en texto plano y devuelve el contexto exacto sin fricción.
"""

import os
import sys
import re
from pathlib import Path

def buscar_en_memoria(query: str, directorio: Path) -> None:
    if not directorio.exists():
        print(f"[!] El tejido de memoria '{directorio.name}' no existe.")
        return

    archivos = list(directorio.glob("*.txt"))
    print(f"=== BUSCADOR OMEGA ACTIVADO ===")
    print(f"Escaneando {len(archivos)} sinapsis en busca de: '{query}'\n")

    resultados_totales = 0
    query_lower = query.lower()

    for archivo in archivos:
        try:
            # Lectura convexa: UTF-8 estricto
            contenido = archivo.read_text(encoding="utf-8").lower()
            
            if query_lower in contenido:
                resultados_totales += 1
                print(f"[+] CONEXIÓN ENCONTRADA: {archivo.name}")
                
                # Extraer coordenadas (índices) de la coincidencia
                coincidencias = [m.start() for m in re.finditer(re.escape(query_lower), contenido)]
                
                # Mostrar hasta 3 fragmentos de contexto para no saturar la terminal
                for m in coincidencias[:3]:
                    inicio = max(0, m - 60)
                    fin = min(len(contenido), m + len(query) + 60)
                    
                    # Limpiamos saltos de línea para mostrar un bloque limpio
                    snippet = contenido[inicio:fin].replace('\n', ' ').strip()
                    
                    # Resaltar visualmente la palabra clave con corchetes
                    snippet_resaltado = re.sub(
                        re.escape(query_lower), 
                        f">>> {query.upper()} <<<", 
                        snippet, 
                        flags=re.IGNORECASE
                    )
                    
                    print(f"    ...{snippet_resaltado}...")
                
                if len(coincidencias) > 3:
                    print(f"    [y {len(coincidencias) - 3} impactos más en este nodo...]")
                print("-" * 70)

        except Exception as e:
            print(f"[!] Fricción al leer {archivo.name}: {e}")

    print(f"=============================================")
    print(f"Búsqueda finalizada: Impreso en {resultados_totales} documentos.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python buscador_omega.py \"termino de busqueda\"")
        sys.exit(1)
    
    termino = sys.argv[1]
    # Apuntamos directo a la digestión previa
    directorio_conocimiento = Path.cwd() / "conocimiento_trino"
    buscar_en_memoria(termino, directorio_conocimiento)
