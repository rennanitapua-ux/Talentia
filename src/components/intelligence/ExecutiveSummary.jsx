import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Gauge, Award, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

function Tile({ icon: Icon, label, value, hint, tone }) {
  const toneCls = tone === 'violet' ? 'text-brand-violet' : tone === 'emerald' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-400' : 'text-primary';
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${toneCls}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
      {hint && <div className="text-xs text-muted-foreground/70 mt-1">{hint}</div>}
    </div>
  );
}

export default function ExecutiveSummary({ metrics, report }) {
  const exec = report?.resumo_executivo || {};
  const adherencePct = metrics.evaluated.length ? metrics.quality.sufficientAdherencePct : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Tile icon={Users} label="Candidaturas" value={metrics.total} hint={`${metrics.jobsCount} vagas`} />
        <Tile icon={Briefcase} label="Vagas abertas" value={metrics.publishedJobs} hint={`${metrics.jobsCount} no total`} tone="violet" />
        <Tile icon={Gauge} label="Média por vaga" value={metrics.total ? metrics.avgPerJob.toFixed(1) : '—'} />
        <Tile icon={Users} label="Avaliados" value={metrics.evaluated.length} hint={`${metrics.notEvaluated} não avaliados`} tone="emerald" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Tile icon={CheckCircle2} label="Dados suficientes" value={metrics.withScores} tone="emerald" />
        <Tile icon={Gauge} label="Aderência p/ avançar" value={`${adherencePct}%`} hint="sobre avaliados" />
        <Tile icon={Award} label="Principal força" value={<span className="text-sm font-semibold leading-tight block">{exec.principal_forca || '—'}</span>} tone="emerald" />
        <Tile icon={AlertTriangle} label="Principal gap" value={<span className="text-sm font-semibold leading-tight block">{exec.principal_gap || '—'}</span>} tone="amber" />
      </div>
      {exec.principal_insight && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-violet flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Principal insight</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{exec.principal_insight}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}