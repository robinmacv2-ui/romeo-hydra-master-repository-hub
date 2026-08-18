from pathlib import Path
def _base() -> Path:
    cwd = Path.cwd()
    if (cwd / "src" / "romeo_hydra_gov").exists():
        return cwd
    if (cwd / "romeo-hydra-core" / "src").exists():
        return cwd / "romeo-hydra-core"
    return Path.home() / "romeo-hydra-master-repository-hub" / "romeo-hydra-core"
def root() -> Path: return _base()
def receipts_root() -> Path: return _base() / "receipts"
def receipts_candidates() -> Path: return receipts_root() / "candidates"
def receipts_final() -> Path: return receipts_root() / "final"
def receipts_zettel() -> Path: return receipts_root() / "zettel"
def return_root(): return _base()
def return_candidates(): return receipts_candidates()
def return_final(): return receipts_final()
def return_zettel(): return receipts_zettel()
