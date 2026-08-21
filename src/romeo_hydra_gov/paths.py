from pathlib import Path

def root() -> Path:
    return Path.cwd()

def receipts_candidates() -> Path:
    p = root() / "receipts" / "candidates"
    p.mkdir(parents=True, exist_ok=True)
    return p

def receipts_final() -> Path:
    p = root() / "receipts" / "final"
    p.mkdir(parents=True, exist_ok=True)
    return p

def receipts_zettel() -> Path:
    p = root() / "receipts" / "zettel"
    p.mkdir(parents=True, exist_ok=True)
    return p
