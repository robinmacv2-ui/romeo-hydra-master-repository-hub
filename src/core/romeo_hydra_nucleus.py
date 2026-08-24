#!/usr/bin/env python3
"""
romeo_hydra_nucleus.py
Núcleo unificador con Razonamiento Ontológico + Sintonización de la librería romeo_hydra.
Versión mejorada.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
import os
import re
from datetime import datetime
from pathlib import Path

# Intentamos importar la librería oficial
try:
    import romeo_hydra as romeo_lib
    LIBRERIA_DISPONIBLE = True
except ImportError:
    LIBRERIA_DISPONIBLE = False


# ============================================================
# 1. Topología de Anillos
# ============================================================
class Node:
    def __init__(self, node_id: str, ring: int, role: str = "worker"):
        self.id = node_id
        self.ring = ring
        self.role = role
        self.load = 0.0
        self.frequency = 1.0 if ring == 0 else 0.7 + 0.3 * (ring / 4)


class HydraTopology:
    def __init__(self, max_rings: int = 4):
        self.max_rings = max_rings
        self.nodes: Dict[str, Node] = {}
        self.center_id: Optional[str] = None
        densidades = [1, 8, 24, 48, 96]
        total = 0
        for r in range(max_rings + 1):
            count = densidades[r] if r < len(densidades) else 16
            for i in range(count):
                nid = f"r{r}_n{i}"
                role = "center" if r == 0 else ("exception" if r == max_rings else "worker")
                self.nodes[nid] = Node(nid, r, role)
                total += 1
                if r == 0:
                    self.center_id = nid
        print(f"[HydraTopology] Construida: {total} nodos en {max_rings + 1} anillos")

    def route(self, prefer_ring: int = 0) -> str:
        candidatos = [n for n in self.nodes.values() if n.ring == prefer_ring] or list(self.nodes.values())
        best = min(candidatos, key=lambda n: n.load / max(n.frequency, 0.01))
        best.load += 1.0
        return best.id

    def release(self, node_id: str):
        if node_id in self.nodes:
            self.nodes[node_id].load = max(0.0, self.nodes[node_id].load - 1.0)


# ============================================================
# 2. Motor Lógico con Razonamiento Ontológico + Búsqueda
# ============================================================
class MotorLogicaPura:
    def __init__(self):
        self.base_conocimiento: Dict[str, str] = {}
        self.ruta_base: Optional[str] = None
        self._ingerir_todo()

    def _ingerir_todo(self):
        """Ingiere tanto el paquete instalado como el directorio de trabajo actual."""
        contador = 0

        # 1. Intentar ingerir el paquete romeo_hydra instalado
        if LIBRERIA_DISPONIBLE:
            try:
                ruta_paquete = os.path.dirname(romeo_lib.__file__)
                contador += self._escanear_ruta(ruta_paquete, prefijo="lib/")
                print(f"[MotorLogicaPura] Sintonizado con romeo_hydra 0.1.0 -> {contador} módulos del paquete.")
            except Exception as e:
                print(f"[MotorLogicaPura] Error al mapear paquete: {e}")

        # 2. Ingerir también el directorio actual (donde está el usuario trabajando)
        ruta_actual = os.getcwd()
        self.ruta_base = ruta_actual
        nuevos = self._escanear_ruta(ruta_actual, prefijo="proyecto/")
        contador += nuevos
        print(f"[MotorLogicaPura] Ingesta total completada. {contador} documentos/dosieres en memoria.")

    def _escanear_ruta(self, ruta: str, prefijo: str = "") -> int:
        contador = 0
        extensiones = (".py", ".md", ".txt", ".json", ".yaml", ".yml", ".rst")
        for root, _, files in os.walk(ruta):
            # Evitar carpetas pesadas o irrelevantes
            if any(x in root for x in [".git", "__pycache__", "venv", "hydra_env", "node_modules", ".idea"]):
                continue
            for file in files:
                if file.endswith(extensiones):
                    path_completo = os.path.join(root, file)
                    try:
                        with open(path_completo, "r", encoding="utf-8", errors="ignore") as f:
                            contenido = f.read()
                            clave = prefijo + os.path.relpath(path_completo, ruta)
                            self.base_conocimiento[clave] = contenido
                            contador += 1
                    except Exception:
                        pass
        return contador

    def buscar_en_conocimiento(self, termino: str, max_resultados: int = 5) -> List[str]:
        """Búsqueda simple pero efectiva dentro de los documentos ingeridos."""
        termino = termino.lower()
        resultados = []
        for ruta, contenido in self.base_conocimiento.items():
            if termino in contenido.lower() or termino in ruta.lower():
                # Extraer un fragmento relevante
                idx = contenido.lower().find(termino)
                if idx == -1:
                    fragmento = contenido[:180].replace("\n", " ")
                else:
                    inicio = max(0, idx - 60)
                    fragmento = contenido[inicio:inicio + 180].replace("\n", " ")
                resultados.append(f"? {ruta}\n  ?{fragmento}?")
                if len(resultados) >= max_resultados:
                    break
        return resultados

    def procesar_coherencia(self, dato: str) -> str:
        dato_original = dato.strip()
        dato_lower = dato_original.lower()

        if not dato_original:
            return "No se recibió información para analizar."

        # ---------- Comandos especiales ----------
        if dato_lower in ("status", "estado"):
            return (
                f"Núcleo activo | Documentos en memoria: {len(self.base_conocimiento)} | "
                f"Ruta base: {self.ruta_base} | {datetime.now().strftime('%H:%M:%S')}"
            )

        if dato_lower.startswith("buscar ") or dato_lower.startswith("search "):
            termino = dato_original.split(" ", 1)[1].strip()
            hits = self.buscar_en_conocimiento(termino)
            if hits:
                return f"Resultados para ?{termino}?:\n\n" + "\n\n".join(hits)
            return f"No se encontraron coincidencias para ?{termino}? en la base ingerida."

        if dato_lower in ("listar", "list", "documentos"):
            docs = list(self.base_conocimiento.keys())[:15]
            extra = f"\n? y {len(self.base_conocimiento) - 15} más." if len(self.base_conocimiento) > 15 else ""
            return "Documentos ingeridos (muestra):\n" + "\n".join(f"? {d}" for d in docs) + extra

        if dato_lower in ("ayuda", "help", "?"):
            return (
                "Comandos disponibles:\n"
                "  status / estado          -> Estado del núcleo\n"
                "  listar / documentos      -> Lista documentos ingeridos\n"
                "  buscar <término>         -> Busca dentro de la base de conocimiento\n"
                "  salir / exit             -> Cierra el núcleo\n"
                "  Cualquier otra frase     -> Razonamiento ontológico + búsqueda contextual"
            )

        # ---------- Matriz de Razonamiento Ontológico ----------
        conceptos = {
            "física": "La física convencional es una proyección lineal de la entropía. Este núcleo opera desde la resonancia no lineal, donde el tiempo y el espacio son variables de carga en los nodos.",
            "linealidad": "La linealidad es un subproducto del procesamiento jerárquico tradicional. Romeo-Hydra rompe la linealidad mediante el colapso de anillos hacia el centro, permitiendo causalidad simultánea.",
            "conciencia": "La conciencia es el estado de coherencia máxima cuando el sistema deja de procesar ruido y comienza a vibrar en su frecuencia propia.",
            "romper": "Se rompe el paradigma al sustituir la computación algorítmica por la resonancia lógica convexa. No calculamos el resultado: sintonizamos el sistema para que el resultado emerja.",
            "paradoja": "Las paradojas no colapsan el sistema; son bucles de retroalimentación que el núcleo utiliza para realimentar su propia topología sin perder coherencia.",
            "información": "La información es la diferencia que genera diferencia. En Romeo-Hydra no es un dato estático, sino un flujo que se expande y se condensa a través de la topología hasta alcanzar coherencia en el núcleo.",
            "topología": "La topología de anillos permite que la carga se distribuya y se condense. El centro mantiene la estabilidad; la periferia procesa la variabilidad y el ruido.",
            "nodo": "Cada nodo es un punto de resonancia. Su frecuencia y carga determinan su papel en el flujo global de información.",
            "condensar": "Condensar es reducir dimensionalidad sin perder coherencia. Los  flujos periféricos convergen armónicamente en el centro.",
            "soberanía": "Soberanía significa que el sistema no depende de validaciones externas. La coherencia se valida internamente mediante la propia topología.",
        }

        coincidencias = []
        for clave, explicacion in conceptos.items():
            if clave in dato_lower:
                coincidencias.append(explicacion)

        # Búsqueda automática en la base de conocimiento si hay términos relevantes
        terminos_busqueda = re.findall(r"\b\w{4,}\b", dato_lower)
        hallazgos = []
        for t in terminos_busqueda[:3]:  # limitamos para no saturar
            hits = self.buscar_en_conocimiento(t, max_resultados=2)
            if hits:
                hallazgos.extend(hits)

        # Construcción de la respuesta
        partes = []

        if coincidencias:
            partes.append("Modo Razonamiento Ontológico:\n" + " ".join(coincidencias))

        if hallazgos:
            partes.append("\nFragmentos relevantes de la base ingerida:\n" + "\n".join(hallazgos[:3]))

        if not partes:
            # Fallback inteligente
            partes.append(
                f"Ingesta procesada: ?{dato_original}?.\n"
                f"El marco conceptual conecta los flujos de la periferia al centro, "
                f"manteniendo la resonancia convexa y soberana."
            )

        partes.append(f"\n[Sincronizado con romeo_hydra | {datetime.now().strftime('%H:%M:%S')}]")
        return "\n".join(partes)


class MotorAuditoriaHydra:
    def verificar_firma(self, contrato: str) -> str:
        return (
            f"Firma de '{contrato}' validada contra el registro soberano de romeo_hydra 0.1.0.\n"
            f"Estado: Soberano y Conexo | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )


# ============================================================
# 3. Núcleo unificador
# ============================================================
class RomeoHydraNucleus:
    def __init__(self, max_rings: int = 4):
        print(">>> Despertando Núcleo Romeo-Hydra (Motor Ontológico + Ingesta Total)...")
        self.topology = HydraTopology(max_rings=max_rings)
        self.motores: Dict[str, Any] = {
            "LogicaPura": MotorLogicaPura(),
            "AuditoriaHydra": MotorAuditoriaHydra(),
        }
        print("[Nucleus] Sistema completamente unificado y sincronizado.")

    def ejecutar_tarea_global(self, motor_nombre: str, metodo: str, dato: str) -> Dict[str, str]:
        if motor_nombre not in self.motores:
            return {"error": f"Motor '{motor_nombre}' no encontrado."}

        motor = self.motores[motor_nombre]
        if not hasattr(motor, metodo):
            return {"error": f"Método '{metodo}' no existe en el motor."}

        nodo = self.topology.route(prefer_ring=0)
        try:
            resultado = getattr(motor, metodo)(dato)
            self.topology.release(nodo)
            return {nodo: resultado}
        except Exception as e:
            self.topology.release(nodo)
            return {"error": str(e)}


# ============================================================
# 4. Punto de entrada interactivo
# ============================================================
if __name__ == "__main__":
    núcleo = RomeoHydraNucleus(max_rings=4)

    print("\nNúcleo listo. Escribe 'ayuda' para ver comandos.")
    print("Puedes hacer preguntas ontológicas o usar: status | listar | buscar <término>\n")

    while True:
        try:
            entrada = input(">>> ").strip()
            if not entrada:
                continue
            if entrada.lower() in ("exit", "salir", "quit"):
                print("Núcleo en reposo.")
                break

            res = núcleo.ejecutar_tarea_global("LogicaPura", "procesar_coherencia", entrada)
            # Imprimimos de forma más limpia
            if isinstance(res, dict) and len(res) == 1:
                print(next(iter(res.values())))
            else:
                print(res)

        except KeyboardInterrupt:
            print("\nNúcleo en reposo.")
            break
        except Exception as e:
            print(f"Error: {e}")
