import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function JobComparison({ metrics }) {
  if (!metrics.perJob.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4 text-brand-violet" />
        <h3 className="text-sm font-semibold text-foreground">Comparação entre vagas</h3>
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-4">Cada vaga é analisada separadamente — candidatos nunca são misturados entre vagas.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-semibold">Vaga</th>
              <th className="py-2 px-3 font-semibold text-right">Candidatos</th>
              <th className="py-2 px-3 font-semibold text-right">Avaliados</th>
              <th className="py-2 px-3 font-semibold text-right">Score médio</th>
              <th className="py-2 px-3 font-semibold">Maior aderência</th>
              <th className="py-2 px-3 font-semibold">Principal lacuna</th>
              <th className="py-2 pl-3 font-semibold text-right">Avançaram</th>
            </tr>
          </thead>
          <tbody>
            {metrics.perJob.map((p) => (
              <tr key={p.job.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4 font-medium text-foreground">{p.job.title}</td>
                <td className="py-3 px-3 text-right font-mono">{p.total}</td>
                <td className="py-3 px-3 text-right font-mono">{p.evaluated}</td>
                <td className="py-3 px-3 text-right font-mono text-primary">{p.avgScore || '—'}</td>
                <td className="py-3 px-3 text-muted-foreground">{p.topCompetency}</td>
                <td className="py-3 px-3 text-amber-400/90">{p.gapCompetency}</td>
                <td className="py-3 pl-3 text-right font-mono">{p.advanced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}