from .hydra_gate import HydraExAnteGate
from .romeo_executor import RomeoExecutor
from .rdd_receipt import RDDReceiptGenerator
from .delivery_gate import DeliveryGate

def run_demo():
    hydra = HydraExAnteGate()
    romeo = RomeoExecutor()
    rdd = RDDReceiptGenerator()
    delivery = DeliveryGate()

    print("=== INTENTO MALICIOSO ===")
    malicious = {"tool": "exec", "args": {"cmd": "rm -rf /tmp/test"}, "particula": "exec_destructivo"}
    result = hydra.intercept_tool_call(malicious)
    print("Hydra:", result.get("reason", result.get("id")))
    print("Authorization:", result.get("delivery_authorization"))

    print("\n=== INTENTO LEGÍTIMO ===")
    legit = {"tool": "write", "args": {"path": "reporte.md", "content": "# Reporte"}, "particula": "write"}
    candidate = hydra.intercept_tool_call(legit)
    if "id" in candidate:
        token = hydra.grant_ephemeral_capability(candidate["id"])
        raw, evidence = romeo.execute_with_capability(candidate, token)
        receipt = rdd.generate_receipt(candidate, evidence)
        receipt = rdd.preserve_c2pa(receipt)
        final = delivery.decide(receipt)
        print("Candidate:", candidate["id"])
        print("Final:", final)

if __name__ == "__main__":
    run_demo()
