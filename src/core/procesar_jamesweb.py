import numpy as np
from PIL import Image

def operador_confinamiento_convexo(matriz_estado: np.ndarray, umbral_inferior: float, umbral_superior: float) -> np.ndarray:
    """
    Aplica un operador de confinamiento convexo sobre la matriz de la imagen real,
    restringiendo la energía y la fase a un conjunto convexo delimitado por los axiomas del sistema.
    """
    matriz_confinada = np.clip(matriz_estado, umbral_inferior, umbral_superior)
    
    min_val = np.min(matriz_confinada)
    max_val = np.max(matriz_confinada)
    
    if max_val - min_val > 0:
        matriz_normalizada = (matriz_confinada - min_val) / (max_val - min_val)
    else:
        matriz_normalizada = matriz_confinada

    return matriz_normalizada

def desdoblamiento_logico_omega(matriz_entrada: np.ndarray) -> np.ndarray:
    """
    Ejecuta el desdoblamiento de la información plegada en el ADN matricial 
    del sistema Romeo Centauro A sobre datos reales del telescopio.
    """
    estado_transformado = np.power(matriz_entrada, 1.0 / 2.2)
    return estado_transformado

if __name__ == "__main__":
    ruta_imagen = "jamesweb.romeo.jpg"
    print(f"Iniciando ingesta local de datos espaciales desde: {ruta_imagen}...")
    
    try:
        img = Image.open(ruta_imagen).convert('L')
        matriz_cruda = np.array(img, dtype=np.float32)

        print("Aplicando operadores lógicos ROMEO-HYDRA...")
        matriz_restringida = operador_confinamiento_convexo(matriz_cruda, umbral_inferior=30.0, umbral_superior=220.0)
        render_final = desdoblamiento_logico_omega(matriz_restringida)

        imagen_salida = Image.fromarray((render_final * 255).astype(np.uint8))
        archivo_resultado = "jamesweb_render_omega.jpg"
        imagen_salida.save(archivo_resultado)
        
        print(f"Procesamiento completado con éxito. Render guardado localmente como: {archivo_resultado}")
        
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {ruta_imagen} en el directorio actual.")
