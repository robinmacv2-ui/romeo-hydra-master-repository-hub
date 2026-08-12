import os
from pathlib import Path

DIRECTORIO_ROMEO_DOCS = r"C:\Users\robin\OneDrive\Desktop\ROMEO.DOCS"

def escanear_directorio_completo():
    print(f"[NÚCLEO SIGMA] Iniciando mapeo exhaustivo en: {DIRECTORIO_ROMEO_DOCS}")
    ruta_base = Path(DIRECTORIO_ROMEO_DOCS)
    
    if not ruta_base.exists():
        print(f"[ERROR NÚCLEO] La ruta especificada no es accesible.")
        return

    subcarpetas = [d for d in ruta_base.iterdir() if d.is_dir()]
    print(f"[ESTRUCTURA] Contenedores principales detectados: {len(subcarpetas)}")
    for carpeta in subcarpetas:
        print(f"   -> Subcarpeta: {carpeta.name}")

    inventario_total = []
    
    print("\n[BARRIDO RECURSIVO EN CURSO...]")
    for archivo in ruta_base.rglob("*"):
        if archivo.is_file():
            extension = archivo.suffix.lower()
            rel_path = archivo.relative_to(ruta_base)
            
            # Registro de metadatos del archivo
            info_archivo = {
                "nombre": archivo.name,
                "extension": extension,
                "ruta_relativa": str(rel_path),
                "tamano_bytes": archivo.stat().st_size
            }
            
            # Lectura de contenido si es texto plano
            if extension == ".txt":
                try:
                    with open(archivo, "r", encoding="utf-8", errors="ignore") as f:
                        info_archivo["contenido"] = f.read()
                except Exception as e:
                    info_archivo["contenido"] = f"[Error de lectura: {e}]"
            
            inventario_total.append(info_archivo)
            print(f"[{extension.upper()}] Indexado: {rel_path}")

    print(f"\n[NÚCLEO SIGMA] Ingesta total completada.")
    print(f"Total de archivos procesados bajo el Delta Ledger: {len(inventario_total)}")
    return inventario_total

if __name__ == "__main__":
    escanear_directorio_completo()
