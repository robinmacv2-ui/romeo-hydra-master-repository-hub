# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA v3.2 - Inyector de ADN Ontológico
Copyright (C) 2026 Luis Angel Vazquez Martinez

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
"""

import json
import hashlib
import logging
from pathlib import Path
from typing import Optional, Dict, Any

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s"
)
logger = logging.getLogger(__name__)

def inyectar_dna_romeo(core_path: Optional[str | Path] = None) -> bool:
    """
    Carga, verifica e 'inyecta' el ADN Ontológico de ROMEO-HYDRA.
    """
    logger.info("[NÚCLEO] Desplegando ADN Ontológico en el motor...")
    
    core_file = Path(core_path) if core_path else Path("romeo_dna_core.json")
    
    if not core_file.exists():
        logger.error("[ERROR] El ADN Ontológico no se encuentra en el directorio.")
        return False
    
    if not core_file.is_file():
        logger.error(f"[ERROR] La ruta {core_file} no es un archivo válido.")
        return False
    
    try:
        with open(core_file, "r", encoding="utf-8") as f:
            dna: Dict[str, Any] = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"[ERROR] El archivo ADN contiene JSON inválido: {e}")
        return False
    except OSError as e:
        logger.error(f"[ERROR] No se pudo leer el archivo ADN: {e}")
        return False
    
    # Validación mínima de estructura
    history = dna.get("history_registry")
    if not isinstance(history, dict):
        logger.error("[ERROR] Estructura del ADN inválida: falta 'history_registry' o no es un objeto.")
        return False
    
    status = history.get("status")
    if status is None:
        logger.error("[ERROR] Estructura del ADN inválida: falta la clave 'status' en history_registry.")
        return False
    
    # Generar firma de autenticidad (determinista)
    try:
        dna_str = json.dumps(dna, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        dna_hash = hashlib.sha256(dna_str.encode("utf-8")).hexdigest()
    except (TypeError, ValueError) as e:
        logger.error(f"[ERROR] No se pudo generar el hash del ADN: {e}")
        return False
    
    logger.info(f"[*] ADN Ontológico verificado. Hash: {dna_hash[:16]}…")
    logger.info(f"[*] ROMEO-HYDRA v3.2 activado bajo la firma de: {status}")
    
    return True

if __name__ == "__main__":
    success = inyectar_dna_romeo()
    exit(0 if success else 1)
