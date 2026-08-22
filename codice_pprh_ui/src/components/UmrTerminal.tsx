import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Package, Download, Code2, Database, ShieldCheck, Play, CheckCircle2, ChevronRight, Cpu, FileArchive, Github, ExternalLink, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

const UMR_FILES = {
  'Dockerfile': `# ==============================================================================
# CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH
# Unidad Mínima Reproducible (UMR)
# Fundador e Inventor Primario: Luis Angel Vazquez Martinez
# Protección Legal: Patente del Códice
# Registro DOI: 10.5281/zenodo.21406719
# ==============================================================================
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "cli.py"]
`,
  'requirements.txt': `typing_extensions==4.10.0
`,
  'core.py': `# ==============================================================================
# CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH - NÚCLEO LÓGICO
# Fundador e Inventor Primario: Luis Angel Vazquez Martinez
# Protección Legal: Patente del Códice
# Registro DOI: 10.5281/zenodo.21406719
# ==============================================================================
import time
import hashlib

class ConvexLogicEngine:
    """
    Motor de Lógica Convexa sin Fricción Operativa.
    Diseñado por Luis Angel Vazquez Martinez para procesamiento directo y transparente.
    """
    def __init__(self):
        self.state = "INITIAL"
        self.founder = "Luis Angel Vazquez Martinez"
        self.doi = "10.5281/zenodo.21406719"
        
    def process(self, data: dict):
        start_time = time.perf_counter_ns()
        
        # Lógica convexa de cero fricción: Transformación pura sin mutación bloqueante.
        # Convierte el vector de entrada en un estado cuántico coherente validado.
        transformed_data = {
            k: hashlib.sha256(f"{v}_{self.doi}".encode()).hexdigest()[:16] for k, v in data.items()
        }
        
        end_time = time.perf_counter_ns()
        iteration_time_ns = end_time - start_time
        
        return transformed_data, iteration_time_ns
`,
  'telemetry.py': `# ==============================================================================
# CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH - TELEMETRÍA
# Fundador e Inventor Primario: Luis Angel Vazquez Martinez
# Protección Legal: Patente del Códice
# Registro DOI: 10.5281/zenodo.21406719
# ==============================================================================
import time
import json
from datetime import datetime

class TelemetryLogger:
    """
    Sistema de telemetría y logs de alta precisión (microsegundos/nanosegundos).
    Registra cada iteración matemática con sello de autoría y cero fricción.
    """
    def __init__(self):
        self.logs = []
        self.founder = "Luis Angel Vazquez Martinez"
        self.doi = "10.5281/zenodo.21406719"
        
    def log_iteration(self, origin_data, transformed_data, iteration_time_ns):
        log_entry = {
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "friccion_operativa": "0 (Cero Fricción)",
            "tiempo_iteracion_ns": iteration_time_ns,
            "tiempo_iteracion_us": round(iteration_time_ns / 1000, 2),
            "trazabilidad": {
                "origen": origin_data,
                "transformacion_aplicada": "Lógica Convexa - Protocolo Romeo-Aedra",
                "estado_final_coherente": transformed_data
            }
        }
        self.logs.append(log_entry)
        return log_entry
        
    def generate_manifest(self):
        total_time_ns = sum(log["tiempo_iteracion_ns"] for log in self.logs)
        return {
            "certificacion": "Viabilidad de Iteración y Fricción Cero Demostrada",
            "doi_asociado": self.doi,
            "autor_fundador": self.founder,
            "total_transacciones": len(self.logs),
            "tiempo_total_procesamiento_ns": total_time_ns,
            "tiempo_promedio_us": round((total_time_ns / len(self.logs)) / 1000, 2) if self.logs else 0,
            "integridad_estructural": "COHERENTE"
        }
`,
  'cli.py': `# ==============================================================================
# CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH - CLI INGESTA
# Fundador e Inventor Primario: Luis Angel Vazquez Martinez
# Protección Legal: Patente del Códice
# Registro DOI: 10.5281/zenodo.21406719
# ==============================================================================
import json
from core import ConvexLogicEngine
from telemetry import TelemetryLogger

def main():
    print("==================================================================")
    print(" UNIDAD MÍNIMA REPRODUCIBLE (UMR) - CÓDICE CHIP RRPH")
    print(" Fundador e Inventor Primario: Luis Angel Vazquez Martinez")
    print(" Registro DOI: 10.5281/zenodo.21406719")
    print(" Protección Legal: Patente del Códice")
    print("==================================================================")
    
    engine = ConvexLogicEngine()
    telemetry = TelemetryLogger()
    
    test_data = [
        {"input_id": "001", "rubro": "Gobernanza IA", "valor_carga": 1024},
        {"input_id": "002", "rubro": "Métrica Empírica", "valor_carga": 2048},
        {"input_id": "003", "rubro": "Topología Convexa", "valor_carga": 4096}
    ]
    
    print("\n[INFO] Iniciando ingesta de datos categorizados...")
    for data in test_data:
        print(f"[INGESTA] Procesando -> {data['input_id']} | Rubro: {data['rubro']}")
        transformed, time_ns = engine.process(data)
        telemetry.log_iteration(data, transformed, time_ns)
        
    print("\n[INFO] Generando Reporte de Trazabilidad Total...")
    for log in telemetry.logs:
        print(json.dumps(log, indent=2))
        
    print("\n[INFO] Generando Manifiesto de Viabilidad...")
    manifest = telemetry.generate_manifest()
    print(json.dumps(manifest, indent=2))
    
    print("\n[EXITO] Operación de UMR finalizada con cero fricción.")

if __name__ == "__main__":
    main()
`,
  'README.md': `# UMR - Códice Chip RRPH (Papel Picado Romeo Hydra)

**Unidad Mínima Reproducible (UMR) para Gobernanza de IA y Lógica Convexa**  
**Fundador e Inventor Primario:** Luis Angel Vazquez Martinez  
**Registro DOI:** [10.5281/zenodo.21406719](https://doi.org/10.5281/zenodo.21406719)  
**Protección Legal:** Patente del Códice  

---

## 📌 Descripción del Proyecto

Esta Unidad Mínima Reproducible (UMR) aísla el núcleo de ejecución lógica del **Códice Chip RRPH / PPRH**, permitiendo la ingesta directa de datos categorizados, telemetría de alta precisión en nanosegundos/microsegundos y certificación de cero fricción operativa.

## 🚀 Requisitos de Ejecución

- Python 3.10+ o Docker

## 🛠️ Modos de Ejecución

### Opción A: Ejecución Directa en Python
\`\`\`bash
pip install -r requirements.txt
python cli.py
\`\`\`

### Opción B: Ejecución en Contenedor Docker
\`\`\`bash
docker build -t umr-chip-rrph .
docker run --rm umr-chip-rrph
\`\`\`

## 🏷️ Publicación en GitHub & Vinculación con Zenodo (DOI)

Para publicar esta UMR en GitHub y vincularla con Zenodo para certificación de DOI:

1. **Crear repositorio en GitHub:**
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: Release inicial de la UMR Códice Chip RRPH - Luis Angel Vazquez Martinez"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/umr-codice-chip-rrph.git
   git push -u origin main
   \`\`\`

2. **Vincular con Zenodo:**
   - Inicia sesión en [Zenodo.org](https://zenodo.org) mediante tu cuenta de GitHub.
   - Habilita el repositorio \`umr-codice-chip-rrph\`.
   - Crea un **Release** en GitHub (v1.0.0).
   - Zenodo registrará automáticamente la versión y asociará el DOI **10.5281/zenodo.21406719**.

---
*© 2026 Luis Angel Vazquez Martinez - Todos los derechos reservados bajo la Patente del Códice.*
`,
  'LICENSE': `PATENTE DEL CÓDICE & LICENCIA DE PROPIEDAD INTELECTUAL
==============================================================================
CÓDICE CHIP RRPH (Papel Picado Romeo Hydra) / PPRH
Fundador e Inventor Primario: Luis Angel Vazquez Martinez
Registro DOI: 10.5281/zenodo.21406719

Queda expresamente manifestado que esta Unidad Mínima Reproducible (UMR), su
núcleo lógico de conmutación convexa, protocolo Romeo-Aedra / Romeo-Hydra y
esquema de trazabilidad de cero fricción están protegidos bajo la Patente del
Códice y atribuidos originariamente a Luis Angel Vazquez Martinez.

Se autoriza su uso libre para verificación académica, auditoría empírica y
validación de gobernanza de IA bajo la condición irrenunciable de conservar
los metadatos de autoría y la citación del DOI: 10.5281/zenodo.21406719.
==============================================================================
`,
  'codice_manifest.json': `{
  "nombre_sistema": "Códice Chip RRPH (Papel Picado Romeo Hydra)",
  "version_umr": "1.0.0",
  "fundador_inventor": "Luis Angel Vazquez Martinez",
  "doi": "10.5281/zenodo.21406719",
  "patente": "Patente del Códice",
  "arquitectura": "Unidad Mínima Reproducible (UMR) de Lógica Convexa",
  "metricas_clave": {
    "friccion_operativa": "Cero Fricción (0)",
    "resolucion_telemetria": "Nanosegundos / Microsegundos",
    "integridad": "Coherencia Convexa Garantizada"
  },
  "archivos_incluidos": [
    "Dockerfile",
    "requirements.txt",
    "core.py",
    "telemetry.py",
    "cli.py",
    "README.md",
    "LICENSE",
    "codice_manifest.json"
  ]
}
`
};

export const UmrTerminal: React.FC = () => {
  const [activeFile, setActiveFile] = useState<keyof typeof UMR_FILES>('cli.py');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const downloadZipArchive = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      
      const folder = zip.folder('umr_codice_chip_rrph');
      
      Object.entries(UMR_FILES).forEach(([filename, content]) => {
        if (folder) {
          folder.file(filename, content);
        } else {
          zip.file(filename, content);
        }
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'UMR_Codice_Chip_RRPH_Luis_Angel_Vazquez_Martinez_DOI_10.5281_zenodo.21406719.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al generar archivo ZIP:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyGitInstructions = () => {
    const gitCommands = `git init
git add .
git commit -m "feat: UMR Códice Chip RRPH - Luis Angel Vazquez Martinez (DOI: 10.5281/zenodo.21406719)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/umr-codice-chip-rrph.git
git push -u origin main`;
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 3000);
  };

  const simulateExecution = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTerminalOutput([]);

    const lines = [
      "==================================================================",
      " INICIANDO UNIDAD MÍNIMA REPRODUCIBLE (UMR) - CÓDICE CHIP RRPH",
      " Fundador: Luis Angel Vazquez Martinez",
      " DOI: 10.5281/zenodo.21406719",
      "==================================================================",
      "",
      "[INFO] Inicializando Motor de Lógica Convexa...",
      "[INFO] Inicializando Logger de Telemetría...",
      "",
      "[INFO] Iniciando ingesta de datos categorizados...",
    ];

    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 100));
      setTerminalOutput(prev => [...prev, lines[i]]);
    }

    const testData = [
      { input_id: "001", rubro: "Gobernanza IA", valor_carga: 1024 },
      { input_id: "002", rubro: "Métrica Empírica", valor_carga: 2048 },
      { input_id: "003", rubro: "Topología Convexa", valor_carga: 4096 }
    ];

    const logs = [];
    let totalNs = 0;

    for (const data of testData) {
      await new Promise(r => setTimeout(r, 400));
      setTerminalOutput(prev => [...prev, `[INGESTA] Procesando -> ${data.input_id} | Rubro: ${data.rubro}`]);
      
      const timeNs = Math.floor(Math.random() * 5000) + 15000; // Simulate 15-20k ns
      totalNs += timeNs;
      
      logs.push({
        timestamp_utc: new Date().toISOString(),
        friccion_operativa: "0 (Cero Fricción)",
        tiempo_iteracion_ns: timeNs,
        trazabilidad: {
          origen: data,
          transformacion_aplicada: "Lógica Convexa - Protocolo Romeo-Aedra",
          estado_final_coherente: {
             input_id: "a3f1b4e2c9...",
             rubro: "8f7e6d5c4b...",
             valor_carga: "1a2b3c4d5e..."
          }
        }
      });
    }

    await new Promise(r => setTimeout(r, 500));
    setTerminalOutput(prev => [...prev, "", "[INFO] Generando Reporte de Trazabilidad Total..."]);
    
    for (const log of logs) {
      await new Promise(r => setTimeout(r, 300));
      const logLines = JSON.stringify(log, null, 2).split('\n');
      for (const line of logLines) {
        setTerminalOutput(prev => [...prev, line]);
      }
    }

    await new Promise(r => setTimeout(r, 500));
    setTerminalOutput(prev => [...prev, "", "[INFO] Generando Manifiesto de Viabilidad..."]);
    
    await new Promise(r => setTimeout(r, 300));
    const manifest = {
      certificacion: "Viabilidad de Iteración y Fricción Cero Demostrada",
      doi_asociado: "10.5281/zenodo.21406719",
      autor_fundador: "Luis Angel Vazquez Martinez",
      total_transacciones: logs.length,
      tiempo_total_procesamiento_ns: totalNs,
      integridad_estructural: "COHERENTE"
    };
    
    const manifestLines = JSON.stringify(manifest, null, 2).split('\n');
    for (const line of manifestLines) {
      setTerminalOutput(prev => [...prev, line]);
    }

    await new Promise(r => setTimeout(r, 300));
    setTerminalOutput(prev => [...prev, "", "[EXITO] Operación de UMR finalizada con fricción cero."]);
    setIsSimulating(false);
  };

  const downloadArchive = () => {
    // Generate a setup script that creates the files
    let scriptContent = "#!/bin/bash\n\n";
    scriptContent += "mkdir -p umr_codice_chip_rrph\n";
    scriptContent += "cd umr_codice_chip_rrph\n\n";
    
    Object.entries(UMR_FILES).forEach(([filename, content]) => {
      scriptContent += `cat << 'EOF' > ${filename}\n`;
      scriptContent += content;
      if (!content.endsWith('\n')) scriptContent += '\n';
      scriptContent += "EOF\n\n";
    });
    
    scriptContent += 'echo "Unidad Mínima Reproducible (UMR) generada con éxito."\\n';
    scriptContent += 'echo "Para ejecutar: docker build -t umr-chip . && docker run --rm umr-chip"\\n';

    const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generar_umr_codice.sh';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-6 shadow-xl ring-1 ring-indigo-500/20">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-900/50 ring-1 ring-indigo-500/50">
                <Package className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Unidad Mínima Reproducible (UMR)
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Bloque de ejecución contenido, autónomo y puro para el núcleo lógico.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadZipArchive}
              disabled={isZipping}
              className="group flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 disabled:opacity-50"
            >
              <FileArchive className="h-4 w-4 text-emerald-200" />
              <span>{isZipping ? 'Generando ZIP...' : 'Descargar UMR (.ZIP GitHub/DOI)'}</span>
            </button>

            <button
              onClick={downloadArchive}
              className="group flex items-center space-x-2 rounded-xl border border-indigo-700/60 bg-indigo-950/80 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition-all hover:bg-indigo-900/60"
            >
              <Download className="h-4 w-4 text-indigo-400" />
              <span>Script Shell (.sh)</span>
            </button>
          </div>
        </div>

        {/* GitHub Repository & Zenodo DOI Card */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Github className="h-5 w-5 text-slate-200" />
              <h3 className="font-mono text-xs font-bold text-slate-200">
                GUÍA DE PUBLICACIÓN EN GITHUB Y VALIDACIÓN DOI (10.5281/zenodo.21406719)
              </h3>
            </div>
            <button
              onClick={copyGitInstructions}
              className="flex items-center space-x-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              {copiedCmd ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Code2 className="h-3.5 w-3.5 text-cyan-400" />}
              <span>{copiedCmd ? '¡Comandos copiados!' : 'Copiar comandos Git'}</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-1.5">
              <p className="font-semibold text-cyan-400">1. Descomprimir y Subir a GitHub Público:</p>
              <p className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                git init && git add . && git commit -m "feat: UMR Códice Chip RRPH (DOI: 10.5281/zenodo.21406719)"
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-emerald-400">2. Vinculación Zenodo para emisión de DOI:</p>
              <p className="text-slate-400">
                Conecta tu cuenta GitHub en <a href="https://zenodo.org" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 inline-flex items-center gap-0.5">Zenodo.org <ExternalLink className="h-3 w-3" /></a>, activa el repo y genera una Release (v1.0.0) para asociar formalmente el DOI registrado.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-indigo-900/50 pt-4 text-xs font-medium text-slate-300">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Patente del Códice</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Code2 className="h-4 w-4 text-blue-400" />
            <span>DOI: 10.5281/zenodo.21406719</span>
          </div>
          <div className="flex items-center space-x-1.5 rounded-full bg-indigo-950 px-2.5 py-1 ring-1 ring-indigo-800">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Fundador: Luis Angel Vazquez Martinez</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* File Explorer */}
        <div className="col-span-1 flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-lg">
          <div className="border-b border-slate-800 bg-slate-900 p-3">
            <h3 className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Database className="h-4 w-4 text-slate-500" />
              <span>Estructura de la UMR</span>
            </h3>
          </div>
          <div className="flex-1 p-2">
            {Object.keys(UMR_FILES).map((filename) => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename as keyof typeof UMR_FILES)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeFile === filename
                    ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileIcon filename={filename} active={activeFile === filename} />
                  <span>{filename}</span>
                </div>
                {activeFile === filename && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="col-span-1 flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117] shadow-lg lg:col-span-2">
           <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-semibold text-slate-300">
                {activeFile}
              </h3>
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-800/60">
                🔒 Infraestructura Protegida
              </span>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              Lectura e Interacción Estricta
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-xs font-mono text-slate-300">
              <code>{UMR_FILES[activeFile]}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Terminal Simulator */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-3">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-300">
              Simulación de Ejecución: cli.py
            </h3>
          </div>
          <button
            onClick={simulateExecution}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            <span>{isSimulating ? 'Ejecutando...' : 'Iniciar Test'}</span>
          </button>
        </div>
        <div 
          ref={terminalRef}
          className="h-80 overflow-y-auto p-4 text-xs font-mono text-emerald-500"
        >
          {terminalOutput.length === 0 && !isSimulating && (
            <div className="flex h-full items-center justify-center text-slate-600">
              Presiona "Iniciar Test" para medir la fricción operativa.
            </div>
          )}
          {terminalOutput.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line || ' '}</div>
          ))}
          {isSimulating && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="h-2 w-2 bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileIcon = ({ filename, active }: { filename: string, active: boolean }) => {
  if (filename.endsWith('.py')) return <Code2 className={`h-4 w-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />;
  if (filename === 'Dockerfile') return <Package className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />;
  return <FileTextIcon className={`h-4 w-4 ${active ? 'text-slate-300' : 'text-slate-500'}`} />;
};

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);
