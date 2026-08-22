import React, { useState, useEffect } from 'react';
import {
  HexaNode,
  LedgerBlock,
  GovernanceSettings as GovernanceSettingsType,
  TelemetryEvent,
  Role,
  Toast,
} from './types';
import {
  INITIAL_HEXA_NODES,
  INITIAL_LEDGER_BLOCKS,
  INITIAL_GOVERNANCE_SETTINGS,
  INITIAL_TELEMETRY_EVENTS,
} from './data/initialData';
import { generateHash, safeNum, generateBlockSha256, syncSha256 } from './utils/helpers';

import { Header } from './components/Header';
import { HexaNodeDashboard } from './components/HexaNodeDashboard';
import { CommandConsole } from './components/CommandConsole';
import { AuditLedger } from './components/AuditLedger';
import { GovernanceSettingsPanel } from './components/GovernanceSettings';
import { GenesisEvolutionTab } from './components/GenesisEvolutionTab';
import { NodeDetailModal } from './components/NodeDetailModal';
import { StressTestModal } from './components/StressTestModal';
import { DoiInfoModal } from './components/DoiInfoModal';
import { ProtocolGuideModal } from './components/ProtocolGuideModal';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { ToastContainer } from './components/ToastContainer';

import { Activity, Terminal, Database, Sliders, Shield, Zap, BookOpen, Compass } from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'nodes' | 'genesis' | 'commands' | 'ledger' | 'settings'>('nodes');

  // Role state
  const [currentRole, setCurrentRole] = useState<Role>('ADMIN');

  // Hexa-Nodes state
  const [nodes, setNodes] = useState<HexaNode[]>(INITIAL_HEXA_NODES);

  // WORM Ledger Blocks
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>(INITIAL_LEDGER_BLOCKS);

  // Governance Settings
  const [settings, setSettings] = useState<GovernanceSettingsType>(INITIAL_GOVERNANCE_SETTINGS);

  // Telemetry Log Events
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>(INITIAL_TELEMETRY_EVENTS);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals state
  const [selectedNode, setSelectedNode] = useState<HexaNode | null>(null);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [isDoiInfoOpen, setIsDoiInfoOpen] = useState(false);
  const [isProtocolGuideOpen, setIsProtocolGuideOpen] = useState(false);

  // Calculate Global HSI
  const hsiGlobal = parseFloat(
    safeNum(
      nodes && nodes.length > 0
        ? nodes.reduce((acc, n) => acc + (n?.hsiIndex ?? 0), 0) / nodes.length
        : 0,
      2
    )
  );

  // Add a toast helper
  const addToast = (type: Toast['type'], title: string, message: string) => {
    const newToast: Toast = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Periodic subtle live telemetry simulation (keep dashboard feeling alive and dynamic)
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          // slight random jitter in latency and cpu
          const latencyDelta = Math.floor(Math.random() * 5) - 2;
          const cpuDelta = Math.floor(Math.random() * 7) - 3;
          return {
            ...node,
            latencyMs: Math.max(3, Math.min(80, node.latencyMs + latencyDelta)),
            cpuUsage: Math.max(10, Math.min(95, node.cpuUsage + cpuDelta)),
            lastHeartbeat: new Date().toISOString(),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Command Execution Handler (Adds block to WORM ledger)
  const handleCommandExecute = (cmdName: string, output: string, riskLevel: string) => {
    const prevBlock = ledgerBlocks[0];
    const newBlockIndex = prevBlock ? prevBlock.blockIndex + 1 : 1000;
    const newBlockHash = generateHash('rh');
    const prevHash = prevBlock ? prevBlock.blockHash : '0x00000000000000000000000000000000';

    const verdictVal = riskLevel === 'CRITICAL' ? 'LOCKED' : riskLevel === 'HIGH' ? 'REVIEW' : 'ACCEPT';

    const newLedgerBlock: LedgerBlock = {
      blockIndex: newBlockIndex,
      timestamp: new Date().toISOString(),
      blockHash: newBlockHash,
      previousHash: prevHash,
      verdict: verdictVal,
      regime: settings.activeRegime,
      arbitrationSignature: `SIG_RH_${settings.activeRegime}_${newBlockIndex}`,
      modelSignatures: {
        chatgpt: generateHash('cg').substring(0, 10),
        grok: generateHash('gk').substring(0, 10),
        meta: generateHash('mt').substring(0, 10),
        gemini: generateHash('gm').substring(0, 10),
        claude: generateHash('cl').substring(0, 10),
      },
      omegaVector: { C: 0.93, S: 0.91, R: 0.95 },
      jacobianNorm: settings.jacobianDampingFactor,
      dampingFactor: 1.0,
      hsiIndex: hsiGlobal,
      commandSource: `${currentRole}_COMMAND`,
      details: `Comando ${cmdName} ejecutado por ${currentRole}. Output: ${output}`,
    };

    setLedgerBlocks((prev) => [newLedgerBlock, ...prev]);

    // Log Telemetry Event
    const newTelemetry: TelemetryEvent = {
      id: 'evt-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      sourceNode: 'Núcleo Central ROMEO-HYDRA',
      type: 'INFO',
      message: `Inyección de comando ${cmdName} sellada en Bloque WORM #${newBlockIndex}. Veredicto: ${verdictVal}.`,
      regime: settings.activeRegime,
    };
    setTelemetryEvents((prev) => [newTelemetry, ...prev]);

    return newLedgerBlock;
  };

  // Stress Test Noise Injection Handler
  const handleRunStressTest = (intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') => {
    let dampingFactorApplied = 1.0;
    let targetStatus: HexaNode['status'] = 'OPERATIONAL';

    if (intensity === 'LOW') {
      dampingFactorApplied = 0.90;
      targetStatus = 'OPERATIONAL';
    } else if (intensity === 'MEDIUM') {
      dampingFactorApplied = 0.75;
      targetStatus = 'WARNING';
    } else if (intensity === 'HIGH') {
      dampingFactorApplied = 0.60;
      targetStatus = 'DAMPENED';
    } else {
      dampingFactorApplied = 0.40;
      targetStatus = 'DAMPENED';
    }

    // Force nodes state update
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === 'node-romeo-core') return n;
        return {
          ...n,
          status: targetStatus,
          jacobianNorm: parseFloat(safeNum(0.85 * (1 - dampingFactorApplied + 0.2), 2)),
          coherenceScore: parseFloat(safeNum((n?.coherenceScore ?? 0) * dampingFactorApplied, 2)),
          latencyMs: n.latencyMs + (intensity === 'EXTREME' ? 45 : 15),
        };
      })
    );

    // Switch active regime to BETA if high/extreme
    if (intensity === 'HIGH' || intensity === 'EXTREME') {
      setSettings((prev) => ({ ...prev, activeRegime: 'BETA' }));
    }

    // Create Stress Block in Ledger
    const prevBlock = ledgerBlocks[0];
    const newBlockIndex = prevBlock ? prevBlock.blockIndex + 1 : 1000;
    const prevHash = prevBlock ? prevBlock.blockHash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const timestampIso = new Date().toISOString();
    const verdictStr = intensity === 'EXTREME' || intensity === 'HIGH' ? 'DAMPENED' : 'ACCEPT';
    const hsiVal = parseFloat(safeNum(hsiGlobal * dampingFactorApplied, 2));

    const newBlockHash = generateBlockSha256(
      newBlockIndex,
      prevHash,
      timestampIso,
      verdictStr,
      0.82,
      hsiVal,
      'STRESS_TEST_SUITE'
    );

    const arbitrationSig = 'SIG_SHA256_' + syncSha256(`VERDICT:${verdictStr}|BLOCK:${newBlockIndex}|HASH:${newBlockHash}`).substring(2, 26).toUpperCase();

    const stressBlock: LedgerBlock = {
      blockIndex: newBlockIndex,
      timestamp: timestampIso,
      blockHash: newBlockHash,
      previousHash: prevHash,
      verdict: verdictStr,
      regime: 'BETA',
      arbitrationSignature: arbitrationSig,
      modelSignatures: {
        chatgpt: generateHash('cg').substring(0, 14),
        grok: generateHash('gk').substring(0, 14),
        meta: generateHash('mt').substring(0, 14),
        gemini: generateHash('gm').substring(0, 14),
        claude: generateHash('cl').substring(0, 14),
      },
      omegaVector: { C: 0.68, S: 0.58, R: 0.62 },
      jacobianNorm: 0.82,
      dampingFactor: dampingFactorApplied,
      hsiIndex: hsiVal,
      commandSource: 'STRESS_TEST_SUITE',
      details: `Perturbación de Entropía Nivel ${intensity} inyectada. Veredicto firmado con SHA-256. Amortiguación Jacobiana C' = C * ${dampingFactorApplied} registrada en WORM.`,
    };

    setLedgerBlocks((prev) => [stressBlock, ...prev]);

    // Telemetry log
    const stressEvent: TelemetryEvent = {
      id: 'evt-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      sourceNode: 'Prueba de Estrés de Entropía',
      type: 'JACOBIAN_DAMPING',
      message: `Perturbación ${intensity} absorbida. Factor de Amortiguación α = ${dampingFactorApplied} activado.`,
      regime: 'BETA',
    };
    setTelemetryEvents((prev) => [stressEvent, ...prev]);

    addToast(
      intensity === 'EXTREME' ? 'warning' : 'info',
      'Prueba de Estrés Ejecutada',
      `Incertidumbre Nivel ${intensity} absorbida por el Jacobiano. Bloque #${newBlockIndex} firmado en Ledger.`
    );
  };

  // Node active toggle
  const handleToggleNodeActive = (nodeId: string) => {
    setSettings((prev) => {
      const isAlreadyActive = prev.activeNodeIds.includes(nodeId);
      const updatedActive = isAlreadyActive
        ? prev.activeNodeIds.filter((id) => id !== nodeId)
        : [...prev.activeNodeIds, nodeId];

      return { ...prev, activeNodeIds: updatedActive };
    });

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextStatus = n.status === 'OFFLINE' ? 'OPERATIONAL' : 'OFFLINE';
          return { ...n, status: nextStatus };
        }
        return n;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          addToast('info', 'Rol de Usuario Actualizado', `Permisos del sistema configurados como ${role}.`);
        }}
        settings={settings}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        onOpenDoiInfo={() => setIsDoiInfoOpen(true)}
        hsiGlobal={hsiGlobal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Module Tab Selector Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'nodes', label: 'Hexa-Nodo Core', icon: Activity, count: '6 Nodos' },
            { id: 'genesis', label: 'Génesis & Evolución', icon: Compass, count: 'Entropy → Hydra' },
            { id: 'commands', label: 'Consola de Inyección', icon: Terminal, count: 'Comandos' },
            { id: 'ledger', label: 'Ledger WORM Inmutable', icon: Database, count: `${ledgerBlocks.length} Bloques` },
            { id: 'telemetry', label: 'Telemetría WORM Live', icon: Zap, count: 'API Ingest' },
            { id: 'settings', label: 'Ajustes de Gobernanza', icon: Sliders, count: 'Parámetros' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="space-y-6">
          {activeTab === 'nodes' && (
            <HexaNodeDashboard
              nodes={nodes}
              onSelectNode={(node) => setSelectedNode(node)}
              hsiGlobal={hsiGlobal}
            />
          )}

          {activeTab === 'genesis' && (
            <GenesisEvolutionTab
              activeRegime={settings.activeRegime}
              onInjectChaosTest={() => handleRunStressTest('HIGH')}
              jacobianThreshold={settings.severityThreshold}
            />
          )}

          {activeTab === 'commands' && (
            <CommandConsole
              currentRole={currentRole}
              onCommandExecute={handleCommandExecute}
              onAddToast={addToast}
            />
          )}

          {activeTab === 'ledger' && (
            <AuditLedger blocks={ledgerBlocks} onAddToast={addToast} />
          )}

          {activeTab === 'telemetry' && (
            <TelemetryDashboard />
          )}

          {activeTab === 'settings' && (
            <GovernanceSettingsPanel
              settings={settings}
              onUpdateSettings={(newSet) => setSettings(newSet)}
              nodes={nodes}
              onToggleNodeActive={handleToggleNodeActive}
              telemetryEvents={telemetryEvents}
              onClearTelemetry={() => setTelemetryEvents([])}
              onAddToast={addToast}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ROMEO-HYDRA: Cognitive Governance Core (DOI: 10.5281/zenodo.21406719)
          </span>
          <span className="text-slate-400">
            Autoría & Soberanía: Luis Angel Vazquez Martinez (2026)
          </span>
        </div>
      </footer>

      {/* Modals */}
      <NodeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />
      <StressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
        onRunStressTest={handleRunStressTest}
      />
      <DoiInfoModal isOpen={isDoiInfoOpen} onClose={() => setIsDoiInfoOpen(false)} />
      <ProtocolGuideModal isOpen={isProtocolGuideOpen} onClose={() => setIsProtocolGuideOpen(false)} />

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
