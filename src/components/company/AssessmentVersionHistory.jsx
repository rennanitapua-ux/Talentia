import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, FileText } from 'lucide-react';

// Mostra o histórico de versões anteriores da simulação da vaga.
// Cada versão preserva as perguntas que candidatos já responderam.
export default function AssessmentVersionHistory({ versions = [], currentCount }) {
  const [expanded, setExpanded] = useState(null);

  if (!versions || versions.length === 0) return null;

  return (
    <div className="bg-card/60 border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <History className="w-4 h-4 text-brand-violet" />
        <h3 className="text-sm font-semibold text-foreground">Histórico de versões</h3>
        <span className="text-xs font-mono text-muted-foreground/60 ml-auto">{versions.length} versão{versions.length > 1 ? 'ões' : ''} anterior{versions.length > 1 ? 'es' : ''}</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-4">Versões preservadas das perguntas — candidatos que responderam a uma versão anterior continuam vinculados a ela.</p>

      <div className="space-y-2">
        {[...versions].reverse().map((v, i) => {
          const realIdx = versions.length - 1 - i;
          const isExpanded = expanded === realIdx;
          const date = v.saved_at ? new Date(v.saved_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
          return (
            <div key={realIdx} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : realIdx)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-violet/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-brand-violet" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">v{realIdx + 1} · {v.situations_count || (v.assessment?.situations?.length) || 0} situações</div>
                  <div className="text-[11px] text-muted-foreground/70 font-mono">{date} · {v.source || '—'}{v.note ? ` · ${v.note}` : ''}</div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/60" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/60" />}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                      {(v.assessment?.situations || []).map((s, si) => (
                        <div key={s.id || si} className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
                          <div className="text-xs font-medium text-foreground/90 mb-1">{si + 1}. {s.title || `Situação ${si + 1}`}</div>
                          <div className="text-[11px] text-muted-foreground/80 line-clamp-2">{s.context || s.question}</div>
                          <div className="text-[10px] text-muted-foreground/50 mt-1">{(s.options || []).length} alternativas</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}