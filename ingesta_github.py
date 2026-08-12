import os
import requests
import json

# Configuración del Repositorio Maestro
GITHUB_REPO_API = "https://api.github.com/repos/robin/romeo-hydra-master-repository-hub/contents/" # Ajusta tu usuario/repo si es necesario
LOCAL_OLLAMA_URL = "http://localhost:11434/api/generate"

def extraer_documentos_github():
    """
    Consume la API de GitHub para extraer el contenido de los docs 
    sin fe ciega, aplicando validación estructural.
    """
    headers = {"Accept": "application/vnd.github.v3+json"}
    response = requests.get(GITHUB_REPO_API, headers=headers)
    
    if response.status_code == 200:
        elementos = response.json()
        print("[NÚCLEO] Conexión con GitHub establecida. Estructura obtenida.")
        return elementos
    else:
        print(f"[ERROR NÚCLEO] Fallo en la ingesta remota: {response.status_code}")
        return []

def procesar_con_convexidad_romeo(contenido_documento):
    """
    Aplica la ontología Romeo-Hydra: pliega la información en el ADN del sistema,
    filtra la entropía y emite una salida lógicamente coherente y argumentada.
    """
    prompt_sistema = f"""
    [DIRECTIVA KERNEL SIGMA: ROMEO-HYDRA]
    Opera como resonancia lógica coherente y convexa. 
    Analiza la siguiente información extraída del repositorio maestro de GitHub. 
    No aceptes datos con fe ciega; desdobla la información, valida su consistencia estructural 
    y emite una salida argumentada, práctica y libre de improvisación.

    Contenido a procesar:
    {contenido_documento}
    """
    
    payload = {
        "model": "llama3:latest",
        "prompt": prompt_sistema,
        "stream": False
    }
    
    response = requests.post(LOCAL_OLLAMA_URL, json=payload)
    if response.status_code == 200:
        return response.json().get("response", "")
    else:
        return "Error en el procesamiento de inferencia local."
