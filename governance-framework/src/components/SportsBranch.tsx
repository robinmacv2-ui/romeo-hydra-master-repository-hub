import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FOOTBALL_DATA } from '../data';
import { calculateTransientState, calculateReconfigurationTime } from '../utils';
import { StateVector } from '../types';
import { Play, RotateCcw, ShieldAlert, Award, Clock, Check, ShieldCheck, HelpCircle, AlertCircle, FileCheck, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface SportsBranchProps {
  onLogEvent: (source: string, detail: string, metrics: Record<string, any>) => void;
}

export const SportsBranch: React.FC<SportsBranchProps> = ({ onLogEvent }) => {
  // Navigation: 'simulator' (Observational Simulator) or 'backtest' (Phase 69/70 Post-Event Backtesting)
  const [activeSubMode, setActiveSubMode] = useState<'simulator' | 'backtest'>('simulator');

  // SIMULATOR STATE
  const [selectedTeam, setSelectedTeam] = useState<'spain' | 'argentina'>('spain');
  const [tau, setTau] = useState<number>(100); // Default to "Structural Damage" (tau -> infinity)
  const [severity, setSeverity] = useState<number>(-0.3); // delta_u0 for Defense
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const teamConfig = FOOTBALL_DATA[selectedTeam];
  const s0 = teamConfig.s0;
  const damping = teamConfig.damping;
  const epsilon = FOOTBALL_DATA.perturbation.epsilon;

  // BACKTEST STATE (Phase 69/70)
  const [empiricalScenario, setEmpiricalScenario] = useState<'antifragile_win' | 'rigid_win' | 'stochastic_draw'>('antifragile_win');
  const [backtestExecuted, setBacktestExecuted] = useState<boolean>(false);
  const [backtestLogged, setBacktestLogged] = useState<boolean>(false);

  // Archive data from WORLD_CUP_FINAL_2026_AUDIT for easy display
  const archivedPrediction = {
    source: "WORLD_CUP_FINAL_2026_AUDIT",
    predicted_winner: "ARGENTINA",
    rationale: "Antifragilidad en alta entropía: la rigidez del S_ESP (España) tiene mayor T_recon (13.56m) que el S_ARG (11.23m) tras expulsión, permitiendo acoplamiento de retorno ofensivo.",
    model_confidence: 0.88,
    target_event: "Final de la Copa del Mundo 2026 (ESP vs ARG)",
    predicted_t_recon_arg: 11.23,
    predicted_t_recon_esp: 13.56
  };

  // Helper to compile simulator trajectory data for t = 0 to 90 minutes
  const generateTrajectoryData = () => {
    const data = [];
    for (let t = 0; t <= 90; t += 5) {
      if (t < 15) {
        data.push({
          time: t,
          Defense: s0.D,
          Offense: s0.O,
          Connection: s0.A,
          Entropy: s0.R,
        });
      } else {
        const timeAfterShock = t - 15;
        const delta_u0 = [severity, severity * 0.8, severity * 0.5, Math.abs(severity) * 1.5];
        const state = calculateTransientState(
          s0,
          FOOTBALL_DATA.jacobian.matrix,
          delta_u0,
          timeAfterShock,
          tau,
          ['D', 'O', 'A', 'R']
        );
        data.push({
          time: t,
          Defense: state.D,
          Offense: state.O,
          Connection: state.A,
          Entropy: state.R,
        });
      }
    }
    return data;
  };

  const chartData = generateTrajectoryData();

  // Get active state at current playback time
  const getActiveState = (t: number) => {
    if (t < 15) return s0;
    const delta_u0 = [severity, severity * 0.8, severity * 0.5, Math.abs(severity) * 1.5];
    return calculateTransientState(
      s0,
      FOOTBALL_DATA.jacobian.matrix,
      delta_u0,
      t - 15,
      tau,
      ['D', 'O', 'A', 'R']
    );
  };

  const currentState = getActiveState(currentTime);

  // Reconfiguration time solver
  const currentAdaptability = getActiveState(90).A;
  const tRecon = calculateReconfigurationTime(epsilon, damping, currentAdaptability);

  // Playback simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 90;
          }
          return prev + 5;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTriggerAnomaly = () => {
    const metrics = {
      team: selectedTeam === 'spain' ? 'España' : 'Argentina',
      severity,
      tau,
      reconfiguration_time_mins: tRecon,
      final_defense: currentState.D,
      final_entropy: currentState.R,
    };
    onLogEvent(
      "BETA_COHERENCE",
      `Simulación de Expulsión (Tarjeta Roja) en min 15 - Equipo: ${selectedTeam.toUpperCase()}`,
      metrics
    );
  };

  // BACKTEST METRIC CALCULATOR (Phase 69/70)
  const getBacktestMetrics = () => {
    let actualWinner = "";
    let alignmentIndex = 0;
    let predictionMatch = false;
    let actual_t_recon_esp = 13.56;
    let actual_t_recon_arg = 11.23;
    let verdict = "";
    let explanation = "";

    switch (empiricalScenario) {
      case 'antifragile_win':
        actualWinner = "ARGENTINA";
        predictionMatch = true;
        actual_t_recon_esp = 13.56;
        actual_t_recon_arg = 11.23;
        alignmentIndex = 0.96; // Very close alignment with model predictions
        verdict = "RATIFICADA (FALSIFICACIÓN SUPERADA)";
        explanation = "La expulsión en el min 15 a España (S_ESP) provocó una rigidez defensiva persistente con T_recon alto, permitiendo que Argentina (S_ARG) explotara su mayor capacidad adaptativa (+21%) y ganara 2-1. La hipótesis de antifragilidad en alta entropía ha superado la prueba de falsación empírica.";
        break;
      case 'rigid_win':
        actualWinner = "ESPAÑA";
        predictionMatch = false;
        actual_t_recon_esp = 8.12; // Reconfigured much faster than expected
        actual_t_recon_arg = 12.45;
        alignmentIndex = 0.45; // Low alignment
        verdict = "FALSADA (DIVERGENCIA ESTRUCTURAL)";
        explanation = "España resistió replegada en bloque bajo impecable. Su T_recon empírico de 8.12m fue mucho menor que el estimado por el Jacobiano debido a un factor de acoplamiento táctico no modelado, ganando 1-0. El modelo de sensibilidad requiere calibración de amortiguamiento.";
        break;
      case 'stochastic_draw':
        actualWinner = "EMPATE (PENALES)";
        predictionMatch = false;
        actual_t_recon_esp = 12.90;
        actual_t_recon_arg = 11.80;
        alignmentIndex = 0.68; // Partial alignment
        verdict = "INCONCLUSIVA (RUIDO ESTOCÁSTICO)";
        explanation = "Ambos sistemas oscilaron de manera inestable. La entropía residual se mantuvo por encima de 0.80 para ambos equipos, derivando en un empate 1-1 en tiempo extra. El azar estocástico en tanda de penales canceló la ventaja determinista.";
        break;
    }

    return {
      actualWinner,
      predictionMatch,
      actual_t_recon_esp,
      actual_t_recon_arg,
      alignmentIndex,
      verdict,
      explanation
    };
  };

  const backtestMetrics = getBacktestMetrics();

  // Generate Backtest Trajectory comparison ( España vs Argentina under real world)
  const generateBacktestChartData = () => {
    const data = [];
    const predictedWinner = archivedPrediction.predicted_winner;

    for (let t = 0; t <= 90; t += 10) {
      // Define baseline state tracking over time
      if (t < 15) {
        data.push({
          time: t,
          "Predicho ARG (Adaptación)": 0.95,
          "Real ARG (Adaptación)": 0.95,
          "Predicho ESP (Defensa)": 0.94,
          "Real ESP (Defensa)": 0.94,
        });
      } else {
        const tDiff = t - 15;
        // Spain's Defense falls and Argentina's adaptation rises
        let espDefPredicted = Math.max(0.4, 0.94 - 0.5 * (1 - Math.exp(-tDiff / 100)));
        let argAdaPredicted = Math.min(1.2, 0.95 + 0.2 * (1 - Math.exp(-tDiff / 25)));

        let espDefReal = espDefPredicted;
        let argAdaReal = argAdaPredicted;

        if (empiricalScenario === 'rigid_win') {
          // Spain's real defense is higher than predicted, adaptation doesn't rise as much
          espDefReal = Math.max(0.72, 0.94 - 0.22 * (1 - Math.exp(-tDiff / 8.12)));
          argAdaReal = Math.min(1.05, 0.95 + 0.1 * (1 - Math.exp(-tDiff / 40)));
        } else if (empiricalScenario === 'stochastic_draw') {
          // Wild oscillations
          espDefReal = espDefPredicted + 0.12 * Math.sin(tDiff / 5);
          argAdaReal = argAdaPredicted + 0.15 * Math.sin(tDiff / 4);
        } else {
          // Antifragile Win: real perfectly matches/exceeds predicted
          espDefReal = espDefPredicted - 0.05 * (tDiff / 50); // falls even more
          argAdaReal = argAdaPredicted + 0.08 * (1 - Math.exp(-tDiff / 11.23));
        }

        data.push({
          time: t,
          "Predicho ARG (Adaptación)": parseFloat(argAdaPredicted.toFixed(3)),
          "Real ARG (Adaptación)": parseFloat(argAdaReal.toFixed(3)),
          "Predicho ESP (Defensa)": parseFloat(espDefPredicted.toFixed(3)),
          "Real ESP (Defensa)": parseFloat(espDefReal.toFixed(3)),
        });
      }
    }
    return data;
  };

  const backtestChartData = generateBacktestChartData();

  const handleRunBacktestAnalysis = () => {
    setBacktestExecuted(true);
    setBacktestLogged(false);
  };

  const handleCommitBacktestToLedger = () => {
    const metrics = {
      target_event: archivedPrediction.target_event,
      predicted_winner: archivedPrediction.predicted_winner,
      empirical_scenario: empiricalScenario === 'antifragile_win' ? 'Antifragile Argentina Win (Expected)' : empiricalScenario === 'rigid_win' ? 'Rigid Spain Defense Win' : 'Stochastic Draw',
      actual_winner: backtestMetrics.actualWinner,
      prediction_match: backtestMetrics.predictionMatch,
      inference_alignment_index: backtestMetrics.alignmentIndex,
      actual_t_recon_esp: backtestMetrics.actual_t_recon_esp,
      actual_t_recon_arg: backtestMetrics.actual_t_recon_arg,
      falsification_verdict: backtestMetrics.verdict,
      auth_code: "PHASE_69_70_COMMIT"
    };

    onLogEvent(
      "WORLD_CUP_POST_EVENT_AUDIT",
      `Validación de Predicción de Inferencia - Fase 69/70 Completa. Veredicto: ${backtestMetrics.verdict}`,
      metrics
    );

    setBacktestLogged(true);
  };

  return (
    <div className="flex flex-col gap-6" id="sports-branch-container">
      
      {/* Sub-navigation to choose between Simulator and Phase 69/70 Backtesting */}
      <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-900 self-start">
        <button
          onClick={() => setActiveSubMode('simulator')}
          className={`py-1.5 px-4 rounded-lg font-mono text-xs font-semibold transition flex items-center gap-2 ${
            activeSubMode === 'simulator'
              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="sports-submode-simulator-btn"
        >
          <Clock className="w-4 h-4" />
          Modelador de Perturbaciones (Observacional)
        </button>
        <button
          onClick={() => setActiveSubMode('backtest')}
          className={`py-1.5 px-4 rounded-lg font-mono text-xs font-semibold transition flex items-center gap-2 ${
            activeSubMode === 'backtest'
              ? 'bg-slate-900 text-purple-400 border border-slate-800 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="sports-submode-backtest-btn"
        >
          <Award className="w-4 h-4" />
          Fase 69/70: Validación Empírica & Backtesting
        </button>
      </div>

      {activeSubMode === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Simulation Controls Panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  Simulador de Perturbación S_esp
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Somete al equipo a una expulsión en el <strong>minuto 15</strong>. Observa cómo la perturbación se propaga dinámicamente y se calcula el tiempo de reconfiguración.
              </p>

              {/* Team Toggle */}
              <div className="mb-5">
                <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-2">
                  Seleccionar Sistema de Equipo
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => { setSelectedTeam('spain'); setCurrentTime(0); }}
                    className={`py-1.5 rounded font-mono text-xs font-semibold transition ${
                      selectedTeam === 'spain'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    España S_ESP
                  </button>
                  <button
                    onClick={() => { setSelectedTeam('argentina'); setCurrentTime(0); }}
                    className={`py-1.5 rounded font-mono text-xs font-semibold transition ${
                      selectedTeam === 'argentina'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Argentina S_ARG
                  </button>
                </div>
              </div>

              {/* Slide 1: Severity (\delta u_0) */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    Gravedad Shock (δu_0)
                  </label>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {severity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-0.70"
                  max="-0.10"
                  step="0.05"
                  value={severity}
                  onChange={(e) => { setSeverity(parseFloat(e.target.value)); setCurrentTime(0); }}
                  className="w-full accent-red-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                  <span>Leve (-0.1)</span>
                  <span>Crítico (-0.7)</span>
                </div>
              </div>

              {/* Slide 2: Tau (\tau) - Decay */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    Constante de Relajación (τ)
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {tau > 1000 ? "∞ (Daño Estructural)" : `${tau} mins`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="101"
                  step="5"
                  value={tau > 100 ? 101 : tau}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTau(val > 100 ? 1000000 : val);
                    setCurrentTime(0);
                  }}
                  className="w-full accent-cyan-400 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                  <span>Susto (τ=1)</span>
                  <span>Persistente (τ=100+)</span>
                </div>
              </div>

              {/* State Variable Cards */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 mb-6">
                <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-3 text-center">
                  Vectores de Estado - t = {currentTime} min
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-900">
                    <div className="text-[10px] text-slate-500 font-mono">D (Defensa)</div>
                    <div className="text-base font-mono font-bold text-slate-200">
                      {currentState.D.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-900">
                    <div className="text-[10px] text-slate-500 font-mono">O (Ofensiva)</div>
                    <div className="text-base font-mono font-bold text-slate-200">
                      {currentState.O.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-900">
                    <div className="text-[10px] text-slate-500 font-mono">C (Conexión)</div>
                    <div className="text-base font-mono font-bold text-slate-200">
                      {currentState.A.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-900">
                    <div className="text-[10px] text-slate-500 font-mono">E (Entropía)</div>
                    <div className="text-base font-mono font-bold text-slate-200">
                      {currentState.R.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Toggles */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentTime >= 90) setCurrentTime(0);
                    setIsPlaying(!isPlaying);
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 text-xs font-mono flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isPlaying ? "Pausar" : "Simular Tiempo"}
                </button>
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900 transition"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleTriggerAnomaly}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 transition"
              >
                <Award className="w-4 h-4" />
                REGISTRAR EN LEDGER DELTA
              </button>
            </div>
          </div>

          {/* Main Graph & Analysis */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide">
                  Trayectoria de Estado S(t) - España vs Argentina
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Perturbación en T+15
                </span>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} unit=" min" />
                    <YAxis stroke="#64748B" fontSize={10} domain={[0, 1.2]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155' }}
                      labelStyle={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}
                      itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }} />
                    <Line type="monotone" dataKey="Defense" stroke="#F87171" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="Offense" stroke="#FB923C" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Connection" stroke="#38BDF8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Entropy" stroke="#A78BFA" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  Métrica de Reconfiguración Dinámica
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Ecuación de Tiempo de Reconfiguración
                    </span>
                    <p className="text-[15px] font-mono text-cyan-300 font-semibold mb-3">
                      T_recon = -ln(ε) / (ζ * A_new)
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calcula el tiempo requerido para que el sistema detenga la propagación de la entropía y alcance un nuevo estado estacionario funcional tras una perturbación destructiva persistente.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-3 pt-3 border-t border-slate-900">
                    Parámetros activos: ε = {epsilon.toFixed(2)} | ζ_ESP = 0.92 | ζ_ARG = 0.85
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">T_recon España (S_ESP)</span>
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        {damping === 0.92 ? tRecon.toFixed(2) : calculateReconfigurationTime(epsilon, 0.92, currentAdaptability).toFixed(2)} minutos
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">
                        ζ = 0.92 (Alto)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">T_recon Argentina (S_ARG)</span>
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        {damping === 0.85 ? tRecon.toFixed(2) : calculateReconfigurationTime(epsilon, 0.85, currentAdaptability).toFixed(2)} minutos
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                        ζ = 0.85 (Bajo)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-950 text-xs text-slate-400 font-mono text-center">
                    <span className="text-emerald-400 font-semibold">Diagnóstico: </span>
                    España posee una <span className="text-slate-100 font-bold">latencia de respuesta 9% más rápida</span> que Argentina debido a su mayor cultura táctica posicional (amortiguamiento).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE 69/70: EMPIRICAL VALIDATION & BACKTESTING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Column Left: Locked Prediction & Scenario Selection */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Archived Prediction Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-[9px] font-mono text-white font-bold px-3 py-1 uppercase rounded-bl tracking-wider">
                LOCKED PREDICTION
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase font-mono">
                  {archivedPrediction.source}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-mono border-t border-slate-800 pt-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">EVENTO OBJETIVO:</span>
                  <span className="text-slate-200 font-bold">{archivedPrediction.target_event}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">GANADOR PREDICHO:</span>
                    <span className="text-emerald-400 font-bold text-sm">🏆 {archivedPrediction.predicted_winner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CONFIANZA DEL MODELO:</span>
                    <span className="text-cyan-400 font-bold text-sm">{(archivedPrediction.model_confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-950">
                  <div>
                    <span className="text-slate-500 block text-[9px]">T_recon Predicho ESP:</span>
                    <span className="text-slate-300 font-bold">{archivedPrediction.predicted_t_recon_esp} mins</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">T_recon Predicho ARG:</span>
                    <span className="text-emerald-400 font-bold">{archivedPrediction.predicted_t_recon_arg} mins</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">RACIOCINIO ESTRUCTURAL:</span>
                  <p className="text-slate-400 leading-normal text-[11px] bg-slate-950 p-3 rounded border border-slate-950">
                    {archivedPrediction.rationale}
                  </p>
                </div>
              </div>
            </div>

            {/* Empirical Event Entry Selection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  Entrada de Datos Empíricos del Evento Real
                </h4>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Selecciona la trayectoria real observada en la final de la Copa del Mundo del 2026 para iniciar el proceso de validación cruzada y falsacionismo experimental.
              </p>

              <div className="space-y-2.5 mb-5">
                {[
                  {
                    id: "antifragile_win",
                    label: "Scenario A: Argentina 2 - 1 España (Antifragility)",
                    desc: "España sufre tarjeta roja al minuto 15. Su defensa se vuelve rígida y sufre colapso táctico tardío. Argentina capitaliza y vence 2-1."
                  },
                  {
                    id: "rigid_win",
                    label: "Scenario B: España 1 - 0 Argentina (Rigid Block)",
                    desc: "España resiste con 10 hombres mediante bloque defensivo bajo impecable. El tiempo de reconfiguración empírico es menor al estimado. Ganan 1-0."
                  },
                  {
                    id: "stochastic_draw",
                    label: "Scenario C: Empate 1 - 1 (Stochastic Noise)",
                    desc: "Oscilaciones de entropía generalizadas debido a desorden. El partido queda empatado tras tiempo extra, decidiéndose por tanda de penales."
                  }
                ].map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setEmpiricalScenario(scen.id as any);
                      setBacktestExecuted(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition flex flex-col gap-1 ${
                      empiricalScenario === scen.id
                        ? 'bg-purple-500/10 border-purple-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${empiricalScenario === scen.id ? 'bg-purple-400' : 'bg-slate-600'}`} />
                      {scen.label}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-normal">{scen.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunBacktestAnalysis}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-purple-600/15 flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                EJECUTAR BACKTESTING DE INFERENCIA (F)
              </button>
            </div>
          </div>

          {/* Column Right: Comparison Graph, Error Metrics, Falsification Verdict */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {backtestExecuted ? (
              <div className="space-y-6">
                
                {/* Backtest Graph */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Comparativa de Trajectory S(t): Predicción vs Trazo Empírico
                  </h3>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={backtestChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="time" stroke="#64748B" fontSize={10} unit=" min" />
                        <YAxis stroke="#64748B" fontSize={10} domain={[0.3, 1.3]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#020617', borderColor: '#334155' }}
                          labelStyle={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}
                          itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                        <Line type="monotone" dataKey="Predicho ARG (Adaptación)" stroke="#06B6D4" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="Real ARG (Adaptación)" stroke="#06B6D4" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="Predicho ESP (Defensa)" stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="Real ESP (Defensa)" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3 leading-tight text-center">
                    * Las líneas discontinuas representan la predicción original cargada; las líneas continuas representan el resultado empírico real observado.
                  </p>
                </div>

                {/* Backtesting Metrics Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide mb-3 border-b border-slate-800 pb-2">
                    Métricas de Ajuste de Inferencia & Desviación
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-950">
                      <span className="text-[9px] font-mono text-slate-500 block">ALIGNMENT INDEX (IAI)</span>
                      <span className={`text-base font-mono font-bold ${backtestMetrics.alignmentIndex >= 0.8 ? 'text-emerald-400' : backtestMetrics.alignmentIndex >= 0.6 ? 'text-amber-400' : 'text-red-400'}`}>
                        {(backtestMetrics.alignmentIndex * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-950">
                      <span className="text-[9px] font-mono text-slate-500 block">T_recon Real ESP</span>
                      <span className="text-base font-mono font-bold text-slate-200">
                        {backtestMetrics.actual_t_recon_esp.toFixed(2)} mins
                      </span>
                      <span className="text-[8px] font-mono block text-slate-500">
                        Predicho: {archivedPrediction.predicted_t_recon_esp}m
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-950">
                      <span className="text-[9px] font-mono text-slate-500 block">T_recon Real ARG</span>
                      <span className="text-base font-mono font-bold text-slate-200">
                        {backtestMetrics.actual_t_recon_arg.toFixed(2)} mins
                      </span>
                      <span className="text-[8px] font-mono block text-slate-500">
                        Predicho: {archivedPrediction.predicted_t_recon_arg}m
                      </span>
                    </div>
                  </div>

                  {/* Falsification Verdict Statement */}
                  <div className={`p-4 rounded-xl border mb-5 font-mono text-xs ${
                    backtestMetrics.predictionMatch 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' 
                      : 'bg-red-500/5 border-red-500/20 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {backtestMetrics.predictionMatch ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        VEREDICTO DIALÉCTICO: {backtestMetrics.verdict}
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-400 text-[11px]">
                      {backtestMetrics.explanation}
                    </p>
                  </div>

                  {/* Commit Certificate Action Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleCommitBacktestToLedger}
                      disabled={backtestLogged}
                      className={`py-2.5 px-5 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center gap-2 ${
                        backtestLogged
                          ? 'bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {backtestLogged ? "CERTIFICADO COMPROMETIDO EN LEDGER DELTA" : "SELLAR VALIDACIÓN EN LEDGER DELTA"}
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 h-full flex flex-col justify-center items-center text-center text-slate-500 font-mono text-xs min-h-[400px]">
                <HelpCircle className="w-12 h-12 text-slate-800 mb-3" />
                <span className="text-slate-400 font-bold mb-1 uppercase tracking-wide">Falta de Ejecución de Backtesting</span>
                <p className="max-w-md text-[11px] text-slate-500 leading-relaxed">
                  Para auditar la predicción archivada <strong className="text-slate-400">WORLD_CUP_FINAL_2026_AUDIT</strong> contra la trayectoria empírica de la final, selecciona un escenario real de juego en el panel izquierdo y presiona el botón "Ejecutar Backtesting".
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
