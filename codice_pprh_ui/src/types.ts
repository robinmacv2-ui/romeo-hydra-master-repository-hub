export type CardMode = 'Luminoso' | 'Oscuro';

export type CardinalPort = 'S' | 'I' | 'N' | 'O';

export type TAnchorPort = 'N_T' | 'E_T' | 'S_T' | 'O_T';

export type Polarity = '+' | '-';

export interface CardState {
  modo: CardMode;
  vector: [number, number, number, number]; // [v_S, v_I, v_N, v_O] (0 or 1)
  polaridades: Record<CardinalPort, Polarity>;
  anclajesT: Record<TAnchorPort, number>;
  referenciaFecha: string;
  identificador: string;
}

export interface NetworkCard extends CardState {
  id: string;
  nombre: string;
  x: number;
  y: number;
}

export interface GrammarToken {
  type: 'CARDINAL' | 'POLARITY' | 'MODE' | 'T_ANCHOR' | 'OPERATOR' | 'PAREN' | 'UNKNOWN';
  value: string;
}

export interface GrammarEvaluation {
  rawExpression: string;
  isValid: boolean;
  tokens: GrammarToken[];
  vectorResult: [number, number, number, number];
  binaryLuminous: [number, number, number, number];
  binaryDark: [number, number, number, number];
  dualityFlipped: boolean;
  fluxPropagation: Record<TAnchorPort, number>;
  errorMessage?: string;
}

export interface FileHashResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256: string;
  timestamp: string;
}

export interface TechnicalDocumentSection {
  id: string;
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}
