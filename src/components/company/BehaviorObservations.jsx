import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Info, Clock, Type } from 'lucide-react';

const SEVERITY = {
  ok: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Info },
  warn: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
};

const fmtTime = (s) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m${r ? ` ${r}s` : ''}`;
};

export default function BehaviorObservations({ sim }) {
  const obs = sim.behavioral_observations;
  if (!obs) return null;

  const items = obs.observations || [];
  const hasWarn = items.some((i) => i.severity === 'warn');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Activity className={`w-4 h-4 ${hasWarn ? 'text-amber-400' : 'text-primary'}`} />
        <span className="text-sm font-semibold text-foreground">Observações de comportamento</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-4">Como o candidato se comportou durante a simulação — ritmo, reflexão e sinais de atalho.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Metric icon={Clock} label="Tempo médio" value={fmtTime(obs.avg_time_per_question || 0)} />
        <Metric icon={Clock} label="Mais lenta" value={fmtTime(obs.max_time || 0)} />
        <Metric icon={Type} label="Caracteres médio" value={obs.avg_chars || 0} />
        <Metric icon={Activity} label="Variação de ritmo" value={fmtTime(obs.time_variance || 0)} />
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const s = SEVERITY[item.severity] || SEVERITY.info;
          const Icon = s.icon;
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${s.bg}`}>
              <Icon className={`w-4 h-4 ${s.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${s.color}`}>{item.label}</div>
                <div className="text-xs text-muted-foreground/80 mt-0.5">{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-muted/40 border border-border rounded-xl p-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/70 mb-1.5" />
      <div className="text-base font-bold font-mono text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground/70">{label}</div>
    </div>
  );
}