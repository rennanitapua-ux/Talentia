import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Gera um PDF do relatório do candidato capturando o conteúdo da página.
// O seletor padrão captura o <main> do CompanyCandidateDetail.
export default function ReportExporter({ candidateName, targetSelector = '.report-export-area', fileName }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const element = document.querySelector(targetSelector);
      if (!element) {
        window.print();
        return;
      }
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#06080f',
        useCORS: true,
        logging: false,
      });
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (candidateName || 'candidato').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(fileName || `TalentIA_${safeName}.pdf`);
    } catch {
      // Fallback para o print nativo
      window.print();
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
    >
      {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{exporting ? 'Gerando PDF…' : 'Exportar PDF'}</span>
    </button>
  );
}