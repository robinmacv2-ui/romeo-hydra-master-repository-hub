import React, { useState } from 'react';
import { HexaNode, Regime, LedgerBlock } from '../types';
import {
  Flame,
  GitCommit,
  Shield,
  Activity,
  Zap,
  Sliders,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Terminal,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface GenesisEvolutionTabProps {
  activeRegime: Regime;
  onInjectChaosTest?: () => void;
  jacobianThreshold: number;
}

export const GenesisEvolutionTab: React.FC<GenesisEvolutionTabProps> = ({
  activeRegime,
  onInjectChaosTest,
  jacobianThreshold,
}) => {
  const [selectedEra, setSelectedEra] = useState<'ENTROPY' | 'EMMOROR' | 'HYDRA'>('HYDRA');
  const [entropyLevel, setEntropyLevel] = useState<number>(0.65);
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.75);
  const [activeAxiom, setActiveAxiom] = useState<number>(0);

  // Simulation values derived from user controls
  const safeEntropy = typeof entropyLevel === 'number' && !isNaN(entropyLevel) ? entropyLevel : 0.65;
  const safeFriction = typeof frictionCoeff === 'number' && !isNaN(frictionCoeff) ? frictionCoeff : 0.75;
  const safeThreshold = typeof jacobianThreshold === 'number' && !isNaN(jacobianThreshold) ? jacobianThreshold : 0.6;

  const simulatedHallucinationProb = Math.min(0.99, parseFloat((safeEntropy * (1.2 - safeFriction * 0.8)).toFixed(2)));
  const simulatedJacobianNorm = parseFloat((safeEntropy * 1.1).toFixed(2));
  const simulatedDampingNeeded = simulatedJacobianNorm > safeThreshold;
  const simulatedHSI = parseFloat(Math.max(0.1, 1 - (simulatedJacobianNorm * 0.4) + (safeFriction * 0.3)).toFixed(2));

  const eras = [
    {
      id: 'ENTROPY' as const,
      title: '1. Entropía Filosófica',
      subtitle: 'El Génesis Conceptual',
      period: 'Fase Inicial — Teoría del Caos Informativo',
      color: 'from-amber-500/20 to-red-500/10 border-amber-500/40 text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Flame,
      summary: 'Estudio de la degradación estocástica y disipación de coherencia en modelos de lenguaje sin barreras de contención.',
    },
    {
      id: 'EMMOROR' as const,
      title: '2. EMMOROR (Resistencia)',
      subtitle: 'Tensión & Amortiguación',
      period: 'Fase Intermedia — Mecánica de Fricción Dialéctica',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: GitCommit,
      summary: 'Sistemas de contención basados en la norma Jacobiana ||J|| y amortiguación α para disipar tensión entre modelos competidores.',
    },
    {
      id: 'HYDRA' as const,
      title: '3. Manifiesto ROMEO-HYDRA',
      subtitle: 'Gobernanza Hexa-Nodo & WORM',
      period: 'DOI: 10.5281/zenodo.21406719',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: Shield,
      summary: 'Arquitectura viva Hexa-Nodo con arbitraje Coherencia Lógica Convexa (CLC), sello inmutable WORM y régimen dinámico.',
    },
  ];

  const axioms = [
    {
      id: 1,
      title: 'Axioma 1: Invarianza Geométrica de Coherencia',
      quote: '«La verdad de un sistema multimodelo no es la suma de sus opiniones, sino el centroide de su intersección lógica en el espacio convexo.»',
      description: 'El núcleo de arbitraje CLC proyecta las salidas de los 6 modelos en un espacio métrico común. Si la distancia entre proyectores excede la métrica MSH, se rechaza la convergencia.',
      impl: 'Espacio Vectores Ω = (C, S, R) con validación de norma convexa.',
    },
    {
      id: 2,
      title: 'Axioma 2: Disipación Jacobiana Controlada',
      quote: '«El caos inducido por perturbación adversarial debe convertirse en disipación térmica mediante la amortiguación de la derivada C\' = C · α.»',
      description: 'Cuando la sensibilidad del sistema excede θ = 0.60, el factor α atenuará proporcionalmente la confianza antes de escribir el bloque en el registro.',
      impl: 'Jacobian Damping Matrix J = ∂F(S)/∂S.',
    },
    {
      id: 3,
      title: 'Axioma 3: Inmutabilidad Forense WORM',
      quote: '«Lo que se ha verificado en consenso queda anclado criptográficamente y no puede ser alterado ni por el operador más privilegiado.»',
      description: 'Cada veredicto final se sella con hashes SHA-256 encadenados y firmas criptográficas distribuidas de los 5 motores auxiliares más el Árbitro CLC.',
      impl: 'Sello WORM (Write Once Read Many) con trazabilidad forense delta.',
    },
    {
      id: 4,
      title: 'Axioma 4: Gradación de Regímenes de Soberanía',
      quote: '«Un sistema resiliente no opera estáticamente; transita dinámicamente entre contención estricta y adaptación continua.»',
      description: 'Gobernanza adaptativa organizada en cuatro niveles operativos (Alpha, Beta, Gamma, Delta) adaptándose al entorno de amenaza en tiempo real.',
      impl: 'Matriz de transición de régimen (Régimen Activo: ' + activeRegime + ').',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300">
      {/* Top Banner & DOI Reference */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-wide uppercase">
                Génesis & Evolución Arquitectónica (Entropy → EMMOROR → ROMEO-HYDRA)
              </h2>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Trazabilidad conceptual e intelectual del marco de gobernanza cognitiva. Visualización de la transición desde la <span className="text-amber-300 font-bold">Entropía Filosófica</span> inicial, pasando por la <span className="text-blue-300 font-bold">Resistencia EMMOROR</span>, hasta el <span className="text-emerald-400 font-bold">Manifiesto ROMEO-HYDRA (DOI: 10.5281/zenodo.21406719)</span>.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col items-end justify-center min-w-[200px]">
            <span className="text-[10px] text-slate-500 uppercase">Documento de Referencia</span>
            <span className="text-emerald-400 font-bold text-xs">DOI: 10.5281/zenodo.21406719</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Versión Oficial v3.0-RC1</span>
          </div>
        </div>
      </div>

      {/* Interactive 3-Stage Timeline Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {eras.map((era) => {
          const Icon = era.icon;
          const isSelected = selectedEra === era.id;
          return (
            <div
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                isSelected
                  ? `bg-slate-900 border-2 ${era.color.split(' ')[2]} shadow-xl ring-1 ring-emerald-500/20`
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${era.badgeBg}`}>
                  {era.subtitle}
                </span>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{era.title}</h3>
              <p className="text-[10px] text-slate-400 font-mono mb-2">{era.period}</p>
              <p className="text-xs text-slate-300 leading-normal line-clamp-3">{era.summary}</p>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-emerald-400">
                  <span>FASE SELECCIONADA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Era View Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-6">
        {selectedEra === 'ENTROPY' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase">1. Entropía Filosófica — El Génesis del Caos Informativo</h3>
                <p className="text-[11px] text-slate-400">Origen teórico sobre la degradación del sentido y alucinación en modelos estocásticos libres.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Fundamentos de Disipación de Información
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  En el principio del marco conceptual, se postuló que todo modelo de inteligencia artificial no restringido se comporta como un sistema termodinámico abierto: la acumulación de contexto sin filtrado geométrico incrementa la <span className="text-amber-300 font-bold">Entropía de Información (S)</span>.
                </p>
                <div className="bg-slate-900 p-3 rounded border border-amber-500/30 text-[11px]">
                  <span className="text-slate-400 font-bold block mb-1">Ecuación Fundamental de Entropía Estocástica:</span>
                  <code className="text-amber-300 block font-mono">S(p) = -∑ p(x) · log₂ p(x) + Δλ_ruido</code>
                  <span className="text-slate-500 text-[10px] block mt-1">Donde Δλ representa la derivada de ruido inducido por perturbación adversarial.</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" /> Simulador de Generación Estocástica
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Nivel de Entropía Contextual (S):</span>
                    <span className="text-amber-400 font-bold">{(entropyLevel * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={entropyLevel}
                    onChange={(e) => setEntropyLevel(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Riesgo de Alucinación Estimado:</span>
                      <span className={simulatedHallucinationProb > 0.5 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {(simulatedHallucinationProb * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          simulatedHallucinationProb > 0.6 ? 'bg-red-500' : simulatedHallucinationProb > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${simulatedHallucinationProb * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEra === 'EMMOROR' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <GitCommit className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase">2. EMMOROR — Resistencia Estructural & Amortiguación Dialéctica</h3>
                <p className="text-[11px] text-slate-400">Mecanismos de fricción competitiva y cálculo de matriz Jacobiana para disipar tensión entre modelos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> La Trancisión hacia la Fricción Regulada
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Para evitar que el caos de la Entropía destruyera la veracidad, EMMOROR introdujo la <span className="text-blue-300 font-bold">Fricción Dialéctica</span>: enfrentar las inferencias de modelos heterogéneos para medir la tasa de cambio de coherencia con respecto a perturbaciones.
                </p>
                <div className="bg-slate-900 p-3 rounded border border-blue-500/30 text-[11px] space-y-1">
                  <span className="text-slate-400 font-bold block">Fórmula de Amortiguación Jacobiana EMMOROR:</span>
                  <code className="text-blue-300 block font-mono">||J|| = || ∂F(S) / ∂S || &gt; θ  ⟹  C&apos; = C · α</code>
                  <span className="text-slate-400 text-[10px] block pt-1">
                    Si la sensibilidad ||J|| excede el umbral θ ({jacobianThreshold}), el factor de atenuación α atenúa la varianza.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" /> Probador de Resistencia EMMOROR
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Coeficiente de Co-Fricción (α):</span>
                      <span className="text-blue-400 font-bold">{(frictionCoeff ?? 0.75).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.99"
                      step="0.05"
                      value={frictionCoeff}
                      onChange={(e) => setFrictionCoeff(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">Norma ||J|| Calculada</span>
                      <span className={`font-bold text-sm ${simulatedJacobianNorm > jacobianThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {simulatedJacobianNorm.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">Estado Amortiguador</span>
                      <span className={`font-bold text-xs ${simulatedDampingNeeded ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {simulatedDampingNeeded ? 'AMORTIGUACIÓN ACTIVA' : 'ESTABLE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEra === 'HYDRA' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase">3. Manifiesto ROMEO-HYDRA (DOI: 10.5281/zenodo.21406719)</h3>
                <p className="text-[11px] text-slate-400">
                  Cúspide de la gobernanza cognitiva. Integración Hexa-Nodo, Arbitraje CLC, Régimen Dinámico y Anclaje Inmutable WORM.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Topología Hexa-Nodo</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  6 motores especializados (ChatGPT, Grok WORM Guard, Meta Llama-3 Aisle, Gemini Invariantes, Claude Ética y Arbiter CLC) colaboran mediante consigna multimodelo.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Coherencia CLC</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Arbitraje por Coherencia Lógica Convexa. Proyección en vectores tripolares Ω = (C, S, R) para garantizar que el centroide cumpla los postulados formales.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Ledger Forense WORM</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Cada decisión aprobada o amortiguada genera un bloque encadenado con firmas SHA-256 e inmutabilidad garantizada sin posibilidad de alteración posterior.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Axiom Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Axiomas Fundamentales del Manifiesto ROMEO-HYDRA
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">DOI: 10.5281/zenodo.21406719</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {axioms.map((ax, idx) => (
            <button
              key={ax.id}
              onClick={() => setActiveAxiom(idx)}
              className={`p-3 rounded-lg text-left border transition-all ${
                activeAxiom === idx
                  ? 'bg-slate-800 border-emerald-500/50 text-emerald-300 font-bold shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Axioma 0{ax.id}</span>
              <span className="text-xs truncate block">{ax.title.split(':')[1] || ax.title}</span>
            </button>
          ))}
        </div>

        {/* Active Axiom Detail Card */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono">{axioms[activeAxiom].title}</h4>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-bold">
              ESTADO: ENFORCED IN CORE
            </span>
          </div>

          <p className="text-xs text-amber-200 italic font-serif bg-slate-900 p-3 rounded border border-amber-500/20">
            {axioms[activeAxiom].quote}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            {axioms[activeAxiom].description}
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Implementación en Código:</span>
            <span className="text-emerald-400 font-bold">{axioms[activeAxiom].impl}</span>
          </div>
        </div>
      </div>

      {/* Live Chaos-Resistance Testing Lab */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Laboratorio de Inyección de Perturbación Entrópica
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Evalúa en tiempo real la transición desde la inyección de caos (Entropía) hasta la amortiguación (EMMOROR) y el bloqueo final (HYDRA WORM).
          </p>
        </div>

        <button
          onClick={onInjectChaosTest}
          className="bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-mono font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 whitespace-nowrap transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simular Ciclo Entropía → EMMOROR → HYDRA</span>
        </button>
      </div>
    </div>
  );
};
