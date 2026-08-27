import unittest

from core.pedersen import (
    H,
    P,
    Q,
    _hash_to_group,
    commit,
    combine,
    verify,
    verify_sum,
)


class TestPedersen(unittest.TestCase):

    def test_commit_verify(self):
        m = 12345
        c, r = commit(m)
        self.assertTrue(verify(c, m, r))

    def test_incorrect_value(self):
        m = 50
        c, r = commit(m)
        # Intentar abrir el compromiso con otro mensaje debe fallar
        self.assertFalse(verify(c, 51, r))

    def test_incorrect_randomness(self):
        m = 50
        c1, r1 = commit(m)
        c2, r2 = commit(m)
        
        # Deben generar commitments distintos por la entropía
        self.assertNotEqual(c1, c2)
        # Intentar usar el factor 'r' de un commitment en otro debe fallar
        self.assertFalse(verify(c1, m, r2))

    def test_homomorphic_addition(self):
        m1 = 150
        m2 = 250
        
        c1, r1 = commit(m1)
        c2, r2 = commit(m2)
        
        c_combined = combine(c1, c2)
        
        # La suma matemática OCURRE EN Z_q
        total_m = (m1 + m2) % Q
        total_r = (r1 + r2) % Q
        
        self.assertTrue(verify(c_combined, total_m, total_r))
        self.assertTrue(verify_sum([c1, c2], total_m, total_r))

    def test_domain_separation(self):
        # Generar un H con un dominio distinto debe producir un resultado ortogonal
        h_alt = _hash_to_group("ROMEO-HYDRA/PEDERSEN/OTRO_DOMINIO", P)
        self.assertNotEqual(H, h_alt)

    def test_bounds_validation(self):
        # m y r deben pertenecer a Z_q
        with self.assertRaises(ValueError):
            commit(Q + 1)
        with self.assertRaises(ValueError):
            commit(10, r=Q + 1)


if __name__ == "__main__":
    unittest.main()
