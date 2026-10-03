import React from 'react';
import { QUALITY_META } from '@/lib/situations';

export default function ReplayOptions({ situation, response }) {
  const options = situation?.options || [];
  if (!options.length || !response.choice_id) {
    if (response.justification) return null;
    return (
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resposta</div>
        <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 border border-border rounded-xl p-4">{response.answer || '—'}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Alternativas</div>
      <div className="space-y-2">
        {options.map((o) => {
          const chosen = o.id === response.choice_id;
          const meta = QUALITY_META[o.quality];
          return (
            <div key={o.id} className={`flex items-start gap-3 p-3 rounded-xl border ${chosen ? 'border-primary/60 bg-primary/10' : 'border-border bg-muted/20 opacity-70'}`}>
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${chosen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{o.id.toUpperCase()}</span>
              <span className="flex-1 text-sm text-foreground/90 leading-relaxed">{o.text}</span>
              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded border text-[10px] ${meta?.cls || ''}`}>{chosen ? `Escolhida · ${meta?.label}` : meta?.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}