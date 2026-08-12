import os
import glob
import zipfile
from pathlib import Path

TARGET_PATH = r"C:\Users\robin\OneDrive\Desktop\SISTEMA_OPERATIVO_PPRH"
EXTRACCION_ZIP_DIR = os.path.join(TARGET_PATH, "_extracted_zips")

def descomprimir_paquetes(ruta_base):
    print("[*] Verificando paquetes ZIP para desdoblamiento...")
    archivos_zip = glob.glob(os.path.join(ruta_base, "**", "*.zip"), recursive=True)
    
    os.makedirs(EXTRACCION_ZIP_DIR, exist_ok=True)
    
    for archivo_zip in archivos_zip:
        try:
            with zipfile.ZipFile(archivo_zip, 'r') as zf:
                nombre_zip = Path(archivo_zip).stem
                destino_extraido = os.path.join(EXTRACCION_ZIP_DIR, nombre_zip)
                zf.extractall(destino_extraido)
                print(f"[+] Descomprimido y expandido en ADN local: {Path(archivo_zip).name}")
        except Exception as e:
            print(f"[-] Error al descomprimir {archivo_zip}: {e}")

def asimilar_dosieres(ruta_base):
    # Primero extraemos los zip encontrados
    descomprimir_paquetes(ruta_base)
    
    print(f"\n[*] Iniciando lectura profunda de contenido en: {ruta_base}")
    
    # Buscamos todos los archivos incluyendo los extraídos
    patrones = ["*.txt", "*.md"] # Extensiones de lectura directa segura en este nivel
    archivos_encontrados = []
    
    for patron in patrones:
        archivos_encontrados.extend(glob.glob(os.path.join(ruta_base, "**", patron), recursive=True))
    
    dosieres_asimilados = {}
    
    for archivo in archivos_encontrados:
        # Evitar leer dentro de la carpeta de respaldo de extracción para no duplicar ciclos
        if "_extracted_zips" in archivo and ruta_base not in archivo:
            continue
            
        categoria = Path(archivo).parent.name
        if categoria not in dosieres_asimilados:
            dosieres_asimilados[categoria] = []
            
        try:
            with open(archivo, "r", encoding="utf-8", errors="ignore") as f:
                contenido = f.read()
                
            # Verificación de lectura de contenido real (Payload)
            if len(contenido.strip()) == 0:
                print(f"[!] Advertencia: El archivo {Path(archivo).name} está vacío o no se pudo parsear texto.")
                continue

            dosier_item = {
                "source_file": Path(archivo).name,
                "path": archivo,
                "payload_length": len(contenido),
                "content_sample": contenido[:150].replace("\n", " "), # Muestra del contenido leído
                "status": "ASIMILADO_CON_EXITO"
            }
            
            dosieres_asimilados[categoria].append(dosier_item)
            print(f"[OK] Leídos {len(contenido)} caracteres de: {Path(archivo).name}")
            
        except Exception as e:
            print(f"[-] Error de lectura en {archivo}: {e}")
            
    return dosieres_asimilados

if __name__ == "__main__":
    repositorio = asimilar_dosieres(TARGET_PATH)
    print(f"\n[V] Ciclo de asimilación convexa finalizado. Categorías procesadas: {list(repositorio.keys())}")