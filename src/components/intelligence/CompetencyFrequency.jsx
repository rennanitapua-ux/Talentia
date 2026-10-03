import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getScoreColor } from '@/lib/skillScoring';

function Bar({ name, count, avg, demonstrated, strong, evaluated, required }) {
  const pct = evaluated ? Math.round((count / evaluated) * 100) : 0;
  return (
    <div className="py-2.5 border-b border-border/60 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{name}</span>
          {required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">exigida</span>}
        </div>
        <span className="text-xs font-mono text-muted-foreground">{count}/{evaluated} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: avg != null ? getScoreColor(avg) : 'hsl(217 91% 60%)' }} />
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground/70">
        <span>demonstraram: {demonstrated} · evidência forte: {strong}</span>
        {avg != null && <span>score médio: {avg}/100</span>}
      </div>
    </div>
  );
}

export default function CompetencyFrequency({ metrics }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Competências mais encontradas</h3>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mb-3">Amostra: {metrics.evaluated.length} candidatos avaliados</p>
        {metrics.mostFound.length === 0 ? <Empty /> : metrics.mostFound.map((c) => <Bar key={c.name} {...c} evaluated={metrics.evaluated.length} />)}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-foreground">Competências menos encontradas</h3>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mb-3">Requisitos das vagas com menor evidência na base</p>
        {metrics.leastFound.length === 0 ? <Empty /> : metrics.leastFound.map((c) => <Bar key={c.name} {...c} evaluated={metrics.evaluated.length} />)}
      </div>
    </motion.div>
  );
}

function Empty() {
  return <div className="text-sm text-muted-foreground/60 py-6 text-center">Sem dados suficientes para esta análise.</div>;
}