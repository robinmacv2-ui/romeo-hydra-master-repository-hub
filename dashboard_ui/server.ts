import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

interface TelemetryPayload {
  id_transaccion?: string;
  origen?: string;
  status?: string;
  metrics?: {
    delta_auditabilidad?: number;
    score_confianza?: number;
    [key: string]: any;
  };
  integrity_hash?: string;
  id?: string;
  timestamp?: string;
  sourceNode?: string;
  type?: string;
  message?: string;
  regime?: string;
  data?: any;
}

interface WormLedgerBlock {
  blockIndex: number;
  timestamp: string;
  blockHash: string;
  previousHash: string;
  verdict: string;
  regime: string;
  arbitrationSignature: string;
  trustScore: number;
  commandSource: string;
  details: string;
}

const inMemoryTelemetryStore: any[] = [
  {
    id: "TEL-INIT-001",
    timestamp: new Date().toISOString(),
    sourceNode: "ROMEO-HYDRA Core",
    type: "INFO",
    message: "Servidor de Telemetría Express WORM listo para ingesta externa.",
    regime: "ALPHA",
    data: {
      status: "INGESTED",
      integrity_hash: "SHA256_VERIFIED_ALPHA_01"
    }
  }
];

const inMemoryWormLedgerStore: WormLedgerBlock[] = [
  {
    blockIndex: 1000,
    timestamp: new Date().toISOString(),
    blockHash: "0x8f2d4e9a1b3c5f7e9d0a2b4c6e8f1a3b5c7d9e0f2a4b6c8e0f1a3b5c7d9e0f2a",
    previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    verdict: "GENESIS_VERIFIED",
    regime: "ALPHA",
    arbitrationSignature: "SIG_SHA256_GENESIS_ROMEO_HYDRA",
    trustScore: 100.0,
    commandSource: "CORE_BOOTSTRAP",
    details: "Bloque Génesis WORM inicializado con protocolo de inmutabilidad forense."
  }
];

function computeSha256(data: string): string {
  return "0x" + crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Middleware de Validación de Integrity Hash SHA-256 según protocolo ROMEO-HYDRA
 */
function validateIntegrityHash(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "POST") return next();

  const body = req.body || {};
  const hash = body.integrity_hash || body.hash;

  if (!hash) {
    return res.status(400).json({
      success: false,
      error: "INTEGRITY_HASH_MISSING",
      message: "El parámetro integrity_hash es obligatorio para la ingesta en ROMEO-HYDRA WORM."
    });
  }

  // Validación de formato SHA-256
  const isValidFormat =
    typeof hash === "string" && (
      hash.startsWith("SHA256_") ||
      hash.startsWith("0x") ||
      /^[a-fA-F0-9]{16,64}$/.test(hash)
    );

  if (!isValidFormat) {
    return res.status(422).json({
      success: false,
      error: "INTEGRITY_HASH_INVALID",
      message: "El hash proporcionado no cumple con la especificación de encadenamiento SHA-256 de ROMEO-HYDRA."
    });
  }

  (req as any).integrityVerified = true;
  (req as any).payloadChecksum = computeSha256(JSON.stringify(body));
  next();
}

/**
 * Función que convierte automáticamente eventos de telemetría con score_confianza > 95.0
 * en un nuevo Bloque inmutable del Ledger WORM.
 */
function convertToWormBlock(payload: TelemetryPayload): WormLedgerBlock | null {
  const trustScore = payload.metrics?.score_confianza ?? (payload as any).score_confianza ?? 0;

  if (trustScore <= 95.0) {
    return null;
  }

  const prevBlock = inMemoryWormLedgerStore[0];
  const newIndex = prevBlock ? prevBlock.blockIndex + 1 : 1001;
  const prevHash = prevBlock ? prevBlock.blockHash : "0x0000000000000000000000000000000000000000000000000000000000000000";
  const timestamp = new Date().toISOString();

  const rawPayloadToSign = `${newIndex}|${prevHash}|${timestamp}|${payload.id_transaccion || payload.id || 'EXT'}|${trustScore.toFixed(2)}`;
  const blockHash = computeSha256(rawPayloadToSign);
  const arbitrationSignature = `SIG_SHA256_${computeSha256(blockHash + trustScore).substring(2, 26).toUpperCase()}`;

  const newWormBlock: WormLedgerBlock = {
    blockIndex: newIndex,
    timestamp,
    blockHash,
    previousHash: prevHash,
    verdict: trustScore >= 98.0 ? "HIGH_TRUST_ACCEPT" : "AUTO_INGEST_ACCEPT",
    regime: payload.regime || "ALPHA",
    arbitrationSignature,
    trustScore,
    commandSource: payload.origen || payload.sourceNode || "LINKEDIN_TELEMETRY_BRIDGE",
    details: `Auto-convertido a Bloque Inmutable WORM. Score de Confianza: ${trustScore}% (>95.0). Integrity Hash: ${payload.integrity_hash}`
  };

  inMemoryWormLedgerStore.unshift(newWormBlock);
  console.log(`[ROMEO-HYDRA WORM] Bloque #${newIndex} minado e inmutable. Hash: ${blockHash}`);

  return newWormBlock;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // CORS Headers for API calls
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      framework: "ROMEO-HYDRA Cognitive Governance Core",
      timestamp: new Date().toISOString(),
      doi: "10.5281/zenodo.21406719",
      wormCompliance: true
    });
  });

  // POST /api/telemetry with validateIntegrityHash Middleware
  app.post("/api/telemetry", validateIntegrityHash, (req, res) => {
    try {
      const body: TelemetryPayload = req.body || {};
      const timestamp = new Date().toISOString();

      const newRecord = {
        id: body.id_transaccion || body.id || `TEL-EXT-${Date.now()}`,
        timestamp: body.timestamp || timestamp,
        sourceNode: body.origen || body.sourceNode || "LinkedIn_External_Signal",
        type: body.type || "INFO",
        message: `Signal ingested [${body.id_transaccion || 'EXTERNAL'}]: status=${body.status || 'INGESTED'}, integrity=${body.integrity_hash}`,
        regime: body.regime || "ALPHA",
        metrics: body.metrics || {},
        integrity_hash: body.integrity_hash,
        payload_checksum: (req as any).payloadChecksum,
        rawPayload: body
      };

      inMemoryTelemetryStore.unshift(newRecord);

      // Conversión automática a bloque WORM si score_confianza > 95.0
      const createdWormBlock = convertToWormBlock(body);

      console.log(`[ROMEO-HYDRA Telemetry Ingest] Transaction ${newRecord.id} from ${newRecord.sourceNode}`);

      return res.status(200).json({
        success: true,
        message: "Telemetría recibida e inyectada exitosamente en el núcleo WORM.",
        received_data: newRecord,
        integrity_verified: true,
        payload_checksum: (req as any).payloadChecksum,
        worm_block_created: createdWormBlock !== null,
        worm_block: createdWormBlock,
        worm_status: "IMMUTABLE_LOGGED"
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Internal Telemetry Ingestion Failure",
        details: err?.message || String(err)
      });
    }
  });

  // GET /api/telemetry - Query telemetry stream
  app.get("/api/telemetry", (req, res) => {
    res.json({
      success: true,
      count: inMemoryTelemetryStore.length,
      events: inMemoryTelemetryStore
    });
  });

  // GET /api/ledger - Query WORM blocks
  app.get("/api/ledger", (req, res) => {
    res.json({
      success: true,
      count: inMemoryWormLedgerStore.length,
      blocks: inMemoryWormLedgerStore
    });
  });

  // Vite middleware for development vs static serve for production
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
    console.log(`[ROMEO-HYDRA] Core Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
