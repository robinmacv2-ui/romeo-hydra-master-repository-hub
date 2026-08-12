export interface RepoFile {
  path: string;
  name: string;
  folder: 'root' | 'docs' | 'src' | 'ledger' | 'assets';
  type: 'markdown' | 'python' | 'json' | 'image';
  size: string;
  description: string;
  doiReference: string;
  content: string;
  sha256: string;
}

export interface ZenodoDoi {
  id: number;
  doi: string;
  title: string;
  category: string;
  description: string;
  isoStandard: string;
  sha256Hash: string;
  url: string;
  status: 'VERIFIED' | 'ACTIVE' | 'CRISTALIZADO';
}

export interface LedgerBlock {
  blockIndex: number;
  timestamp: string;
  event: string;
  operator: string;
  lambdaMin: number;
  hsiStatus: string;
  sha256Hash: string;
  previousHash: string;
  signature: string;
  zeroEscapeVerified: boolean;
}

export interface SimulationParams {
  tau: number;
  epsilon: number;
  lambdaWeight: number;
  hessianA: number;
  initialX1: number;
  initialX2: number;
  speed: number;
  noiseLevel: number;
}

export interface AuditResult {
  decision: 'COMPLIANT_ADMISSIBLE' | 'CRITICAL_INTERCEPTED' | 'CONTAINED_AND_BLOCKED';
  lambdaMin: number;
  hsiValue: number;
  analysis: string;
  bifurcationPhase: string;
  governanceSignature: string;
  recommendations: string[];
  offlineFallback?: boolean;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
  timestamp: string;
}
