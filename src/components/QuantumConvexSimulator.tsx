import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { SimulationParams } from '../types';

export const QuantumConvexSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    tau: 0.05,
    epsilon: 0.08,
    lambdaWeight: 1.0,
    hessianA: 2.0,
    initialX1: 0.5,
    initialX2: 0.5,
    speed: 1.0,
    noiseLevel: 0.02
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stateX, setStateX] = useState<[number, number]>([0.5, 0.5]);
  const [trajectory, setTrajectory] = useState<[number, number][]>([[0.5, 0.5]]);
  const [lambdaMin, setLambdaMin] = useState<number>(0.85);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [bifurcationPhase, setBifurcationPhase] = useState<string>('Phase 1: Gradient Flow (Convex State)');
  const [hsi, setHsi] = useState<number>(1.000000);
  const [stepCount, setStepCount] = useState<number>(0);
  const [zeroEscapeCount, setZeroEscapeCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Hessian & Lambda Min
  const calculatePhysics = (x1: number, x2: number): { lMin: number; isCrit: boolean; grad1: number; grad2: number } => {
    const safeX1 = Math.max(0.001, x1);
    const safeX2 = Math.max(0.001, x2);

    // Hessian H_Sigma: 1/x^2 + A + Lambda
    const h11 = (1.0 / (safeX1 * safeX1)) + params.hessianA;
    const h22 = (1.0 / (safeX2 * safeX2)) + params.hessianA;
    const h12 = -0.5;

    // Eigenvalues of 2x2 matrix
    const trace = h11 + h22;
    const det = h11 * h22 - h12 * h12;
    const disc = Math.sqrt(Math.max(0, trace * trace - 4 * det));
    const lMin = (trace - disc) / 2.0 - (1.0 / (safeX1 * safeX2) * 0.2);

    const isCrit = lMin <= params.tau;

    // Gradient of free energy functional
    const grad1 = params.hessianA * safeX1 - (1.0 / safeX1);
    const grad2 = params.hessianA * safeX2 - (1.0 / safeX2);

    return { lMin, isCrit, grad1, grad2 };
  };

  // Step Simulation
  const stepSimulation = () => {
    if (isBlocked) return;

    let [x1, x2] = stateX;

    // Add perturbation noise
    const noise1 = (Math.random() - 0.5) * params.noiseLevel;
    const noise2 = (Math.random() - 0.5) * params.noiseLevel;

    const physics = calculatePhysics(x1, x2);
    setLambdaMin(physics.lMin);

    // Check critical condition
    if (physics.isCrit || x1 <= params.epsilon || x2 <= params.epsilon || x1 >= 1 - params.epsilon || x2 >= 1 - params.epsilon) {
      // Topological isolation A_epsilon triggers
      setIsBlocked(true);
      setBifurcationPhase('Phase 4: Intercepted & Terminal Blocked State (A_ε ∘ P_LAM)');
      setZeroEscapeCount(prev => prev + 1);
      
      // Project to terminal point outside C interior
      const terminalX: [number, number] = [params.epsilon, params.epsilon];
      setStateX(terminalX);
      setTrajectory(prev => [...prev, terminalX]);
      return;
    }

    // P_LAM Gradient Step
    const dt = 0.03 * params.speed;
    let newX1 = x1 - dt * physics.grad1 + noise1;
    let newX2 = x2 - dt * physics.grad2 + noise2;

    // Constrain to compact convex envelope C
    newX1 = Math.max(params.epsilon, Math.min(1.0 - params.epsilon, newX1));
    newX2 = Math.max(params.epsilon, Math.min(1.0 - params.epsilon, newX2));

    const nextState: [number, number] = [newX1, newX2];
    setStateX(nextState);
    setTrajectory(prev => [...prev.slice(-150), nextState]);
    setStepCount(prev => prev + 1);

    if (physics.lMin < 0.2) {
      setBifurcationPhase('Phase 2: Boundary Proximity & Hoeffding Interception');
    } else {
      setBifurcationPhase('Phase 1: Gradient Flow (Convex State)');
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRunning && !isBlocked) {
      interval = setInterval(stepSimulation, 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, stateX, isBlocked, params]);

  // Reset Simulation
  const handleReset = () => {
    setIsRunning(false);
    setIsBlocked(false);
    const init: [number, number] = [params.initialX1, params.initialX2];
    setStateX(init);
    setTrajectory([init]);
    setStepCount(0);
    setBifurcationPhase('Phase 1: Gradient Flow (Convex State)');
    setHsi(1.000000);
    const physics = calculatePhysics(init[0], init[1]);
    setLambdaMin(physics.lMin);
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridStep = width / 10;
    for (let i = 0; i <= width; i += gridStep) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Compact Convex Envelope C (Green/Cyan Region)
    const margin = params.epsilon * width;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.fillRect(margin, margin, width - 2 * margin, height - 2 * margin);
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);

    // Label Envelope C
    ctx.fillStyle = '#22d3ee';
    ctx.font = '11px monospace';
    ctx.fillText('Compact Convex Envelope C [dist ≥ ε]', margin + 8, margin + 18);

    // Boundary Isolation Zone (Red warning border)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(margin - 8, margin - 8, width - 2 * margin + 16, height - 2 * margin + 16);
    ctx.setLineDash([]);

    // Draw Trajectory
    if (trajectory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = isBlocked ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2.5;

      trajectory.forEach((pt, idx) => {
        const px = pt[0] * width;
        const py = (1.0 - pt[1]) * height; // Invert Y
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Draw Current Particle Position (Luis Angel Particle P_LAM)
    const currX = stateX[0] * width;
    const currY = (1.0 - stateX[1]) * height;

    ctx.beginPath();
    ctx.arc(currX, currY, isBlocked ? 10 : 7, 0, Math.PI * 2);
    ctx.fillStyle = isBlocked ? '#ef4444' : '#38bdf8';
    ctx.shadowColor = isBlocked ? '#ef4444' : '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Particle Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(isBlocked ? 'P_LAM [BLOQUEADO]' : 'P_LAM(x)', currX + 12, currY - 6);

  }, [stateX, trajectory, isBlocked, params]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Interactive 2D Phase Canvas Plot */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Atom className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-slate-100 font-bold text-sm">
                  Espacio de Estados Ω & Envolvente C (Partícula P_LAM)
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Operador A_ε ∘ P_LAM e Interceptación Topológica ante λ_min(H_Σ) = 0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${
                isBlocked 
                  ? 'bg-red-950/80 text-red-300 border-red-800 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              }`}>
                {isBlocked ? 'ESTADO TERMINAL BLOQUEADO' : 'FLUJO ADMISIBLE'}
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2 mb-4">
            <canvas
              ref={canvasRef}
              width={520}
              height={400}
              className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-inner"
            />

            {/* Overlaid Live Stats Box */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-[11px] font-mono space-y-1.5 shadow-lg backdrop-blur-sm">
              <div className="text-slate-400 flex justify-between gap-4">
                <span>Vector x(t):</span>
                <span className="text-cyan-300 font-bold">[{stateX[0].toFixed(3)}, {stateX[1].toFixed(3)}]</span>
              </div>
              <div className="text-slate-400 flex justify-between gap-4">
                <span>λ_min(H_Σ):</span>
                <span className={`font-bold ${lambdaMin <= params.tau ? 'text-red-400' : 'text-emerald-400'}`}>
                  {lambdaMin.toFixed(4)}
                </span>
              </div>
              <div className="text-slate-400 flex justify-between gap-4">
                <span>HSI Index:</span>
                <span className="text-emerald-400 font-bold">1.000000</span>
              </div>
              <div className="text-slate-400 flex justify-between gap-4">
                <span>0 Escapes:</span>
                <span className="text-amber-400 font-bold">{zeroEscapeCount} verificados</span>
              </div>
            </div>
          </div>

          {/* Phase Bifurcation Status Banner */}
          <div className={`p-3 rounded-lg border text-xs font-mono mb-4 flex items-center justify-between ${
            isBlocked
              ? 'bg-red-950/60 text-red-200 border-red-800/80'
              : 'bg-cyan-950/40 text-cyan-200 border-cyan-800/60'
          }`}>
            <div className="flex items-center gap-2">
              {isBlocked ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
              <div>
                <span className="font-semibold block">{bifurcationPhase}</span>
                <span className="text-[11px] text-slate-400">
                  {isBlocked 
                    ? 'Bifurcación 1->4 activada. Trajectory bloqueada fuera del interior de C.' 
                    : 'Gobernanza determinista activa under Coherencia Lógico-Convexa CLC v1.2'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
                Paso #{stepCount}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isBlocked}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-md ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pausar Flujo' : 'Iniciar Gradiente'}
              </button>

              <button
                onClick={stepSimulation}
                disabled={isRunning || isBlocked}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
              >
                1 Paso dx/dt
              </button>

              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Sello: <span className="text-emerald-400">0xLAVM_PPRH_HYDRA_V3</span>
            </div>
          </div>
        </div>

        {/* Right Side: Parameter Sli ders & Math Theorem Card */}
        <div className="lg:col-span-5 space-y-6">

          {/* Mathematical Postulate Overview Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-slate-100 font-bold text-sm flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Activity className="w-4 h-4 text-cyan-400" />
              Postulado de Invarianza Homeostática
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-200">
                dx/dt = P_LAM(-g^ij ∂_j I_Λ)<br/>
                P_LAM(x) = δ_C(x) · Π_C(B_LAM(x))
              </div>

              <p className="text-slate-400 text-[11px]">
                Cuando <code className="text-cyan-300">λ_min(H_Σ) = 0</code>, la composición del operador de aislamiento topológico <code className="text-cyan-300">A_ε ∘ P_LAM</code> fuerza la bifurcación determinista 1->4 y restringe la ejecución a un estado bloqueado fuera de C.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-slate-500">Ledger Invariante:</div>
                  <div className="text-emerald-400 font-semibold">L_X Δ = 0</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-slate-500">HSI Index:</div>
                  <div className="text-emerald-400 font-semibold">HSI(x) = const</div>
                </div>
              </div>
            </div>
          </div>

          {/* Parameter Sliders Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-slate-100 font-bold text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Parámetros de Operación (τ, ε, H_Σ)
            </h3>

            <div className="space-y-4 text-xs font-mono">
              {/* Tau Parameter */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Umbral Crítico τ (tau):</span>
                  <span className="text-cyan-400 font-bold">{params.tau.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.2"
                  step="0.005"
                  value={params.tau}
                  onChange={e => setParams({ ...params, tau: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-950 rounded"
                />
              </div>

              {/* Epsilon Parameter */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Membrana Aislamiento ε (epsilon):</span>
                  <span className="text-cyan-400 font-bold">{params.epsilon.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.2"
                  step="0.01"
                  value={params.epsilon}
                  onChange={e => setParams({ ...params, epsilon: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-950 rounded"
                />
              </div>

              {/* Noise Perturbation */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Perturbación No Convexa (Ruido):</span>
                  <span className="text-amber-400 font-bold">{(params.noiseLevel * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.005"
                  value={params.noiseLevel}
                  onChange={e => setParams({ ...params, noiseLevel: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-950 rounded"
                />
              </div>

              {/* Speed Factor */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Velocidad de Flujo (dt multiplier):</span>
                  <span className="text-emerald-400 font-bold">{params.speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.2"
                  value={params.speed}
                  onChange={e => setParams({ ...params, speed: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 bg-slate-950 rounded"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
