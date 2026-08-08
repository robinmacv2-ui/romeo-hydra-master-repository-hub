import hashlib
import time

class ConvexLogicEngine:
    def __init__(self, doi="10.5281/zenodo.21406719"): # DOI canónico[cite: 1, 5]
        self.doi = doi

    def process(self, data):
        start = time.perf_counter_ns()
        output = hashlib.sha256(f"{data}{self.doi}".encode()).hexdigest()[:16]
        return output, time.perf_counter_ns() - start
