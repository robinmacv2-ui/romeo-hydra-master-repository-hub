export interface AlphaAxiom {
  id: number;
  name: string;
  description: string;
  fn: (state: any, input: any) => boolean;
}

export interface ContradictionEvent {
  timestamp: string;
  currentStateSnapshot: any;
  rejectedInput: any;
  reason: string;
  regime: 'ALPHA';
}

export class AlphaRegime {
  public axioms: AlphaAxiom[];
  public contradictionLog: ContradictionEvent[];

  constructor(customAxioms?: AlphaAxiom[]) {
    this.axioms = customAxioms ? customAxioms : this.getDefaultAxioms();
    this.contradictionLog = [];
  }

  private getDefaultAxioms(): AlphaAxiom[] {
    return [
      {
        id: 0,
        name: "Axioma 0: Integridad Estructural",
        description: "Rechaza inputs vacíos o nulos para prevenir la degradación de memoria del sistema.",
        fn: (state, input) => {
          if (!input) return false;
          return Object.keys(input).length > 0;
        }
      },
      {
        id: 1,
        name: "Axioma 1: Continuidad Temporal (Anti-Lockout)",
        description: "Previene la ejecución de inferencias cognitivas secundarias si el sistema central se encuentra bloqueado (LOCKED).",
        fn: (state, input) => {
          const isLocked = state?.status === "LOCKED";
          const isInferAction = input?.action === "INFER";
          return !(isLocked && isInferAction);
        }
      },
      {
        id: 2,
        name: "Axioma 2: Umbral de Invariante de Calidad",
        description: "Impide transiciones de optimización si el índice de coherencia sistémica desciende del umbral crítico de 0.85.",
        fn: (state, input) => {
          const coherence = state?.coherence_index ?? 1.0;
          const isInferAction = input?.action === "INFER";
          if (isInferAction && coherence < 0.85) {
            return false;
          }
          return true;
        }
      }
    ];
  }

  /**
   * Evaluates if proposed data creates a structural contradiction against current state.
   * Returns true if transition is structurally stable, false if it violates any axiom.
   */
  public evaluateTransition(currentState: any, proposedData: any): { allowed: boolean; failingAxiom?: AlphaAxiom } {
    for (const axiom of this.axioms) {
      try {
        const isStable = axiom.fn(currentState, proposedData);
        if (!isStable) {
          this.logContradiction(currentState, proposedData, `Violación del ${axiom.name}`);
          return { allowed: false, failingAxiom: axiom };
        }
      } catch (err: any) {
        this.logContradiction(currentState, proposedData, `Error de evaluación en ${axiom.name}: ${err.message}`);
        return { allowed: false };
      }
    }
    return { allowed: true };
  }

  private logContradiction(state: any, input: any, reason: string): void {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.contradictionLog.push({
      timestamp,
      currentStateSnapshot: JSON.parse(JSON.stringify(state)),
      rejectedInput: JSON.parse(JSON.stringify(input)),
      reason,
      regime: 'ALPHA'
    });
  }

  public getMitigationMetrics() {
    return {
      totalBlocks: this.contradictionLog.length,
      logSnapshot: this.contradictionLog.slice(-5).reverse() // Last 5 blocks, newest first
    };
  }
}
