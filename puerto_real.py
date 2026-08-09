import http.server
import json
import socket
import urllib.request
import time
import numpy as np

from romeo_hydra.kernel.sigma_chameleon import (
    KernelConfig,
    KernelSigmaController,
    EnvironmentSpectrum,
)

PORT = 8888
OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate"

class DualStackServer(http.server.HTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

class RomeoOllamaGateway(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        t_start = time.perf_counter()
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        prompt = payload.get("prompt", "Estado del sistema.")
        model = payload.get("model", "qwen2.5:0.5b")

        # Fase 1: Colapso Lógico en Kernel Sigma V∞
        t_kernel_start = time.perf_counter()
        config = KernelConfig(state_dimension=128)
        controller = KernelSigmaController(config)
        state = np.zeros(128)
        candidate = np.random.randn(128) * 0.05
        core, adapter = controller.collapse_to_core(state, candidate)
        t_kernel_ms = (time.perf_counter() - t_kernel_start) * 1000

        # Fase 2: Ingesta e Inferencia Subordinada en Ollama
        t_ollama_start = time.perf_counter()
        ollama_req_data = json.dumps({
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_thread": 2,
                "num_predict": 30
            }
        }).encode("utf-8")

        ollama_req = urllib.request.Request(
            OLLAMA_API_URL,
            data=ollama_req_data,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(ollama_req, timeout=15) as resp:
                ollama_res = json.loads(resp.read().decode("utf-8"))
                llm_output = ollama_res.get("response", "").strip()
                status_ollama = "OK"
        except Exception as e:
            llm_output = f"Aviso de tiempo límite / offline ({e})."
            status_ollama = "OFFLINE"

        t_ollama_ms = (time.perf_counter() - t_ollama_start) * 1000
        t_total_ms = (time.perf_counter() - t_start) * 1000

        # Fase 3: Proyección de Superficie Gobernada con Telemetría
        projection = adapter.project(
            EnvironmentSpectrum.JSON_WORM,
            extra={
                "prompt_ingested": prompt,
                "ollama_status": status_ollama,
                "ollama_model": model,
                "ollama_response": llm_output,
                "execution_telemetry": {
                    "total_time_ms": round(t_total_ms, 3),
                    "kernel_collapse_time_ms": round(t_kernel_ms, 3),
                    "ollama_inference_time_ms": round(t_ollama_ms, 3),
                    "process_pipeline": [
                        "1. Vector Initialization & Noise Injection (dim=128)",
                        "2. 6k±1 Prime Sieve Noise Reduction",
                        "3. Euler Complex Phase Modulation",
                        "4. Hessian Stability Boundary Check (Eigenvalue Tau)",
                        "5. Subordinate LLM Ingestion via Local IPv4 Socket",
                        "6. Core State Immutable SHA-256 Signature Assembly"
                    ]
                }
            }
        )

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(projection, ensure_ascii=False, indent=2).encode("utf-8"))

if __name__ == "__main__":
    DualStackServer.allow_reuse_address = True
    with DualStackServer(("::", PORT), RomeoOllamaGateway) as httpd:
        print(f"Pasarela Romeo-Hydra con Telemetría Interna en http://127.0.0.1:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nPasarela detenida.")
