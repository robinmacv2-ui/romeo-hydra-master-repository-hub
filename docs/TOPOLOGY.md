# ROMEO Topology — Information Folding

**Principle:** Structure-Before-Specificity.

Any digital object induces a space. Stable information lives in structural features that persist under perturbation (components, identity cycles, critical order). High-entropy detail is *scaffold*: it can be discarded or regenerated. Encoding the invariants is **folding**; reconstruction is **unfolding**.

This is the base of ROMEO computer topology — not limited to video.

---

## Why this exists

YC (and any real constraint) forces a rate budget. Example: a 1-minute application video must fit under ~100 MB. The naive answer is “compress the file”. The topological answer is:

> Keep the invariants that make the object still *itself* (face, voice, meaning, integrity). Fold away the scaffold.

The same principle applies to text, code, ledgers, packages, and binaries.

Formal cousins in the literature (we do not re-implement full persistent homology here):

- Information Topology (cycle closure, homological capacity)
- Topology-preserving lossy compression (TopoSZ and related)
- Topological folding of graphs (label compression by recursive fold)
- Geometric compression via topological surgery

---

## Code map

| Path | Role |
|------|------|
| `romeo/topology/fold.py` | Core: `fold_bytes`, `fold_text`, `fold_file`, `FoldResult` |
| `romeo/topology/__init__.py` | Public exports |
| `romeo/tools/video.py` | Media application: CRF/scale under rate budget (YC preset) |

---

## Quick use

### Any file (structure fold)

```bash
python -m romeo.topology.fold path/to/file.txt
python -m romeo.topology.fold path/to/blob.bin --mode bytes -o fold.json
```

### Video for YC (<100 MB, face-safe)

```bash
# requires ffmpeg on PATH
python -m romeo.tools.video your_recording.mp4 --yc -o yc_video.mp4
```

PowerShell one-liner equivalent if you prefer raw ffmpeg:

```powershell
ffmpeg -i recording.mp4 -c:v libx265 -crf 28 -preset medium -c:a aac -b:a 96k -vf "scale=-2:'min(720,ih)'" -movflags +faststart -pix_fmt yuv420p -tag:v hvc1 yc_video.mp4
```

---

## What we claim / do not claim

**Claim**

- Operational principle: invariants vs scaffold for any file type.
- Offline, reproducible, edge-friendly (Termux aarch64 compatible APIs).
- Video path is a concrete instance under a real constraint (YC upload).

**Do not claim**

- Full persistent homology of arbitrary files in production.
- Bit-identical reconstruction when residual/scaffold is dropped.
- Replacement for general-purpose codecs (H.265, zstd, etc.) — we *use* them as the fold operator in the media case.

---

## Relation to HYDRA / ROMEO kernel

- **Coherence / stability kernel** → preserve consistency cycles.
- **SHA-256 ledgers** → integrity of invariants, not of every scaffold byte.
- **Offline / no cloud** → unfold locally when needed.
- **Ontological frame** → ontology = set of cycles that must remain invariant under allowed transforms.

---

Luis Angel Vazquez Martinez · 2026  
https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub
