from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from kernel_sigma import KernelSigmaController, KernelConfig

app = FastAPI()
# Inicializamos el kernel con la configuración por defecto (128 dimensiones)
kernel = KernelSigmaController(KernelConfig())

class EvaluationRequest(BaseModel):
    current_state: list[float]
    candidate_action: list[float]

@app.post("/evaluate")
async def evaluate(req: EvaluationRequest):
    try:
        # Convertimos las listas a arrays de numpy para el kernel
        state = np.array(req.current_state)
        action = np.array(req.candidate_action)
        
        # Validación de dimensiones
        if state.shape[0] != 128 or action.shape[0] != 128:
            raise ValueError("El kernel requiere vectores de 128 dimensiones.")
            
        res = kernel.evaluate_and_collapse(state, action)
        return res.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)
