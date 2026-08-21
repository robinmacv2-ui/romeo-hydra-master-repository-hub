from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, List, Dict

@dataclass
class Metrics:
    fit: float
    complexity: float
    stability: float
    convexity: float

    def to_dict(self) -> Dict[str, float]:
        return self.__dict__

class ScientificCase(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def evaluate(self, model: Any) -> Metrics:
        pass
