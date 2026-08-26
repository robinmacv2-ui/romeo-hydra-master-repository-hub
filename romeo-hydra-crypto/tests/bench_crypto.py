from __future__ import annotations

import os
import sys
import statistics
import time

# Hack de la realidad 1: Autocorrección estricta del path de ejecución.
# Elimina la dependencia de configurar PYTHONPATH manualmente en cada sesión de terminal.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from core.aead import encrypt, generate_key
from core.envelope import seal
from core.pedersen import P, Q, G, H, _USE_GMP

# Hack de la realidad 2: Presupuesto computacional UMR acotado.
# 20 iteraciones estabilizan la mediana estadística sin generar bloqueos termodinámicos
# cuando el sistema opera bajo el respaldo de referencia en Python puro.
ITERATIONS = 20


def benchmark(name, fn, iterations=ITERATIONS):
    samples = []
    for _ in range(iterations):
        start = time.perf_counter_ns()
        fn()
        end = time.perf_counter_ns()
        samples.append(end - start)

    mean_ns = statistics.mean(samples)
    median_ns = statistics.median(samples)

    print(
        f"{name:35s} "
        f"mean={mean_ns / 1_000_000:.4f} ms "
        f"median={median_ns / 1_000_000:.4f} ms"
    )


def main():
    print("[*] Iniciando banco de pruebas criptográficas ROMEO-HYDRA")
    backend_name = "GMP (Acelerado nativo)" if _USE_GMP else "Python Reference (Puro)"
    print(f"[*] Backend Pedersen activo: {backend_name}")
    print(f"[*] Muestra estadística UMR: {ITERATIONS} iteraciones\n")

    try:
        key = generate_key()
        aad = b"benchmark-aad"
        plaintext = b"ROMEO-HYDRA benchmark payload"

        nonce, ciphertext = encrypt(key, plaintext, aad)

        digest_value = 123456789 % Q
        randomness = 987654321 % Q

        benchmark(
            "G^m mod P",
            lambda: pow(G, digest_value, P),
        )

        benchmark(
            "H^r mod P",
            lambda: pow(H, randomness, P),
        )

        benchmark(
            "Pedersen total (commit)",
            lambda: (
                pow(G, digest_value, P)
                * pow(H, randomness, P)
            ) % P,
        )

        benchmark(
            "seal() completo",
            lambda: seal(
                "benchmark-event",
                nonce,
                ciphertext,
                aad,
            ),
        )
        print("\n[*] Benchmark completado con éxito.")
    except Exception as e:
        print(f"[!] Error crítico durante la ejecución del benchmark: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
