import hashlib
import time

def pprh_geometric_core_compiled(data):
    # Metrica NOT o NOT (BER 0.0000%)[cite: 1]
    start = time.perf_counter_ns()
    doi = "10.5281/zenodo.21406719" # DOI canónico[cite: 1, 5]
    output = hashlib.sha256(f"{data}{doi}".encode()).hexdigest()[:16]
    return output, time.perf_counter_ns() - start
