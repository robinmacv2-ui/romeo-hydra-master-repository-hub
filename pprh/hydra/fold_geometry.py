"""
Generador matemático del protocolo HYDRA-FOLD-v1
a partir de las dimensiones de hoja carta.
No depende de imagen real.
El descriptor_hash identifica el protocolo geométrico canónico;
NO demuestra realizabilidad física de 22 pliegues.
"""

from dataclasses import dataclass
from typing import List
import hashlib


class FoldGeometryError(ValueError):
    """Error de invariante geométrica."""


@dataclass(frozen=True)
class FoldGeometry:
    n1: int = 22          # pliegues de primer orden
    n2_factor: int = 4    # redistribución ortogonal
    n3_factor: int = 8    # zigzag final
    paper_width_mm: float = 215.9
    paper_height_mm: float = 279.4

    def __post_init__(self):
        if self.n1 < 1:
            raise FoldGeometryError("n1 must be >= 1")
        if self.n2_factor < 1:
            raise FoldGeometryError("n2_factor must be >= 1")
        if self.n3_factor < 1:
            raise FoldGeometryError("n3_factor must be >= 1")

    @property
    def n2(self) -> int:
        return self.n1 * self.n2_factor

    @property
    def n3(self) -> int:
        return self.n2 * self.n3_factor

    def generate_fold_vector(self) -> List[int]:
        """
        Vector de 704 decisiones de plegado (0=adentro, 1=afuera).
        Determinista. Es descriptor geométrico, no fuente de entropía.
        """
        vector: List[int] = []

        # Fase 1
        for i in range(self.n1):
            vector.append(i % 2)

        # Fase 2 – inversión por sección
        for i in range(self.n1, self.n2):
            vector.append((i % 2) ^ 1)

        # Fase 3 – zigzag con desplazamiento de fase por sección
        for i in range(self.n2, self.n3):
            local = (i - self.n2) % 8
            section = (i - self.n2) // (self.n3 // 4)
            vector.append((local + section) % 2)

        if len(vector) != 704:
            raise FoldGeometryError(
                f"fold vector length {len(vector)} != 704"
            )
        return vector

    def descriptor_hash(self) -> str:
        """
        Hash canónico del descriptor geométrico.
        Solo identifica el protocolo; no prueba realizabilidad física.
        """
        material = (
            f"HYDRA-FOLD-v1|{self.n1}|{self.n2}|{self.n3}|"
            f"{self.paper_width_mm}|{self.paper_height_mm}"
        )
        return hashlib.sha256(material.encode()).hexdigest()

    def summary(self) -> dict:
        return {
            "protocol": "HYDRA-FOLD-v1",
            "n1": self.n1,
            "n2": self.n2,
            "n3": self.n3,
            "descriptor_hash": self.descriptor_hash(),
            "paper": {
                "width_mm": self.paper_width_mm,
                "height_mm": self.paper_height_mm,
            },
            "note": "descriptor only – physical realizability is experimental",
        }
