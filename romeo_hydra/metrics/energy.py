# -*- coding: utf-8 -*-
"""
Estimacion proxy de energia y CO2e para corridas locales.

No es un medidor de laboratorio (no hay wattimetro). Es un modelo
reproducible basado en tiempo de CPU y potencias tipicas de dispositivo,
para argumentar reduccion vs siempre-encendido en cloud.

Fuentes de orden de magnitud (documentadas en el reporte):
  - Termux / telefono: ~2-4 W CPU activa (orden de magnitud)
  - Laptop: ~15-45 W
  - VM cloud tipica siempre disponible: se modela como horas de instancia

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import time
from dataclasses import dataclass, asdict
from typing import Any, Callable

# kg CO2e por kWh — factor proxy red (ajustable). Orden de magnitud red mexicana / media.
DEFAULT_GRID_KG_CO2E_PER_KWH = 0.4

DEVICE_WATTS = {
    "termux_phone": 3.0,
    "laptop": 25.0,
    "edge_sbc": 5.0,      # Raspberry-class
    "cloud_vm_proxy": 40.0,  # vCPU activa aproximada
}


@dataclass
class EnergyReport:
    label: str
    device_profile: str
    duration_s: float
    power_w: float
    energy_kwh: float
    co2e_kg: float
    grid_kg_co2e_per_kwh: float
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def estimate_run(
    duration_s: float,
    device_profile: str = "termux_phone",
    label: str = "run",
    grid_kg_co2e_per_kwh: float = DEFAULT_GRID_KG_CO2E_PER_KWH,
    power_w: float | None = None,
) -> EnergyReport:
    watts = power_w if power_w is not None else DEVICE_WATTS.get(device_profile, 10.0)
    energy_kwh = (watts * duration_s) / 3_600_000.0
    co2e = energy_kwh * grid_kg_co2e_per_kwh
    return EnergyReport(
        label=label,
        device_profile=device_profile,
        duration_s=round(duration_s, 6),
        power_w=watts,
        energy_kwh=energy_kwh,
        co2e_kg=co2e,
        grid_kg_co2e_per_kwh=grid_kg_co2e_per_kwh,
        note=(
            "Proxy model (CPU power x time). Not a lab wattmeter measurement. "
            "Useful to compare edge burst vs always-on cloud assumptions."
        ),
    )


def measure_callable(
    fn: Callable[[], Any],
    device_profile: str = "termux_phone",
    label: str = "callable",
) -> tuple[Any, EnergyReport]:
    t0 = time.perf_counter()
    result = fn()
    dt = time.perf_counter() - t0
    return result, estimate_run(dt, device_profile=device_profile, label=label)


def compare_edge_vs_cloud_proxy(
    edge_duration_s: float,
    cloud_hours_always_on: float = 1.0,
    edge_profile: str = "termux_phone",
) -> dict[str, Any]:
    """
    Compara una corrida edge (segundos) contra dejar una VM 'siempre on'
    durante N horas (argumento de gasto energetico / huella).
    """
    edge = estimate_run(edge_duration_s, device_profile=edge_profile, label="edge_burst")
    cloud = estimate_run(
        cloud_hours_always_on * 3600.0,
        device_profile="cloud_vm_proxy",
        label="cloud_always_on_proxy",
    )
    ratio = (cloud.energy_kwh / edge.energy_kwh) if edge.energy_kwh > 0 else None
    return {
        "edge": edge.to_dict(),
        "cloud_proxy": cloud.to_dict(),
        "energy_ratio_cloud_over_edge": ratio,
        "interpretation": (
            f"Una corrida edge de {edge_duration_s:.3f}s vs {cloud_hours_always_on}h de VM proxy: "
            f"el modelo estima ~{ratio:.0f}x mas energia en el escenario always-on"
            if ratio
            else "n/a"
        ),
        "honesty": (
            "Modelo de orden de magnitud, no auditoria ISO de carbono. "
            "El punto de producto es: computo local bajo demanda evita idle cloud."
        ),
    }
