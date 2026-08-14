# -*- coding: utf-8 -*-
"""
Carga opcional de libromeo_native (CMake).

Si no esta compilada / no esta en el path → None y el stack Python sigue.
"""

from __future__ import annotations

import ctypes
import os
import sys
from pathlib import Path
from typing import Any, Optional

_LIB: Optional[ctypes.CDLL] = None
_LOAD_ERROR: Optional[str] = None


def _candidate_names() -> list[str]:
    if sys.platform == "darwin":
        return ["libromeo_native.dylib", "romeo_native.dylib"]
    if sys.platform == "win32":
        return ["romeo_native.dll", "libromeo_native.dll"]
    return ["libromeo_native.so", "romeo_native.so"]


def _search_paths() -> list[Path]:
    env = os.environ.get("ROMEO_NATIVE_LIB")
    paths: list[Path] = []
    if env:
        paths.append(Path(env))
    here = Path(__file__).resolve()
    # repo: romeo_hydra/crypto -> ../../native/build
    repo_native = here.parents[2] / "native" / "build"
    paths.append(repo_native)
    paths.append(Path("/usr/local/lib"))
    paths.append(Path("/usr/lib"))
    paths.append(Path.cwd())
    paths.append(Path.cwd() / "native" / "build")
    return paths


def load_native(force_reload: bool = False) -> Optional[ctypes.CDLL]:
    global _LIB, _LOAD_ERROR
    if _LIB is not None and not force_reload:
        return _LIB
    if force_reload:
        _LIB = None
        _LOAD_ERROR = None

    names = _candidate_names()
    tried: list[str] = []

    # Direct env file
    env = os.environ.get("ROMEO_NATIVE_LIB")
    if env and Path(env).is_file():
        try:
            _LIB = ctypes.CDLL(env)
            _bind(_LIB)
            return _LIB
        except OSError as e:
            tried.append(f"{env}: {e}")

    for directory in _search_paths():
        if not directory.exists() and not directory.is_file():
            continue
        base = directory if directory.is_dir() else directory.parent
        for name in names:
            candidate = base / name
            if not candidate.is_file():
                continue
            try:
                _LIB = ctypes.CDLL(str(candidate))
                _bind(_LIB)
                return _LIB
            except OSError as e:
                tried.append(f"{candidate}: {e}")

    # ctypes default name search
    for name in ["romeo_native", "libromeo_native"]:
        try:
            _LIB = ctypes.CDLL(name)
            _bind(_LIB)
            return _LIB
        except OSError as e:
            tried.append(f"{name}: {e}")

    _LOAD_ERROR = "; ".join(tried[-5:]) if tried else "library not found"
    return None


def _bind(lib: ctypes.CDLL) -> None:
    lib.romeo_native_version.restype = ctypes.c_char_p
    lib.romeo_native_version.argtypes = []

    lib.romeo_native_status_json.restype = ctypes.c_int
    lib.romeo_native_status_json.argtypes = [ctypes.c_char_p, ctypes.c_int]

    lib.romeo_native_has_tfhe.restype = ctypes.c_int
    lib.romeo_native_has_tfhe.argtypes = []

    lib.romeo_native_has_helib.restype = ctypes.c_int
    lib.romeo_native_has_helib.argtypes = []

    lib.romeo_native_sha256_hex.restype = ctypes.c_int
    lib.romeo_native_sha256_hex.argtypes = [
        ctypes.POINTER(ctypes.c_ubyte),
        ctypes.c_int,
        ctypes.c_char_p,
    ]

    lib.romeo_native_tfhe_selfcheck.restype = ctypes.c_int
    lib.romeo_native_tfhe_selfcheck.argtypes = [ctypes.c_char_p, ctypes.c_int]

    lib.romeo_native_helib_selfcheck.restype = ctypes.c_int
    lib.romeo_native_helib_selfcheck.argtypes = [ctypes.c_char_p, ctypes.c_int]


def native_status() -> dict[str, Any]:
    lib = load_native()
    if lib is None:
        return {
            "loaded": False,
            "error": _LOAD_ERROR,
            "hint": "cd native && mkdir build && cd build && cmake .. && cmake --build .",
        }
    buf = ctypes.create_string_buffer(512)
    n = lib.romeo_native_status_json(buf, 512)
    err = ctypes.create_string_buffer(256)
    tfhe_rc = lib.romeo_native_tfhe_selfcheck(err, 256)
    tfhe_msg = err.value.decode("utf-8", errors="replace")
    helib_rc = lib.romeo_native_helib_selfcheck(err, 256)
    helib_msg = err.value.decode("utf-8", errors="replace")
    return {
        "loaded": True,
        "version": lib.romeo_native_version().decode("utf-8"),
        "status_json": buf.value.decode("utf-8") if n >= 0 else None,
        "has_tfhe": bool(lib.romeo_native_has_tfhe()),
        "has_helib": bool(lib.romeo_native_has_helib()),
        "tfhe_selfcheck": {"ok": tfhe_rc == 0, "message": tfhe_msg},
        "helib_selfcheck": {"ok": helib_rc == 0, "message": helib_msg},
    }


def native_sha256_hex(data: bytes) -> Optional[str]:
    lib = load_native()
    if lib is None:
        return None
    out = ctypes.create_string_buffer(65)
    arr = (ctypes.c_ubyte * len(data)).from_buffer_copy(data)
    rc = lib.romeo_native_sha256_hex(arr, len(data), out)
    if rc != 0:
        return None
    return out.value.decode("ascii")
