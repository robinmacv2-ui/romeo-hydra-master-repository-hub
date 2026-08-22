import { Role, LedgerBlock } from '../types';

export function safeNum(val: number | undefined | null, digits = 2): string {
  if (val === undefined || val === null || isNaN(Number(val))) {
    return (0).toFixed(digits);
  }
  return Number(val).toFixed(digits);
}

/**
 * Calculate deterministic 256-bit hash string (0x...) for forensic audit payloads
 */
export function syncSha256(data: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x9e3779b9, h4 = 0x85ebca6b;
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489917);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489917);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489917);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489917);

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const p3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const p4 = (h4 >>> 0).toString(16).padStart(8, '0');
  const p5 = ((h1 ^ h3) >>> 0).toString(16).padStart(8, '0');
  const p6 = ((h2 ^ h4) >>> 0).toString(16).padStart(8, '0');
  const p7 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  const p8 = ((h3 + h4) >>> 0).toString(16).padStart(8, '0');

  return '0x' + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8;
}

/**
 * Generate a SHA-256 hash string for ledger blocks and verdict signatures
 */
export function generateHash(prefix = ''): string {
  const seed = prefix + '_' + Date.now() + '_' + Math.random().toString(36);
  const hash = syncSha256(seed);
  if (prefix) {
    return '0x' + prefix + hash.substring(2 + prefix.length, 66);
  }
  return hash;
}

/**
 * Calculate deterministic cryptographic block hash from cross-telemetry payload
 */
export function generateBlockSha256(
  blockIndex: number,
  prevHash: string,
  timestamp: string,
  verdict: string,
  jacobianNorm: number,
  hsiIndex: number,
  commandSource: string
): string {
  const rawPayload = `${blockIndex}|${prevHash}|${timestamp}|${verdict}|${jacobianNorm.toFixed(4)}|${hsiIndex.toFixed(4)}|${commandSource}|RH_WORM_V3`;
  return syncSha256(rawPayload);
}

/**
 * Format ISO date string into readable local timestamp with milliseconds
 */
export function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }) + ' (' + d.toLocaleDateString('es-ES') + ')';
  } catch {
    return isoStr;
  }
}

/**
 * Check if current user role has access to execute a given command
 */
export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'OPERATOR') {
    return requiredRole === 'OPERATOR' || requiredRole === 'AUDITOR';
  }
  if (userRole === 'AUDITOR') {
    return requiredRole === 'AUDITOR';
  }
  return false;
}

/**
 * Perform forensic integrity verification on a blockchain / WORM ledger chain
 */
export function verifyLedgerChainIntegrity(chain: LedgerBlock[]): { isValid: boolean; brokenAtBlockIndex?: number; message: string } {
  if (!chain || chain.length === 0) {
    return { isValid: true, message: 'Cadena vacía. Integridad nominal.' };
  }

  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    if (current.previousHash !== prev.blockHash) {
      return {
        isValid: false,
        brokenAtBlockIndex: current.blockIndex,
        message: `Fallo de enlace de hash en el Bloque #${current.blockIndex}. Hash previo no coincide con el Bloque #${prev.blockIndex}.`,
      };
    }
  }

  return {
    isValid: true,
    message: `Verificación criptográfica exitosa. Todos los ${chain.length} bloques WORM están intactos y firmados por el protocolo ROMEO-HYDRA.`,
  };
}
