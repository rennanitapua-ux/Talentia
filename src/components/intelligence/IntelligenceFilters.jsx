import React from 'react';
import { Filter } from 'lucide-react';

export default function IntelligenceFilters({ filters, setFilters, jobs }) {
  const update = (k, v) => setFilters({ ...filters, [k]: v });
  const selectCls = 'h-9 rounded-lg bg-card border border-border text-xs px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary';
  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-6">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Filter className="w-3.5 h-3.5" /> Filtros
      </div>
      <select value={filters.jobId || 'all'} onChange={(e) => update('jobId', e.target.value)} className={selectCls}>
        <option value="all">Todas as vagas</option>
        {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
      </select>
      <select value={filters.period || 'all'} onChange={(e) => update('period', e.target.value)} className={selectCls}>
        <option value="all">Todo o período</option>
        <option value="30">Últimos 30 dias</option>
        <option value="90">Últimos 90 dias</option>
        <option value="180">Últimos 6 meses</option>
        <option value="365">Último ano</option>
      </select>
      <select value={filters.status || 'all'} onChange={(e) => update('status', e.target.value)} className={selectCls}>
        <option value="all">Todos os candidatos</option>
        <option value="evaluated">Avaliados</option>
        <option value="not_evaluated">Não avaliados</option>
        <option value="advanced">Avançaram</option>
        <option value="not_advanced">Não avançaram</option>
        <option value="final_stages">Etapas finais</option>
      </select>
      {(filters.jobId !== 'all' || filters.period !== 'all' || filters.status !== 'all') && (
        <button onClick={() => setFilters({ jobId: 'all', period: 'all', status: 'all' })} className="text-xs text-primary hover:underline px-2">Limpar</button>
      )}
    </div>
  );
}