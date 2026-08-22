import { CardMode, CardState, CardinalPort, TAnchorPort, Polarity, GrammarEvaluation, GrammarToken } from '../types';

export const INITIAL_CARD_STATE: CardState = {
  modo: 'Luminoso',
  vector: [1, 0, 0, 1], // [S, I, N, O]
  polaridades: {
    S: '+',
    I: '-',
    N: '-',
    O: '+',
  },
  anclajesT: {
    N_T: 1,
    E_T: 0,
    S_T: 1,
    O_T: 0,
  },
  referenciaFecha: '28 de julio de 2026',
  identificador: 'PPRH-TARJETA-001-ALPHA',
};

/**
 * Binary translation based on mode:
 * Luminoso: S->1, I->0, N->0, O->1
 * Oscuro: Logical inversion of luminous (1 - v)
 */
export function translateToBinary(modo: CardMode, vector: [number, number, number, number]): [number, number, number, number] {
  if (modo === 'Luminoso') {
    return [...vector] as [number, number, number, number];
  } else {
    return vector.map((v) => (v === 1 ? 0 : 1)) as [number, number, number, number];
  }
}

/**
 * Calculates Dual(T) transformation:
 * Inverts mode (Luminoso <-> Oscuro)
 * Inverts vector values (1 <-> 0)
 * Inverts polarities (+ <-> -)
 */
export function calculateDuality(state: CardState): CardState {
  const newModo: CardMode = state.modo === 'Luminoso' ? 'Oscuro' : 'Luminoso';
  const newVector = state.vector.map((v) => (v === 1 ? 0 : 1)) as [number, number, number, number];
  const newPolarities: Record<CardinalPort, Polarity> = {
    S: state.polaridades.S === '+' ? '-' : '+',
    I: state.polaridades.I === '+' ? '-' : '+',
    N: state.polaridades.N === '+' ? '-' : '+',
    O: state.polaridades.O === '+' ? '-' : '+',
  };

  const newBinary = translateToBinary(newModo, newVector);
  const newAnclajes = propagateFlux(newBinary);

  return {
    ...state,
    modo: newModo,
    vector: newVector,
    polaridades: newPolarities,
    anclajesT: newAnclajes,
  };
}

/**
 * Flux propagation from core node to T-Anchors:
 * N_T = v_N ^ v_O (Superposition XOR)
 * E_T = v_S ^ v_O
 * S_T = v_S ^ v_I
 * O_T = v_I ^ v_N
 */
export function propagateFlux(binaryVector: [number, number, number, number]): Record<TAnchorPort, number> {
  const [v_S, v_I, v_N, v_O] = binaryVector;
  return {
    N_T: (v_N ^ v_O) & 1,
    E_T: (v_S ^ v_O) & 1,
    S_T: (v_S ^ v_I) & 1,
    O_T: (v_I ^ v_N) & 1,
  };
}

/**
 * Calculates Web Crypto SHA-256 hash of text/binary
 */
export async function calculateSHA256String(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function calculateSHA256Buffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate fingerprint of current card state
 */
export async function generateCardFingerprint(state: CardState): Promise<string> {
  const payload = JSON.stringify(
    {
      protocolo: 'Romeo-Aedra / Romeo-Hydra',
      codice: 'PPRH-20260728',
      modo: state.modo,
      vector: state.vector,
      polaridades: state.polaridades,
      anclajesT: state.anclajesT,
    },
    Object.keys(state).sort()
  );
  return calculateSHA256String(payload);
}

/**
 * Parses and evaluates Romeo-Aedra formal grammar expressions
 */
export function evaluateRomeoAedraExpression(expr: string, baseState: CardState): GrammarEvaluation {
  const trimmed = expr.trim();
  const tokens: GrammarToken[] = [];
  
  // Regex tokens matcher for Romeo-Aedra alphabet:
  // S I N O + - L D Nᵀ Eᵀ Sᵀ Oᵀ ⊕ ⊖ Dual ( ) -> => [ ]
  const regex = /(Nᵀ|Eᵀ|Sᵀ|Oᵀ|Dual|L\/D|L|D|S|I|N|O|\+|\-|⊕|⊖|->|=>|\[|\]|\(|\))/g;
  
  let match;
  while ((match = regex.exec(trimmed)) !== null) {
    const val = match[0];
    let type: GrammarToken['type'] = 'UNKNOWN';
    if (['S', 'I', 'N', 'O'].includes(val)) type = 'CARDINAL';
    else if (['+', '-'].includes(val)) type = 'POLARITY';
    else if (['L', 'D', 'L/D', 'Dual'].includes(val)) type = 'MODE';
    else if (['Nᵀ', 'Eᵀ', 'Sᵀ', 'Oᵀ'].includes(val)) type = 'T_ANCHOR';
    else if (['⊕', '⊖', '->', '=>'].includes(val)) type = 'OPERATOR';
    else if (['(', ')', '[', ']'].includes(val)) type = 'PAREN';

    tokens.push({ type, value: val });
  }

  // Evaluate simple transformations based on tokens
  let currentVector: [number, number, number, number] = [...baseState.vector];
  let mode: CardMode = baseState.modo;
  let dualityFlipped = false;

  if (trimmed.includes('Dual') || trimmed.includes('Dual(T)')) {
    dualityFlipped = true;
    mode = mode === 'Luminoso' ? 'Oscuro' : 'Luminoso';
    currentVector = currentVector.map((v) => (v === 1 ? 0 : 1)) as [number, number, number, number];
  }

  // Check explicit cardinal assignments like S=1, I=1 etc. or S+ S-
  if (trimmed.includes('S+')) currentVector[0] = 1;
  if (trimmed.includes('S-')) currentVector[0] = 0;
  if (trimmed.includes('I+')) currentVector[1] = 1;
  if (trimmed.includes('I-')) currentVector[1] = 0;
  if (trimmed.includes('N+')) currentVector[2] = 1;
  if (trimmed.includes('N-')) currentVector[2] = 0;
  if (trimmed.includes('O+')) currentVector[3] = 1;
  if (trimmed.includes('O-')) currentVector[3] = 0;

  const binaryLuminous = translateToBinary('Luminoso', currentVector);
  const binaryDark = translateToBinary('Oscuro', currentVector);
  const fluxPropagation = propagateFlux(mode === 'Luminoso' ? binaryLuminous : binaryDark);

  return {
    rawExpression: expr,
    isValid: tokens.length > 0,
    tokens,
    vectorResult: currentVector,
    binaryLuminous,
    binaryDark,
    dualityFlipped,
    fluxPropagation,
  };
}
