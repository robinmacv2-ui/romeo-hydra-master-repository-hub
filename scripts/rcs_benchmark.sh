#!/usr/bin/env bash

QUBITS="${1:-10}"
DEPTH="${2:-8}"
SAMPLES="${3:-1000}"

PYTHON_CMD="python"

$PYTHON_CMD - "$QUBITS" "$DEPTH" "$SAMPLES" << 'INNER_EOF'
import sys
import time
import numpy as np

try:
    qubits = int(sys.argv[1])
    depth = int(sys.argv[2])
    samples = int(sys.argv[3])
    
    dim = 1 << qubits
    ram_mb = (dim * 16) / (1024 * 1024)

    print("==================================================")
    print("  BENCHMARK COMPUTACIONAL RCS - MARCO ROMEO")
    print("==================================================")
    print(f"  - Cúbits (N): {qubits}")
    print(f"  - Profundidad (D): {depth}")
    print(f"  - Dimensión espacio de Hilbert (2^N): {dim:,}")
    print(f"  - RAM estimada requerida: {ram_mb:.2f} MB")
    print("--------------------------------------------------")

    print("[*] Reservando vector de estado en memoria RAM...")
    psi = np.zeros(dim, dtype=np.complex128)
    psi[0] = 1.0 + 0.0j

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
    sim_time = time.time() - start_sim

    print(f"[*] Extrayendo {samples} muestras de probabilidad...")
    start_sample = time.time()
    np.random.choice(dim, size=samples, p=probabilities)
    sample_time = time.time() - start_sample

    entropy = -np.sum(probabilities * np.log(probabilities + 1e-15))

    print("--------------------------------------------------")
    print("Resultados de ejecución:")
    print(f"  - Tiempo de simulación: {sim_time:.4f} s")
    print(f"  - Tiempo de muestreo:   {sample_time:.4f} s")
    print(f"  - Entropía (Porter-Thomas): {entropy:.4f} nats")
    print("==================================================")

except MemoryError:
    print("\n[!] ERROR: Memoria RAM insuficiente para asignar la matriz.")
except Exception as e:
    print(f"\n[!] Ocurrió un error en el procesamiento: {e}")

INNER_EOF
