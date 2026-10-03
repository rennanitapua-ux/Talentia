import React from 'react';
import { motion } from 'framer-motion';

function Row({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
      <div>
        <div className="text-sm text-foreground/85">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/70">{sub}</div>}
      </div>
      <div className="text-lg font-bold font-mono text-primary">{value}</div>
    </div>
  );
}

export default function AggregateStats({ metrics }) {
  const m = metrics;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-1">Visão geral das candidaturas</h3>
        <p className="text-[11px] text-muted-foreground/70 mb-3">Amostra: {m.total} candidaturas · {m.jobsCount} vagas</p>
        <Row label="Total de candidatos" value={m.total} />
        <Row label="Média por vaga" value={m.total ? m.avgPerJob.toFixed(1) : '—'} />
        <Row label="Média por processo seletivo" value={m.total ? m.avgPerProcess.toFixed(1) : '—'} sub={`${m.publishedJobs} publicadas`} />
        <Row label="Candidatos avaliados" value={m.evaluated.length} />
        <Row label="Candidatos não avaliados" value={m.notEvaluated} />
        <Row label="Concluíram as avaliações" value={m.evaluated.length} />
        <Row label="Dados insuficientes" value={m.insufficientData} />
        <Row label="Chegaram às etapas finais" value={m.finalStages} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-1">Qualidade das candidaturas</h3>
        <p className="text-[11px] text-muted-foreground/70 mb-3">Percentuais calculados sobre a amostra disponível</p>
        <Row label="Com currículo" value={`${m.quality.withResumePct}%`} sub={`${m.quality.withResume} de ${m.total}`} />
        <Row label="Avaliações concluídas" value={`${m.quality.completedPct}%`} sub={`${m.evaluated.length} de ${m.total}`} />
        <Row label="Evidências comportamentais suficientes" value={`${m.quality.sufficientAdherencePct}%`} sub={`sobre ${m.evaluated.length} avaliados`} />
        <Row label="Com respostas abertas" value={`${m.quality.openResponsesPct}%`} sub={`${m.quality.withOpenResponses} avaliados`} />
        <Row label="Precisam de validação" value={`${m.quality.needingValidationPct}%`} sub={`sobre ${m.evaluated.length} avaliados`} />
        <Row label="Aderência suficiente p/ avançar" value={`${m.quality.sufficientAdherencePct}%`} sub={`sobre ${m.evaluated.length} avaliados`} />
        <Row label="Sem dados suficientes" value={`${m.quality.insufficientDataPct}%`} sub={`sobre ${m.evaluated.length} avaliados`} />
      </div>
    </motion.div>
  );
}