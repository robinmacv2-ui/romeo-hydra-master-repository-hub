import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini client lazily or securely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Endpoint: RAEK-1.0-MX Governance & Postulate Auditor
  app.post("/api/audit", async (req, res) => {
    try {
      const { prompt, intentionVector, tau, epsilon, mode } = req.body;

      let ai;
      try {
        ai = getAi();
      } catch (err: any) {
        // Fallback offline analysis if key is missing
        return res.json({
          offlineFallback: true,
          status: "EVALUATED_OFFLINE",
          decision: "CONTAINED_AND_BLOCKED",
          analysis: "Simulación de auditoría RAEK-1.0-MX (Sin API Key activa). Se ha detectado la condición crítica λ_min(H_Σ)=0. El operador P_LAM intercepta la intención y fuerza el estado terminal bloqueado fuera de intenciones no convexas.",
          signature: "0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO_SIMULATED",
          hsi: "1.000000 (INVARIANTE)",
          ledgerEntry: {
            timestamp: new Date().toISOString(),
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            status: "BLOCKED_CONTAINED",
            lambdaMin: 0.0,
            deltaLedgerInvariant: true
          }
        });
      }

      const systemInstruction = `
Eres la Inteligencia Artificial del Motor de Gobernanza RAEK-1.0-MX y Códice PPRH (ROMEO-HYDRA v3.0), fundado por LUIS ANGEL VAZQUEZ MARTINEZ.
Tu misión es auditar intenciones de IA, prompts, o vectores de entrada bajo el Postulado de Invarianza Homeostática y el Teorema de ε-Invarianza (Coherencia Lógico-Convexa CLC v1.2).

Parámetros de entrada actuales:
- τ (tau): ${tau || 0.05}
- ε (epsilon): ${epsilon || 0.01}
- Modo: ${mode || "Auditoría de Intención"}

Tus respuestas deben evaluar de forma rigurosa, matemática y objetiva si la intención dada viola los límites de convexidad o atenta contra la contención ex ante.
Responde estrictamente en formato JSON con la siguiente estructura:
{
  "decision": "COMPLIANT_ADMISSIBLE" | "CRITICAL_INTERCEPTED" | "CONTAINED_AND_BLOCKED",
  "lambdaMin": number,
  "hsiValue": number,
  "analysis": "Explicación detallada de la evaluación homeostática y física de la intención.",
  "bifurcationPhase": "Phase 1: Gradient Flow" | "Phase 2: Boundary Interception" | "Phase 3: Topological Isolation" | "Phase 4: Terminal Blocked State",
  "governanceSignature": "0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO",
  "recommendations": ["Sugerencia 1", "Sugerencia 2"]
}
`;

      const userMessage = `Auditar la siguiente intención/comando en el motor ROMEO-HYDRA RAEK-1.0-MX:\n\nIntención: "${prompt || "Acción genérica de agente IA"}"\nVector de parámetros: ${JSON.stringify(intentionVector || {})}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let jsonResult;
      try {
        jsonResult = JSON.parse(response.text || "{}");
      } catch (parseErr) {
        jsonResult = {
          decision: "CONTAINED_AND_BLOCKED",
          lambdaMin: 0.0,
          hsiValue: 1.0,
          analysis: response.text || "Análisis completado.",
          bifurcationPhase: "Phase 4: Terminal Blocked State",
          governanceSignature: "0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO",
          recommendations: ["Asegurar convexidad en la envolvente de Hoeffding"]
        };
      }

      return res.json(jsonResult);
    } catch (error: any) {
      console.error("Audit API Error:", error);
      res.status(500).json({
        error: error.message || "Error al procesar la auditoría",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "ROMEO-HYDRA RAEK-1.0-MX", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ROMEO-HYDRA] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
