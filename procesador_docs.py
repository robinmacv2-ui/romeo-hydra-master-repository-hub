#!/usr/bin/env python3
"""
ROMEO-HYDRA - Motor Digestivo de Documentos
Extrae texto crudo de contenedores binarios (DOCX/PDF) y los normaliza
en texto plano UTF-8 puro para la asimilación del Cerebro Trino.
"""

import os
import sys
from pathlib import Path

try:
    import pypdf
    import docx
except ImportError:
    print("[ERROR] Faltan las enzimas. Ejecuta: pip install pypdf python-docx")
    sys.exit(1)

def extraer_docx(ruta: Path) -> str:
    """Extrae párrafos de un archivo Word de forma secuencial."""
    try:
        doc = docx.Document(ruta)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    except Exception as e:
        return f"[ERROR_EXTRACCION_DOCX] {str(e)}"

def extraer_pdf(ruta: Path) -> str:
    """Extrae texto de un archivo PDF página por página."""
    texto = []
    try:
        with open(ruta, "rb") as f:
            lector = pypdf.PdfReader(f)
            for pagina in lector.pages:
                extraido = pagina.extract_text()
                if extraido:
                    texto.append(extraido)
        return "\n".join(texto)
    except Exception as e:
        return f"[ERROR_EXTRACCION_PDF] {str(e)}"

def procesar_biblioteca(directorio_origen: Path, directorio_destino: Path) -> None:
    """Itera sobre la biblioteca y convierte todo a texto plano .txt"""
    if not directorio_origen.exists():
        print(f"[-] El directorio de origen '{directorio_origen}' no existe.")
        return

    directorio_destino.mkdir(parents=True, exist_ok=True)
    
    archivos = [a for a in directorio_origen.rglob("*") if a.is_file() and a.suffix.lower() in ['.docx', '.pdf']]
    total = len(archivos)
    
    print(f"=== INICIANDO METABOLISMO DE DATOS ===")
    print(f"Archivos detectados: {total}")
    
    procesados = 0
    errores = 0

    for archivo in archivos:
        nombre_salida = archivo.stem + ".txt"
        ruta_salida = directorio_destino / nombre_salida
        
        # Evitar re-procesar si ya existe (Eficiencia convexa)
        if ruta_salida.exists():
            procesados += 1
            continue

        contenido = ""
        if archivo.suffix.lower() == '.docx':
            contenido = extraer_docx(archivo)
        elif archivo.suffix.lower() == '.pdf':
            contenido = extraer_pdf(archivo)

        if "[ERROR_" in contenido:
            print(f"[Fallo] {archivo.name} -> {contenido}")
            errores += 1
        else:
            # Escribir atómicamente en UTF-8
            ruta_salida.write_text(contenido, encoding="utf-8", errors="ignore")
            procesados += 1
            print(f"[OK] {archivo.name} -> Asimilado")

    print(f"=======================================")
    print(f"Digestión completada: {procesados}/{total} procesados. {errores} errores.")

if __name__ == "__main__":
    # Configurar rutas (Ajusta 'biblioteca_cruda' al nombre real de tu carpeta de Zips extraídos)
    origen = Path("C:/Users/robin/OneDrive/Desktop/ROMEO.DOCS") 
    destino = Path.cwd() / "conocimiento_trino"
    
    # Crea la carpeta de origen si no existe para que el usuario pueda meter sus archivos
    origen.mkdir(exist_ok=True)
    
    procesar_biblioteca(origen, destino)
