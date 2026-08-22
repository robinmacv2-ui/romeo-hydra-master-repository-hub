import logging
from typing import Dict, Any, List, Callable

# Configuración del logger para auditoría interna (se integrará con Delta)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - ALPHA_REGIME - %(levelname)s - %(message)s')

class AlphaRegime:
    """
    Régimen Alpha: Motor de Estabilidad Estructural.
    
    Implementa la validación axiomática para interceptar inputs o inferencias
    que presentan contradicciones lógicas antes de que alteren el estado base
    del sistema ROMEO-HYDRA.
    """

    def __init__(self, custom_axioms: List[Callable[[Dict, Dict], bool]] = None):
        """
        Inicializa el régimen con un set de leyes inmutables (axiomas).
        
        Args:
            custom_axioms: Lista de funciones lambda o métodos que evalúan 
                           (estado_actual, datos_propuestos). Deben retornar bool.
        """
        self.axioms = custom_axioms if custom_axioms else self._default_axioms()
        # Buffer en memoria temporal para métricas. Delta persistirá esto luego.
        self.contradiction_log: List[Dict[str, Any]] = []

    def _default_axioms(self) -> List[Callable[[Dict, Dict], bool]]:
        """
        Define los supuestos de diseño fundamentales (Axiomas Base).
        Para que el framework sea determinista, estas reglas no pueden romperse.
        """
        return [
            # Axioma 0: Integridad de datos (No se aceptan inputs vacíos)
            lambda state, new_data: bool(new_data),
            
            # Axioma 1: Continuidad temporal/lógica 
            # (Ejemplo: no puede procesar inferencias si el sistema está en estado de bloqueo)
            lambda state, new_data: not (state.get("status") == "LOCKED" and new_data.get("action") == "INFER"),

            # Axioma 2: Umbral de Invariante de Calidad
            # (Impide transiciones de optimización/inferencia si el índice de coherencia sistémica desciende del umbral crítico de 0.85)
            lambda state, new_data: not (new_data.get("action") == "INFER" and state.get("coherence_index", 1.0) < 0.85)
        ]

    def evaluate_transition(self, current_state: Dict[str, Any], proposed_data: Dict[str, Any]) -> bool:
        """
        Evalúa si los datos propuestos generan una alucinación o contradicción 
        respecto al estado actual.
        
        Retorna:
            True si la transición es estructuralmente estable.
            False si viola algún axioma (ruido/contradicción).
        """
        for i, axiom in enumerate(self.axioms):
            try:
                if not axiom(current_state, proposed_data):
                    self._log_contradiction(current_state, proposed_data, f"Violación del Axioma Base #{i}")
                    return False
            except Exception as e:
                # Si la evaluación falla técnicamente, se considera una anomalía de entropía
                logging.error(f"Fallo en la evaluación axiomática #{i}: {str(e)}")
                return False
                
        return True

    def _log_contradiction(self, state: Dict, data: Dict, reason: str) -> None:
        """
        Registra el rechazo. Estas son las métricas que usaremos en el Whitepaper 
        para demostrar la "Tasa de Mitigación de Ruido".
        """
        evento = {
            "current_state_snapshot": state,
            "rejected_input": data,
            "reason": reason,
            "regime": "ALPHA"
        }
        self.contradiction_log.append(evento)
        logging.warning(f"Intercepción Estructural: {reason}")

    def get_mitigation_metrics(self) -> Dict[str, Any]:
        """
        Retorna métricas duras para validación experimental.
        """
        return {
            "total_blocks": len(self.contradiction_log),
            "log_snapshot": self.contradiction_log[-5:] # Últimos 5 bloqueos
        }
