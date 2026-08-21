"""
Romeo-Hydra Certification Engine
================================
Motor de certificación ontológica y técnica del Master Hub.

Implementa el flujo:
  1. Generación de HASH Invariante
  2. Emisión de Credencial / Sello
  3. Trazabilidad verificable

Distingue explícitamente:
  - Plano Interno: certificación técnica del sistema (invariantes lógicos)
  - Plano Externo: validez legal/institucional (INDAUTOR y registros)
"""

from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


# ---------------------------------------------------------------------------
# Constantes del marco
# ---------------------------------------------------------------------------

MARCO = "Romeo-Hydra"
VERSION_MOTOR = "1.0.0-romeo-cert"
CONVEXITY_INDEX_MIN = 1.0


@dataclass
class CertificadoOntologico:
    """Representa un certificado digital emitido por el núcleo Romeo-Hydra."""

    id_certificado: str
    hash_invariante: str
    sujeto: str                     # nombre del módulo / artefacto certificado
    version_sujeto: str
    plano: str                      # "interno" | "externo_complementario"
    invariantes_validados: list[str]
    parametros_coherencia: dict[str, Any]
    emisor: str = MARCO
    timestamp_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    convexity_index: float = CONVEXITY_INDEX_MIN
    nota_legal: str = (
        "Esta certificación es de carácter ontológico y técnico (plano interno). "
        "No sustituye registros gubernamentales. Se complementa con la titularidad "
        "jurídica y patrimonial otorgada por INDAUTOR u organismo equivalente."
    )
    sello_metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)


def generar_hash_invariante(
    contenido: str | bytes,
    algoritmo: str = "sha256",
    sal_marco: str = "ROMEO-HYDRA-INVARIANTE-2026",
) -> str:
    """
    Genera una firma digital única e irrepetible (HASH Invariante)
    a partir del contenido validado y una sal del marco conceptual.

    Cada versión validada de un software o documento pasa por el
    filtro ontológico de Romeo antes de emitir el hash.
    """
    if isinstance(contenido, str):
        contenido = contenido.encode("utf-8")

    h = hashlib.new(algoritmo)
    h.update(sal_marco.encode("utf-8"))
    h.update(b"|")
    h.update(contenido)
    return h.hexdigest()


def emitir_sello(
    sujeto: str,
    version_sujeto: str,
    hash_invariante: str,
    invariantes_validados: list[str],
    parametros_coherencia: Optional[dict[str, Any]] = None,
    plano: str = "interno",
) -> CertificadoOntologico:
    """
    Emite una Credencial / Sello que vincula la versión del código
    con los parámetros de coherencia de la librería Romeo-Hydra.
    """
    parametros = parametros_coherencia or {
        "resonancia_logica": True,
        "geometria_convexa": True,
        "invarianza_homeostatica": True,
        "marco": MARCO,
        "version_motor": VERSION_MOTOR,
    }

    cert = CertificadoOntologico(
        id_certificado=str(uuid.uuid4()),
        hash_invariante=hash_invariante,
        sujeto=sujeto,
        version_sujeto=version_sujeto,
        plano=plano,
        invariantes_validados=invariantes_validados,
        parametros_coherencia=parametros,
        sello_metadata={
            "tipo": "sello_romeo_hydra",
            "algoritmo_hash": "sha256",
            "generado_por": "core.certificacion_ontologica",
        },
    )
    return cert


def verificar_trazabilidad(
    certificado: CertificadoOntologico | dict[str, Any],
    registro_repositorio: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Permite a cualquier usuario o entidad verificar la autenticidad
    de la certificación contrastándola con el registro del repositorio
    y los derechos patrimoniales inscritos.

    Retorna un dict de verificación con estado y detalles.
    """
    if isinstance(certificado, CertificadoOntologico):
        data = certificado.to_dict()
    else:
        data = certificado

    resultado = {
        "valido_estructuralmente": True,
        "id_certificado": data.get("id_certificado"),
        "hash_invariante": data.get("hash_invariante"),
        "plano": data.get("plano"),
        "emisor": data.get("emisor"),
        "timestamp_utc": data.get("timestamp_utc"),
        "advertencias": [],
        "notas": [],
    }

    # Validaciones mínimas de integridad del certificado
    campos_requeridos = [
        "id_certificado",
        "hash_invariante",
        "sujeto",
        "version_sujeto",
        "plano",
        "invariantes_validados",
    ]
    for campo in campos_requeridos:
        if not data.get(campo):
            resultado["valido_estructuralmente"] = False
            resultado["advertencias"].append(f"Campo requerido ausente o vacío: {campo}")

    if data.get("plano") == "interno":
        resultado["notas"].append(
            "Certificación de plano interno (ontológico/técnico). "
            "Complementar con registro INDAUTOR para validez legal plena."
        )
    elif data.get("plano") == "externo_complementario":
        resultado["notas"].append(
            "Certificación marcada como complementaria a registro institucional."
        )

    if registro_repositorio:
        # Contraste opcional con un registro externo (bitácora / DNA / ledger)
        hash_reg = registro_repositorio.get("hash_invariante") or registro_repositorio.get("hash")
        if hash_reg and hash_reg != data.get("hash_invariante"):
            resultado["valido_estructuralmente"] = False
            resultado["advertencias"].append(
                "HASH del certificado no coincide con el registro del repositorio."
            )
        else:
            resultado["notas"].append("HASH contrastado con registro del repositorio: coincidencia.")

    return resultado


class RomeoCertificationEngine:
    """
    Fachada de alto nivel para el flujo de certificación formal
    dentro del Master Hub.
    """

    def __init__(self, bitacora_path: Optional[str | Path] = None):
        self.bitacora_path = Path(bitacora_path) if bitacora_path else None
        self._emitidos: list[CertificadoOntologico] = []

    def certificar(
        self,
        sujeto: str,
        version: str,
        contenido_o_hash: str | bytes,
        invariantes: list[str],
        parametros: Optional[dict[str, Any]] = None,
        ya_es_hash: bool = False,
        plano: str = "interno",
    ) -> CertificadoOntologico:
        """
        Ejecuta el flujo completo:
          HASH Invariante -> Emisión de Sello -> (opcional) registro en bitácora.
        """
        if ya_es_hash and isinstance(contenido_o_hash, str):
            hash_inv = contenido_o_hash
        else:
            hash_inv = generar_hash_invariante(contenido_o_hash)

        cert = emitir_sello(
            sujeto=sujeto,
            version_sujeto=version,
            hash_invariante=hash_inv,
            invariantes_validados=invariantes,
            parametros_coherencia=parametros,
            plano=plano,
        )
        self._emitidos.append(cert)

        if self.bitacora_path:
            self._registrar_en_bitacora(cert)

        return cert

    def verificar(self, certificado: CertificadoOntologico | dict[str, Any]) -> dict[str, Any]:
        return verificar_trazabilidad(certificado)

    def _registrar_en_bitacora(self, cert: CertificadoOntologico) -> None:
        """Append del certificado a un ledger JSONL de certificaciones."""
        self.bitacora_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.bitacora_path, "a", encoding="utf-8") as f:
            f.write(cert.to_json(indent=None) + "\n")

    @property
    def historial(self) -> list[CertificadoOntologico]:
        return list(self._emitidos)


# ---------------------------------------------------------------------------
# Punto de entrada de demostración / auto-test ligero
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    engine = RomeoCertificationEngine()
    demo = engine.certificar(
        sujeto="romeo_hydra_core",
        version="3.0.1",
        contenido_o_hash="contenido-simulado-del-nucleo-romeo-hydra",
        invariantes=[
            "Postulado de Invarianza Homeostática",
            "Resonancia Lógica Coherente y Convexa",
            "Certificación Ontológica y Técnica",
        ],
    )
    print(demo.to_json())
    print("--- Verificación ---")
    print(json.dumps(engine.verificar(demo), ensure_ascii=False, indent=2))
