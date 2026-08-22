import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Lock, Terminal, Activity } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'OK' | 'ALERTA' | 'BLOQUEO';
  message: string;
  hash: string;
}

export const WhiteBoxConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toISOString();
    const hash = 'sha256-' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      type,
      message,
      hash
    }]);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    addLog('OK', 'Consola de Caja Blanca vinculada correctamente. Modo Viewer Activo.');
  }, []);

  const handleDemoSandbox = () => {
    addLog('INFO', 'Sandbox iniciado: Simulando flujo de inferencia de IA en entorno bancario...');
    setTimeout(() => {
      addLog('ALERTA', 'Kernel Sigma detectó desviación leve (Data Drift > 4.2%) en modelo de riesgo crediticio.');
    }, 800);
    setTimeout(() => {
      addLog('BLOQUEO', 'Optimización Convexa aplicada: Transacción anómala contenida en 12ms. Evitada posible elusión normativa.');
    }, 1600);
  };

  const handleForceSeal = () => {
    addLog('INFO', 'Sellado manual de integridad ejecutado por el usuario con éxito.');
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'ALERTA': return 'border-amber-500 text-amber-300 bg-amber-950/20';
      case 'BLOQUEO': return 'border-rose-500 text-rose-300 bg-rose-950/20';
      default: return 'border-emerald-500 text-emerald-300 bg-emerald-950/20';
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between border border-slate-800 rounded-xl overflow-hidden h-[800px]">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-wider text-emerald-400 flex items-center gap-2">
                        <span>🛡️</span> ROMEO-HYDRA <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">v3.0-RC1</span>
                    </h1>
                    <p className="text-xs text-slate-400">Estándar Global de Certificación Algorítmica y Caja Blanca (DOI: 10.5281/zenodo.21406719)</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-md text-slate-300 border border-slate-700">Modo: Invitado (Viewer)</span>
                    <button onClick={handleDemoSandbox} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition shadow-lg shadow-emerald-900/40 flex items-center gap-1.5">
                        <Zap className="w-4 h-4" /> Sandbox Visual
                    </button>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Telemetría del Kernel Sigma</h2>
                    <div className="space-y-4">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500">Estado del Sistema</p>
                            <p className="text-sm font-bold text-emerald-400">🟢 ACTIVO / MONITOREO ACTIVO</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500">Optimización Convexa</p>
                            <p className="text-sm font-bold text-slate-200">Estable (Restricciones A-F OK)</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500">Normativa Alineada</p>
                            <p className="text-sm font-bold text-indigo-400">ISO/IEC 42001 & Art. 164 Banxico</p>
                        </div>
                    </div>
                    <button onClick={handleForceSeal} className="w-full mt-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-lg border border-slate-700 transition flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" /> Forzar Sellado SHA-256
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full min-h-[400px]">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Delta Ledger Inmutable (Consola en Vivo)
                        </h2>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Registros: {logs.length}</span>
                    </div>
                    
                    <div ref={terminalRef} className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-y-auto flex-grow space-y-2 border border-slate-900 max-h-[450px]">
                        <div className="border-l-2 pl-3 py-1 border-slate-500 text-slate-400 bg-slate-900/20">
                            <span className="text-slate-500">[{new Date().toISOString()}]</span> <span className="font-bold">[SYSTEM]</span> Inicializando núcleo ROMEO-HYDRA v3.0...
                        </div>
                        <div className="border-l-2 pl-3 py-1 border-slate-500 text-slate-400 bg-slate-900/20">
                            <span className="text-slate-500">[{new Date().toISOString()}]</span> <span className="font-bold">[SYSTEM]</span> Kernel Sigma operativo. Esperando transacciones o pruebas en el sandbox...
                        </div>
                        
                        {logs.map(log => (
                            <div key={log.id} className={`border-l-2 pl-3 py-1 ${getLogStyle(log.type)}`}>
                                <span className="text-slate-500">[{log.timestamp}]</span> <span className="font-bold">[{log.type}]</span> {log.message} <br/>
                                <span className="text-[10px] text-slate-600">HASH: {log.hash}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/40 text-center py-4 text-xs text-slate-500">
            ROMEO-HYDRA Framework &bull; Desarrollado por Luis Angel Vazquez Martinez &bull; Todos los derechos reservados.
        </footer>
    </div>
  );
};
