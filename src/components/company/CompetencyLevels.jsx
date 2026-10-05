import React from 'react';
import { Target } from 'lucide-react';

const STATUS = {
  meets: { label: 'Atende', color: 'hsl(160,60%,55%)', bg: 'hsl(160,60%,45%,0.12)' },
  supera: { label: 'Supera', color: 'hsl(160,60%,45%)', bg: 'hsl(160,60%,45%,0.15)' },
  close: { label: 'Próximo', color: 'hsl(30,80%,60%)', bg: 'hsl(30,80%,55%,0.12)' },
  below: { label: 'Abaixo', color: 'hsl(0,72%,60%)', bg: 'hsl(0,72%,51%,0.12)' },
  insufficient: { label: 'Sem dados', color: 'hsl(220,14%,60%)', bg: 'hsl(220,14%,20%,0.4)' },
  no_target: { label: 'Sem meta', color: 'hsl(220,14%,60%)', bg: 'hsl(220,14%,20%,0.4)' },
};

export default function CompetencyLevels({ sim }) {
  const levels = sim.demonstrated_levels;
  if (!levels || Object.keys(levels).length === 0) return null;

  const entries = Object.entries(levels);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Níveis: exigido vs. demonstrado</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-4">Cada competência tem um nível mínimo exigido pela vaga (0–10). Compare com o que o candidato demonstrou na simulação.</p>
      <div className="space-y-5">
        {entries.map(([name, info]) => {
          const st = STATUS[info.status] || STATUS.no_target;
          const req = info.required;
          const dem = info.demonstrated;
          const gap = info.gap;
          return (
            <div key={name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ color: st.color, background: st.bg }}>
                  {st.label}{gap !== null && gap < 0 ? ` (${gap})` : gap !== null && gap > 0 ? ` (+${gap})` : ''}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                {/* Demonstrated bar */}
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(dem ?? 0) * 10}%`, background: st.color }} />
                {/* Required marker */}
                {req !== null && (
                  <div className="absolute inset-y-0" style={{ left: `${req * 10}%`, width: '2px', background: 'hsl(220,14%,90%)' }} title={`Exigido: ${req}/10`} />
                )}
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs">
                <span className="text-muted-foreground">Demonstrado: <span className="font-mono font-semibold text-foreground">{dem !== null ? `${dem}/10` : '—'}</span></span>
                <span className="text-muted-foreground">Exigido: <span className="font-mono font-semibold text-foreground">{req !== null ? `${req}/10` : '—'}</span></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(220,14%,90%)' }} /> marca o nível exigido</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(160,60%,55%)' }} /> nível demonstrado</span>
      </div>
    </div>
  );
}