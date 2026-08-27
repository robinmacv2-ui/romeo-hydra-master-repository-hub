"""
Despliegue determinista 1→4 sobre ejes S/I/N/O
según gramática Romeo-Aedra.
"""

from dataclasses import dataclass
from typing import Dict


class PolarityError(ValueError):
    """Error de polaridad PPRH."""


@dataclass(frozen=True)
class PolaridadPPRH:
    mode: str
    vector: str
    signos: Dict[str, int]

    def dual(self) -> "PolaridadPPRH":
        opposite = "D" if self.mode == "L" else "L"
        return bifurcar_1_a_4(opposite)


def bifurcar_1_a_4(mode: str = "L") -> PolaridadPPRH:
    """
    Bifurcación canónica 1→4.
    L → 1001
    D → 0110
    """
    mode = mode.upper()
    if mode == "L":
        signos = {"S": 1, "I": 0, "N": 0, "O": 1}
        vector = "1001"
    elif mode == "D":
        signos = {"S": 0, "I": 1, "N": 1, "O": 0}
        vector = "0110"
    else:
        raise PolarityError("mode must be 'L' or 'D'")

    return PolaridadPPRH(mode=mode, vector=vector, signos=signos)
