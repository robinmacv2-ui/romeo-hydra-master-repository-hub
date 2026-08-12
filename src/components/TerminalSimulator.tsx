import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  GitCommit, 
  GitBranch, 
  UploadCloud, 
  Copy, 
  Check, 
  Sparkles,
  Command
} from 'lucide-react';
import { TerminalLog } from '../types';

export const TerminalSimulator: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      type: 'system',
      text: 'Entorno Linux (Ubuntu 24.04 LTS / WSL2) - Terminal Modo Fundador ROMEO-HYDRA v3.0',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: '2',
      type: 'system',
      text: 'Listo para inicializar el repositorio maestro inmutable con 7 DOIs [ISO/IEC 42001].',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [inputCommand, setInputCommand] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type: TerminalLog['type'], text: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(),
      type,
      text,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLog('input', `user@wsl-ubuntu:~$ ${trimmed}`);

    if (trimmed === 'clear') {
      setLogs([]);
      setInputCommand('');
      return;
    }

    if (trimmed === 'cd ~' || trimmed === 'cd') {
      addLog('output', 'Navegado a directorio personal: /home/fundador');
    } else if (trimmed === 'mkdir romeo-hydra-master') {
      addLog('success', 'Directorio creado exitosamente: /home/fundador/romeo-hydra-master');
    } else if (trimmed === 'cd romeo-hydra-master') {
      addLog('output', 'Directorio de trabajo actual: /home/fundador/romeo-hydra-master');
    } else if (trimmed === 'git init') {
      addLog('success', 'Inicializado repositorio Git vacío en /home/fundador/romeo-hydra-master/.git/');
    } else if (trimmed.startsWith('git add')) {
      addLog('output', 'Añadidos archivos al índice de seguimiento: README.md, docs/, src/, ledger/, assets/');
    } else if (trimmed.startsWith('git commit')) {
      addLog('success', '[main (root-commit) a1b2c3d] feat(core): consolidación del ecosistema maestro ROMEO-HYDRA con 7 DOIs y trazabilidad cruzada [ISO/IEC 42001]');
      addLog('output', ' 7 files changed, 482 insertions(+) [Sello SHA-256 inmutable registrado]');
    } else if (trimmed.startsWith('git branch')) {
      addLog('output', 'Rama cambiada a: main');
    } else if (trimmed.startsWith('git remote add')) {
      addLog('success', 'Origen remoto registrado: https://github.com/LUIS-ANGEL-VAZQUEZ-MARTINEZ/romeo-hydra.git');
    } else if (trimmed.startsWith('git push')) {
      addLog('output', 'Enumerating objects: 12, done.');
      addLog('output', 'Counting objects: 100% (12/12), done.');
      addLog('output', 'Delta compression using up to 16 threads');
      addLog('output', 'Compressing objects: 100% (10/10), done.');
      addLog('output', 'Writing objects: 100% (12/12), 18.4 KiB | 9.20 MiB/s, done.');
      addLog('success', 'To https://github.com/LUIS-ANGEL-VAZQUEZ-MARTINEZ/romeo-hydra.git\n * [new branch] main -> main\nBranch main set up to track remote branch main from origin.');
    } else if (trimmed === 'python3 src/experimento_hydra.py') {
      addLog('system', '=== EJECUTANDO MOTOR EXPERIMENTAL HYDRA v3.0 ===');
      addLog('output', '[Paso 1]: Vector x=[0.5, 0.5] | λ_min=1.414214 | Bloqueado=False | HSI=1.000000');
      addLog('output', '[Paso 2]: Vector x=[0.2, 0.2] | λ_min=0.082100 | Bloqueado=False | HSI=1.000000');
      addLog('output', '[Paso 3]: [CRITICAL ALERT] λ_min <= 0 alcanzado! Membrana A_ε interceptando...');
      addLog('output', '[BIFURCACIÓN 1->4] Fuerza estado terminal bloqueado fuera del interior de C.');
      addLog('success', '[ÉXITO DE DEMOSTRACIÓN] Propiedad de 0 Escapes Verificada Ex-Ante.');
    } else if (trimmed === 'python3 src/simulador_tarjeta_logica.py') {
      addLog('system', '=== INICIANDO BANCADA DE PRUEBAS HYDRA (10,000 ITERACIONES) ===');
      addLog('output', 'Procesando perturbaciones no convexas estocásticas...');
      addLog('output', 'Total Iteraciones: 10,000');
      addLog('output', 'Bloqueos Interceptados Ex-Ante: 3,421');
      addLog('success', 'Escapes Detectados: 0 (PROPIEDAD DE 0 ESCAPES CUMPLIDA)');
      addLog('success', 'Firma de Auditoría: 0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO');
    } else if (trimmed === 'sha256sum ledger/romeo_ledger.json') {
      addLog('success', '2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3  ledger/romeo_ledger.json');
    } else if (trimmed === 'ls -la') {
      addLog('output', 'drwxr-xr-x 6 fundador fundador 4096 Aug  1 08:43 .\ndrwxr-xr-x 3 fundador fundador 4096 Aug  1 08:43 ..\n-rw-r--r-- 1 fundador fundador 14520 Aug  1 08:43 README.md\ndrwxr-xr-x 2 fundador fundador 4096 Aug  1 08:43 docs\ndrwxr-xr-x 2 fundador fundador 4096 Aug  1 08:43 src\ndrwxr-xr-x 2 fundador fundador 4096 Aug  1 08:43 ledger\ndrwxr-xr-x 2 fundador fundador 4096 Aug  1 08:43 assets');
    } else {
      addLog('output', `Comando ejecutado en entorno virtual: ${trimmed}`);
    }

    setInputCommand('');
  };

  const executeGuidedStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);

    if (stepNumber === 1) {
      handleRunCommand('cd ~');
      setTimeout(() => handleRunCommand('mkdir romeo-hydra-master'), 300);
      setTimeout(() => handleRunCommand('cd romeo-hydra-master'), 600);
    } else if (stepNumber === 2) {
      handleRunCommand('git init');
    } else if (stepNumber === 3) {
      handleRunCommand('git add .');
      setTimeout(() => handleRunCommand('git commit -m "feat(core): consolidación del ecosistema maestro ROMEO-HYDRA con 7 DOIs y trazabilidad cruzada [ISO/IEC 42001]"'), 400);
    } else if (stepNumber === 4) {
      handleRunCommand('git branch -M main');
      setTimeout(() => handleRunCommand('git remote add origin https://github.com/LUIS-ANGEL-VAZQUEZ-MARTINEZ/romeo-hydra.git'), 300);
      setTimeout(() => handleRunCommand('git push -u origin main'), 700);
    } else if (stepNumber === 5) {
      handleRunCommand('python3 src/experimento_hydra.py');
      setTimeout(() => handleRunCommand('python3 src/simulador_tarjeta_logica.py'), 800);
    }
  };

  const copyFullCommands = () => {
    const fullScript = `cd ~
mkdir romeo-hydra-master
cd romeo-hydra-master
git init
git add .
git commit -m "feat(core): consolidación del ecosistema maestro ROMEO-HYDRA con 7 DOIs y trazabilidad cruzada [ISO/IEC 42001]"
git branch -M main
git remote add origin https://github.com/LUIS-ANGEL-VAZQUEZ-MARTINEZ/romeo-hydra.git
git push -u origin main
python3 src/experimento_hydra.py`;

    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Step Guide Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-slate-100 font-bold text-base flex items-center gap-2">
              <Command className="w-5 h-5 text-cyan-400" />
              Guía de Inicialización del Repositorio Maestro en WSL (Linux)
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Sigue los 4 pasos del Modo Fundador para inicializar Git, realizar el commit inmutable y desplegar en GitHub.
            </p>
          </div>

          <button
            onClick={copyFullCommands}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            {copied ? 'Comandos Copiados!' : 'Copiar Todos los Comandos'}
          </button>
        </div>

        {/* Action Buttons for Guided Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => executeGuidedStep(1)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-lg text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60">
                Paso 1
              </span>
              <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="text-xs font-bold text-slate-200">Crear Directorio</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">mkdir & cd</div>
          </button>

          <button
            onClick={() => executeGuidedStep(2)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-lg text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60">
                Paso 2
              </span>
              <GitBranch className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="text-xs font-bold text-slate-200">Inicializar Git</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">git init</div>
          </button>

          <button
            onClick={() => executeGuidedStep(3)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-lg text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60">
                Paso 3
              </span>
              <GitCommit className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="text-xs font-bold text-slate-200">Commit Inmutable</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">git commit (7 DOIs)</div>
          </button>

          <button
            onClick={() => executeGuidedStep(4)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-lg text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60">
                Paso 4
              </span>
              <UploadCloud className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="text-xs font-bold text-slate-200">Push a GitHub</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">git push origin main</div>
          </button>

          <button
            onClick={() => executeGuidedStep(5)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Test
              </span>
              <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div className="text-xs font-bold text-slate-200">Ejecutar Python</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">python3 experimento.py</div>
          </button>
        </div>
      </div>

      {/* Main Terminal Shell UI */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-slate-400 font-bold ml-2 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              fundador@wsl-ubuntu: ~/romeo-hydra-master
            </span>
          </div>

          <button
            onClick={() => setLogs([])}
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[11px] transition"
            title="Limpiar pantalla"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        </div>

        {/* Terminal Screen Logs */}
        <div className="p-5 h-[420px] overflow-y-auto space-y-2 select-text leading-relaxed">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-600 select-none text-[10px] pt-0.5">{log.timestamp}</span>
              {log.type === 'input' && (
                <span className="text-cyan-300 font-bold">{log.text}</span>
              )}
              {log.type === 'output' && (
                <span className="text-slate-300">{log.text}</span>
              )}
              {log.type === 'success' && (
                <span className="text-emerald-400 font-semibold">{log.text}</span>
              )}
              {log.type === 'error' && (
                <span className="text-red-400 font-semibold">{log.text}</span>
              )}
              {log.type === 'system' && (
                <span className="text-amber-300/90 italic">{log.text}</span>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand(inputCommand);
          }}
          className="bg-slate-900/80 px-4 py-3 border-t border-slate-800 flex items-center gap-2"
        >
          <span className="text-cyan-400 font-bold">fundador@wsl-ubuntu:~/romeo-hydra-master$</span>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            placeholder="Escribe un comando (ej. python3 src/experimento_hydra.py, git status, sha256sum...)..."
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs placeholder-slate-600"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-xs font-semibold transition"
          >
            Ejecutar
          </button>
        </form>
      </div>

    </div>
  );
};
