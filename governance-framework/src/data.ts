import { StateVector, JacobianMatrix, HydraNode } from './types';

export const FOOTBALL_DATA = {
  spain: {
    name: "España",
    color: "#EF4444", // Red
    s0: { D: 0.94, O: 0.93, A: 0.96, R: 0.97 } as StateVector,
    damping: 0.92, // \zeta
  },
  argentina: {
    name: "Argentina",
    color: "#06B6D4", // Light Blue
    s0: { D: 0.92, O: 0.91, A: 0.95, R: 0.96 } as StateVector,
    damping: 0.85, // \zeta
  },
  jacobian: {
    rowNames: ["D (Defense)", "O (Offense)", "C (Connection)", "E (Entropy)"],
    colNames: ["D", "O", "C", "E"],
    matrix: [
      [1.0, -0.4, 0.6, -0.8],
      [-0.7, 1.0, 0.5, -0.9],
      [-0.5, -0.5, 1.0, -0.7],
      [0.9, 0.8, 0.8, 1.0]
    ]
  } as JacobianMatrix,
  perturbation: {
    delta_u0: [-0.3, -0.2, -0.15, 0.4], // [D, O, C, E]
    epsilon: 0.05
  }
};

export const FINANCIAL_DATA = {
  stateNames: ["D (Liquidity)", "O (Return)", "A (Adaptability)", "R (Resilience)"],
  pre1987: { D: 0.90, O: 0.90, A: 0.85, R: 0.90 } as StateVector,
  pre2010: { D: 0.95, O: 0.95, A: 0.99, R: 0.92 } as StateVector,
  jacobian: {
    rowNames: ["D (Liquidity)", "O (Return)", "A (Adaptability)", "R (Resilience)"],
    colNames: ["D", "O", "A", "R"],
    matrix: [
      [1.0, 0.4, 0.5, 0.3],
      [0.6, 1.0, 0.6, 0.4],
      [0.6, 0.5, 1.0, 0.2], // J31 = 0.60
      [0.7, 0.6, 0.8, 1.0]
    ]
  } as JacobianMatrix,
  perturbation1987: {
    label: "Lunes Negro (1987)",
    delta_u0: [-0.3, -0.1, -0.4, -0.5],
    tau: 100, // Persistent decay
  },
  perturbation2010: {
    label: "Flash Crash (2010)",
    delta_u0: [-0.6, -0.7, -0.1, -0.2],
    tau: 0.08, // Rapid decay (impulse)
  }
};

export const EXPOSURE_DATA = {
  author: "LUIS ANGEL VAZQUEZ MARTINEZ", // No tildes as requested
  projectName: "Deconstruccion",
  s0: { D: 0.92, O: 0.20, A: 0.45, R: 0.35 } as StateVector, // Quality, Vis, Algo, Resonance
  stateLabels: ["C (Quality / Authenticity)", "V (Visibility / Reach)", "A (Algorithm Adaptability)", "R (Resonance / Community)"],
  jacobian: {
    rowNames: ["C (Quality)", "V (Visibility)", "A (Algorithm)", "R (Resonance)"],
    colNames: ["C", "V", "A", "R"],
    matrix: [
      [1.0, -0.18, 0.15, 0.10],
      [0.65, 1.0, 0.85, 0.25],
      [0.30, 0.60, 1.0, 0.45],
      [0.15, 0.40, 0.75, 1.0]
    ]
  } as JacobianMatrix,
  campaignPerturbation: {
    delta_u0: [0, 0.60, 0.30, 0], // Vis increase, Algo adaptation
  },
  alphaFirewallThreshold: 0.85, // Quality invariant threshold
  initialHydraTree: [
    {
      id: "H_root",
      label: "Raíz de Deriva",
      category: "Core",
      coherence: 0.95,
      resistance: 0.90,
      status: "Active",
      description: "La visibilidad algorítmica y el ROAS de Meta sufren un shock de deriva transitoria.",
      parentId: null,
    },
    // Rama A
    {
      id: "H_A1",
      label: "A.1: Causalidad Estructural",
      category: "Structural",
      coherence: 0.88,
      resistance: 0.85,
      status: "Active",
      description: "La inestabilidad proviene de un feedback loop positivo algorítmico que amplifica sesgos.",
      parentId: "H_root",
    },
    {
      id: "H_A1_1",
      label: "A.1.1: Sesgo de Dataset",
      category: "Structural",
      coherence: 0.45,
      resistance: 0.35,
      status: "Pending", // Will be pruned since score falls below threshold
      description: "El sesgo es intrínseco al dato histórico del feed de entrenamiento.",
      parentId: "H_A1",
    },
    {
      id: "H_A1_2",
      label: "A.1.2: Sesgo de Refuerzo",
      category: "Structural",
      coherence: 0.90,
      resistance: 0.88,
      status: "Pending", // Will bifurcate
      description: "El sesgo emerge de la propia arquitectura de optimización y retroalimentación.",
      parentId: "H_A1",
    },
    {
      id: "H_A2",
      label: "A.2: Dinámica de Atención",
      category: "Stochastic",
      coherence: 0.91,
      resistance: 0.86,
      status: "Active",
      description: "La inestabilidad se origina por la saturación rápida de la atención del usuario.",
      parentId: "H_root",
    },
    {
      id: "H_A2_1",
      label: "A.2.1: Desviación del Perfil",
      category: "Stochastic",
      coherence: 0.93,
      resistance: 0.89,
      status: "Pending", // Will bifurcate
      description: "La saturación provoca cambios discretos en el vector de intereses del usuario.",
      parentId: "H_A2",
    },
    {
      id: "H_A2_2",
      label: "H.2.2: Memoria Infinita",
      category: "Stochastic",
      coherence: 0.50,
      resistance: 0.42,
      status: "Pending", // Will be pruned
      description: "El modelo no posee un decaimiento temporal (capacidad de olvido) de interacciones antiguas.",
      parentId: "H_A2",
    }
  ] as HydraNode[]
};
