#!/usr/bin/env python3
"""
ROMEO-HYDRA :: PURGADOR DE CREDENCIALES
Escanea y destruye patrones de llaves API (Google, GCP, tokens) en el conocimiento trino.
"""

import re
from pathlib import Path

# Patrones estrictos para detectar credenciales (ej. AIza..., secrets, bearer tokens)
PATRONES_SECRETOS = [
    re.compile(r'AIza[0-9A-Za-z-_]{35}'),  # Google API Keys estándar
    re.compile(r'ya29\.[0-9A-Za-z-_]+'),    # Google OAuth Access Tokens
    re.compile(r'-----BEGIN PRIVATE KEY-----.*?-----END PRIVATE KEY-----', re.DOTALL), # Llaves RSA/PEM
]

def purgar_directorio(directorio: Path) -> None:
    print(f"[*] Iniciando purga de credenciales en: {directorio}")
    archivos = list(directorio.glob("*.txt"))
    modificados = 0

    for archivo in archivos:
        contenido = archivo.read_text(encoding="utf-8", errors="ignore")
        nuevo_contenido = contenido
        encontrado = False

        for patron in PATRONES_SECRETOS:
            if patron.search(nuevo_contenido):
                nuevo_contenido = patron.sub("[SECRETO_PURGADO]", nuevo_contenido)
                encontrado = True

        if encontrado:
            archivo.write_text(nuevo_contenido, encoding="utf-8")
            print(f"  [PURGADO] Credencial eliminada en: {archivo.name}")
            modificados += 1

    print(f"[OK] Purga completa. {modificados} archivos limpiados de entropía de seguridad.")

if __name__ == "__main__":
    dir_conocimiento = Path("conocimiento_trino")
    if dir_conocimiento.exists():
        purgar_directorio(dir_conocimiento)
    else:
        print("[FATAL] Directorio conocimiento_trino no encontrado.")
