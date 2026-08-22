export type Role = 'ADMIN' | 'OPERATOR' | 'AUDITOR';

export type Regime = 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA';

export type NodeStatus = 'OPERATIONAL' | 'DAMPENED' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface HexaNode {
  id: string;
  name: string;
  provider: 'OpenAI' | 'xAI' | 'Meta' | 'Google' | 'Anthropic' | 'ROMEO-HYDRA Core';
  roleDescription: string;
  specialty: 'Inferencia General' | 'Compliance WORM' | 'Privacidad & Aisle' | 'Semántica & Invariantes' | 'Alineación Ética' | 'Arbitraje Central CLC';
  status: NodeStatus;
  latencyMs: number;
  coherenceScore: number; // 0 to 1
  jacobianNorm: number;   // ||J||
  hsiIndex: number;       // Hydra Stability Index
  cpuUsage: number;       // %
  memoryUsage: number;    // %
  activeConsensus: 'ACCEPT' | 'REVIEW' | 'REJECT';
  omegaVector: {
    C: number; // Coherencia
    S: number; // Estabilidad
    R: number; // Resistencia
  };
  lastHeartbeat: string;
  iconName: string;
}

export interface LedgerBlock {
  blockIndex: number;
  timestamp: string;
  blockHash: string;
  previousHash: string;
  verdict: 'LOCKED' | 'DAMPENED' | 'ACCEPT' | 'REVIEW' | 'REJECT';
  regime: Regime;
  arbitrationSignature: string; // e.g. "0x8F9...D3"
  modelSignatures: {
    chatgpt: string;
    grok: string;
    meta: string;
    gemini: string;
    claude: string;
  };
  omegaVector: { C: number; S: number; R: number };
  jacobianNorm: number;
  dampingFactor: number;
  hsiIndex: number;
  commandSource?: string;
  details: string;
}

export interface CommandTemplate {
  id: string;
  command: string;
  category: 'DATABASE' | 'SECURITY' | 'GOVERNANCE' | 'SYSTEM' | 'OPTIMIZATION';
  description: string;
  requiredRole: Role;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresDoubleAuth: boolean;
  estimatedDurationSec: number;
  parameters?: { name: string; label: string; defaultValue: string; type: 'string' | 'number' | 'select'; options?: string[] }[];
}

export interface CommandLog {
  id: string;
  command: string;
  executedBy: string;
  role: Role;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED_ROLE' | 'CANCELLED';
  output: string;
  executionTimeMs: number;
  ledgerHashGenerated?: string;
}

export interface GovernanceSettings {
  severityThreshold: number; // θ (0 to 1)
  jacobianDampingFactor: number; // α (0 to 1)
  entropyTolerance: number; // %
  weights: {
    alphaMSH: number;
    betaES: number;
    gammaRI: number;
  };
  activeRegime: Regime;
  activeNodeIds: string[];
  autoMitigateNoise: boolean;
  strictWORMCompliance: boolean;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  sourceNode: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'JACOBIAN_DAMPING' | 'REGIME_CHANGE' | 'SECURITY';
  message: string;
  regime: Regime;
  data?: Record<string, any>;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}
