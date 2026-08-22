export interface StateVector {
  D: number; // Defense / Liquidity / Quality (Content)
  O: number; // Offense / Return / Visibility
  A: number; // Connection (Adaptability) / Algorithm / Adaptability of portfolio
  R: number; // Resilience / Capital / Resonance (Community)
}

export interface JacobianMatrix {
  rowNames: string[];
  colNames: string[];
  matrix: number[][]; // 4x4 matrix
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  evidence: {
    source: string;
    detail: string;
    metrics: Record<string, any>;
  };
  prev_hash: string;
  hash: string;
  regime_status: 'SECURED' | 'CRITICAL' | 'CORRUPTED';
}

export interface HydraNode {
  id: string;
  label: string;
  category: 'Structural' | 'Stochastic' | 'Core';
  coherence: number;
  resistance: number;
  status: 'Active' | 'Pruned' | 'Fused' | 'Pending';
  description: string;
  parentId: string | null;
  children?: string[];
}

export interface HypothesisQuality {
  C: number; // Coherence [0, 1]
  S: number; // Stability under perturbation [0, 1]
  R: number; // Robustness against alternate hypothesis [0, 1]
  V: number; // Variability across iterations [0, 1]
}

export interface SystemMetrics {
  msh: number; // Hypothesis Survival Metric
  es: number;  // Stability under Noise
  ri: number;  // Recovery Index
  hsi: number; // Hypothesis Survival Index
  iri: number; // Inference Resilience Index
}

export interface DesignLockLog {
  id: string;
  timestamp: string;
  previousState: boolean;
  newState: boolean;
  operator: string;
  detail: string;
  hash?: string;
}

export interface ExternalInteraction {
  id: string;
  timestamp: string;
  actionType: string;
  component: string;
  details: string;
  userRole: string;
  userEmail?: string;
  ipPlaceholder?: string;
}

export interface SimulationMeta {
  simulation_id: string;
  scenario_id: string;
  scenario_version: string;
  executed_at: string;
  random_seed: number;
}

export interface EnvironmentSnapshot {
  kernel_version: string;
  policy_version: string;
  ledger_snapshot_hash: string;
  model_versions: {
    detective_analyst: string;
    risk_scoring: string;
    [key: string]: string;
  };
}

export interface InjectedShock {
  type: string;
  magnitude?: string;
  duration_steps?: number;
  metric?: string;
  delta?: string;
  rule_id?: string;
  new_value?: string;
  [key: string]: any;
}

export interface TriggeredInvariant {
  invariant_id: string;
  description: string;
  hit_count: number;
}

export interface ContainmentAction {
  action: string;
  target_tier: string;
  timestamp_offset_sec: number;
}

export interface CounterfactualComparison {
  false_positive_rate: string;
  user_friction_score?: string;
  system_crash_risk?: string;
  system_resilience?: string;
  [key: string]: any;
}

export interface ExecutionOutcomes {
  triggered_invariants: TriggeredInvariant[];
  containment_actions_taken: ContainmentAction[];
  counterfactual_comparisons: Record<string, CounterfactualComparison>;
}

export interface FinalAssessment {
  status: 'RESILIENT' | 'FIELD_READY_RESILIENT' | 'DEGRADED' | 'CRITICAL_FAILURE' | 'PENDING_AUDIT' | string;
  confidence_score: number;
  audit_summary: string;
}

export interface SimulationRun {
  simulation_meta: SimulationMeta;
  environment_snapshot: EnvironmentSnapshot;
  injected_shocks: InjectedShock[];
  execution_outcomes: ExecutionOutcomes;
  final_assessment: FinalAssessment;
}

