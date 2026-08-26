# ROMEO-HYDRA v0.2.0 — Information Folding Topology

**Branch:** `release/topology-fold-v0.2.0`  
**Tag target:** `v0.2.0`  
**Date:** 2026-08-15  
**Author:** Luis Angel Vazquez Martinez

---

## One sentence

We treat **folding information** the way a cell packs ~2 metres of DNA into a nucleus smaller than half a millimetre: hierarchical structure first, bulk second.

---

## Why this release exists

v0.1.x delivered an offline ~55K package, SHA-256 evidence pilots, dual Zenodo DOIs and Termux aarch64 paths.

v0.2.0 names the deeper principle that was already implicit and makes it a first-class module:

> **Structure-Before-Specificity** — stable information lives in invariants (components, identity cycles, critical order). Scaffold (high-entropy, low-persistence detail) can be discarded or regenerated under a rate budget. Encoding invariants is *folding*; reconstruction is *unfolding*.

This is not limited to video. Video was the forcing function (YC application clip must fit under ~100 MB). The same operator applies to text, code, ledgers and binaries.

---

## What is new

| Path | Role |
|------|------|
| `romeo/topology/fold.py` | `fold_bytes`, `fold_text`, `fold_file`, `FoldResult` |
| `romeo/topology/__init__.py` | Public API |
| `romeo/tools/video.py` | Media instance of the same principle (YC preset) |
| `docs/TOPOLOGY.md` | Design note + claims / non-claims |
| `.zenodo.json` | Metadata for this DOI deposit |
| `CITATION.cff` | Bumped to 0.2.0 (version DOI pending mint) |

---

## DNA packing metaphor (intentional)

| Biology | ROMEO topology |
|---------|----------------|
| ~2 m DNA | Full digital object (file, doc, stream) |
| Nucleus < 0.5 mm | Rate / storage budget (edge, offline, upload limit) |
| Chromatin hierarchy | Invariants + scaffold levels |
| Sequence preserved | Critical structure preserved |
| Bulk packed, not deleted as “noise” without rule | Scaffold folded away under explicit policy |

We do **not** claim a biological model of chromatin. We claim an operational analogy that forces the right engineering question: *what must persist?*

---

## Honesty bounds

- Not full persistent homology of arbitrary files in production (optional later).
- Unfold recovers structure; bit-identical restore requires storing residual.
- Media path uses real codecs (H.265/H.264) as the fold operator — we do not reimplement them.
- 0 MRR / no CNBV claim (unchanged from v0.1.x).

---

## How to get the Zenodo DOI

1. Ensure Zenodo ↔ GitHub integration is ON for this public repo (Zenodo → GitHub → toggle).
2. Merge or keep this branch; create **GitHub Release** with tag **`v0.2.0`** from this branch (or from main after merge).
3. Zenodo archives the tag and mints a **version DOI**; concept DOI stays `10.5281/zenodo.21744014`.
4. Paste the new version DOI into `CITATION.cff`, README badges and `DOI_HISTORY.md`.

Sandbox tip: test once on https://sandbox.zenodo.org before production if you want a dry run.

---

## Cite (until version DOI is minted)

Use concept DOI + this tag:

- Concept: https://doi.org/10.5281/zenodo.21744014  
- Code: https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub/tree/release/topology-fold-v0.2.0  
- Tag: `v0.2.0` (after release)

---

Luis Angel Vazquez Martinez · CDMX · 2026  
robinmac.v2@gmail.com · emmororromeohydra@gmail.com
