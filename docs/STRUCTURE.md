# STRUCTURE — Product Surface vs Laboratory

**Author:** Luis Angel Vazquez Martinez  
**Repo:** romeo-hydra-master-repository-hub  
**Principle:** Structure-Before-Specificity. Error has no place in the geometry.

---

## PRODUCT SURFACE (only this is evaluated)

```
romeo_hydra/          # installable package
romeo_agent/          # offline DFA + ex-ante gate
pilot/                # evidence ledgers + scoring audit
tests/                # unit + adversarial
scripts/              # smoke + judge audit
docs/                 # FHE_STATUS, regulatory mapping, technical validation
main.py
README.md
FOR_EVALUATORS.md
STRUCTURE.md
DOI_HISTORY.md
OPS_RULES.md
CITATION.cff
LICENSE
pyproject.toml
requirements.txt
```

Everything else is Laboratory or Satellite. It is not part of the product surface.

---

## LABORATORY (noise controlled — do not evaluate)

All remaining root scripts, personal bitácoras, experimental assets, prototype folders and historical layers live here by geometry. They are not deleted (history is immutable). They are simply outside the admissible evaluation set.

Policy:
1. New experiments → lab/ or equivalent.
2. When mature → promote to product surface with tests.
3. No aggressive history rewrite until explicit backup tag.

---

## SATELLITES

See ECOSYSTEM.md and DOI_HISTORY.md.

---

## Evaluation Rule

An evaluator who looks only at the Product Surface obtains a complete, coherent, fail-closed system.  
Any file outside that surface is invisible to the audit by design.

---

Luis Angel Vazquez Martinez  
ORCID 0009-0006-8163-3759  
Concept DOI 10.5281/zenodo.21744014
