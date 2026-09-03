# STRUCTURE — Product Surface vs Laboratory

**Author:** Luis Angel Vazquez Martinez  
**Repo:** romeo-hydra-master-repository-hub  
**Principle:** Structure-Before-Specificity. Error has no place in the geometry.

---

## PRODUCT SURFACE (only this is evaluated)

This is the complete, coherent system a Financial Regulation / Model Risk / Big4 evaluator needs:

```
romeo_hydra/          # installable package (kernel, crypto, evidence, metrics)
romeo_agent/          # offline DFA + ex-ante admissibility gate
pilot/                # evidence ledgers + scoring / offline audit
tests/                # unit + adversarial
scripts/              # smoke + judge audit
docs/                 # REGULATORY_BRIEF, ARCHITECTURE, FHE_STATUS, OPS_RULES
main.py
README.md
FOR_EVALUATORS.md
STRUCTURE.md
REGULATORY_BRIEF.md   # ← one-pager for KPMG / CNMV / CNBV audiences
DOI_HISTORY.md
OPS_RULES.md
CITATION.cff
LICENSE / dual licence notes
pyproject.toml
requirements.txt
```

Everything else is Laboratory or Satellite. It is **not** part of the product surface.

---

## LABORATORY (noise controlled — do not evaluate)

All remaining root scripts, personal bitácoras (`BITACORA_PERSONAL/`), experimental assets, geometric / quantum prototypes, infinity archives, historical layers and UI sandboxes live here by design.

They are not deleted (history is immutable). They are simply outside the admissible evaluation set.

**Policy:**
1. New experiments → `lab/` or equivalent.
2. When mature → promote to product surface with tests + documentation.
3. No aggressive history rewrite until explicit backup tag.

---

## SATELLITES

See `ECOSYSTEM.md` and `DOI_HISTORY.md`.

Banking-related exploratory repos exist but are **not** production certification nor product surface.

---

## Evaluation Rule (for Francisco / KPMG / any regulator)

An evaluator who looks **only** at the Product Surface obtains a complete, coherent, fail-closed system with evidence ledgers.

Any file outside that surface is invisible to the audit **by design**.

Start here:
1. `README.md`
2. `docs/REGULATORY_BRIEF.md`
3. `docs/FOR_EVALUATORS.md`
4. Smoke commands in the README
5. `pilot/` outputs

---

Luis Angel Vazquez Martinez  
ORCID 0009-0006-8163-3759  
Concept DOI 10.5281/zenodo.21744014
