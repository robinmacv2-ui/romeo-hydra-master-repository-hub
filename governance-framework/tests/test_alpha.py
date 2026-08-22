import unittest
from core.alpha import AlphaRegime

class TestAlphaRegime(unittest.TestCase):
    """
    Casos de prueba para validar la estabilidad axiomática y robustez
    del Régimen Alpha (Motor de Estabilidad Estructural).
    """

    def setUp(self):
        # Inicializa una instancia limpia con los axiomas base predeterminados
        self.alpha = AlphaRegime()
        self.base_state = {
            "status": "RUNNING",
            "coherence_index": 0.88,
            "f_norm": 2.115
        }

    def test_nominal_transition_allowed(self):
        """
        Prueba que las transiciones con datos consistentes y lícitos
        sean aprobadas correctamente (True).
        """
        proposed_data = {
            "action": "INFER",
            "confidence_threshold": 0.80,
            "target": "COPA_MUNDIAL_2026"
        }
        result = self.alpha.evaluate_transition(self.base_state, proposed_data)
        self.assertTrue(result)
        self.assertEqual(self.alpha.get_mitigation_metrics()["total_blocks"], 0)

    def test_axiom_0_empty_data_rejection(self):
        """
        Prueba el Axioma 0: Rechazo inmediato de inputs vacíos o nulos
        para evitar corrupción del estado.
        """
        proposed_data = {}
        result = self.alpha.evaluate_transition(self.base_state, proposed_data)
        self.assertFalse(result)
        
        metrics = self.alpha.get_mitigation_metrics()
        self.assertEqual(metrics["total_blocks"], 1)
        self.assertIn("Violación del Axioma Base #0", metrics["log_snapshot"][0]["reason"])

    def test_axiom_1_locked_state_rejection(self):
        """
        Prueba el Axioma 1: Rechazo de inferencias propuestas cuando el sistema
        se encuentra en estado 'LOCKED' (bloqueo por seguridad / anomalías).
        """
        locked_state = {
            "status": "LOCKED",
            "coherence_index": 0.42
        }
        proposed_data = {
            "action": "INFER",
            "payload": "predictive_run"
        }
        result = self.alpha.evaluate_transition(locked_state, proposed_data)
        self.assertFalse(result)
        
        metrics = self.alpha.get_mitigation_metrics()
        self.assertEqual(metrics["total_blocks"], 1)
        self.assertIn("Violación del Axioma Base #1", metrics["log_snapshot"][0]["reason"])

    def test_axiom_2_coherence_rejection(self):
        """
        Prueba el Axioma 2: Impide transiciones si el índice de coherencia
        desciende del umbral crítico de 0.85.
        """
        low_coherence_state = {
            "status": "RUNNING",
            "coherence_index": 0.75
        }
        proposed_data = {
            "action": "INFER",
            "payload": "predictive_run"
        }
        result = self.alpha.evaluate_transition(low_coherence_state, proposed_data)
        self.assertFalse(result)
        
        metrics = self.alpha.get_mitigation_metrics()
        self.assertEqual(metrics["total_blocks"], 1)
        self.assertIn("Violación del Axioma Base #2", metrics["log_snapshot"][0]["reason"])

    def test_custom_axiom_injection(self):
        """
        Prueba la extensibilidad inyectando un axioma customizado.
        Ejemplo: rechazar si el 'confidence' del input es menor a 0.70.
        """
        custom_axioms = [
            # Axioma customizado 0
            lambda state, data: data.get("confidence", 0.0) >= 0.70
        ]
        alpha_custom = AlphaRegime(custom_axioms=custom_axioms)
        
        # Caso exitoso >= 0.70
        self.assertTrue(alpha_custom.evaluate_transition(self.base_state, {"confidence": 0.85}))
        
        # Caso fallido < 0.70
        self.assertFalse(alpha_custom.evaluate_transition(self.base_state, {"confidence": 0.50}))
        
        metrics = alpha_custom.get_mitigation_metrics()
        self.assertEqual(metrics["total_blocks"], 1)

    def test_stress_noise_mitigation(self):
        """
        Prueba de estrés que simula una batería de inputs ruidosos o corruptos
        para medir cuantitativamente la 'Tasa de Mitigación de Ruido'.
        """
        noisy_inputs = [
            {"action": "INFER"}, # Licito
            {},                  # Corrupto (Axioma 0)
            {"action": "INFER"}, # Licito
            {},                  # Corrupto (Axioma 0)
            {"action": "READ"},  # Licito
        ]
        
        allowed_count = 0
        blocked_count = 0
        
        for inp in noisy_inputs:
            if self.alpha.evaluate_transition(self.base_state, inp):
                allowed_count += 1
            else:
                blocked_count += 1
                
        self.assertEqual(allowed_count, 3)
        self.assertEqual(blocked_count, 2)
        
        metrics = self.alpha.get_mitigation_metrics()
        self.assertEqual(metrics["total_blocks"], 2)

if __name__ == '__main__':
    unittest.main()
