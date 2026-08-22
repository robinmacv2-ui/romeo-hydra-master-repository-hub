import { StateVector, JacobianMatrix, HydraNode } from './types';

/**
 * Calculates the Frobenius norm of a Jacobian matrix
 * ||J||_F = sqrt(sum(abs(J_ij)^2))
 */
export function calculateFrobeniusNorm(matrix: number[][]): number {
  let sum = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      sum += matrix[r][c] * matrix[r][c];
    }
  }
  return Math.sqrt(sum);
}

/**
 * Multiplies a 4x4 matrix with a 4x1 vector
 */
export function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  const result = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) {
    let sum = 0;
    for (let c = 0; c < 4; c++) {
      sum += matrix[r][c] * vector[c];
    }
    result[r] = sum;
  }
  return result;
}

/**
 * Solves the transient state vector after a perturbation decay:
 * S(t) = S_0 + J * (delta_u0 * exp(-t / tau))
 * S_0 is [D, O, A, R] or similar
 */
export function calculateTransientState(
  s0: StateVector,
  jacobian: number[][],
  delta_u0: number[],
  t: number,
  tau: number,
  stateKeys: (keyof StateVector)[] = ['D', 'O', 'A', 'R']
): StateVector {
  // Compute decayed perturbation: delta_u(t) = delta_u0 * exp(-t / tau)
  // If tau is close to infinity (persistent), exp(-t / tau) is 1.0 (no decay)
  const decayFactor = tau > 1000 ? 1.0 : Math.exp(-t / tau);
  const decayedPerturbation = delta_u0.map(u => u * decayFactor);

  // Propagate through Jacobian: delta_S = J * decayed_perturbation
  const delta_S = multiplyMatrixVector(jacobian, decayedPerturbation);

  // Apply to base state S0
  const s0Array = [s0.D, s0.O, s0.A, s0.R];
  const s_new = s0Array.map((val, idx) => Math.max(0, Math.min(1.5, val + delta_S[idx])));

  return {
    [stateKeys[0]]: s_new[0],
    [stateKeys[1]]: s_new[1],
    [stateKeys[2]]: s_new[2],
    [stateKeys[3]]: s_new[3],
  } as unknown as StateVector;
}

/**
 * Solves Reconfiguration Time:
 * T_recon = -ln(epsilon) / (damping_factor * Adaptability)
 */
export function calculateReconfigurationTime(
  epsilon: number,
  damping: number,
  adaptability: number
): number {
  if (damping <= 0 || adaptability <= 0) return Infinity;
  return -Math.log(epsilon) / (damping * adaptability);
}

/**
 * Calculates a predictable 64-character SHA-256-like hex signature
 * used for Delta's cryptographic integrity check.
 */
export function calculateLedgerHash(data: string, prevHash: string): string {
  const content = data + prevHash;
  let extended = "";
  for (let j = 0; j < 8; j++) {
    let subHash = 0;
    for (let k = 0; k < content.length; k++) {
      subHash = ((subHash << (3 + j)) - subHash) + content.charCodeAt(k) + j;
    }
    extended += Math.abs(subHash).toString(16).padStart(8, '0');
  }
  return extended.substring(0, 64);
}

/**
 * Calculates the Hypothesis Survival Metric (MSH) for a set of nodes:
 * MSH = a * C_T + b * R_T + g * D_T - d * P_T
 */
export function calculateMSH(
  nodes: HydraNode[],
  weights = { a: 0.4, b: 0.3, g: 0.2, d: 0.1 }
): number {
  const activeNodes = nodes.filter(n => n.status === 'Active');
  if (activeNodes.length === 0) return 0;

  const C_T = activeNodes.reduce((sum, n) => sum + n.coherence, 0) / activeNodes.length;
  const R_T = activeNodes.reduce((sum, n) => sum + n.resistance, 0) / activeNodes.length;
  
  // Diversity is normalized count of categories represented
  const uniqueCategories = new Set(activeNodes.map(n => n.category)).size;
  const D_T = uniqueCategories / 3.0; // 3 categories: Core, Structural, Stochastic

  // Computational penalty for total nodes
  const P_T = nodes.length * 0.02;

  const msh = weights.a * C_T + weights.b * R_T + weights.g * D_T - weights.d * P_T;
  return Math.max(0, Math.min(1.0, msh));
}

/**
 * Calculates Inference Resilience Index (IRI):
 * IRI = w1 * C + w2 * S + w3 * R - w4 * V
 */
export function calculateIRI(
  C: number,
  S: number,
  R: number,
  V: number,
  weights = { w1: 0.4, w2: 0.3, w3: 0.2, w4: 0.1 }
): number {
  return Math.max(0, Math.min(1.0, (weights.w1 * C + weights.w2 * S + weights.w3 * R) - (weights.w4 * V)));
}

/**
 * Calculates Hypothesis Survival Index (HSI):
 * HSI = MSH * ES * RI
 */
export function calculateHSI(msh: number, es: number, ri: number): number {
  return Math.max(0, Math.min(1.0, msh * es * ri));
}
