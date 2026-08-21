"""
ROMEO video tools - offline compression with FFmpeg.

This is one *application* of the topology principle in romeo.topology:
  fold information by keeping structural invariants and discarding scaffold.

In media terms:
  - Invariants ? face, voice intelligibility, motion continuity
  - Scaffold  ? perceptual redundancy (high bitrate noise, excess resolution)
  - Fold     ? CRF + scale under a rate budget (e.g. YC <100 MB)

Primary use today: compress a ~1 min YC application video to <100 MB
while keeping face and voice clear (libx265 CRF 28 / fallback libx264).

Requires: ffmpeg and ffprobe on PATH (Termux: pkg install ffmpeg).
No cloud. No external APIs.

See also: romeo.topology.fold (same principle for text/bytes/any file).
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


def _which_ffmpeg() -> str:
    path = shutil.which("ffmpeg")
    if not path:
        raise RuntimeError(
            "ffmpeg not found on PATH. Install it first:\n"
            "  Windows: winget install Gyan.FFmpeg   or   choco install ffmpeg\n"
            "  Termux:  pkg install ffmpeg\n"
            "  Debian:  sudo apt install ffmpeg"
        )
    return path


def _which_ffprobe() -> str:
    path = shutil.which("ffprobe")
    if not path:
        raise RuntimeError("ffprobe not found on PATH (usually ships with ffmpeg).")
    return path


def probe(path: str | Path) -> dict[str, Any]:
    """Return format + streams as JSON dict."""
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(path)
    cmd = [
        _which_ffprobe(),
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        str(path),
    ]
    out = subprocess.check_output(cmd, text=True)
    return json.loads(out)


def size_mb(path: str | Path) -> float:
    return Path(path).stat().st_size / (1024 * 1024)


def _has_encoder(name: str) -> bool:
    try:
        out = subprocess.check_output(
            [_which_ffmpeg(), "-hide_banner", "-encoders"],
            text=True,
            stderr=subprocess.STDOUT,
        )
        return name in out
    except Exception:
        return False


def compress(
    input_path: str | Path,
    output_path: str | Path | None = None,
    *,
    crf: int = 28,
    codec: str = "auto",
    preset: str = "medium",
    audio_bitrate: str = "96k",
    max_height: int | None = 720,
    overwrite: bool = False,
) -> Path:
    """
    Compress video with H.265 (preferred) or H.264.

    CRF 28 is a good default for a 1-min face video aimed at <100 MB.
    Lower CRF = larger file / better quality. Higher = smaller / more artifacts.

    Topologically: raises the persistence threshold of visual detail -
    low-persistence (scaffold) energy is discarded under the rate bound.
    """
    inp = Path(input_path)
    if not inp.is_file():
        raise FileNotFoundError(inp)

    if output_path is None:
        output_path = inp.with_name(f"{inp.stem}_compressed.mp4")
    out = Path(output_path)

    if out.exists() and not overwrite:
        raise FileExistsError(f"{out} already exists (pass overwrite=True)")

    if codec == "auto":
        codec = "libx265" if _has_encoder("libx265") else "libx264"

    tmp = out.with_suffix(f".tmp{out.suffix}")
    if tmp.exists():
        tmp.unlink()

    vf: list[str] = []
    if max_height:
        vf.append(f"scale=-2:'min({max_height},ih)'")

    cmd = [
        _which_ffmpeg(),
        "-y" if overwrite else "-n",
        "-i",
        str(inp),
        "-c:v",
        codec,
        "-crf",
        str(crf),
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        audio_bitrate,
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
    ]
    if vf:
        cmd.extend(["-vf", ",".join(vf)])
    if codec == "libx265":
        cmd.extend(["-tag:v", "hvc1"])
    cmd.append(str(tmp))

    print(f"[romeo.tools.video] {inp.name} -> {tmp.name}  codec={codec} crf={crf}")
    subprocess.check_call(cmd)

    subprocess.check_call(
        [_which_ffprobe(), "-v", "error", str(tmp)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    tmp.replace(out)
    print(f"[romeo.tools.video] done: {out}  ({size_mb(out):.1f} MB)")
    return out


def compress_for_yc(
    input_path: str | Path,
    output_path: str | Path | None = None,
    *,
    target_mb: float = 95.0,
    overwrite: bool = False,
) -> Path:
    """
    One-shot preset for Y Combinator 1-minute application video.

    - Prefer libx265 CRF 28, 720p max height, AAC 96k
    - If still over target_mb, retry CRF 30 then 32
    - Fallback to libx264 if x265 missing

    Same topology principle: meet rate budget while keeping face/voice invariants.
    """
    inp = Path(input_path)
    if output_path is None:
        output_path = inp.with_name(f"{inp.stem}_yc.mp4")
    out = Path(output_path)

    for crf in (28, 30, 32):
        result = compress(
            inp,
            out,
            crf=crf,
            codec="auto",
            preset="medium",
            audio_bitrate="96k",
            max_height=720,
            overwrite=True,
        )
        mb = size_mb(result)
        print(f"[romeo.tools.video] YC pass crf={crf} -> {mb:.1f} MB (target ? {target_mb})")
        if mb <= target_mb:
            return result

    print("[romeo.tools.video] still over target - forcing 540p + CRF 32")
    return compress(
        inp,
        out,
        crf=32,
        codec="auto",
        preset="slow",
        audio_bitrate="80k",
        max_height=540,
        overwrite=True,
    )


def _cli() -> None:
    import argparse

    p = argparse.ArgumentParser(description="ROMEO video compress (offline)")
    p.add_argument("input", help="Input video path")
    p.add_argument("-o", "--output", default=None, help="Output path")
    p.add_argument("--yc", action="store_true", help="YC preset (<100 MB, face-safe)")
    p.add_argument("--crf", type=int, default=28)
    p.add_argument("--overwrite", action="store_true")
    p.add_argument("--probe", action="store_true", help="Only print probe JSON")
    args = p.parse_args()

    if args.probe:
        print(json.dumps(probe(args.input), indent=2))
        return

    if args.yc:
        compress_for_yc(args.input, args.output, overwrite=args.overwrite)
    else:
        compress(
            args.input,
            args.output,
            crf=args.crf,
            overwrite=args.overwrite,
        )


if __name__ == "__main__":
    _cli()
