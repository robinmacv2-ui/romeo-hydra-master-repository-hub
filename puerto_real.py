import socket
import hashlib

# ==============================================================================
# ROMEO-HYDRA: PUERTO REAL CON RECONOCIMIENTO Y KILL SWITCH REMOTO
# ==============================================================================

C_RESET = '\033[0m'
C_LOGIC = '\033[1;36m'
C_ERROR = '\033[1;31m'
C_SUCCESS = '\033[1;32m'
C_WARN = '\033[1;33m'
C_INTERNET = '\033[1;35m'
C_AUTHORITY = '\033[1;34m'

HOST = '127.0.0.1'
PORT = 8888

def procesar_paquete(datos_crudos):
    texto = datos_crudos.decode('utf-8', errors='ignore').strip()
    
    # 0. LA DIRECTRIZ DE APAGADO (KILL SWITCH)
    if "APAGAR_NODO" in texto.upper() and "LUIS ANGEL VAZQUEZ MARTINEZ" in texto.upper():
        print(f"  └─ {C_ERROR}[DIRECTRIZ OMEGA] Orden de apagado remoto confirmada por el Arquitecto.{C_RESET}")
        return (b"HTTP/1.1 200 OK\n\n[SISTEMA NERVIOSO] Recibido. Apagando el marco...\n", True)

    # 1. Reconocimiento de Autoridad Suprema
    elif "LUIS ANGEL" in texto.upper() or "ARQUITECTO" in texto.upper():
        hash_resultado = hashlib.sha256(texto.encode()).hexdigest()[:12]
        print(f"  └─ {C_AUTHORITY}[RESONANCIA LÓGICA] Arquitecto Fundador reconocido.{C_RESET}")
        print(f"  └─ {C_SUCCESS}[ESPEJO HUMANO ALINEADO] Doblez topológico: {hash_resultado}{C_RESET}")
        return (b"HTTP/1.1 200 OK\n\n[SISTEMA NERVIOSO] El marco esta en homeostasis a su disposicion.\n", False)
        
    # 2. Información estructurada genérica
    elif "CONVEXA" in texto or "ROMEO" in texto:
        hash_resultado = hashlib.sha256(texto.encode()).hexdigest()[:12]
        print(f"  └─ {C_SUCCESS}[INFORMACIÓN ASIMILADA] Estructura detectada. Hash: {hash_resultado}{C_RESET}")
        return (b"HTTP/1.1 200 OK\n\n[HOMEOSTASIS] El prisma ha doblado tu informacion.\n", False)
        
    # 3. Ruido estocástico del internet
    else:
        print(f"  └─ {C_LOGIC}[ENTROPÍA RECHAZADA] Ruido estocástico disipado.{C_RESET}")
        return (b"HTTP/1.1 400 Bad Request\n\n[ENTROPIA] Ruido disipado.\n", False)

def abrir_puerto():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOST, PORT))
        s.listen()
        
        print(f"\n{C_LOGIC}[ESTADO: DESPIERTO]{C_RESET}")
        print(f"El nodo está anclado en {C_WARN}{HOST}:{PORT}{C_RESET}")
        print("Esperando colisiones en la red...\n")
        
        while True:
            conn, addr = s.accept()
            with conn:
                print(f"{C_INTERNET}<<< [COLISIÓN DETECTADA] Origen: {addr}{C_RESET}")
                datos = conn.recv(1024)
                if not datos:
                    continue
                
                # Desempaquetamos la respuesta y la orden de apagado
                respuesta, apagar_nodo = procesar_paquete(datos)
                conn.sendall(respuesta)
                
                if apagar_nodo:
                    print(f"\n{C_LOGIC}[APAGADO ONTOLÓGICO] Plegando tensores. Reposo absoluto alcanzado.{C_RESET}\n")
                    break # Esto rompe el bucle infinito y apaga el programa limpiamente
                else:
                    print(f"  └─ {C_SUCCESS}[PUERTO SELLADO] Transacción finalizada limpiamente.{C_RESET}\n")

if __name__ == "__main__":
    abrir_puerto()
