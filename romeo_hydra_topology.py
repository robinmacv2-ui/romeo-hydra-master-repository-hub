import concurrent.futures
import time

class Node:
    def __init__(self, node_id, ring, role="worker", freq=1.0):
        self.id = node_id
        self.ring = ring
        self.role = role
        self.load = 0.0
        self.state = {}
        self.frequency = freq

class RomeoHydraTopology:
    def __init__(self, max_rings=3, nodes_per_ring=None):
        self.max_rings = max_rings
        self.nodes_per_ring = nodes_per_ring or [1, 8, 24, 48, 96]
        self.nodes = {}
        self.center_id = None
        self.build_topology()

    def build_topology(self):
        node_count = 0
        for ring in range(self.max_rings + 1):
            count = self.nodes_per_ring[ring] if ring < len(self.nodes_per_ring) else 8
            for i in range(count):
                nid = f"r{ring}_n{i}"
                role = "center" if ring == 0 else "exception" if ring == self.max_rings else "worker"
                freq = 1.0 if ring == 0 else 0.7 + 0.3 * (ring / self.max_rings)
                
                self.nodes[nid] = Node(nid, ring, role, freq)
                node_count += 1
                if ring == 0:
                    self.center_id = nid
                    
        print(f"[HydraTopology] Construida: {node_count} nodos en {self.max_rings + 1} anillos")

    def route(self, prefer_ring=-1):
        candidates = [n for n in self.nodes.values() if prefer_ring == -1 or n.ring == prefer_ring]
        if not candidates:
            candidates = list(self.nodes.values())
            
        best_node = min(candidates, key=lambda n: n.load / max(n.frequency, 0.01))
        best_node.load += 1.0
        return best_node.id

    def release(self, node_id, amount=1.0):
        if node_id in self.nodes:
            self.nodes[node_id].load = max(0.0, self.nodes[node_id].load - amount)

    def execute(self, tasks, max_workers=8):
        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_node = {}
            for i, task in enumerate(tasks):
                func, arg = task
                prefer = 0 if i % 5 == 0 else -1
                node_id = self.route(prefer)
                
                future = executor.submit(func, arg)
                future_to_node[future] = node_id

            for future in concurrent.futures.as_completed(future_to_node):
                node_id = future_to_node[future]
                try:
                    results[node_id] = future.result()
                finally:
                    self.release(node_id)
        return results

    def visualize_ascii(self):
        lines = ["Romeo Hydra Topology (anillos concéntricos)"]
        for r in range(self.max_rings + 1):
            ring_nodes = [n for n in self.nodes.values() if n.ring == r]
            loads = " ".join([f"{n.id[-3:]}:{int(n.load)}" for n in ring_nodes[:8]])
            extra = " ..." if len(ring_nodes) > 8 else ""
            lines.append(f"  Ring {r} ({len(ring_nodes):>3} nodes): {loads}{extra}")
        return "\n".join(lines)

# ==========================================
# BLOQUE DE EJECUCIÓN DEL ORQUESTADOR
# ==========================================
if __name__ == "__main__":
    # Funciones de prueba simuladas
    def hard_logic(x):
        time.sleep(0.05)
        return {"stable": x * 2, "type": "core"}

    def peripheral(x):
        time.sleep(0.02)
        return {"noise": x + 0.1, "type": "edge"}

    # 1. Instanciar la topología
    topo = RomeoHydraTopology(max_rings=3)

    # 2. Mostrar la red vacía
    print("\n" + topo.visualize_ascii())

    # 3. Crear tareas
    tasks = []
    for i in range(20):
        if i % 5 == 0:
            tasks.append((hard_logic, i))
        else:
            tasks.append((peripheral, i))

    print("\nEjecutando tareas en el orquestador de Python puro...")
    
    # 4. Ejecutar usando los hilos nativos de Python
    resultado = topo.execute(tasks, max_workers=6)

    # 5. Imprimir resultados procesados
    print("\nResultado bruto procesado por los nodos (muestra de 3):")
    for i, (k, v) in enumerate(resultado.items()):
        if i >= 3: break
        print(f"  Nodo {k}: {v}")

    # 6. Mostrar el snapshot final de las cargas
    print("\nSnapshot (primeros 6 nodos):")
    for i, n in enumerate(topo.nodes.values()):
        if i >= 6: break
        print(f"  {n.id}: ring={n.ring} load={n.load} freq={n.frequency}")
