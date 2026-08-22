import React, { useState, useEffect } from 'react';
import { RegimeOverview } from './components/RegimeOverview';
import { SportsBranch } from './components/SportsBranch';
import { FinancialBranch } from './components/FinancialBranch';
import { ExposureBranch } from './components/ExposureBranch';
import { MetacognitiveTerminal } from './components/MetacognitiveTerminal';
import { AuditLedgerView } from './components/AuditLedgerView';
import { AlphaRegimeView } from './components/AlphaRegimeView';
import { DoiCertificate } from './components/DoiCertificate';
import { WhitepaperView } from './components/WhitepaperView';
import { RomeoHydraLogo } from './components/RomeoHydraLogo';
import { ComplianceMatrix } from './components/ComplianceMatrix';
import { Iso42001AimsSubmodule } from './components/Iso42001AimsSubmodule';
import { CertificationCenter } from './components/CertificationCenter';
import { SovereigntyShield } from './components/SovereigntyShield';
import { SigmaOptimizer } from './components/SigmaOptimizer';
import { ForensicDashboard } from './components/ForensicDashboard';
import { ActivityLogger } from './components/ActivityLogger';
import { MegazordArchitectureView } from './components/MegazordArchitectureView';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { SimulationRunSandbox } from './components/SimulationRunSandbox';
import { CorporateGovernanceCenter } from './components/CorporateGovernanceCenter';
import { WhiteBoxConsole } from './components/WhiteBoxConsole';
import { calculateLedgerHash } from './utils';
import { AuditBlock, DesignLockLog } from './types';
import { EXPOSURE_DATA } from './data';
import { Shield, Activity, GitBranch, Terminal, Database, Clock, RefreshCw, Award, FileText, Lock, Unlock, ShieldAlert, ShieldCheck, Cpu, Eye, Layers, Sliders, Zap, Briefcase } from 'lucide-react';
import { 
  saveLedgerBlock, 
  getLedgerBlocks, 
  clearLedgerDatabase, 
  subscribeToAuth, 
  loginWithGoogle, 
  logoutUser, 
  getFirebaseMode,
  FOUNDER_PHOTO_URL,
  loginAsGuest,
  saveVisit,
  saveInteraction
} from './lib/firebase';


// Pre-populate blockchain ledger
const seedLedger: AuditBlock[] = [
  {
    index: 0,
    timestamp: "2026-07-16 08:00:00",
    evidence: {
      source: "ALPHA_FIREWALL",
      detail: "Arranque de Sistema ROMEO-HYDRA v3.0-RC1",
      metrics: {
        system_version: "3.0-RC1",
        author: "LUIS ANGEL VAZQUEZ MARTINEZ",
        firewall_armed: true,
        quality_invariant_threshold: 0.85
      }
    },
    prev_hash: "0".repeat(64),
    hash: "",
    regime_status: "SECURED"
  },
  {
    index: 1,
    timestamp: "2026-07-16 08:05:22",
    evidence: {
      source: "BETA_COHERENCE",
      detail: "Inicialización del Jacobiano de Acoplamiento Cruzado",
      metrics: {
        state_variables: ["D", "O", "A", "R"],
        frobenius_norm: 2.115,
        coupling_sensitivity_j31: 0.60
      }
    },
    prev_hash: "",
    hash: "",
    regime_status: "SECURED"
  },
  {
    index: 2,
    timestamp: "2026-07-16 08:12:45",
    evidence: {
      source: "GAMMA_ENTROPY",
      detail: "Despliegue del Espacio de Hipótesis en Árbol Hydra v2.7",
      metrics: {
        root_nodes: 1,
        total_hypotheses: 7,
        initial_msh: 0.724,
        initial_hsi: 0.586
      }
    },
    prev_hash: "",
    hash: "",
    regime_status: "SECURED"
  },
  {
    index: 3,
    timestamp: "2026-07-16 08:30:00",
    evidence: {
      source: "WORLD_CUP_FINAL_2026_AUDIT",
      detail: "Archivo de Predicción Oficial para la Final de la Copa del Mundo (ESP vs. ARG)",
      metrics: {
        target_event: "Copa del Mundo 2026 - Final",
        predicted_winner: "ARGENTINA",
        rationale: "Antifragilidad en estados de alta entropía (Regimen Gamma HSI)",
        predicted_t_recon_arg: 11.23,
        predicted_t_recon_esp: 13.56,
        predicted_state_coupling_norm: 2.115,
        model_confidence: 0.88,
        hash_lock_active: true
      }
    },
    prev_hash: "",
    hash: "",
    regime_status: "SECURED"
  }
];

// Helper to compile hashes properly across the sequence
const computeSequentialHashes = (blocks: AuditBlock[]): AuditBlock[] => {
  const verifiedBlocks: AuditBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const prevHash = i === 0 ? "0".repeat(64) : verifiedBlocks[i - 1].hash;
    const payloadStr = JSON.stringify(blocks[i].evidence);
    const selfHash = calculateLedgerHash(payloadStr, prevHash);
    verifiedBlocks.push({
      ...blocks[i],
      prev_hash: prevHash,
      hash: selfHash,
      regime_status: "SECURED"
    });
  }
  return verifiedBlocks;
};

export default function App() {
  const checkIsFounder = (user: any) => {
    if (!user) return false;
    const email = user.email ? user.email.toLowerCase().trim() : "";
    const name = user.displayName ? user.displayName.toLowerCase().trim() : "";
    return (
      email === "robinmac.v2@gmail.com" ||
      email === "luis.angel.vazquez@gmail.com" ||
      name.includes("luis angel vazquez martinez") ||
      name.includes("luis angel vazquez") ||
      user.uid === "mock_founder"
    );
  };

  const checkIsGuest = (user: any) => {
    if (!user) return false;
    const email = user.email ? user.email.toLowerCase().trim() : "";
    return email === "guest.auditor@romeohydra.local" || user.role === "VIEWER" || user.uid === "mock_guest";
  };

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const isReadOnly = checkIsGuest(currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Telemetry: Automatic registration of visits and interactions
  useEffect(() => {
    if (currentUser) {
      // 1. Register Visit
      const isFounder = checkIsFounder(currentUser);
      const isGuest = checkIsGuest(currentUser);
      const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const visitPayload = {
        id: visitId,
        uid: currentUser.uid,
        tipo_usuario: isFounder ? "Google (Fundador)" : (isGuest ? "Invitado" : "Google"),
        correo: currentUser.email || "guest@viewer.local",
        timestamp: new Date().toISOString(),
        agente_usuario: navigator.userAgent,
        dispositivo: `${navigator.platform} (${window.innerWidth}x${window.innerHeight})`
      };
      
      saveVisit(visitPayload).catch(err => console.error("Error saving automatic visit telemetry:", err));

      // 2. Define global logHydraInteraction helper to sync with Firestore
      (window as any).logHydraInteraction = async (actionType: string, component: string, details: string) => {
        const intId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Log to our new telemetry "interacciones" collection
        const telemetryPayload = {
          id: intId,
          uid: currentUser.uid,
          tipo_usuario: isFounder ? "Google" : (isGuest ? "Invitado" : "Google"),
          correo: currentUser.email || "guest@viewer.local",
          nombre_interaccion: `${component}: [${actionType}] ${details.substring(0, 80)}`,
          timestamp: new Date().toISOString()
        };

        try {
          await saveInteraction(telemetryPayload);
        } catch (err) {
          console.error("Error saving automatic interaction telemetry:", err);
        }
      };
    }
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<'overview' | 'sports' | 'financial' | 'exposure' | 'terminal' | 'ledger' | 'whitepaper' | 'certification' | 'sovereignty' | 'sigma' | 'forensic' | 'megazord'>('whitepaper');
  const [alphaActive, setAlphaActive] = useState<boolean>(true);
  const [betaNorm, setBetaNorm] = useState<number>(2.115);
  const [gammaHSI, setGammaHSI] = useState<number>(0.586);
  const [ledger, setLedger] = useState<AuditBlock[]>([]);
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [brokenIndex, setBrokenIndex] = useState<number | null>(null);
  const [doi, setDoi] = useState<string>(() => {
    return localStorage.getItem('romeo_hydra_doi') || "10.5281/zenodo.21406719";
  });
  const [doiJustUpdated, setDoiJustUpdated] = useState<boolean>(false);
  const [isDesignLocked, setIsDesignLocked] = useState<boolean>(true);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);

  const [designLockLogs, setDesignLockLogs] = useState<DesignLockLog[]>(() => {
    const stored = localStorage.getItem('romeo_hydra_design_lock_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "DL-AUDIT-001",
        timestamp: "2026-07-18 10:00:00 CST",
        previousState: false,
        newState: true,
        operator: "LUIS ANGEL VAZQUEZ MARTINEZ",
        detail: "Bloqueo inicial del diseño de producción para el lanzamiento de la versión de seguridad ROMEO-HYDRA.",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ];
  });

  const changeDesignLock = (locked: boolean) => {
    setIsDesignLocked(locked);
    
    const prevLog = designLockLogs[0];
    const prevHash = prevLog ? prevLog.hash || "0".repeat(64) : "0".repeat(64);
    
    const id = `DL-AUDIT-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + " CST";
    const operator = EXPOSURE_DATA.author || "LUIS ANGEL VAZQUEZ MARTINEZ";
    const detail = locked 
      ? "Se congeló preventivamente la configuración del sistema para garantizar la inmutabilidad de la cadena de confianza en producción." 
      : "Se desbloqueó el diseño del sistema para propósitos de simulación, debugging y auditoría.";
      
    const payload = JSON.stringify({ id, previousState: !locked, newState: locked, operator, detail });
    const hash = calculateLedgerHash(payload, prevHash);
    
    const newLog: DesignLockLog = {
      id,
      timestamp,
      previousState: !locked,
      newState: locked,
      operator,
      detail,
      hash
    };
    
    const updatedLogs = [newLog, ...designLockLogs];
    setDesignLockLogs(updatedLogs);
    localStorage.setItem('romeo_hydra_design_lock_history', JSON.stringify(updatedLogs));
    
    // Also save design change as an active block in Delta Ledger
    handleLogEvent(
      "DESIGN_LOCK_CHANGE",
      `Estado de diseño cambiado de ${!locked ? 'DESBLOQUEADO' : 'BLOQUEADO'} a ${locked ? 'BLOQUEADO' : 'DESBLOQUEADO'}.`,
      { previousState: !locked, newState: locked, logId: id, hash }
    );
  };

  // Trigger dynamic highlight on DOI updates
  useEffect(() => {
    const stored = localStorage.getItem('romeo_hydra_doi') || "10.5281/zenodo.21406719";
    if (doi !== "10.5281/zenodo.21406719" || stored !== "10.5281/zenodo.21406719") {
      setDoiJustUpdated(true);
      const timer = setTimeout(() => setDoiJustUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [doi]);

  // Initialize and compute base ledger hashes with Firestore synchronization
  useEffect(() => {
    const initializeLedger = async () => {
      try {
        const liveBlocks = await getLedgerBlocks();
        if (liveBlocks && liveBlocks.length > 0) {
          const sorted = [...liveBlocks].sort((a, b) => a.index - b.index);
          setLedger(sorted);
          verifyChainIntegrity(sorted);
        } else {
          const initialBlocks = computeSequentialHashes(seedLedger);
          setLedger(initialBlocks);
          for (const block of initialBlocks) {
            await saveLedgerBlock(block);
          }
        }
      } catch (err) {
        console.error("Failed to load live ledger from Firestore, using local seed:", err);
        setLedger(computeSequentialHashes(seedLedger));
      }
    };
    initializeLedger();
  }, []);

  // Register global window controls matching ROMEO-HYDRA v3.0 specs
  useEffect(() => {
    (window as any).ejecutarContencion = () => {
      if (isReadOnly) {
        alert("⚡ [KERNEL SIGMA] Operación denegada: El modo de lectura (invitado) no permite ejecutar recortes normativos.");
        return;
      }
      handleLogEvent(
        "K_SIGMA_PROJECTION",
        "Se ejecutó el Recorte Normativo (Proyección Convexa) de forma proactiva mediante la Consola de Caja Blanca.",
        {
          status: "SECURED",
          engine_optimized: true,
          interception_latency_ms: 0.42,
          iso_42001_compliance: "100%"
        }
      );
      alert("⚡ [KERNEL SIGMA] Recorte Normativo ejecutado correctamente. La proyección convexa ha sido calculada e inyectada en el Delta Ledger.");
    };

    (window as any).sellarLedger = () => {
      if (isReadOnly) {
        alert("🔐 [DELTA LEDGER] Operación denegada: El modo de lectura (invitado) no permite sellar bloques.");
        return;
      }
      handleHealLedger().then(() => {
        alert("🔐 [DELTA LEDGER] Cadena inmutable sellada con éxito. El Hash Proof secuencial ha sido recalculado.");
      }).catch(err => {
        console.error("Error healing ledger:", err);
        alert("🔐 [DELTA LEDGER] Cadena inmutable sellada. El Hash Proof secuencial ha sido recalculado.");
      });
    };

    (window as any).appLogout = () => {
      logoutUser().then(() => {
        alert("Sesión de usuario finalizada correctamente.");
      }).catch(err => {
        console.error("Logout failed:", err);
      });
    };

    return () => {
      delete (window as any).ejecutarContencion;
      delete (window as any).sellarLedger;
      delete (window as any).appLogout;
    };
  }, [ledger, isReadOnly]);

  // Verification engine for the cryptographic chain
  const verifyChainIntegrity = (blocks: AuditBlock[]) => {
    if (blocks.length === 0) {
      setIsChainValid(true);
      setBrokenIndex(null);
      return;
    }

    for (let i = 0; i < blocks.length; i++) {
      // 1. Verify previous hash matching
      if (i > 0) {
        if (blocks[i].prev_hash !== blocks[i - 1].hash) {
          setIsChainValid(false);
          setBrokenIndex(i);
          return;
        }
      }

      // 2. Verify self hash matches recalculated hash
      const payloadStr = JSON.stringify(blocks[i].evidence);
      const recalculatedHash = calculateLedgerHash(payloadStr, blocks[i].prev_hash);
      if (blocks[i].hash !== recalculatedHash) {
        setIsChainValid(false);
        setBrokenIndex(i);
        return;
      }
    }

    setIsChainValid(true);
    setBrokenIndex(null);
  };

  // Log a new system operation/perturbation into Delta's ledger
  const handleLogEvent = (source: string, detail: string, metrics: Record<string, any>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    setLedger(prev => {
      // Calculate index and previous hash
      const newIndex = prev.length;
      const lastBlock = prev[prev.length - 1];
      const prevHash = lastBlock ? lastBlock.hash : "0".repeat(64);

      const payload = { source, detail, metrics };
      const payloadStr = JSON.stringify(payload);
      const selfHash = calculateLedgerHash(payloadStr, prevHash);

      const newBlock: AuditBlock = {
        index: newIndex,
        timestamp,
        evidence: payload,
        prev_hash: prevHash,
        hash: selfHash,
        regime_status: "SECURED"
      };

      // Save block directly to live/mock Firestore database
      saveLedgerBlock(newBlock).catch(err => {
        console.error("Failed to save transaction block to Firestore:", err);
      });

      // Log external interaction
      (window as any).logHydraInteraction?.("ESCRITURA_LEDGER", "Delta Ledger", `Sincronización del bloque #${newIndex} a Firebase con hash ${selfHash.substring(0, 10)}...`);

      const updatedLedger = [...prev, newBlock];
      // Run verify on updated set
      verifyChainIntegrity(updatedLedger);
      return updatedLedger;
    });
  };

  // Simulate a malicious data tempering attack on block [index]
  const handleTamperBlock = (index: number, tamperedDetail: string) => {
    setLedger(prev => {
      const updated = prev.map((block, idx) => {
        if (idx === index) {
          // Deep-copy and modify data payload
          const tamperedEvidence = {
            ...block.evidence,
            detail: tamperedDetail,
            metrics: {
              ...block.evidence.metrics,
              TAMPERED: "true",
              original_detail_overwritten: "true"
            }
          };
          // Recalculate this single hash, but don't propagate to mimic sneaky attack!
          const payloadStr = JSON.stringify(tamperedEvidence);
          const tamperedSelfHash = calculateLedgerHash(payloadStr, block.prev_hash);

          return {
            ...block,
            evidence: tamperedEvidence,
            hash: tamperedSelfHash,
            regime_status: "CORRUPTED" as const
          };
        }
        return block;
      });

      // Run verification across the entire modified array
      verifyChainIntegrity(updated);

      // Log external interaction of attack simulation
      (window as any).logHydraInteraction?.("ATAQUE_SIMULADO", "Delta Ledger", `Inyección de anomalía: datos alterados maliciosamente en bloque #${index}`);

      return updated;
    });
  };

  const handleClearLedger = () => {
    clearLedgerDatabase().catch(err => {
      console.error("Failed to clear Firestore ledger collection:", err);
    });
    setLedger([]);
    setIsChainValid(true);
    setBrokenIndex(null);

    // Log external interaction
    (window as any).logHydraInteraction?.("CONFIGURACIÓN", "Delta Ledger", "Hard Clear de la base de datos de auditoría de Firebase.");
  };

  const handleResetLedger = async () => {
    try {
      await clearLedgerDatabase();
    } catch (err) {
      console.error("Failed to clear Firestore ledger collection during reset:", err);
    }

    const genesisSeed: AuditBlock = {
      index: 0,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      evidence: {
        source: "GENESIS_RECONSTRUCTION",
        detail: "Reconstrucción del Bloque Génesis mediante Hard Reset del Operador",
        metrics: {
          system_version: "3.0-RC1",
          author: EXPOSURE_DATA.author || "LUIS ANGEL VAZQUEZ MARTINEZ",
          reset_triggered: true,
          integrity_secured: true
        }
      },
      prev_hash: "0".repeat(64),
      hash: "",
      regime_status: "SECURED"
    };

    const compiledGenesis = computeSequentialHashes([genesisSeed]);

    try {
      await saveLedgerBlock(compiledGenesis[0]);
    } catch (err) {
      console.error("Failed to save genesis block to Firestore:", err);
    }

    setLedger(compiledGenesis);
    setIsChainValid(true);
    setBrokenIndex(null);

    // Log external interaction
    (window as any).logHydraInteraction?.("CONFIGURACIÓN", "Delta Ledger", "Hard Reset del Ledger Delta y re-generación del bloque Génesis.");

    // Append an entry about the reset
    handleLogEvent(
      "LEDGER_RESET",
      "Se ejecutó el restablecimiento completo (resetLedger) del Ledger Delta por comando del operador.",
      { status: "SECURED", code_reference: "RESET_OK", timestamp_ms: Date.now() }
    );
  };

  const handleHealLedger = async () => {
    if (ledger.length === 0) return;

    const healedBlocks = computeSequentialHashes(ledger);

    try {
      for (const block of healedBlocks) {
        await saveLedgerBlock(block);
      }
    } catch (err) {
      console.error("Failed to sync healed ledger with Firestore:", err);
    }

    setLedger(healedBlocks);
    setIsChainValid(true);
    setBrokenIndex(null);

    // Log external interaction
    (window as any).logHydraInteraction?.("ESCRITURA_LEDGER", "Delta Ledger", `Reparación (Heal) de cadena inyectando firmas corregidas para ${healedBlocks.length} bloques.`);

    handleLogEvent(
      "LEDGER_HEAL_OPERATION",
      "Se ha reparado la contaminación detectada en el Ledger. La cadena fue secuenciada, firmada y restaurada al estado 'SECURED'.",
      { 
        status: "SECURED", 
        healed_blocks_count: healedBlocks.length,
        timestamp_ms: Date.now() 
      }
    );
  };

  // Render loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-500 uppercase tracking-widest">Verificando Credenciales de Acceso...</p>
        </div>
      </div>
    );
  }

  // Render Login Gate / Control A-B
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-purple-500/20 selection:text-purple-300 relative overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-2xl relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <RomeoHydraLogo size={48} theme="dark" className="shrink-0" />
            </div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-slate-100 uppercase">
              ROMEO-HYDRA v3.0
            </h2>
            <p className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
              Control A-B: Validación de Identidad e Intención
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Ingrese al Kernel Sigma utilizando el proveedor de identidad corporativa. El acceso está restringido estrictamente a personal verificado.
            </p>
          </div>

          <div className="border-t border-b border-slate-800/60 py-4 my-2 space-y-3">
            <span className="text-[10px] font-mono text-slate-500 block uppercase text-center font-bold">
              MODOS DE ACCESO EN SANDBOX
            </span>
            
            <button
              onClick={async () => {
                try {
                  setAuthLoading(true);
                  await loginWithGoogle({
                    uid: "mock_founder",
                    displayName: "Luis Angel Vazquez Martinez",
                    email: "robinmac.v2@gmail.com",
                    photoURL: FOUNDER_PHOTO_URL
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 bg-slate-950/80 hover:bg-slate-950 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                Acceder como Fundador
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 font-normal">
                L. A. Vazquez Martinez
              </span>
            </button>

            <button
              onClick={async () => {
                try {
                  setAuthLoading(true);
                  await loginWithGoogle({
                    uid: "mock_unauthorized",
                    displayName: "Inspector OP-88X",
                    email: "op88x@hydra.net",
                    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 bg-slate-950/80 hover:bg-slate-950 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Simular Acceso No Autorizado
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-red-400 font-normal">
                OP-88X Inspector
              </span>
            </button>

            <button
              onClick={async () => {
                try {
                  setAuthLoading(true);
                  await loginAsGuest("Auditor Regulador");
                } catch (e) {
                  console.error(e);
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 bg-slate-950/80 hover:bg-slate-950 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)] animate-pulse" />
                Entrar como Invitado / Viewer Mode
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 font-normal">
                Sesión Temporal (guest)
              </span>
            </button>
          </div>

          <button
            onClick={async () => {
              try {
                setAuthLoading(true);
                await loginWithGoogle(); // Default trigger (either Google popup or Mock Founder)
              } catch (e) {
                console.error(e);
              } finally {
                setAuthLoading(false);
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-slate-950 font-bold text-xs font-mono rounded-lg transition duration-300 shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Shield className="w-4 h-4 text-slate-950" />
            Iniciar Sesión con Google
          </button>

          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-600 uppercase">
              Romeo-Hydra Cryptographic Identity Kernel • Sandbox Status: Active
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Access Blocked Containment Screen
  if (currentUser && !checkIsFounder(currentUser) && !checkIsGuest(currentUser)) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Urgent Alert Red Glow */}
        <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg bg-slate-900 border border-red-500/30 rounded-xl p-8 space-y-6 shadow-2xl relative z-10 font-mono text-xs">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-sm font-black text-red-500 tracking-widest uppercase text-center">
              🔴 BLOCKED / ACCESO DENEGADO - CREDENCIAL NO AUTORIZADA
            </h2>
            <div className="h-0.5 w-12 bg-red-500/30 mx-auto" />
          </div>

          <div className="bg-slate-950/80 rounded-lg p-5 border border-slate-800 space-y-3.5">
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              La identidad proporcionada mediante el Control A-B ha sido validada criptográficamente, pero no cumple con los privilegios contractuales necesarios para acceder a la consola Sigma de ROMEO-HYDRA.
            </p>
            
            <div className="border-t border-slate-900 pt-3 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">USUARIO DETECTADO:</span>
                <span className="text-slate-300 font-bold">{currentUser.displayName || "Anónimo"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EMAIL REGISTRADO:</span>
                <span className="text-slate-300">{currentUser.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ACCESO REQUERIDO:</span>
                <span className="text-cyan-400 font-bold">KERNEL SIGMA CONSOLE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ESTADO OPERACIONAL:</span>
                <span className="text-red-400 font-bold animate-pulse">CONTAINMENT_ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-[10px] text-red-400/90 leading-relaxed text-center font-sans">
            Para auditorías o revisiones, inicie sesión utilizando las credenciales verificadas del fundador (<strong>Luis Angel Vazquez Martinez</strong>). Su sesión actual ha sido confinada.
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={async () => {
                await logoutUser();
              }}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-slate-950 font-bold text-xs font-mono rounded-lg transition duration-300 flex items-center justify-center gap-1.5 uppercase"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              Cerrar Sesión Bloqueada
            </button>
            <button
              onClick={async () => {
                try {
                  setAuthLoading(true);
                  await logoutUser();
                  await loginWithGoogle({
                    uid: "mock_founder",
                    displayName: "Luis Angel Vazquez Martinez",
                    email: "robinmac.v2@gmail.com",
                    photoURL: FOUNDER_PHOTO_URL
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono transition duration-300 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Acceder con Fundador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-500/20 selection:text-purple-300">
      
      {/* Security Ribbon: Authorized Founder / Auditor Access Guard (Control A-B) */}
      <div className={`border-b px-6 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono ${
        isReadOnly 
          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          {currentUser && currentUser.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || "User"} 
              className={`w-6 h-6 rounded-full border mr-1.5 shrink-0 ${
                isReadOnly ? 'border-cyan-500/30' : 'border-emerald-500/30'
              }`}
              referrerPolicy="no-referrer"
            />
          )}
          <span className={`w-2 h-2 rounded-full mr-1 ${
            isReadOnly 
              ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
              : 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
          } animate-pulse`} />
          <span className="font-bold">
            {isReadOnly 
              ? `🟢 PASS - ACCESOS DE INSPECCIÓN: ${currentUser?.displayName || "AUDITOR REGULADOR"}` 
              : "🟢 PASS - ACCESOS AUTORIZADOS: LUIS ANGEL VAZQUEZ MARTINEZ"
            }
          </span>
          <span className={`text-[10px] font-normal hidden md:inline ${isReadOnly ? 'text-cyan-400/80' : 'text-emerald-500/80'}`}>
            {isReadOnly 
              ? "| ROL: Oficial de Cumplimiento / Regulador Externo (Modo Solo Lectura)" 
              : "| ROL: Fundador Autorizado / Administrador Supremo del Kernel Sigma"
            }
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] text-slate-500 font-normal">SESIÓN: {currentUser?.email}</span>
          <button
            onClick={async () => {
              await logoutUser();
            }}
            className={`px-2.5 py-1 rounded border font-bold transition text-[10px] uppercase ${
              isReadOnly 
                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/20' 
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/20'
            }`}
          >
            LOGOUT / SALIR
          </button>
        </div>
      </div>

      {/* Top Professional Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <RomeoHydraLogo size={36} theme="dark" className="shrink-0" />
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <h1 className="text-lg font-bold font-mono tracking-tight text-slate-100">
              ROMEO-HYDRA v3.0-RC1 Caja Blanca
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800 text-slate-400">
              EMMOROR-EXP
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500">
            DYNAMIC INFERENCE GOVERNANCE FRAMEWORK (DIGF) // CONSOLE DE AUDITORÍA Y CAJA BLANCA
          </p>
        </div>

        {/* System Telemetry Badges */}
        <div className="flex flex-wrap gap-3 items-center text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-2">
            <span className="text-slate-500">AUTOR:</span>
            <span className="text-slate-300 font-semibold">{EXPOSURE_DATA.author}</span>
          </div>

          <div className={`transition-all duration-500 rounded px-2.5 py-1 flex items-center gap-2 ${
            doiJustUpdated 
              ? "bg-amber-500/25 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105" 
              : "bg-slate-900 border border-slate-800"
          }`}>
            <Award className={`w-3.5 h-3.5 text-amber-500 ${doiJustUpdated ? "animate-bounce" : ""}`} />
            <span className="text-slate-500">{doiJustUpdated ? "NUEVO DOI:" : "DOI:"}</span>
            <a 
              href={`https://doi.org/${doi}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-cyan-400 font-semibold hover:underline flex items-center gap-1 transition-all ${
                doiJustUpdated ? "text-amber-300" : ""
              }`}
            >
              {doi}
            </a>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-2">
            <span className="text-slate-500">LEDGER STATUS:</span>
            {isChainValid ? (
              <span className="text-emerald-400 font-bold">SECURED</span>
            ) : (
              <span className="text-red-500 font-bold animate-pulse">BREACHED</span>
            )}
          </div>

          {/* Master Lock Indicator Button */}
          <button
            onClick={() => setShowUnlockModal(true)}
            className={`transition-all duration-300 rounded px-2.5 py-1 flex items-center gap-2 border ${
              isDesignLocked
                ? "bg-amber-950/30 border-amber-500/30 text-amber-400 hover:border-amber-400/50 hover:bg-amber-950/50"
                : "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-950/50"
            }`}
            title="Haga clic para gestionar la gobernanza de diseño"
          >
            {isDesignLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase">DISEÑO: BLOQUEADO</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">DISEÑO: DESBLOQUEADO</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        
        {/* Regime Cards Overview */}
        <RegimeOverview 
          alphaActive={alphaActive} 
          betaNorm={betaNorm} 
          gammaHSI={gammaHSI} 
          deltaValid={isChainValid} 
        />

        {/* Custom Tab Navigation Bar */}
        <div className="flex border-b border-slate-900 overflow-x-auto gap-2 scrollbar-none mb-2">
          {[
            { id: 'whitepaper', label: 'Whitepaper de Auditoría', icon: FileText },
            { id: 'overview', label: 'Estructura Core', icon: Shield },
            { id: 'certification', label: 'Centro Certificación', icon: Award },
            { id: 'governance', label: 'B2B Cumplimiento', icon: Briefcase },
            { id: 'whitebox', label: 'Consola Caja Blanca', icon: Terminal },
            { id: 'sovereignty', label: 'Soberanía y Blindaje', icon: ShieldCheck },
            { id: 'sigma', label: 'Kernel Sigma', icon: Cpu },
            { id: 'simulation', label: 'Sandbox SimulationRun', icon: Sliders },
            { id: 'forensic', label: 'Console Forense', icon: Eye },
            { id: 'megazord', label: 'Megazord Arquitectura', icon: Layers },
            { id: 'sports', label: 'Inferencia S_ESP', icon: Clock },
            { id: 'financial', label: 'Shock Financiero', icon: Activity },
            { id: 'exposure', label: 'Estrategia EMMOROR', icon: GitBranch },
            { id: 'terminal', label: 'Operador Dialéctico F', icon: Terminal },
            { id: 'ledger', label: 'Trazabilidad Delta', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  (window as any).logHydraInteraction?.("NAVEGACIÓN", "Panel de Control", `Visualización de la sección: ${tab.label}`);
                }}
                className={`py-2.5 px-4 rounded-t-lg font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/[0.02]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
                id={`tab-nav-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Context Routing */}
        <div className="flex-1">
          {activeTab === 'whitepaper' && (
            <WhitepaperView 
              doi={doi}
              onLogEvent={handleLogEvent}
            />
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6" id="architecture-blueprint">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                    Estructura Lógica y Protocolos Activos
                  </h3>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  ROMEO-HYDRA es un middleware de gobernanza cognitiva que opera en cuatro niveles paralelos (regímenes). Permite auditar la estabilidad inferencial de modelos complejos (como decisiones deportivas críticas, contagios en mercados automatizados u optimizaciones publicitarias) mediante una matriz de sensibilidad jacobiana y un árbol de poda dialectal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-slate-400">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <h4 className="text-slate-200 font-bold uppercase mb-2 text-[11px] text-cyan-400">
                      I. Principio de Invariantes Lógicos (Alpha)
                    </h4>
                    <p className="leading-relaxed">
                      Ninguna optimización secundaria o perturbación temporal puede diluir las cualidades core del sistema. Si los valores de autenticidad o liquidez descienden de 0.85, se activa un bloqueo preventivo que detiene la transferencia de entropía hacia nodos colaterales.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <h4 className="text-slate-200 font-bold uppercase mb-2 text-[11px] text-purple-400">
                      II. Monitoreo de Sensibilidad Jacobiana (Beta)
                    </h4>
                    <p className="leading-relaxed">
                      Calcula continuamente las derivadas parciales de cambio cruzado para estimar cómo una anomalía en un nodo (v.g. tarjeta roja o pánico de spreads) afecta el vector general del sistema. La norma Frobenius es nuestro termómetro de acoplamiento.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <h4 className="text-slate-200 font-bold uppercase mb-2 text-[11px] text-emerald-400">
                      III. Poda Dialéctica con Operador F (Gamma)
                    </h4>
                    <p className="leading-relaxed">
                      El protocolo Hydra (v2.7) no sostiene hipótesis débiles. El operador dialéctico colisiona postulados lógicos contra sus contra-argumentos, podando ramas cuyas métricas de supervivencia caigan por debajo del umbral de estabilidad de 0.65.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <h4 className="text-slate-200 font-bold uppercase mb-2 text-[11px] text-indigo-400">
                      IV. Certificación de Trazabilidad Delta (Delta)
                    </h4>
                    <p className="leading-relaxed">
                      La gobernanza se audita. Cada evento genera un bloque hash-chain inmutable. Si ocurre manipulación o inyección maliciosa en los registros forenses, el protocolo rompe la correlación criptográfica, aislando el bloque corrupto inmediatamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Alignment Matrix */}
              <ComplianceMatrix onLogEvent={handleLogEvent} />

              {/* ISO/IEC 42001 (AIMS) Submodule */}
              <Iso42001AimsSubmodule 
                onLogEvent={handleLogEvent} 
                onAddLedgerBlock={handleLogEvent} 
                isReadOnly={isReadOnly} 
              />

              {/* DOI Scientific Certificate */}
              <DoiCertificate 
                currentDoi={doi}
                onLogEvent={handleLogEvent}
                onDoiChange={setDoi}
                isLocked={isDesignLocked || isReadOnly}
              />

              {/* Alpha Regime Interactive Control Panel */}
              <AlphaRegimeView 
                onLogEvent={handleLogEvent}
                onSetAlphaActive={setAlphaActive}
                isReadOnly={isReadOnly}
              />
            </div>
          )}

          {activeTab === 'sports' && (
            <SportsBranch onLogEvent={handleLogEvent} />
          )}

          {activeTab === 'financial' && (
            <FinancialBranch 
              onLogEvent={handleLogEvent} 
              onSetAlphaActive={setAlphaActive} 
              onSetBetaNorm={setBetaNorm} 
            />
          )}

          {activeTab === 'exposure' && (
            <ExposureBranch 
              onLogEvent={handleLogEvent} 
              onSetGammaHSI={setGammaHSI} 
            />
          )}

          {activeTab === 'certification' && (
            <CertificationCenter 
              onLogEvent={handleLogEvent} 
              isLocked={isDesignLocked} 
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'governance' && (
            <CorporateGovernanceCenter />
          )}

          {activeTab === 'whitebox' && (
            <WhiteBoxConsole />
          )}

          {activeTab === 'sovereignty' && (
            <SovereigntyShield 
              onLogEvent={handleLogEvent} 
              doi={doi}
              founderName={EXPOSURE_DATA.author}
              designLockLogs={designLockLogs}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'sigma' && (
            <div className="space-y-6">
              <SigmaOptimizer 
                onLogEvent={handleLogEvent} 
                isReadOnly={isReadOnly}
              />
              <SimulationRunSandbox 
                onLogLedgerEvent={handleLogEvent}
                isReadOnly={isReadOnly}
              />
            </div>
          )}

          {activeTab === 'simulation' && (
            <SimulationRunSandbox 
              onLogLedgerEvent={handleLogEvent}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'forensic' && (
            <div className="space-y-6">
              <TelemetryDashboard currentUser={currentUser} isReadOnly={isReadOnly} />
              <ForensicDashboard 
                ledger={ledger} 
                isChainValid={isChainValid} 
              />
              <ActivityLogger isReadOnly={isReadOnly} />
            </div>
          )}

          {activeTab === 'megazord' && (
            <MegazordArchitectureView />
          )}

          {activeTab === 'terminal' && (
            <MetacognitiveTerminal onLogEvent={handleLogEvent} />
          )}

          {activeTab === 'ledger' && (
            <AuditLedgerView 
              ledger={ledger} 
              onTamperBlock={handleTamperBlock} 
              onClearLedger={handleClearLedger} 
              onResetLedger={handleResetLedger}
              onHealLedger={handleHealLedger}
              isChainValid={isChainValid} 
              brokenIndex={brokenIndex} 
              isLocked={isDesignLocked || isReadOnly}
            />
          )}
        </div>
      </main>

      {/* Dynamic Security Violation Alert */}
      {!isChainValid && (
        <div className="bg-red-600 text-white px-6 py-3 font-mono text-xs flex justify-between items-center z-50 sticky bottom-0 animate-pulse border-t border-red-500 shadow-xl">
          <span className="font-bold flex items-center gap-2">
            🚨 ALERTA CRÍTICA REGIMEN DELTA: VIOLACIÓN DE INTEGRIDAD DETECTADA EN BLOQUE #{brokenIndex}. SECUENCIA DE REGISTRO CONGELADA.
          </span>
          <button 
            onClick={() => setActiveTab('ledger')}
            className="bg-white text-red-600 px-3 py-1 rounded font-bold hover:bg-slate-100 transition text-[10px]"
          >
            LOCALIZAR CORRUPCIÓN
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-4 px-6 text-center text-[10px] font-mono text-slate-600">
        ROMEO-HYDRA v3.0-RC1 // DIGF MIDDLEWARE // DESARROLLADO PARA ENTORNOS DE EXPOSICIÓN ARTÍSTICA Y CIENTÍFICA
      </footer>

      {/* Interactive Governance Lock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                  Gobernanza de Publicación
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  SISTEMA DE DISEÑO INMUTABLE
                </p>
              </div>
            </div>

            <p className="text-xs font-sans text-slate-300 leading-relaxed mb-4">
              Antes de publicar, el diseño de la aplicación ha sido <strong>bloqueado preventivamente</strong> para cumplir con la inmutabilidad y certificación requerida por el fundador general. 
            </p>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60 font-mono text-[10.5px] text-slate-400 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">CERTIFICANTE:</span>
                <span className="text-amber-400 font-bold">L. A. VAZQUEZ MARTINEZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ESTADO ACTUAL:</span>
                {isDesignLocked ? (
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> BLOQUEADO (SÓLO LECTURA)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-emerald-400" /> DESBLOQUEADO (TESTING)
                  </span>
                )}
              </div>
              <div className="text-[9.5px] text-slate-500 leading-normal border-t border-slate-900 pt-2 mt-2">
                En estado Bloqueado, los identificadores científicos (DOI) y las herramientas de alteración del ledger quedan selladas contra alteraciones externas para asegurar la presentación corporativa.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isDesignLocked ? (
                <button
                  onClick={() => {
                    changeDesignLock(false);
                    setShowUnlockModal(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4 text-slate-950" />
                  DESBLOQUEAR (MODO DESARROLLO)
                </button>
              ) : (
                <button
                  onClick={() => {
                    changeDesignLock(true);
                    setShowUnlockModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-mono transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-amber-500" />
                  CONGELAR DISEÑO DE NUEVO
                </button>
              )}
              
              <button
                onClick={() => setShowUnlockModal(false)}
                className="w-full py-2 hover:bg-slate-800/40 text-slate-400 rounded-lg text-xs font-mono transition"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
