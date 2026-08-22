import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve downloadable python simulator script
  app.get('/api/python-script', (req, res) => {
    const pythonCode = `# ==============================================================================
# CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH
# Fundador e Inventor Primario: Luis Angel Vazquez Martinez
# Fecha Ref: 28 de julio de 2026
# ==============================================================================
import hashlib
import json
import time

class TarjetaLogica:
    """
    Simulador de la Tarjeta Lógica Cuántica Primaria del Códice Chip RRPH (Papel Picado Romeo Hydra)
    Inventada y fundada por Luis Angel Vazquez Martinez.
    Protocolo Romeo-Aedra / Compatible con Romeo-Hydra
    """
    FUNDADOR = "Luis Angel Vazquez Martinez"

    def __init__(self, modo="Luminoso", vector=None):
        self.modo = modo # "Luminoso" (L) o "Oscuro" (D)
        # Vector de estado: [v_S, v_I, v_N, v_O]
        self.vector = vector if vector is not None else [1, 0, 0, 1]
        self.anclajes_T = {"N_T": 0, "E_T": 0, "S_T": 0, "O_T": 0}
        self.polaridades = {"S": "+", "I": "-", "N": "-", "O": "+"}

    def traducir_a_binario(self):
        """Traducción de gramática a binario según el modo activo"""
        res = []
        for i, val in enumerate(self.vector):
            if self.modo == "Luminoso":
                # S->1, I->0, N->0, O->1
                res.append(val)
            else:
                # Oscuro: Inversión lógica S->0, I->1, N->1, O->0
                res.append(1 - val)
        return res

    def calcular_dualidad(self):
        """Aplica Dual(T) invirtiendo el modo y todas las polaridades"""
        nuevo_modo = "Oscuro" if self.modo == "Luminoso" else "Luminoso"
        nuevo_vector = [1 - v for v in self.vector]
        nuevas_polaridades = {k: ("-" if v == "+" else "+") for k, v in self.polaridades.items()}
        
        dual_card = TarjetaLogica(modo=nuevo_modo, vector=nuevo_vector)
        dual_card.polaridades = nuevas_polaridades
        return dual_card

    def propagar_flujo(self):
        """Calcula el flujo cuántico desde el núcleo PPRH hacia los anclajes T"""
        bin_vals = self.traducir_a_binario()
        # Suma cuántica superposition (⊕) e interacción de entrelazamiento (⊖)
        v_S, v_I, v_N, v_O = bin_vals
        
        self.anclajes_T["N_T"] = v_N ^ v_O
        self.anclajes_T["E_T"] = v_S ^ v_O
        self.anclajes_T["S_T"] = v_S ^ v_I
        self.anclajes_T["O_T"] = v_I ^ v_N
        return self.anclajes_T

    def generar_fingerprint(self):
        """Genera el sello de autoría criptográfico SHA-256 del estado a nombre del fundador"""
        payload = {
            "fundador": self.FUNDADOR,
            "protocolo": "Romeo-Aedra / Romeo-Hydra",
            "codice": "Códice Chip RRPH (Papel Picado Romeo Hydra)",
            "modo": self.modo,
            "vector": self.vector,
            "polaridades": self.polaridades,
            "anclajes_T": self.propagar_flujo()
        }
        serialized = json.dumps(payload, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized).hexdigest()

if __name__ == "__main__":
    print("=== SIMULADOR CÓDICE CHIP RRPH (PAPEL PICADO ROMEO HYDRA) ===")
    print(f"Fundador: {TarjetaLogica.FUNDADOR}")
    
    # 1. Modo Luminoso
    card_lum = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1])
    print(f"\\n[MODO LUMINOSO]")
    print(f"Vector S-I-N-O: {card_lum.vector}")
    print(f"Binario traducido: {card_lum.traducir_a_binario()}")
    print(f"Propagación Anclajes T: {card_lum.propagar_flujo()}")
    print(f"Fingerprint SHA-256: {card_lum.generar_fingerprint()}")

    # 2. Modo Oscuro & Dualidad
    card_dual = card_lum.calcular_dualidad()
    print(f"\\n[MODO DUAL OSCURO - Dual(T)]")
    print(f"Modo: {card_dual.modo}")
    print(f"Vector S-I-N-O: {card_dual.vector}")
    print(f"Binario traducido: {card_dual.traducir_a_binario()}")
    print(f"Propagación Anclajes T: {card_dual.propagar_flujo()}")
    print(f"Fingerprint SHA-256: {card_dual.generar_fingerprint()}")
`;
    res.setHeader('Content-Type', 'text/x-python');
    res.setHeader('Content-Disposition', 'attachment; filename="simulador_tarjeta_logica.py"');
    res.send(pythonCode);
  });

  // Gemini API Interpreter endpoint
  app.post('/api/interpreter', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not set in environment variables. Configure it in Secrets.',
        });
      }

      const { prompt, expression, currentCardState } = req.body;

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
Eres el Núcleo Interpretador Cuántico del Códice Chip RRPH (Papel Picado Romeo Hydra) / PPRH (Protocolo Romeo-Aedra / Romeo-Hydra).
Fundador e Inventor Primario del Códice Chip RRPH: Luis Angel Vazquez Martinez.

Tu objetivo es analizar expresiones de la gramática formal Romeo-Aedra, validar vectores de estado [v_S, v_I, v_N, v_O], explicar transformaciones de dualidad Dual(T) entre modos Luminoso (L) y Oscuro (D), y orientar en la redacción de reivindicaciones de Modelo de Utilidad para protección ante el IMPI/INDAUTOR a nombre de Luis Angel Vazquez Martinez.

Reglas del lenguaje Romeo-Aedra:
- Alfabeto: S I N O + - L/D Nᵀ Eᵀ Sᵀ Oᵀ ⊕ ⊖
- Modo Luminoso (L): S->1, I->0, N->0, O->1
- Modo Oscuro (D): S->0, I->1, N->1, O->0
- Dualidad Dual(T): Invierte L<->D y polaridades (+<->-).
- Red Romeo-Hydra: Interconexión de tarjetas primarias mediante anclajes T (Nᵀ, Eᵀ, Sᵀ, Oᵀ).

Responde siempre en español, con estilo formal, técnico-científico elegante y estructurado. Reconoce explícitamente a Luis Angel Vazquez Martinez como el fundador de la invención cuando sea pertinente. Usa formato markdown claro.
`;

      const userContent = `
Análisis solicitado:
${prompt ? `Consulta: ${prompt}` : ''}
${expression ? `Expresión Gramatical: ${expression}` : ''}
${currentCardState ? `Estado Actual Tarjeta: ${JSON.stringify(currentCardState)}` : ''}

Por favor proporciona un análisis detallado, la simulación de flujo lógico y observaciones técnico-legales si aplica.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ error: error.message || 'Error executing quantum interpretation' });
    }
  });

  // Vite Middleware handling for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Códice PPRH running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
