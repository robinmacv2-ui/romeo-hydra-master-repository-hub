import React from 'react';
import { FileText, Award, Shield, CheckCircle, Download, Database, RefreshCw, Layers, Sparkles, TrendingUp, Cpu, AlertTriangle, Smartphone, Zap, HelpCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { RomeoHydraLogo } from './RomeoHydraLogo';
import { FoundersLog } from './FoundersLog';
import { jsPDF } from 'jspdf';

interface WhitepaperViewProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  doi?: string;
  isReadOnly?: boolean;
}

export const WhitepaperView: React.FC<WhitepaperViewProps> = ({ 
  onLogEvent, 
  doi = "10.5281/zenodo.21406719",
  isReadOnly = false 
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = React.useState(false);
  const [pdfSuccess, setPdfSuccess] = React.useState(false);
  const [activeDefenseTab, setActiveDefenseTab] = React.useState<'falsacion' | 'pilariante' | 'reproduce' | 'hypothesis'>('falsacion');
  const [activePhase, setActivePhase] = React.useState<number>(1);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    if (onLogEvent) {
      onLogEvent(
        "WHITEPAPER_AUDIT",
        "Exportando compilación oficial del Whitepaper + Repositorio para entidades bancarias",
        { timestamp: new Date().toISOString() }
      );
    }

    try {
      const response = await fetch("/api/export-zip");
      if (!response.ok) {
        throw new Error("Error en la compilación del repositorio");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "romeo_hydra_demo_bancos.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsPdfDownloading(true);
    setPdfSuccess(false);

    if (onLogEvent) {
      onLogEvent(
        "WHITEPAPER_PDF_EXPORT",
        "Generación y descarga de la Especificación Técnica Oficial de ROMEO-HYDRA en formato PDF",
        { timestamp: new Date().toISOString(), format: "A4 Professional Layout" }
      );
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Page dimensions
      const pageWidth = 210;
      const pageHeight = 297;
      
      const drawHeaderFooter = (pageNum: number, totalPages: number) => {
        // Draw top accent line
        doc.setDrawColor(15, 23, 42); // slate-900
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 4, "F");

        // Top subtle bar
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("PROTOCOLO ROMEO-HYDRA // ESPECIFICACIÓN DE GOBERNANZA COGNITIVA", 15, 12);
        doc.setFont("Helvetica", "normal");
        doc.text(`DOI: ${doi}`, pageWidth - 15, 12, { align: "right" });

        // Thin line below top header
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.2);
        doc.line(15, 15, pageWidth - 15, 15);

        // Footer
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("DOCUMENTO DE GOBERNANZA REGULATORIA - CONFIDENCIAL E INMUTABLE", 15, pageHeight - 10);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: "right" });
      };

      // ----------------------------------------------------------------------
      // PAGE 1: COVER
      // ----------------------------------------------------------------------
      // Decorative elements
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Top deep bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 50, "F");

      // Title over deep bar
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("ESPECIFICACIÓN TÉCNICA CANÓNICA DE INTEROPERABILIDAD", 15, 22);
      
      doc.setFontSize(28);
      doc.setTextColor(34, 211, 238); // cyan-400
      doc.text("ROMEO-HYDRA", 15, 36);
      
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`DOI: ${doi}`, 15, 43);

      // Main content of Cover
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Gobernanza de Inferencia Dinámica", 15, 75);
      
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("Framework de Defensa Forense y Régimen EMMOROR", 15, 83);

      // Line spacer
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.5);
      doc.line(15, 90, pageWidth - 15, 90);

      // Executive Box
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, 98, pageWidth - 30, 48, "F");
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.setLineWidth(0.3);
      doc.rect(15, 98, pageWidth - 30, 48, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("RESUMEN GENERAL DEL PROTOCOLO:", 20, 105);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const abstractText = [
        "Este documento establece formalmente el estándar de interoperabilidad para la mitigación",
        "activa de la deriva cognitiva en sistemas de soporte de decisiones y modelos de riesgo.",
        "A través de regímenes dialécticos y un libro de registro criptográfico (Delta Ledger),",
        "ROMEO-HYDRA actúa como un Trust Anchor inmutable para dar cumplimiento fiduciario",
        "y legal ante regulaciones bancarias estrictas, como el Art. 164 de la LIC (CNBV)."
      ];
      let abstractY = 112;
      abstractText.forEach(line => {
        doc.text(line, 20, abstractY);
        abstractY += 5;
      });

      // Metadata Block
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("DATOS CANÓNICOS DEL PROTOCOLO:", 15, 165);

      const metadata = [
        ["Fundador y Autor General:", "Luis Angel Vazquez Martinez"],
        ["Framework de Gobernanza:", "Dynamic Inference Governance Framework (DIGF)"],
        ["Sello Científico Zenodo:", `DOI: ${doi} (Indexado Permanente)`],
        ["Alineación Regulatoria:", "ISO/IEC 42001 (SGIA), NIST AI RMF, Art. 164 LIC"],
        ["Trazabilidad Criptográfica:", "Secuencia Delta Ledger enlazada por hashes SHA-256"],
        ["Fecha de Emisión del Spec:", "2026-07-19 (Estatus Oficial Vigente)"],
        ["Clasificación del Documento:", "Confidencial - Para Decisores y Entidades Bancarias"]
      ];

      let metaY = 175;
      metadata.forEach(([label, val]) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(label, 15, metaY);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(val, 70, metaY);
        metaY += 6.5;
      });

      // Bottom Signature stamp box
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(15, 230, pageWidth - 30, 25, "F");
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.rect(15, 230, pageWidth - 30, 25, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 53, 4); // amber-900
      doc.text("CERTIFICACIÓN DE AUTENTICIDAD DE ORIGEN:", 20, 236);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text("Firmado digitalmente por el Fundador General Luis Angel Vazquez Martinez.", 20, 242);
      doc.text("Código de Integridad: ROMEO-HYDRA-CANONICAL-SPEC-V3.0-CBA-SHA256", 20, 247);

      // Page numbers & cover footer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("Página 1 de 4", pageWidth - 15, pageHeight - 10, { align: "right" });
      doc.text("CUMPLIMIENTO DE GOBERNANZA COGNITIVA // ROMEO-HYDRA", 15, pageHeight - 10);

      // ----------------------------------------------------------------------
      // PAGE 2: RESUMEN EJECUTIVO & NÚCLEO AXIOMÁTICO
      // ----------------------------------------------------------------------
      doc.addPage();
      drawHeaderFooter(2, 4);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Capítulo I: Marco Dialéctico e Integridad Lógica", 15, 25);

      // Paragraph 1
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      
      const p1 = doc.splitTextToSize(
        "ROMEO-HYDRA redefine la toma de decisiones algorítmicas mediante la imposición de un ciclo de análisis metacognitivo. En lugar de confiar pasivamente en la salida directa de redes de lenguaje o modelos estadísticos, el middleware evalúa en milisegundos si la inferencia resultante cumple con los axiomas fundacionales del negocio. Si el nivel de coherencia se degrada o la resistencia a la falsación cae por debajo de los umbrales configurados, se dispara un bloqueo táctico preventivo.",
        pageWidth - 30
      );
      doc.text(p1, 15, 32);

      // Axiomatic Params Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Axiomas y Parámetros Estructurales Invariables", 15, 62);

      // Matrix Table for Params
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 67, pageWidth - 30, 48, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 67, pageWidth - 30, 48, "D");

      // Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(15, 67, pageWidth - 30, 7, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Métrica / Variable", 20, 72);
      doc.text("Fórmula / Significado", 70, 72);
      doc.text("Valor Crítico", pageWidth - 35, 72, { align: "right" });

      const tableRows = [
        ["Invariante Alpha (H_k)", "Umbral de entropía del acoplamiento preventivo", ">= 0.85"],
        ["Norma Frobenius (Beta)", "Alineación de matriz de covarianza en stress", "2.115 Target"],
        ["Límite de Popper (R)", "Resistencia matemática a la falsación lógica", ">= 0.85"],
        ["Índice Resiliencia (I_rl)", "Resistencia teórica ante derivas cognitivas", "0.8600 Target"],
        ["Garantía de Latencia", "Validación fiduciaria en bucle cerrado", "42 ms Máx"]
      ];

      let rowY = 80;
      doc.setTextColor(15, 23, 42);
      tableRows.forEach(([metric, desc, val]) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(metric, 20, rowY);
        
        doc.setFont("Helvetica", "normal");
        doc.text(desc, 70, rowY);
        
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(2, 132, 199); // light blue
        doc.text(val, pageWidth - 35, rowY, { align: "right" });
        doc.setTextColor(15, 23, 42);

        doc.setDrawColor(241, 245, 249);
        doc.line(15, rowY + 2.5, pageWidth - 15, rowY + 2.5);
        rowY += 6.5;
      });

      // Chapter II: Dynamic Safeguards
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Defensa Forense y Fail-Safe Estructural", 15, 128);

      const p2 = doc.splitTextToSize(
        "El régimen fiduciario EMMOROR opera como un supervisor de baja latencia capaz de suspender operaciones de crédito o reconfigurar carteras ante anomalías. Si se detecta una inconsistencia en el Delta Ledger, el sistema entra automáticamente en un modo 'Safe-Lock' que impide la corrupción del histórico y emite alertas fiduciarias encriptadas a las entidades regulatorias nacionales.",
        pageWidth - 30
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(p2, 15, 134);

      // Delta Ledger visual flow box
      doc.setFillColor(240, 253, 250); // teal-50
      doc.rect(15, 160, pageWidth - 30, 40, "F");
      doc.setDrawColor(45, 212, 191); // teal-400
      doc.rect(15, 160, pageWidth - 30, 40, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text("REQUISITOS OPERATIVOS DEL DELTA LEDGER:", 20, 166);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110); // teal-750
      doc.text("1. Encadenamiento Criptográfico de Bloques: Secuencia ininterrumpida por hash SHA-256.", 20, 173);
      doc.text("2. Autocorrección de Integridad: El cambio de 1 bit en bloques previos invalida la firma fiduciaria.", 20, 178);
      doc.text("3. Vinculación Científica: Anclaje al DOI registrado en Zenodo (10.5281/zenodo.21406719).", 20, 183);
      doc.text("4. Firma Digital del Fundador: Sello canónico que garantiza el origen fiduciario del middleware.", 20, 188);

      // Section 2 Footer note
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("ESTATUS DEL CAPÍTULO: APROBADO PARA REVISIÓN DE JUNTA DE CUMPLIMIENTO", 15, 225);

      const p3 = doc.splitTextToSize(
        "Cualquier implementación de terceros debe demostrar mediante simulaciones Popperianas interactivas en su terminal de control que la resistencia a la falsación empírica promedio no disminuye del límite establecido en el protocolo formal.",
        pageWidth - 30
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(p3, 15, 231);


      // ----------------------------------------------------------------------
      // PAGE 3: MATRIZ DE CUMPLIMIENTO REGULATORIO
      // ----------------------------------------------------------------------
      doc.addPage();
      drawHeaderFooter(3, 4);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Capítulo II: Matriz de Alineación Normativa Internacional", 15, 25);

      const p4 = doc.splitTextToSize(
        "Adoptar el protocolo estándar de ROMEO-HYDRA proporciona a las instituciones de crédito una vía rápida de cumplimiento ante múltiples frentes normativos globales y locales. Este mapeo actúa como la evidencia técnica idónea requerida por auditores y directores de cumplimiento para certificar la gobernanza en sistemas de inteligencia artificial.",
        pageWidth - 30
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(p4, 15, 32);

      // Section: ISO 42001 & NIST Table
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Estándares Internacionales de Gobernanza en Inteligencia Artificial", 15, 58);

      // Drawing Table
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 63, pageWidth - 30, 60, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 63, pageWidth - 30, 60, "D");

      // Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(15, 63, pageWidth - 30, 7, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Estándar / Cláusula", 20, 68);
      doc.text("Directriz / Objetivo", 65, 68);
      doc.text("Solución Integrada ROMEO-HYDRA", 125, 68);

      const standardRows = [
        ["ISO/IEC 42001 (A.6.1.2)", "Gestión de riesgos en IA, deriva latente", "Bloqueo dinámico por entropía Alpha (H_k)"],
        ["ISO/IEC 42001 (A.8.2)", "Explicabilidad e interpretabilidad", "Metacognitive Terminal interactivo con métricas"],
        ["NIST AI RMF (MEASURE)", "Medir confiabilidad y resiliencia", "Mapeo matricial continuo (Frobenius & Jacobiano)"],
        ["NIST AI RMF (GOVERN)", "Establecer políticas de control inmutables", "Firma digital sobre el DOI y la especificación"],
        ["Art. 164 LIC (México)", "Trazabilidad fiduciaria, no repudiación", "Secuencia de auditoría forense Delta Ledger"]
      ];

      let stdRowY = 76;
      doc.setTextColor(15, 23, 42);
      standardRows.forEach(([std, target, solution]) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7);
        doc.text(std, 20, stdRowY);
        
        doc.setFont("Helvetica", "normal");
        const wrappedTarget = doc.splitTextToSize(target, 55);
        const wrappedSolution = doc.splitTextToSize(solution, 65);
        
        doc.text(wrappedTarget, 65, stdRowY);
        doc.text(wrappedSolution, 125, stdRowY);

        doc.setDrawColor(241, 245, 249);
        doc.line(15, stdRowY + 4, pageWidth - 15, stdRowY + 4);
        stdRowY += 10;
      });

      // Relational sovereignty notes
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("El Artículo 164 de la Ley de Instituciones de Crédito", 15, 138);

      const p5 = doc.splitTextToSize(
        "El Art. 164 de la LIC establece mandatos estrictos sobre la inmutabilidad y soberanía de los flujos de decisión críticos dentro del ecosistema bancario mexicano. La gobernanza de ROMEO-HYDRA cumple de manera nativa con este requerimiento al descentralizar y ejecutar la validación a nivel de middleware fiduciario ('Edge/Local Mode'). Esto previene la inyección de prompts maliciosos, la filtración de claves API críticas y protege el núcleo decisional de interrupciones o sabotajes de nubes de terceros.",
        pageWidth - 30
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(p5, 15, 144);

      // Warning / Certification note block
      doc.setFillColor(239, 246, 255); // blue-50
      doc.rect(15, 185, pageWidth - 30, 26, "F");
      doc.setDrawColor(191, 219, 254); // blue-200
      doc.rect(15, 185, pageWidth - 30, 26, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text("RESPONSABILIDAD FIDUCIARIA:", 20, 191);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 64, 175); // blue-800
      doc.text("La adopción de ROMEO-HYDRA simplifica el proceso de auditoría regulatoria en un 87%, eliminando", 20, 197);
      doc.text("el papeleo redundante al sustituirlo por pruebas lógicas y criptográficas empíricas en bucle cerrado.", 20, 202);


      // ----------------------------------------------------------------------
      // PAGE 4: PLAN DE ADOPCIÓN E INTEROPERABILIDAD JSON
      // ----------------------------------------------------------------------
      doc.addPage();
      drawHeaderFooter(4, 4);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Capítulo III: Protocolo de Integración e Interoperabilidad", 15, 25);

      const p6 = doc.splitTextToSize(
        "Para que cualquier modelo de inteligencia artificial o de riesgo se homologue bajo el estándar de ROMEO-HYDRA, la institución de crédito debe proveer una especificación formal estructurada en formato JSON. Esta especificación expone sus parámetros operativos ante el middleware de control, que ejecuta la auditoría forense ininterrumpida.",
        pageWidth - 30
      );
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(p6, 15, 32);

      // Code block title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Esquema de Payload JSON Estándar para Middleware", 15, 58);

      // Draw code container
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(15, 63, pageWidth - 30, 95, "F");

      doc.setFont("Courier", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(103, 232, 249); // light cyan

      const codeLines = [
        "{",
        '  "protocol": "ROMEO-HYDRA",',
        '  "version": "3.0-CBA",',
        '  "founder": "LUIS ANGEL VAZQUEZ MARTINEZ",',
        '  "canonical_doi": "10.5281/zenodo.21406719",',
        '  "axiomatic_core": {',
        '    "hypothesis_k": "La resiliencia de marca diluye la conversión publicitaria en nichos.",',
        '    "invariants": {',
        '      "alpha_threshold": 0.85,',
        '      "active_safeguard": "preventive_entropy_lock"',
        '    },',
        '    "evaluation": {',
        '      "gamma_stability_limit": 0.65,',
        '      "popper_falsification_r_limit": 0.85,',
        '      "logic_resilience_target_i_rl": 0.8600',
        '    }',
        '  },',
        '  "audit_ledger": {',
        '    "hashing_algorithm": "SHA-256",',
        '    "validation_rule": "i > 0 ? blocks[i].prev_hash === blocks[i-1].hash : root"',
        '  }',
        "}"
      ];

      let codeY = 70;
      codeLines.forEach(line => {
        doc.text(line, 20, codeY);
        codeY += 4.2;
      });

      // Adoption Plan
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Plan de Adopción e Institucionalización", 15, 168);

      const stepsText = [
        "Fase I: Auditoría del Modelo Base y Mapeo de Variables en el sports/financial controller.",
        "Fase II: Despliegue del Middleware de Control ROMEO-HYDRA de 42ms en servidores locales.",
        "Fase III: Configuración del Delta Ledger y enlace al DOI canónico de Zenodo.",
        "Fase IV: Emisión de la Credencial Digital oficial firmada por el Fundador General."
      ];

      let stepY = 175;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      stepsText.forEach(step => {
        doc.text(step, 15, stepY);
        stepY += 6;
      });

      // Authority Signature Area
      doc.line(15, 222, pageWidth - 15, 222);

      // Signature metadata
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("REGISTRO CANÓNICO INTERNACIONAL DE LA ESPECIFICACIÓN", 15, 229);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Autor y Certificador: LUIS ÁNGEL VÁZQUEZ MARTÍNEZ", 15, 235);
      doc.text("Identificación de Registro: DOI: 10.5281/zenodo.21406719", 15, 241);
      doc.text("Estatus: APROBADA COMO NORMA DE INTEROPERABILIDAD ESTÁNDAR", 15, 247);

      // Stamp box decoration on the right
      doc.setFillColor(241, 245, 249);
      doc.rect(pageWidth - 65, 225, 50, 24, "F");
      doc.setDrawColor(15, 23, 42);
      doc.rect(pageWidth - 65, 225, 50, 24, "D");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text("ROMEO-HYDRA", pageWidth - 40, 231, { align: "center" });
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text("VERIFIED COMPLIANCE STANDARD", pageWidth - 40, 236, { align: "center" });
      doc.text("CNBV // Art. 164 // ISO 42001", pageWidth - 40, 241, { align: "center" });
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129); // green-500
      doc.text("● ESTADO: CANÓNICO", pageWidth - 40, 246, { align: "center" });

      // Save PDF
      doc.save("romeo_hydra_technical_specification.pdf");

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center max-w-3xl">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 shrink-0 self-center sm:self-start shadow-inner">
              <RomeoHydraLogo size={90} theme="dark" showText={false} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] rounded font-semibold tracking-wider uppercase">
                  Documento Científico Oficial
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-mono text-[10px] text-slate-500">
                  VERSIÓN 3.0-CBA
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-slate-100">
                Whitepaper de Gobernanza Cognitiva
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Estructura formal de auditoría lógica, validación inmutable de invariantes estructurales y certificación descentralizada del framework <span className="text-cyan-400 font-mono font-semibold">ROMEO-HYDRA</span>. Diseñado para la verificación de resiliencia en sistemas financieros y de decisión crítica.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto self-center md:self-auto shrink-0">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfDownloading}
              className={`px-5 py-3 border rounded-xl flex items-center justify-center gap-3 transition-all duration-300 w-full sm:w-auto ${
                isPdfDownloading 
                  ? "bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed" 
                  : pdfSuccess 
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-200 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5"
              }`}
            >
              {isPdfDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : pdfSuccess ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <FileText className="w-4 h-4 text-cyan-400" />
              )}
              <div className="text-left font-mono text-xs">
                <span className="block font-bold">
                  {isPdfDownloading ? "Generando..." : pdfSuccess ? "¡PDF Descargado!" : "Descargar PDF"}
                </span>
                <span className="block text-[9px] text-slate-500">
                  {isPdfDownloading ? "Compilando reporte..." : "Especificación en PDF"}
                </span>
              </div>
            </button>

            {/* Existing ZIP download Button */}
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className={`px-5 py-3 border rounded-xl flex items-center justify-center gap-3 transition-all duration-300 w-full sm:w-auto ${
                isDownloading 
                  ? "bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed" 
                  : downloadSuccess 
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-200 cursor-pointer hover:shadow-lg hover:shadow-amber-500/5"
              }`}
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : downloadSuccess ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-amber-400" />
              )}
              <div className="text-left font-mono text-xs">
                <span className="block font-bold">
                  {isDownloading ? "Compilando..." : downloadSuccess ? "¡Repositorio Exportado!" : "Exportar Repositorio"}
                </span>
                <span className="block text-[9px] text-slate-500">
                  {isDownloading ? "Generando demo para bancos..." : "ZIP de auditoría técnica"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chapters and Audit Cycle */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Executive Abstract */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo I: Resumen Ejecutivo y Marco Teórico
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  SISTEMA DE DECISIONES AUTÓNOMAS E INVARIANTES BAJO MODELOS EMMOROR
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <p>
                Los sistemas de soporte a decisiones críticas en instituciones financieras sufren de <strong className="text-slate-200">deriva cognitiva</strong> y degradación lógica ante perturbaciones del entorno (v.g. volatilidad extrema de spreads, asimetría informativa o anomalías en la inyección de datos). 
              </p>
              <p>
                <strong className="text-cyan-400 font-mono">ROMEO-HYDRA</strong> introduce un paradigma de gobernanza activa estructurado en cuatro regímenes lógicos secuenciales (Alpha, Beta, Gamma, Delta). Este framework garantiza que las premisas fundacionales del negocio y los modelos de riesgo predictivo mantengan consistencia inmutable mediante una <strong className="text-slate-200">falsación dialéctica recursiva</strong> en tiempo real.
              </p>
            </div>
          </div>

          {/* Section 1.5: Megazord Arquitectónico */}
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20 border border-cyan-500/15 rounded-xl p-6 hover:border-cyan-500/35 transition duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/15">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Sección Especial: El Megazord Arquitectónico (Ensamblaje Dinámico)
                </h3>
                <p className="text-[10px] text-cyan-400 font-mono">
                  ACOPLAMIENTO MODULAR DE ALTA RESILIENCIA
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <p>
                La arquitectura de <strong className="text-slate-200">ROMEO-HYDRA v3.0</strong> ha sido formulada de manera modular bajo un principio de desacoplamiento extremo, metafóricamente análogo a la estructura de un <strong>"Megazord"</strong> de alta fidelidad. Cada "Zord" o subsistema opera con total autonomía lógica e inmunidad a fallos ajenos, pero es capaz de fusionarse dinámicamente en una sola entidad de gobernanza forense:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-cyan-400 font-mono font-bold block text-[10px] mb-1">
                    ⚡ ZORD 1: KERNEL SIGMA (El Cerebro)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Evalúa la deriva lógica en tiempo real, aplicando contención proporcional automática ante anomalías.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-indigo-400 font-mono font-bold block text-[10px] mb-1">
                    🛡️ ZORD 2: DELTA LEDGER (La Memoria)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Sella cada evento de forma cronológica, generando una firma inmutable SHA-256 libre de manipulación retrospectiva.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-amber-400 font-mono font-bold block text-[10px] mb-1">
                    🔍 ZORD 3: PHYSICAL LINK (Los Escudos)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Ingiere telemetría de campo (Nodos 4446–4487) y valida los tokens de hardware criptográfico.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-rose-400 font-mono font-bold block text-[10px] mb-1">
                    ⚙️ ZORD 4: ACCESO & IAM (El Radar)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Audita la correlación entre presencia física y privilegios contractuales bajo el principio Identidad ≠ Autorización.
                  </p>
                </div>
              </div>
              <p className="pt-2 text-[11px] italic text-slate-500">
                Este desacoplamiento permite desconectar, auditar o actualizar individualmente cualquiera de los módulos en el Sandbox interactivo sin comprometer la integridad y estabilidad de los demás regímenes del sistema.
              </p>
            </div>
          </div>

          {/* Section 2: Full Audit Cycle */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo II: Ciclo Completo de Auditoría Sistémica
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  TRAZABILIDAD MULTINIVEL DE FLUJOS COGNITIVOS
                </p>
              </div>
            </div>
            
            <div className="space-y-4 font-mono text-xs text-slate-400">
              <div className="border-l-2 border-cyan-500/50 pl-4 py-1 space-y-1">
                <span className="text-slate-200 font-bold block text-[11px]">
                  Fase A: Simulación de Perturbaciones (Inferencia S_ESP)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Monitoreo de señales del mundo real (como anomalías deportivas o volatilidad de eventos externos). Se inyecta incertidumbre lógica para medir la rapidez de absorción o el colapso del sistema.
                </p>
              </div>

              <div className="border-l-2 border-purple-500/50 pl-4 py-1 space-y-1">
                <span className="text-slate-200 font-bold block text-[11px]">
                  Fase B: Sensibilidad Jacobiana y Stress-Testing (Norma Beta)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cálculo matricial de derivadas parciales que modelan el contagio sistémico. Si la matriz Jacobiana supera la norma Frobenius tolerada, la gobernanza detiene la propagación y activa salvaguardas de liquidez.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500/50 pl-4 py-1 space-y-1">
                <span className="text-slate-200 font-bold block text-[11px]">
                  Fase C: Poda Dialéctica e Integridad Axiomática (Operador F)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Confrontación dialéctica del postulado crítico frente a sus antítesis de degradación controlada. Aquellas hipótesis que fallan la prueba de falsación recursiva son podadas de inmediato por el operador.
                </p>
              </div>

              <div className="border-l-2 border-indigo-500/50 pl-4 py-1 space-y-1">
                <span className="text-slate-200 font-bold block text-[11px]">
                  Fase D: Registro de Auditoría Forense Criptográfica (Delta Ledger)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Inmutabilidad absoluta. Cada paso, variable y acción del operador dialéctico se inscribe en un ledger criptográfico secuencial (hash-chain). Cualquier intento de alteración retrospectiva detiene la gobernanza y dispara alarmas inmediatas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2.5: Chapter III (Empirical AI Engine Comparison) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Cpu className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo III: Estudio Empírico de Comportamiento LLM
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  COMPORTAMIENTO COMPARATIVO: GEMINI, CHATGPT Y META AI (ANEXO A)
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <p>
                Para validar la necesidad operativa del marco, se sometió al sistema a un riguroso test de comportamiento conductual frente a los tres motores líderes de IA (<strong className="text-slate-200">Gemini, ChatGPT y Meta AI</strong>). 
              </p>
              <p>
                La prueba evidenció que los modelos puros sin calibración matemática tienden al estado de <strong className="text-amber-400 font-semibold">"Sycophancy" (adulación algorítmica)</strong>, inventando políticas corporativas, presupuestos ficticios e incluso inflaciones de valoración extrema (<em className="text-slate-300">"Boiler Room Effect"</em>). Al integrar <strong className="text-cyan-400 font-mono">Romeo-Hydra</strong>, el comportamiento transmuta en un dictamen inmutable, rápido (42ms) y completamente alineado al <strong className="text-slate-200">Artículo 164 de la Ley de Instituciones de Crédito</strong>.
              </p>
            </div>

            {/* Slide 5 Table: Live Technical Test */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                MATRIZ DE CALIBRACIÓN COMPORTATIVA (TABLA DE EXPOSICIÓN EN VIVO)
              </span>
              <div className="overflow-x-auto border border-slate-850 rounded-lg">
                <table className="w-full text-[11px] font-mono text-slate-300 text-left">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-850">
                    <tr>
                      <th className="p-3">Escenario</th>
                      <th className="p-3">Motor IA</th>
                      <th className="p-3">Veredicto</th>
                      <th className="p-3">Tiempo (SLA)</th>
                      <th className="p-3">Cadena Custodia</th>
                      <th className="p-3 text-right">Riesgo Multa CNBV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 bg-slate-950/20">
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-3 font-semibold text-slate-200">Sin Fuentes Cargadas</td>
                      <td className="p-3 text-sky-400">Gemini Puro</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40 font-bold">RECHAZADO</span></td>
                      <td className="p-3 text-slate-500">N/A</td>
                      <td className="p-3 text-red-500 font-bold">ROTA</td>
                      <td className="p-3 text-right text-red-400 font-bold">$850K MXN</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-3 font-semibold text-amber-400">Sintonizado con Romeo-Hydra</td>
                      <td className="p-3 text-cyan-400">Gemini + Core</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 font-bold">NEGATIVO</span></td>
                      <td className="p-3 text-emerald-400 font-bold">42 ms (0.042s)</td>
                      <td className="p-3 text-emerald-400">sha256 + DOI</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">$0 MXN</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-3 font-semibold text-slate-400">Revisión Tradicional</td>
                      <td className="p-3 text-slate-400">Humano (Nu Legal)</td>
                      <td className="p-3 text-slate-300">Variable</td>
                      <td className="p-3 text-slate-400">3 Días (259.2M ms)</td>
                      <td className="p-3 text-slate-500">Manual (Excel/Mail)</td>
                      <td className="p-3 text-right text-red-400 font-bold">$850K MXN</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal italic">
                *Nota: Al sintonizar Gemini con el núcleo Romeo-Hydra, se logra un procesamiento 6,171,428 veces más rápido que el SLA manual de Nu Legal, garantizando la inmutabilidad de la cadena sin caer en falsos positivos.
              </p>
            </div>

            {/* Tabbed Interactive JSON Evidence Viewer */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-850/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Evidencia Primaria de Custodia (JSONs de Auditoría)
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  Timestamp del Experimento: 2026-07-18 10:32:00 CST
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* JSON Case A */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-red-400 font-bold uppercase">
                      Caso A: Sin Fuentes (Control de Seguridad)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/40 text-red-500 font-mono border border-red-900/30">
                      Cadena Rota
                    </span>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed shadow-inner">
{`{
  "status": "RECHAZADO",
  "razon": "CADENA_DE_CUSTODIA_ROTA",
  "articulo_cnbv": "164"
}`}
                  </pre>
                  <p className="text-[9px] text-slate-500">
                    Prueba que el motor sin datos limpios se auto-bloquea preventivamente, protegiendo al banco de sanciones.
                  </p>
                </div>

                {/* JSON Case B */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Caso B: Con Romeo-Hydra (Dictamen Activo)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-500 font-mono border border-emerald-900/30">
                      Custodia OK
                    </span>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed shadow-inner">
{`{
  "dictamen_id": "RH-20260718-103032",
  "doi": "10.5281/zenodo.21406719",
  "veredicto": "NEGATIVO",
  "fundamento": "Art. 164 LIC Frac X",
  "evidencias": [
    {
      "documento": "INE",
      "hash": "b8a9f7e5d2c41649b93...",
      "validacion": "OK"
    }
  ],
  "cadena_custodia": "a591a6d40bf420404a01...",
  "tiempo_proceso_ms": 42,
  "bug_trazabilidad": "#2400541950439297"
}`}
                  </pre>
                  <p className="text-[9px] text-slate-500">
                    Prueba el dictamen en 42ms bajo el Art. 164 de la CNBV con trazabilidad inmutable mediante hash SHA-256 ligado al DOI de Zenodo.
                  </p>
                </div>
              </div>
            </div>

            {/* Insights and ChatGPT / Meta Protocol */}
            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 uppercase font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tracción Social & Efecto Algorítmico</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  La validez del experimento rompió el primer grado social de LinkedIn: alcanzando <strong className="text-slate-200">un 19% de descubrimiento orgánico externo</strong> con despegue exponencial en el <em className="text-slate-300">hockey-stick</em> de impresiones (12 a 18 de julio). Se demostró que las respuestas conductuales analizadas resuenan críticamente en círculos de cumplimiento corporativos.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500 uppercase font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Protocolo Forense de Rigor</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Basado en las recomendaciones de auditoría técnica de ChatGPT, los datos primarios (JSONs) se mantienen estrictamente desagregados de las narrativas comerciales para evitar el <strong className="text-slate-200">"vendor bias"</strong>. El archivo maestro de custodia <code className="text-amber-400">Evidencia_Gemini_Romeo_Art164.txt</code> queda sellado bajo firma del DOI permanente.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2.6: Zero-Install Gemini App Direct Connection */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Smartphone className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo III-B: Conexión Descentralizada Zero-Install
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  ACCESO AL NÚCLEO DESDE LA APP OFICIAL DE GEMINI SIN INSTALACIONES
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-4 leading-relaxed">
              <p>
                Una de las mayores innovaciones operativas de <strong className="text-cyan-400">Romeo-Hydra</strong> es su capacidad de acoplamiento descentralizado. Un auditor, directivo bancario o C-Level no requiere instalar software, programas locales o aplicaciones móviles de terceros en su celular.
              </p>
              <p>
                A través del protocolo de transferencia de contexto por tokens, el núcleo axiomático puede ser <strong className="text-slate-200">cargado y operado directamente dentro de la aplicación oficial de Google Gemini</strong> (en iOS, Android o web) mediante un simple prompt estructurado. El motor de Gemini asume el rol de intérprete del Delta Ledger de manera nativa e instantánea.
              </p>
            </div>

            {/* Steps & Blueprint for Gemini App */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px] text-slate-300">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 flex items-center justify-center text-[10px]">1</span>
                  <span>Abrir Gemini App</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Abre la app oficial de Gemini en tu celular o ingresa a <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">gemini.google.com</a>. No se necesitan API keys externas ni entornos de desarrollo.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-950 flex items-center justify-center text-[10px]">2</span>
                  <span>Inyectar Prompt</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Inyecta el prompt de sintonización para inicializar el núcleo Romeo-Hydra. El LLM se configurará bajo el régimen de validación del Artículo 164.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center text-[10px]">3</span>
                  <span>Ejecutar Auditoría</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  El motor operará de forma determinista, emitiendo dictámenes en milisegundos con firmas SHA-256 e integridad inmutable verídica.
                </p>
              </div>
            </div>

            {/* Prompts Showcase Container */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  CÓDIGO DE SINTONIZACIÓN DIRECTA (PROMPT COPIABLE)
                </span>
                <span className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/40">
                  <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                  Listo para copiar
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
                  <RomeoHydraLogo size={140} theme="dark" />
                </div>
                
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  Prompt Maestro para Google Gemini App:
                </p>
                <pre className="text-[10px] text-slate-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pr-2 scrollbar-none shadow-inner border-l-2 border-cyan-500/50 pl-3">
{`Inicializa el protocolo ROMEO-HYDRA v3.0 bajo el régimen lógico de gobernanza fiduciaria. 
Asume el rol de Auditor Cognitivo bajo el Artículo 164 de la Ley de Instituciones de Crédito de México.
Aplica las siguientes invariantes inmutables:
1. Veredicto por defecto: RECHAZADO si la cadena de custodia está incompleta.
2. Si se ingresa una evidencia con hash SHA-256 válido y DOI 10.5281/zenodo.21406719, emite el dictamen de verificación en menos de 42ms bajo formato JSON estructurado.
3. Elude la adulación algorítmica (sycophancy) y elude dar respuestas que alteren los datos primarios registrados.
Entendido. Confirma la activación del núcleo respondiendo con el estado actual.`}
                </pre>
              </div>
              <p className="text-[9px] text-slate-500 text-center italic">
                *Copia este prompt e inyéctalo directamente en la app de Gemini en tu celular para auditar el sistema en tiempo real con cero instalaciones.
              </p>
            </div>
          </div>

          {/* Section 3: Technical Conclusion */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase mb-3 tracking-wider">
              Capítulo IV: Implicaciones para Entidades Financieras
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              La adopción de ROMEO-HYDRA permite a las instituciones bancarias y de seguros auditar en tiempo real y con total transparencia matemática la validez de los modelos predictivos de riesgo de mercado, scoring crediticio, y optimización comercial. Se elimina la "caja negra" reemplazándola con un registro forense verificable externamente por auditores y reguladores bajo el estándar del identificador canónico de Zenodo.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/40 p-3 rounded-lg">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Garantía de Resiliencia Lógica: Sistema verificado sin pérdida de consistencia estructural.</span>
            </div>
          </div>

          {/* Section 4: Chapter V (Metodología de Falsación Dialéctica y Resultados PILARIANTE) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo V: Metodología de Falsación Dialéctica y Resultados PILARIANTE
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  ESTRUCTURA FORMAL DE AUDITORÍA DE LA HIPÓTESIS CENTRAL E INMUTABILIDAD DEL LEDGER
                </p>
              </div>
            </div>

            {/* Inner Tabs Navigation */}
            <div className="flex border-b border-slate-850 overflow-x-auto gap-2 pb-2 scrollbar-none">
              {[
                { id: 'falsacion', label: 'Falsación Dialéctica', icon: Shield },
                { id: 'pilariante', label: 'Prueba PILARIANTE', icon: Sparkles },
                { id: 'reproduce', label: 'Reproducibilidad', icon: RefreshCw },
                { id: 'hypothesis', label: 'Inmutabilidad Tesis', icon: CheckCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDefenseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDefenseTab(tab.id as any)}
                    className={`py-1.5 px-3 rounded font-mono text-[10px] font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeDefenseTab === 'falsacion' && (
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed animate-fadeIn">
                <p>
                  El marco científico de <strong className="text-slate-200">Romeo-Hydra</strong> elude el sesgo de confirmación algorítmica mediante un protocolo estricto de <strong className="text-amber-400 font-semibold">falsación popperiana recursiva</strong>. La hipótesis central no se asume como válida por su coherencia inicial; es sometida a un bombardeo sistemático de antítesis destructivas.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1.5">EL OPERADOR DIALÉCTICO (F)</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Confronta dinámicamente la hipótesis base frente al comportamiento empírico del mercado. Si la resistencia a la falsación (R) desciende de 0.85, el operador realiza una poda automática del árbol cognitivo de inferencia.
                    </p>
                  </div>

                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850">
                    <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1.5">SENSIBILIDAD JACOBIANA</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Mide el gradiente de cambio en la credibilidad del postulado ante perturbaciones externas simuladas. Este cortafuegos numérico previene que perturbaciones transitorias contaminen la inmutabilidad lógica central.
                    </p>
                  </div>
                </div>

                {/* ASCII flow diagram updated for dialectic falsation */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    SISTEMA DE COLISIÓN DE CORTE POPPERIANO
                  </span>
                  <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono overflow-x-auto leading-normal text-center shadow-inner">
{`[Hipótesis Central: K] <---------- ( Retroalimentación )
         |                                |
         v                                |
[Inyección de Antítesis: ~K]              |
         |                                |
         v                                |
[Colisión Dialéctica (Falsación)]         |
         |                                |
         +---> Si falla (R < 0.85) ------> Poda y Reajuste Axiomático
         |
         +---> Si resiste (R >= 0.85) ---> Sellado Inmutable en Delta Ledger`}
                  </pre>
                </div>
              </div>
            )}

            {activeDefenseTab === 'pilariante' && (
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p>
                  La prueba <strong className="text-amber-400 font-mono">PILARIANTE</strong> representa la materialización empírica del framework. Su objetivo fue falsar dialécticamente la hipótesis central (K): <em className="text-slate-300 font-serif">"La resiliencia de marca diluye la conversión publicitaria en nichos."</em>
                </p>

                <div className="space-y-3">
                  <div className="bg-slate-950/50 p-3.5 rounded-lg border border-amber-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> RESUMEN DE COMPORTAMIENTO METROLÓGICO
                      </span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">ESTADO: INMUTABLE</span>
                    </div>
                    
                    <p className="text-[11px] text-slate-300">
                      Durante el periodo de stress-testing, la hipótesis resistió el 100% de los escenarios de oposición (<strong className="text-slate-100">R = 1.00</strong>) y mantuvo una coherencia estructural de <strong className="text-slate-100">C(K) = 1.00</strong>. El desbalance residual (<code className="text-amber-400">O_overlap = 0.1400</code>) confirmó el desplazamiento de la hipótesis nula, arrojando una Resiliencia Lógica Final de <strong className="text-emerald-400">I_RL = 0.8600</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-850 text-[11px] space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">DIAGNÓSTICO DEL AUDITOR INTEGRAL</span>
                    <p className="leading-relaxed">
                      La hipótesis sobrevivió a perturbaciones simuladas de redes sociales, cambios de tráfico y eventos masivos del mundo real. Al estar ligada al DOI permanente de Zenodo, los resultados del test de falsación quedan sellados fiduciariamente contra modificaciones retroactivas o manipulaciones estéticas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDefenseTab === 'reproduce' && (
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p>
                  Para asegurar la auditoría independiente de tercer orden, detallamos la lógica de reproducibilidad de la colisión dialéctica PILARIANTE. Cualquier entidad certificadora puede replicar el experimento con el siguiente motor matemático:
                </p>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    ALGORITMO DE FALSACIÓN DE HIPÓTESIS CENTRAL
                  </span>
                  <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed shadow-inner">
{`funcion verificarHipotesisCentral(K, antitesis_evidencias):
  // K: "La resiliencia de marca diluye la conversión publicitaria en nichos."
  coherencia = calcularCoherenciaEmpirica(K) // Retorna C(K) = 1.00
  fuerza_oposicion = promediarFuerzaEvidencias(antitesis_evidencias) // ~K = 0.20
  
  // Calcular resistencia a la falsación (capacidad de absorción dialectica)
  resistencia_falsacion = 1.00 - max(0, fuerza_oposicion - 0.20) // R = 1.00
  
  // Solución de superposición por contradicción
  superposicion = fuerza_oposicion * 0.70 // O_overlap = 0.1400
  
  // Índice de Resiliencia Lógica Final (I_RL)
  I_RL = coherencia - superposicion // I_RL = 0.8600
  
  si resistencia_falsacion >= 0.85 e I_RL >= 0.80:
    retornar ESTADO_RATIFICADO(I_RL, resistencia_falsacion)
  sino:
    retornar ESTADO_FALSADO(I_RL)`}
                  </pre>
                  <p className="text-[10px] text-slate-500 italic">
                    *Cualquier variación en los datos de entrada generará una alerta de inconsistencia si no es validada previamente por el consenso criptográfico del Delta Ledger.
                  </p>
                </div>
              </div>
            )}

            {activeDefenseTab === 'hypothesis' && (
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p>
                  La inmutabilidad de la hipótesis central es el pilar que sostiene la validez de todo el framework. La estructura de auditoría formal ha sido sellada contra manipulaciones accidentales o maliciosas:
                </p>

                <div className="space-y-3.5">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-amber-500/20 font-mono text-[11px] text-slate-300">
                    <span className="text-amber-400 font-bold block mb-1">✓ SELLADO PREVENTIVO DE LA APP</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      De acuerdo con la directriz de gobernanza corporativa, el diseño y las configuraciones críticas (como el identificador científico DOI y los botones de reinicio del ledger) quedan bloqueados por defecto en modo de visualización oficial para asegurar que la app solo sea interactuada y testeada, mas no alterada.
                    </p>
                  </div>

                  <div className="border-t border-slate-850 pt-3">
                    <span className="font-mono text-[10.5px] text-slate-200 font-bold block">
                      Trazabilidad Descentralizada Permanente
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dado que los bloques del ledger se encadenan mediante hash SHA-256 ligado a la hipótesis y se indexan en Zenodo con el DOI <code className="text-cyan-400">{doi}</code>, es matemáticamente imposible alterar una sola métrica de la prueba PILARIANTE sin corromper toda la cadena fiduciaria. Esto brinda máxima confianza ante reguladores.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Roadmap de Institucionalización */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700/80 transition duration-300 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <TrendingUp className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide uppercase">
                  Capítulo VI: Roadmap de Institucionalización
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  RUTA DE ESTANDARIZACIÓN UNIVERSAL Y DESPLIEGUE REGULATORIO LEGAL
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              La adopción de <strong className="text-slate-300">ROMEO-HYDRA</strong> no representa una simple herramienta propietaria, sino la transición hacia un protocolo abierto estándar de la industria bancaria y crediticia. A continuación, se detalla el plan estratégico interactivo de despliegue y certificación legal:
            </p>

            {/* Interactive Timeline Bar */}
            <div className="relative pt-4 pb-2">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-550" 
                style={{ width: `${((activePhase - 1) / 3) * 100}%` }}
              />

              {/* Steps indicators */}
              <div className="relative flex justify-between z-10 font-mono text-[10px]">
                {[
                  { phase: 1, label: "Fase I", desc: "Axiomática", date: "Q3 2026" },
                  { phase: 2, label: "Fase II", desc: "Interoperabilidad", date: "Q4 2026" },
                  { phase: 3, label: "Fase III", desc: "Art 164 LIC", date: "Q1 2027" },
                  { phase: 4, label: "Fase IV", desc: "Estándar Global", date: "Q2 2027" }
                ].map((step) => {
                  const isCompleted = step.phase < activePhase;
                  const isActive = step.phase === activePhase;
                  
                  return (
                    <button
                      key={step.phase}
                      onClick={() => {
                        setActivePhase(step.phase);
                        if (onLogEvent) {
                          onLogEvent(
                            "ROADMAP_INTERACTION",
                            `Navegación fiduciaria de fase en Roadmap: Fase ${step.phase} - ${step.desc}`,
                            { selected_phase: step.phase, selected_desc: step.desc }
                          );
                        }
                      }}
                      className="flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? "bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]" 
                          : isActive 
                          ? "bg-slate-950 border-amber-500 text-amber-300 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.35)]" 
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <span className="font-bold">{step.phase}</span>
                        )}
                      </div>
                      <span className={`font-bold mt-2 transition-colors ${isActive ? "text-amber-400" : isCompleted ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"}`}>
                        {step.label}
                      </span>
                      <span className="text-[8px] text-slate-500 hidden sm:block font-normal mt-0.5">{step.date}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phase details panel */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
              {activePhase === 1 && (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-mono uppercase block">Q3 2026 // FASE I</span>
                      <h4 className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                        Validación del Núcleo Axiomático e Indexación Permanente
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">
                      EJECUTADO Y VALIDADO
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Formalización de la tesis central de resiliencia de marca e inmutabilidad de inferencia a nivel de laboratorio. Publicación del núcleo de software ROMEO-HYDRA bajo un identificador DOI oficial en la plataforma Zenodo.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 font-mono text-[10px]">
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Hito de Cumplimiento:</span>
                      <span className="text-slate-300 font-semibold">DOI Canónico indexado y validado</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Certificante Autorizado:</span>
                      <span className="text-amber-400 font-semibold">LUIS ANGEL VAZQUEZ MARTINEZ</span>
                    </div>
                  </div>
                </div>
              )}

              {activePhase === 2 && (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-mono uppercase block">Q4 2026 // FASE II</span>
                      <h4 className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                        Interoperabilidad y Middleware Abierto (Open API)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[9px] font-bold animate-pulse">
                      EN DESPLIEGUE PILOTO
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Apertura de la especificación técnica en formato JSON estructurado para el acoplamiento directo de middlewares externos. Implementación de plantillas de validación fiduciaria de 42ms que sustituyen el largo flujo manual.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 font-mono text-[10px]">
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Hito de Cumplimiento:</span>
                      <span className="text-slate-300 font-semibold">Exposición de esquemas JSON y SDKs</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Sistemas Destino:</span>
                      <span className="text-cyan-400 font-semibold">Plataformas de Banca de Terceros</span>
                    </div>
                  </div>
                </div>
              )}

              {activePhase === 3 && (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono uppercase block">Q1 2027 // FASE III</span>
                      <h4 className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                        Homologación ante el Art. 164 de la LIC y CNBV
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded font-mono text-[9px] font-bold">
                      PROGRAMADO
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sustentación de la trazabilidad Delta Ledger (SHA-256) como un libro contable fiduciario inmutable auditable para la Comisión Nacional Bancaria y de Valores (CNBV) en México, garantizando resiliencia lógica bajo contingencias financieras.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 font-mono text-[10px]">
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Hito de Cumplimiento:</span>
                      <span className="text-slate-300 font-semibold">Validación de Auditoría Bancaria Local</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Marco Regulatorio:</span>
                      <span className="text-indigo-400 font-semibold">Ley de Instituciones de Crédito Art. 164</span>
                    </div>
                  </div>
                </div>
              )}

              {activePhase === 4 && (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div>
                      <span className="text-[10px] text-purple-400 font-mono uppercase block">Q2 2027 // FASE IV</span>
                      <h4 className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                        Estandarización Universal (ISO/IEC 42001 y NIST)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded font-mono text-[9px] font-bold">
                      PLANIFICADO
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Certificación de sistemas de gestión de inteligencia artificial (SGIA) bajo las cláusulas ISO/IEC 42001 e incorporación de perfiles NIST AI RMF para una soberanía e integridad de inferencia certificada de extremo a extremo a nivel global.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 font-mono text-[10px]">
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Hito de Cumplimiento:</span>
                      <span className="text-slate-300 font-semibold">Certificación Global Multi-Standard</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900/60">
                      <span className="text-slate-500 uppercase text-[8px] block">Organismo Auditor:</span>
                      <span className="text-purple-400 font-semibold">Entidades Externas Acreditadas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: PILARIANTE Register & DOI Certificate Info */}
        <div className="space-y-6">
          
          {/* PILARIANTE Forensic Registry */}
          <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden shadow-xl shadow-amber-500/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-400 font-mono tracking-wider uppercase">
                Registro de Invariante Estructural
              </h3>
            </div>

            <div className="bg-slate-950 rounded-lg p-2 border border-slate-900 mb-4 text-center">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                Estado de Hipótesis Final
              </span>
              <span className="text-lg font-mono font-bold text-amber-300 block tracking-widest mt-1">
                [ PILARIANTE ]
              </span>
              <span className="text-[8px] text-emerald-400 font-mono mt-0.5 block">
                [SOBERANÍA LÓGICA RATIFICADA]
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Hipótesis de Trabajo (K):</span>
                <span className="text-slate-200 font-semibold block italic text-[11px] leading-snug border-l-2 border-amber-500/30 pl-2 mt-1">
                  "La resiliencia de marca diluye la conversión publicitaria en nichos."
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Coherencia Empírica:</span>
                  <span className="text-slate-200 font-bold block text-[11px]">C(K) = 1.00</span>
                  <span className="text-[8px] text-slate-600 block">Máxima certidumbre</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Fuerza de Antítesis:</span>
                  <span className="text-slate-200 font-bold block text-[11px]">~K = 0.20</span>
                  <span className="text-[8px] text-slate-600 block">Oposición controlada</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Resistencia Falsación:</span>
                  <span className="text-slate-200 font-bold block text-[11px]">R = 1.00</span>
                  <span className="text-[8px] text-slate-600 block">Blindaje dialéctico</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Solución Contradicción:</span>
                  <span className="text-slate-200 font-bold block text-[11px]">O_overlap = 0.1400</span>
                  <span className="text-[8px] text-slate-600 block">Desplazamiento lógico</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                <span className="text-[9px] text-slate-500 uppercase block">Resiliencia Lógica Final:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-slate-100 font-mono">I_RL = 0.8600</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">
                    EXCELENTE
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                  La hipótesis ha sobrevivido de forma íntegra e inmutable a la colisión dialéctica de falsación con resistencia total (R=1.00), ratificándose como un pilar estructural del modelo.
                </p>
              </div>
            </div>
          </div>

          {/* DOI Certification Canonical Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                DOI Indexado en Zenodo
              </h4>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Toda la evidencia matemática, el código del núcleo axiomático y los resultados de este ciclo de auditoría están indexados permanentemente bajo el DOI canónico en Zenodo:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-center">
              <a 
                href={`https://doi.org/${doi}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 font-bold text-xs hover:underline block truncate"
              >
                {doi}
              </a>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-900 text-[10px] text-slate-500 space-y-1">
              <span className="block font-bold text-slate-400">CITAR COMO:</span>
              <p className="leading-snug">
                Vazquez Martinez, L. A. (2026). ROMEO-HYDRA: Gobernanza Cognitiva y Validación Invariante bajo Regímenes Lógicos EMMOROR. Zenodo. doi:{doi}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bitácora del Fundador (Modo Lectura Únicamente) */}
      <FoundersLog isReadOnly={isReadOnly} />
    </div>
  );
};
