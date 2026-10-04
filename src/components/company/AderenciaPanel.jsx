import React from 'react';
import { motion } from 'framer-motion';
import { ADERENCIA, ADERENCIA_ORDER } from '@/lib/aderencia';

// Painel de Aderência à Vaga — mostra NÍVEL DEMONSTRADO vs. NÍVEL EXIGIDO por competência.
// Nunca apresenta o 0-10 como nota universal; sempre contextualizado à vaga.
export default function AderenciaPanel({ aderencia, competencies }) {
  if (!aderencia) return null;
  const { perCompetency, distribution, headline, counts, total } = aderencia;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl surface p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-foreground">Aderência à vaga</h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">nível demonstrado vs. exigido</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-5">{headline}</p>

        {/* Distribuição */}
        <div className="space-y-2.5">
          {ADERENCIA_ORDER.map((key) => {
            const cls = ADERENCIA[key.toUpperCase().replace('ATENDE', 'ATENDE').replace('SUPERA', 'SUPERA')];
            const entry = Object.values(ADERENCIA).find((a) => a.key === key);
            const count = distribution[key] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-28 text-xs text-foreground/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                  {entry.short}
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: entry.color }}
                  />
                </div>
                <div className="w-10 text-right text-xs font-mono text-muted-foreground">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Por competência */}
      <div className="rounded-2xl surface p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Competências vs. nível exigido</h3>
        <div className="space-y-3">
          {(competencies || []).map((name) => {
            const pc = perCompetency?.[name];
            if (!pc) return null;
            return (
              <div key={name} className="py-2.5 border-b border-border/60 last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{name}</span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: `${pc.class.color}20`, color: pc.class.color }}
                  >
                    {pc.class.short}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Exigido: <span className="font-mono text-foreground/80">{pc.required != null ? pc.required : '—'}</span>/10</span>
                  <span>Demonstrado: <span className="font-mono text-foreground/80">{pc.demonstrated != null ? pc.demonstrated : '—'}</span>/10</span>
                  {pc.gap != null && (
                    <span className={pc.gap >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pc.gap >= 0 ? '+' : ''}{pc.gap}
                    </span>
                  )}
                  {pc.score != null && <span className="ml-auto font-mono">score {pc.score}/100</span>}
                </div>
                <p className="text-[11px] text-muted-foreground/70 mt-1">{pc.class.description}</p>
              </div>
            );
          })}
          {(!competencies || competencies.length === 0) && (
            <p className="text-xs text-muted-foreground/60 py-4 text-center">Nenhuma competência definida para esta vaga.</p>
          )}
        </div>
      </div>
    </div>
  );
}