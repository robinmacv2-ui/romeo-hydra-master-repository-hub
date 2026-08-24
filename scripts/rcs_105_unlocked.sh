#!/usr/bin/env bash

# Sin parámetros de entrada: forzado a 105 cúbits
QUBITS=105
DEPTH=10
SAMPLES=1000

PYTHON_CMD="python"

$PYTHON_CMD - "$QUBITS" "$DEPTH" "$SAMPLES" << 'INNER_EOF'
import sys
import time
import numpy as np

try:
    qubits = int(sys.argv[1])
    depth = int(sys.argv[2])
    samples = int(sys.argv[3])
    
    # Intento de cálculo de la dimensión masiva
    dim = 1 << qubits
    
    # Manejo de números extremadamente grandes para evitar desbordamiento en el print
    try:
        ram_mb = (dim * 16) / (1024 * 1024)
        ram_str = f"{ram_mb:.2e} MB"
    except OverflowError:
        ram_str = "Infinito (Overflow)"

    print("==================================================")
    print("  BENCHMARK RCS - PRUEBA DE ESTRÉS EXTREMO (105 QUBITS)")
    print("==================================================")
    print(f"  - Cúbits (N): {qubits}")
    print(f"  - Profundidad (D): {depth}")
    print(f"  - Dimensión espacio de Hilbert (2^N): {dim}")
    print(f"  - RAM estimada requerida: {ram_str}")
    print("--------------------------------------------------")

    print("[*] Intentando reservar vector de estado masivo en memoria RAM...")
    
    # Esta es la línea exacta donde la arquitectura física se enfrenta a la matemática de 105 cúbits
    start_alloc = time.time()
    psi = np.zeros(dim, dtype=np.complex128)
    psi[0] = 1.0 + 0.0j
    
    print(f"[*] ¡Memoria asignada con éxito en {time.time() - start_alloc:.4f} s!")

    # El resto del cálculo
    def get_random_single_gate():
        z = (np.random.randn(2, 2) + 1j * np.random.randn(2, 2)) / np.sqrt(2)
        q, r = np.linalg.qr(z)
        d = np.diag(r)
        ph = d / np.abs(d)
        return q / ph

    print(f"[*] Simulando circuito aleatorio (D={depth})...")
    start_sim = time.time()

    for d in range(depth):
        for q in range(qubits):
            gate = get_random_single_gate()
            psi = psi.reshape([2] * qubits)
            psi = np.tensordot(gate, psi, axes=([1], [q]))
            axes = list(range(1, q + 1)) + [0] + list(range(q + 1, qubits))
            psi = np.transpose(psi, axes)
        psi = psi.flatten()

    probabilities = np.abs(psi) ** 2
    probabilities /= np.sum(probabilities)
    print(f"[*] Cálculo finalizado en {time.time() - start_sim:.4f} s.")

except MemoryError:
    print("\n[!] DICTAMEN DE HARDWARE: MemoryError.")
    print("    El sistema operativo ha bloqueado la ejecución porque 4 GB de RAM")
    print("    son insuficientes para contener el universo de probabilidad.")
except ValueError as e:
    print(f"\n[!] DICTAMEN DE SOFTWARE: ValueError - {e}")
    print("    La arquitectura del sistema de 64 bits es estructuralmente")
    print("    incapaz de manejar una matriz de este tamaño.")
except OverflowError as e:
    print(f"\n[!] DICTAMEN MATEMÁTICO: OverflowError - {e}")
    print("    El número de dimensiones excede la capacidad de cálculo del intérprete.")
except Exception as e:
    print(f"\n[!] ERROR INESPERADO: {e}")

INNER_EOF
