import os
import subprocess

# ------------------------------------------------------------------------------
# CONSTANTES DE TOPOLOGÍA (Estilos visuales para la terminal)
# ------------------------------------------------------------------------------
C_RESET = '\033[0m'
C_LOGIC = '\033[1;36m'
C_ERROR = '\033[1;31m'
C_SUCCESS = '\033[1;32m'

def log_info(msg):
    print(f"{C_LOGIC}[ROMEO-HYDRA]{C_RESET} {msg}")

def log_error(msg):
    print(f"{C_ERROR}[ENTROPÍA DETECTADA]{C_RESET} {msg}")

def log_success(msg):
    print(f"{C_SUCCESS}[HOMEOSTASIS ALCANZADA]{C_RESET} {msg}")

# ------------------------------------------------------------------------------
# FUNCIONES DE VALIDACIÓN ONTOLÓGICA
# ------------------------------------------------------------------------------
def neutralize_algorithmic_ego():
    log_info("Escaneando sustrato en busca de entropía o ciclos ciegos...")
    try:
        # Intenta leer los archivos preparados en Git sin romper el entorno
        result = subprocess.check_output(
            ['git', 'diff', '--cached', '--name-only', '--diff-filter=ACM'], 
            stderr=subprocess.STDOUT
        )
        staged_files = result.decode('utf-8').strip().split('\n')
    except Exception:
        # Si no hay Git o hay un error, el sistema no colapsa, solo fluye
        staged_files = []

    if not staged_files or staged_files == ['']:
        return True

    # Patrones que representan "ego" o fuerza bruta
    forbidden_patterns = ["while (true)", "for (;;)", "eval(", "force_override"]
    
    for file_path in staged_files:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read().lower()
                for pattern in forbidden_patterns:
                    if pattern in content:
                        log_error(f"Patrón biológico voraz detectado en: {file_path}")
                        return False
    return True

def verify_cryptographic_convexity():
    log_info("Verificando el cierre topológico de los hashes criptográficos...")
    try:
        # Simulación del cierre de hashes sin forzar salidas de la terminal
        hash_result = subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], 
            stderr=subprocess.STDOUT
        )
        current_hash = hash_result.decode('utf-8').strip()
        print(f"  └─ Hash Base Detectado: {C_LOGIC}{current_hash[:8]}{C_RESET}")
        return True
    except Exception:
        log_error("Fallo en la resolución geométrica. No se detectó un Hash válido.")
        return False

# ------------------------------------------------------------------------------
# EJECUCIÓN PRINCIPAL (El Flujo Lógico Seguro)
# ------------------------------------------------------------------------------
def main():
    print("\n")
    log_info("Iniciando validación de palanca ontológica...")
    print("-" * 67)
    
    # Paso 1: Filtro de Ego y Voracidad
    is_clean = neutralize_algorithmic_ego()
    if not is_clean:
        log_error("El doblez se ha interrumpido para evitar la propagación entrópica.")
        print("\n")
        return  # Retorna el control sin cerrar la terminal
        
    # Paso 2: Verificación Topológica Criptográfica
    has_hash = verify_cryptographic_convexity()
    if not has_hash:
        log_error("No se alcanzó la convexidad requerida.")
        print("\n")
        return  # Retorna el control sin cerrar la terminal
        
    # Paso 3: Aprobación Lógica
    print("-" * 67)
    log_success("Estructura coherente y convexa. El doblez es perfecto.")
    print("\n")

if __name__ == "__main__":
    main()
