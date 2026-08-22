import React, { useState } from 'react';
import { CommandTemplate, CommandLog, Role } from '../types';
import { Terminal, ShieldAlert, Lock, Play, Trash2, CheckCircle2, AlertTriangle, Cpu, Database, Sliders, ShieldCheck } from 'lucide-react';

interface CommandConsoleProps {
  templates: CommandTemplate[];
  commandLogs: CommandLog[];
  activeRole: Role;
  onExecuteCommand: (commandString: string, template: CommandTemplate, params: Record<string, string>) => void;
  onClearLogs: () => void;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  templates,
  commandLogs,
  activeRole,
  onExecuteCommand,
  onClearLogs,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate>(templates[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [customCommandInput, setCustomCommandInput] = useState<string>('');
  
  // Double auth modal state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingExecution, setPendingExecution] = useState<{ commandString: string; template: CommandTemplate; params: Record<string, string> } | null>(null);
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Handle template switch
  const handleSelectTemplate = (tpl: CommandTemplate) => {
    setSelectedTemplate(tpl);
    const initialParams: Record<string, string> = {};
    if (tpl.parameters) {
      tpl.parameters.forEach((p) => {
        initialParams[p.name] = p.defaultValue;
      });
    }
    setParamValues(initialParams);
    setCustomCommandInput(tpl.command);
  };

  const handleParamChange = (paramName: string, value: string) => {
    const updated = { ...paramValues, [paramName]: value };
    setParamValues(updated);

    // reconstruct command line string
    let cmd = selectedTemplate.command;
    if (selectedTemplate.parameters) {
      selectedTemplate.parameters.forEach((p) => {
        const val = updated[p.name] || p.defaultValue;
        if (p.name === 'target') cmd = cmd.replace(/--target \S+/, `--target ${val}`);
        if (p.name === 'theta') cmd = cmd.replace(/--theta \S+/, `--theta ${val}`);
        if (p.name === 'alpha') cmd = cmd.replace(/--alpha \S+/, `--alpha ${val}`);
        if (p.name === 'nodeId') cmd = cmd.replace(/--node-id \S+/, `--node-id ${val}`);
        if (p.name === 'reason') cmd = cmd.replace(/--reason "\S+"/, `--reason "${val}"`);
      });
    }
    setCustomCommandInput(cmd);
  };

  // Role validation check
  const isRoleAllowed = (requiredRole: Role): boolean => {
    if (activeRole === 'ADMIN') return true;
    if (activeRole === 'OPERATOR') return requiredRole === 'OPERATOR' || requiredRole === 'AUDITOR';
    if (activeRole === 'AUDITOR') return false; // Auditors read only
    return false;
  };

  const handleInitiateExecution = () => {
    if (!isRoleAllowed(selectedTemplate.requiredRole)) {
      return; // Button disabled anyway
    }

    const cmdToRun = customCommandInput || selectedTemplate.command;

    if (selectedTemplate.requiresDoubleAuth || selectedTemplate.riskLevel === 'CRITICAL' || selectedTemplate.riskLevel === 'HIGH') {
      setPendingExecution({
        commandString: cmdToRun,
        template: selectedTemplate,
        params: paramValues,
      });
      setPasscode('');
      setPasscodeError('');
      setShowAuthModal(true);
    } else {
      onExecuteCommand(cmdToRun, selectedTemplate, paramValues);
    }
  };

  const handleConfirmDoubleAuth = () => {
    if (passcode.trim().toUpperCase() !== 'HYDRA-2026') {
      setPasscodeError('Código de pase inválido. Utilice el código de seguridad: HYDRA-2026');
      return;
    }

    if (pendingExecution) {
      onExecuteCommand(pendingExecution.commandString, pendingExecution.template, pendingExecution.params);
    }

    setShowAuthModal(false);
    setPendingExecution(null);
    setPasscode('');
    setPasscodeError('');
  };

  const getRiskBadge = (risk: CommandTemplate['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">RIESGO CRÍTICO</span>;
      case 'HIGH':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">RIESGO ALTO</span>;
      case 'MEDIUM':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">RIESGO MEDIO</span>;
      case 'LOW':
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">SEGURO / BAJO</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Command Templates & Parameters */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-400" />
              Simulador de Comandos de Sistema
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Rol Activo: <strong className={activeRole === 'ADMIN' ? 'text-red-400' : activeRole === 'OPERATOR' ? 'text-emerald-400' : 'text-blue-400'}>{activeRole}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono mb-4">
            Seleccione una plantilla calibrada o configure parámetros. Las acciones críticas requieren doble autenticación de seguridad.
          </p>

          {/* Template Selection List */}
          <div className="space-y-2 mb-5">
            <label className="text-[10px] text-slate-500 font-mono uppercase block">Plantillas Disponibles:</label>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {templates.map((tpl) => {
                const allowed = isRoleAllowed(tpl.requiredRole);
                const isSelected = selectedTemplate.id === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between font-mono ${
                      isSelected
                        ? 'bg-slate-800/80 border-emerald-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      {!allowed ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" title={`Requiere rol ${tpl.requiredRole}`} />
                      ) : (
                        <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{tpl.command.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate">{tpl.description}</p>
                      </div>
                    </div>
                    {getRiskBadge(tpl.riskLevel)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parameter Customizer */}
          {selectedTemplate.parameters && selectedTemplate.parameters.length > 0 && (
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-3 mb-4">
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block border-b border-slate-800/80 pb-1">
                Parámetros de Entrada ({selectedTemplate.id}):
              </span>
              {selectedTemplate.parameters.map((param) => (
                <div key={param.name} className="space-y-1 font-mono">
                  <label className="text-[11px] text-slate-300 block">{param.label}:</label>
                  {param.type === 'select' && param.options ? (
                    <select
                      value={paramValues[param.name] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                    >
                      {param.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={paramValues[param.name] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Command String Input & Execution Trigger */}
          <div className="space-y-2 font-mono">
            <label className="text-[10px] text-slate-500 uppercase block">Comando a Inyectar:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customCommandInput}
                onChange={(e) => setCustomCommandInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Validation & Execution Button */}
            <div className="pt-2">
              {!isRoleAllowed(selectedTemplate.requiredRole) ? (
                <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded text-[11px] text-red-400 flex items-center space-x-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Acceso Bloqueado: Se requiere rol <strong>{selectedTemplate.requiredRole}</strong>. Tu rol actual es <strong>{activeRole}</strong>.
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleInitiateExecution}
                  className={`w-full py-2.5 px-4 rounded font-mono text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-all shadow-lg ${
                    selectedTemplate.riskLevel === 'CRITICAL'
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                      : selectedTemplate.riskLevel === 'HIGH'
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-900/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-900/30'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ejecutar Comando en Núcleo</span>
                  {selectedTemplate.requiresDoubleAuth && <ShieldAlert className="w-3.5 h-3.5 ml-1" title="Requiere Doble Autenticación" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Terminal Output Log */}
      <div className="lg:col-span-7 flex flex-col h-[580px] bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800/40 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Terminal de Inyección de Comandos & Telemetría
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
              WORM_ENFORCED
            </span>
            <button
              onClick={onClearLogs}
              className="text-slate-400 hover:text-slate-200 p-1 text-[10px] font-mono flex items-center space-x-1"
              title="Limpiar logs de consola"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 bg-[#020617]/90 scrollbar-thin">
          <p className="text-slate-500 text-[11px]">
            [SYSTEM_HYDRA_CORE_V3] Terminal de inyección activa. Doble seguridad frontend validada.
          </p>
          <p className="text-slate-500 text-[11px]">
            [SECURITY] Autenticación por rol: <span className="text-emerald-400 font-bold">{activeRole}</span>. Todos los comandos son registrados en el Ledger WORM Inmutable.
          </p>

          {commandLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-600">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Sin comandos ejecutados en esta sesión.</p>
              <p className="text-[10px] text-slate-700 mt-1">Seleccione una plantilla a la izquierda para iniciar la simulación.</p>
            </div>
          ) : (
            commandLogs.map((log) => (
              <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>[{log.timestamp}] • Rol: <strong className="text-slate-300">{log.role}</strong> ({log.executedBy})</span>
                  <span>{log.executionTimeMs} ms</span>
                </div>
                <p className="text-emerald-400 font-bold">
                  &gt; {log.command}
                </p>
                <div className="text-slate-300 whitespace-pre-wrap bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px]">
                  {log.output}
                </div>
                {log.ledgerHashGenerated && (
                  <p className="text-[10px] text-amber-400 font-mono">
                    ✦ Hash Ledger WORM Generado: <span className="underline">{log.ledgerHashGenerated}</span>
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Terminal Status Prompt Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-500 font-bold">$</span>
            <span>hydra-cli --status</span>
            <span className="w-2 h-4 bg-emerald-500 animate-pulse inline-block" />
          </div>
          <span className="text-[10px] text-slate-500">Audit Ledger: SYNCED</span>
        </div>
      </div>

      {/* Double Authentication Security Modal */}
      {showAuthModal && pendingExecution && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Doble Autenticación de Seguridad (HYDRA-PASS)
                </h3>
                <p className="text-[10px] text-red-400 font-mono">Comando de Alto Riesgo / Modificación Crítica</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-1.5">
              <p className="text-slate-400">Comando solicitado:</p>
              <p className="text-emerald-400 font-bold bg-slate-900 p-2 rounded border border-slate-800 break-all">
                {pendingExecution.commandString}
              </p>
              <p className="text-slate-400 text-[10px] mt-1">
                Nivel de Riesgo: <strong className="text-red-400">{pendingExecution.template.riskLevel}</strong>
              </p>
            </div>

            <div className="space-y-2 font-mono">
              <label className="text-xs text-slate-300 block">
                Para confirmar la ejecución, ingrese el código de autorización de emergencia:
              </label>
              <p className="text-[10px] text-slate-500">
                (Código de prueba sugerido: <strong className="text-emerald-400">HYDRA-2026</strong>)
              </p>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="HYDRA-2026"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
              />
              {passcodeError && (
                <p className="text-xs text-red-400 font-mono mt-1">{passcodeError}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => { setShowAuthModal(false); setPendingExecution(null); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs py-2 rounded uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDoubleAuth}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold py-2 rounded uppercase shadow-lg shadow-red-900/30"
              >
                Autorizar y Ejecutar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
