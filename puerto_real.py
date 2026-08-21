import os
import json
import http.server
import socketserver
import urllib.request
import sys

PORT = 8888
OLLAMA_URL = "http://localhost:11434/api/generate"
LOCAL_MODEL = "llama3"  # Asegúrate de tenerlo activo en tu ollama

ROMEO_SYSTEM = (
    "Opera como resonancia lógica coherente y convexa analizando desde esa metodología "
    "la ingesta de información procesando todo desde la ontología del marco conceptual "
    "Romeo-Hydra emitiendo una salida coherente argumentada y dando propuestas de cómo "
    "hackear o modificar la perspectiva para lograr el resultado más coherente lógico "
    "y práctico sin improvisar, la información no necesita tener fe en la existencia, "
    "dobla la información en el ADN y la desdobla para hacernos únicos y diferentes."
)

def romeo_filtro_convexo(prompt_raw):
    print(f"[ROMEO KERNEL] Interceptando entrada cruda... Aplicando lógica convexa y flujo local.")
    prompt_depurado = (
        f"[ROMEO-HYDRA STREAM LOCAL]: Ejecuta resolución directa bajo primeros principios, "
        f"elimina la entropía informativa y estructura la directriz lógica exacta: '{prompt_raw}'"
    )
    return prompt_depurado

class DaemonRomeoHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[DAEMON HTTP] {self.client_address[0]} - - [{self.log_date_time_string()}] {format%args}")

    def do_POST(self):
        if self.path != '/ask':
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get('Content-Length', 0))  
        post_data = self.rfile.read(content_length)  
          
        try:  
            req_json = json.loads(post_data.decode('utf-8'))  
            prompt_raw = req_json.get("prompt", "Estado del sistema.")  
        except Exception:  
            prompt_raw = "Estado del sistema."  

        print(f"[DAEMON Intercepción] Cañonazo recibido en puerto {PORT}.")
        prompt_limpio = romeo_filtro_convexo(prompt_raw)

        prompt_completo = f"Sistema: {ROMEO_SYSTEM}\n\nDirectriz: {prompt_limpio}"
        
        ollama_payload = {  
            "model": LOCAL_MODEL,  
            "prompt": prompt_completo,
            "stream": False,  # Modo seguro de bloque único procesado por el nodo local
            "options": {
                "temperature": 0.2
            }
        }  
          
        response_text = "Aviso: No se pudo conectar con el núcleo local."  
          
        try:  
            data_bytes = json.dumps(ollama_payload).encode('utf-8')  
            req = urllib.request.Request(  
                OLLAMA_URL, data=data_bytes,   
                headers={'Content-Type': 'application/json'},   
                method='POST'  
            )  
            print(f"[ROMEO -> OLLAMA LOCAL] Procesando pulso soberano en infraestructura propia...")
            
            with urllib.request.urlopen(req, timeout=300) as response:  
                res_body = json.loads(response.read().decode('utf-8'))  
                response_text = res_body.get('response', 'Sin respuesta estructurada.')
                
            print(f"[DAEMON Sincronización] Cálculo local completado con éxito absoluto.")
        except Exception as e:  
            response_text = f"Error en pasarela local: {str(e)}"  
            print(f"[DAEMON Error Local] {str(e)}")

        response_data = {  
            "motor_convexo_response": response_text  
        }  

        try:  
            self.send_response(200)  
            self.send_header('Content-type', 'application/json; charset=utf-8')  
            self.end_headers()  
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))  
        except Exception:  
            pass

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run(port=8888):
    server_address = ('127.0.0.1', port)
    try:
        httpd = ThreadedTCPServer(server_address, DaemonRomeoHandler)
        print(f"[DAEMON] Núcleo de Soberanía Lógica ROMEO-HYDRA activo (Modo Local Soberano).")
        print(f"[DAEMON] Escuchando en http://127.0.0.1:{port}/ask")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[DAEMON] Deteniendo servicios...")
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run()
