# main.py
# ROMEO-HYDRA V3.1 - Orchestrator with Formal DFA Gate
# Offline · Python 3.11 stdlib only · Fail-closed
# Architect: Luis Angel Vazquez Martinez

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from pilot.faro import proyectar, VERB_CLOSED_SET, ROLE_CAPABILITIES

def run(signal: str, role: str = "operator") -> dict:
    print("[RUN] signal received")
    result = proyectar(signal, role=role)
    decision = result.get("decision")
    print(f"[RUN] decision      : {decision}")
    print(f"[RUN] state         : {result.get('state')}")
    print(f"[RUN] failure_class : {result.get('failure_class', 'n/a')}")
    print(f"[RUN] seq           : {result.get('seq')}")
    print(f"[RUN] receipt       : {result.get('receipt')}")
    if decision == "allow":
        print("[RUN] DISPATCH → action permitted under receipt")
    else:
        print(f"[RUN] DENY/HOLD → {result.get('reason')}")
        print("[RUN] FAILURE_RECEIPT generated. No side-effects.")
    return result

def main():
    if len(sys.argv) < 2:
        print("Uso: python main.py \"verb::entity\" [role]")
        print("Roles:", ", ".join(ROLE_CAPABILITIES.keys()))
        print("Verbos cerrados:", ", ".join(sorted(VERB_CLOSED_SET)))
        sys.exit(1)
    signal = sys.argv[1]
    role = sys.argv[2] if len(sys.argv) > 2 else "operator"
    run(signal, role=role)

if __name__ == "__main__":
    main()
