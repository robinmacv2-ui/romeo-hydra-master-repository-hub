# -*- coding: utf-8 -*-
"""python -m pilot  -> ayuda rapida."""

print("""ROMEO-HYDRA pilot kit

  python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
  python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
  python -m pilot.run_market_integrity_audit --symbol DEMO --n 15

Desde la raiz del repo (o con pip install -e . y PYTHONPATH=.):\n
  cd ~/romeo-hydra-master-repository-hub
  PYTHONPATH=. python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
""")
