# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA · Paralelismo CPU (sin GPU)
======================================
Reparte trabajo pesado (Hessiana / lotes de estados) en varios núcleos.
No requiere CUDA ni tarjeta gráfica.

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import os
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass
from typing import Callable, Iterable, List, Optional, Sequence, Tuple

import numpy as np
from numpy.typing import NDArray


def _default_workers() -> int:
    """Cuántos 'ayudantes' usar (núcleos disponibles, mínimo 1)."""
    n = os.cpu_count() or 1
    return max(1, n)


def _hessian_diag_job(args: Tuple[np.ndarray, float]) -> np.ndarray:
    """
    Trabajo de un solo vector: arma una Hessiana diagonal simple.
    (Misma idea que el kernel: curvatura local aproximada.)
    Se define a nivel de módulo para que multiprocessing pueda serializarlo.
    """
    x, eps = args
    x = np.asarray(x, dtype=float).ravel()
    # Diagonal: 1 + |x|  (barata y estable)
    diag = 1.0 + np.abs(x) + float(eps)
    return np.diag(diag)


def _lam_min_job(args: Tuple[np.ndarray, float]) -> float:
    """Autovalor mínimo de la Hessiana diagonal de un vector."""
    H = _hessian_diag_job(args)
    # En diagonal, λ_min es el mínimo de la diagonal
    return float(np.min(np.diag(H)))


@dataclass
class ParallelResult:
    n_items: int
    workers: int
    seconds: float
    mode: str  # "serial" | "parallel"
    payload: list

    def summary(self) -> str:
        return (
            f"mode={self.mode}  items={self.n_items}  "
            f"workers={self.workers}  time={self.seconds:.4f}s"
        )


class CPUParallelEngine:
    """
    Motor simple: en serie (1 por 1) o en paralelo (muchos a la vez en CPU).

    Uso típico en Romeo:
      - calcular λ_min o Hessiana de muchos estados de golpe
      - comparar cronómetro serie vs paralelo
    """

    def __init__(self, workers: Optional[int] = None):
        self.workers = workers if workers is not None else _default_workers()

    # ------------------------------------------------------------------
    # API principal
    # ------------------------------------------------------------------

    def lam_min_batch(
        self,
        states: Sequence[NDArray[np.floating]],
        *,
        parallel: bool = True,
        eps: float = 1e-12,
    ) -> ParallelResult:
        """
        Para cada estado, calcula λ_min de su Hessiana diagonal.
        parallel=True  → varios núcleos
        parallel=False → uno por uno (como Romeo hoy)
        """
        jobs = [(np.asarray(s, dtype=float), eps) for s in states]
        t0 = time.perf_counter()

        if not parallel or self.workers <= 1 or len(jobs) <= 1:
            values = [_lam_min_job(j) for j in jobs]
            mode = "serial"
            workers_used = 1
        else:
            values = self._map(_lam_min_job, jobs)
            mode = "parallel"
            workers_used = self.workers

        elapsed = time.perf_counter() - t0
        return ParallelResult(
            n_items=len(jobs),
            workers=workers_used,
            seconds=elapsed,
            mode=mode,
            payload=values,
        )

    def hessian_batch(
        self,
        states: Sequence[NDArray[np.floating]],
        *,
        parallel: bool = True,
        eps: float = 1e-12,
    ) -> ParallelResult:
        """Igual que arriba, pero devuelve la Hessiana completa de cada estado."""
        jobs = [(np.asarray(s, dtype=float), eps) for s in states]
        t0 = time.perf_counter()

        if not parallel or self.workers <= 1 or len(jobs) <= 1:
            values = [_hessian_diag_job(j) for j in jobs]
            mode = "serial"
            workers_used = 1
        else:
            values = self._map(_hessian_diag_job, jobs)
            mode = "parallel"
            workers_used = self.workers

        elapsed = time.perf_counter() - t0
        return ParallelResult(
            n_items=len(jobs),
            workers=workers_used,
            seconds=elapsed,
            mode=mode,
            payload=values,
        )

    def benchmark(
        self,
        n_states: int = 200,
        dim: int = 64,
        seed: int = 42,
    ) -> dict:
        """
        Cronómetro claro: serie vs paralelo.
        Devuelve tiempos y speedup (cuántas veces más rápido).
        """
        rng = np.random.default_rng(seed)
        states = [rng.normal(size=dim) for _ in range(n_states)]

        serial = self.lam_min_batch(states, parallel=False)
        parallel = self.lam_min_batch(states, parallel=True)

        speedup = (
            serial.seconds / parallel.seconds
            if parallel.seconds > 0
            else float("inf")
        )
        return {
            "n_states": n_states,
            "dim": dim,
            "cpu_count": os.cpu_count(),
            "workers": self.workers,
            "serial_s": round(serial.seconds, 4),
            "parallel_s": round(parallel.seconds, 4),
            "speedup": round(speedup, 2),
            "serial_summary": serial.summary(),
            "parallel_summary": parallel.summary(),
        }

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _map(self, fn: Callable, jobs: List) -> list:
        results = [None] * len(jobs)
        with ProcessPoolExecutor(max_workers=self.workers) as pool:
            future_map = {pool.submit(fn, job): i for i, job in enumerate(jobs)}
            for fut in as_completed(future_map):
                i = future_map[fut]
                results[i] = fut.result()
        return results
