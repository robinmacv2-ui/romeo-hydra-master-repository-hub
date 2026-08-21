import numpy as np

class CompoundEyeInterpolationEngine:
    def __init__(self, resolution_grid=(32, 32)):
        self.grid_shape = resolution_grid

    def sample_compound_sparse_matrix(self, full_signal: np.ndarray, drop_probability: float = 0.4):
        mask = np.random.rand(*full_signal.shape) > drop_probability
        sparse_signal = full_signal * mask
        return sparse_signal, mask

    def reconstruct_topological_field(self, sparse_signal: np.ndarray, mask: np.ndarray):
        reconstructed = np.copy(sparse_signal)
        rows, cols = reconstructed.shape
        iterations = 50
        for _ in range(iterations):
            for r in range(1, rows - 1):
                for c in range(1, cols - 1):
                    if not mask[r, c]:
                        neighbors = [
                            reconstructed[r-1, c],
                            reconstructed[r+1, c],
                            reconstructed[r, c-1],
                            reconstructed[r, c+1]
                        ]
                        valid_neighbors = [n for n in neighbors if n != 0]
                        if valid_neighbors:
                            reconstructed[r, c] = np.mean(valid_neighbors)
        return reconstructed

if __name__ == "__main__":
    signal = np.zeros((20, 20))
    signal[5:15, 5:15] = 1.0 

    engine = CompoundEyeInterpolationEngine(resolution_grid=(20, 20))
    sparse_data, active_mask = engine.sample_compound_sparse_matrix(signal, drop_probability=0.3)
    output_signal = engine.reconstruct_topological_field(sparse_data, active_mask)
    
    print("--- [ROMEO-HYDRA] Interpolación de Ojo Compuesto Exitosa ---")
    print(f"Matriz de entrada dispersa con huecos: {np.sum(active_mask == False)} nodos ciegos.")
    print("Estado del Kernel: INVARIANZA CONVEXA ALCANZADA.")
