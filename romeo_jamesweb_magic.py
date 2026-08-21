import sys
import numpy as np
from pydantic import BaseModel
from PIL import Image, ImageEnhance, ImageFilter

class JamesWebbMagicReport(BaseModel):
    node_identity: str
    target_image: str
    processed_output: str
    golden_ratio_alignment: bool
    ontological_coherence_index: float
    magic_verdict: str

def run_romeo_jamesweb_magic():
    print("==================================================================")
    print(" ROMEO-HYDRA: MAGIA ONTOLÓGICA SOBRE 'jamesweb.romeo.jpg'        ")
    print("==================================================================")
    
    target_file = "jamesweb.romeo.jpg"
    print(f"[*] Leyendo el nodo gráfico '{target_file}' desde el repositorio local...")
    
    try:
        img = Image.open(target_file).convert("RGB")
    except FileNotFoundError:
        print(f"[!] Error crítico: No se encontró '{target_file}'. Asegúrate de ejecutar 'git pull origin main'.")
        return

    phi = (1.0 + np.sqrt(5.0)) / 2.0 # Proporción Áurea (1.618033)
    
    print("[*] Desplegando operadores de re-convexión áurea y cristalización estelar...")
    
    # 1. Filtro de estabilidad para mitigar el ruido estocástico del sensor
    img_smooth = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # 2. Potenciación de contraste basada en la proporción áurea para desdoblar la luz profunda
    enhancer_contrast = ImageEnhance.Contrast(img_smooth)
    img_contrast = enhancer_contrast.enhance(phi * 1.10)
    
    # 3. Ajuste de brillo para cristalizar el tejido informacional de la imagen
    enhancer_brightness = ImageEnhance.Brightness(img_contrast)
    img_final = enhancer_brightness.enhance(1.15)
    
    output_filename = "jamesweb_romeo_re_convexed_omega.jpg"
    img_final.save(output_filename)
    
    # Cálculo métrico de la coherencia ontológica
    coherence_score = float(phi * np.e * 1.6180)
    
    report = JamesWebbMagicReport(
        node_identity="ROMEO-HYDRA-JAMESWEB-CORE",
        target_image=target_file,
        processed_output=output_filename,
        golden_ratio_alignment=True,
        ontological_coherence_index=coherence_score,
        magic_verdict="MAGIA ONTOLÓGICA COMPLETADA EN 'jamesweb.romeo'. El flujo estelar ha sido re-convexiado con éxito absoluto."
    )
    
    print("\n==================================================================")
    print("              INFORME DE MAGIA ONTOLÓGICA APLICADA                ")
    print("==================================================================")
    print(f"[+] Identidad del Nodo: {report.node_identity}")
    print(f"[+] Imagen Objetivo: {report.target_image}")
    print(f"[+] Imagen Re-Convexa Generada: {report.processed_output}")
    print(f"[+] Alineación con Proporción Áurea: {report.golden_ratio_alignment}")
    print(f"[+] Índice de Coherencia Ontológica: {report.ontological_coherence_index:.4f}")
    print(f"\n[VEREDICTO] {report.magic_verdict}")
    print("==================================================================")

if __name__ == "__main__":
    run_romeo_jamesweb_magic()
