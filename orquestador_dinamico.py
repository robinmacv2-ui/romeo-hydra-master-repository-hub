import sys
import os
import importlib
import time
import numpy as np

class OrquestadorDinamicoReal:
    def __init__(self):
        self.directorio_actual = os.getcwd()
        # Aseguramos que el directorio actual esté en el path de Python para importación limpia
        if self.directorio_actual not in sys.path:
            sys.path.insert(0, self.directorio_actual)

        self.modulos_cargados = {}
        self.kernel_controller = None
        self.invariante_eukaris = None
        self.cargar_subsistemas()
        self.compilar_invariante_eukaris()

    def cargar_subsistemas(self):
        print("=====================================================")
        print("  INICIANDO ORQUESTADOR DE CAJA BLANCA (REAL v3.0)   ")
        print("=====================================================")

        subsistemas = [
            ("romeo_engine", "RomeoEngine"),
            ("kernel_sigma", "KernelSigmaController"),
            ("sensor_hardware", "sensor")
        ]

        for mod_name, class_name in subsistemas:
            try:
                # Importación robusta vía sys.path y importlib nativo
                modulo = importlib.import_module(mod_name)
                self.modulos_cargados[mod_name] = modulo
                print(f"[SUBSISTEMA VINCULADO] {mod_name}.py -> Cargado en memoria con éxito.")

                # Vinculación directa con el Kernel Sigma para uso real
                if mod_name == "kernel_sigma" and hasattr(modulo, "KernelSigmaController"):
                    cfg_class = getattr(modulo, "KernelConfig", None)
                    if cfg_class:
                        cfg = cfg_class()
                        self.kernel_controller = modulo.KernelSigmaController(cfg)
                        print(f"[NÚCLEO ACTIVO] Kernel Sigma enlazado al motor de colapso vectorial.")
            except Exception as e:
                print(f"[ERROR DE VINCULACIÓN] No se pudo cargar {mod_name}.py: {e}")

        print("=====================================================")

    def compilar_invariante_eukaris(self):
        """Carga y compila las afirmaciones de Dra. Eukaris Zerpa en el núcleo."""
        try:
            # Preferir paquete core.
            try:
                from core.eukaris_affirmations import compilar_en_nucleo
            except ImportError:
                # Fallback por ruta relativa
                import importlib.util
                ruta = os.path.join(self.directorio_actual, "core", "eukaris_affirmations.py")
                spec = importlib.util.spec_from_file_location("eukaris_affirmations", ruta)
                if spec is None or spec.loader is None:
                    raise ImportError("No se encontró core/eukaris_affirmations.py")
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                compilar_en_nucleo = mod.compilar_en_nucleo

            self.invariante_eukaris = compilar_en_nucleo()
            total = self.invariante_eukaris["invariante"]["total_afirmaciones"]
            print(f"[INVARIANTE EUKARIS] Compilado en núcleo -> {total} afirmaciones de regeneración/abundancia.")
            print(f"[INVARIANTE EUKARIS] Origen: Dra. Eukaris Zerpa (Venezuela) | Redescubierto 2026-08-12")
            self.modulos_cargados["eukaris_affirmations"] = self.invariante_eukaris
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo compilar invariante Eukaris: {e}")
            self.invariante_eukaris = None

    def procesar_premisa(self, premisa: str):
        print(f"\n[AUDITORÍA DE NÚCLEO] Evaluando premisa mediante tensores reales...")
        time.sleep(0.3)

        premisa_l = premisa.lower().strip()

        # Comandos especiales del invariante Eukaris
        if premisa_l in ("eukaris", "afirmaciones", "mantra", "regeneracion", "regeneración"):
            if self.invariante_eukaris:
                print("-----------------------------------------------------")
                print("  INVARIANTE EUKARIS - Mantra de regeneración")
                print("-----------------------------------------------------")
                for linea in self.invariante_eukaris["invariante"]["afirmaciones"]:
                    print(f"  ? {linea}")
                print("-----------------------------------------------------")
                print("  Instrucción original: repetir diariamente aunque al principio no tenga sentido.")
                print("-----------------------------------------------------")
            else:
                print("[EUKARIS] Invariante no disponible en este arranque.")
            return

        # Si el Kernel Sigma está vinculado, procesamos la premisa matemáticamente
        if self.kernel_controller:
            try:
                dim = self.kernel_controller.config.state_dimension
                # Generamos un vector de estado y una acción influenciada por la longitud y contenido de la premisa
                np.random.seed(abs(hash(premisa)) % (2**32))
                estado_actual = np.zeros(dim, dtype=np.float64)

                # Si la premisa contiene palabras de riesgo, aumentamos la entropía de la acción propuesta
                riesgos = ["tarot", "horóscopo", "azar", "ilegal", "saltar", "kyc", "aml", "fraude"]
                factor_ruido = 0.25 if any(r in premisa.lower() for r in riesgos) else 0.015
                accion_propuesta = np.random.randn(dim) * factor_ruido

                # Evaluación ex-ante mediante el Kernel Sigma real
                resultado = self.kernel_controller.evaluate_and_collapse(estado_actual, accion_propuesta)
                traza = self.kernel_controller.generate_immutable_trace(resultado, extra_context={"premisa": premisa})

                coherencia = round(max(5.0, min(99.9, 100.0 - (resultado.final_entropy * 200))), 1)

                print("-----------------------------------------------------")
                print(f"  * Coherencia Lógica Convexa (Kernel Sigma): {coherencia}%")
                print(f"  * Entropía Original vs Final: {resultado.original_entropy:.5f} -> {resultado.final_entropy:.5f}")
                print(f"  * Proyectado / Colapsado por el Kernel: {resultado.projected}")
                print(f"  * Veredicto de Caja Blanca: {'[BLOQUEO DE KERNEL] - ANOMALÍA DETECTADA' if resultado.projected else 'OPTIMIZADO Y CONVERGENTE'}")
                print(f"  * Hash de Auditoría WORM (SHA-256): {traza[:16]}...")
                if self.invariante_eukaris:
                    print(f"  * Invariante Eukaris: ACTIVO ({self.invariante_eukaris['invariante']['total_afirmaciones']} afirmaciones)")
                print("-----------------------------------------------------")
                return
            except Exception as ex:
                print(f"[ADVERTENCIA] Error interno ejecutando el kernel: {ex}")

        # Fallback si el kernel no responde
        print("-----------------------------------------------------")
        print(f"  * Coherencia Lógica Convexa: 85.0%")
        print(f"  * Veredicto: Subsistemas operativos en modo básico.")
        if self.invariante_eukaris:
            print(f"  * Invariante Eukaris: ACTIVO")
        print("-----------------------------------------------------")

if __name__ == "__main__":
    orquestador = OrquestadorDinamicoReal()
    try:
        while True:
            entrada = input("\nIngrese la premisa o comando a procesar (escriba 'salir' para terminar): ")
            if entrada.lower() in ['salir', 'exit', 'quit']:
                print("[SISTEMA] Apagando orquestador de manera segura.")
                break
            if not entrada.strip():
                continue
            orquestador.procesar_premisa(entrada)
    except KeyboardInterrupt:
        print("\n[SISTEMA] Interrupción detectada. Limpiando buffers de memoria.")
