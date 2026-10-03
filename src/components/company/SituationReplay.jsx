import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Bot } from 'lucide-react';
import ResponseAnalysis from '@/components/ResponseAnalysis';
import ReplayOptions from '@/components/company/ReplayOptions';

const tone = (s) => (s >= 70 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-rose-400');
const fmt = (s) => `${Math.floor((s || 0) / 60)}m ${(s || 0) % 60}s`;

export default function SituationReplay({ responses, situations }) {
  const [active, setActive] = useState(0);
  if (!responses.length) return null;
  const r = responses[active];
  const situation = situations.find((s) => s.id === r.situation_id);
  const a = r.analysis || {};

  return (
    <section>
      <h3 className="font-display text-xl font-bold mb-5 flex items-center gap-2.5"><Play className="w-4 h-4 text-primary" /> Replay da simulação</h3>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {responses.map((x, i) => {
          const sc = x.analysis?.response_score;
          return (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-mono transition-colors ${active === i ? 'bg-primary text-primary-foreground font-semibold' : 'surface text-muted-foreground hover:text-foreground'}`}>
              S{String(i + 1).padStart(2, '0')}
              {sc != null && <span className={active === i ? '' : tone(sc)}>{sc}</span>}
              {x.analysis?.ai_detection?.is_ai_generated && <Bot className="w-3 h-3 text-rose-400" />}
            </button>
          );
        })}
      </div>

      <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl surface p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">{r.phase_title || `Situação ${active + 1}`}</span>
          {r.time_spent_seconds != null && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{fmt(r.time_spent_seconds)}</span>}
          <div className="ml-auto flex items-center gap-3 text-xs">
            {a.decision_score != null && <span className="text-muted-foreground">Decisão <b className={tone(a.decision_score)}>{a.decision_score}</b></span>}
            {a.justification_score != null && <span className="text-muted-foreground">Justificativa <b className={tone(a.justification_score)}>{a.justification_score}</b></span>}
            {a.response_score != null && <span className={`px-2 py-0.5 rounded-md bg-muted font-semibold ${tone(a.response_score)}`}>Nota {a.response_score}</span>}
          </div>
        </div>

        <div>
          {r.character_name && <div className="text-xs text-muted-foreground mb-1">{r.character_name} · {r.character_role}</div>}
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{r.question_prompt}</p>
        </div>

        <ReplayOptions situation={situation} response={r} />

        {r.justification && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Justificativa escrita</div>
            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 border border-border rounded-xl p-4">{r.justification}</p>
          </div>
        )}

        {a.behavior_signals?.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Comportamento observado</div>
            <div className="space-y-1.5">
              {a.behavior_signals.map((b, i) => (
                <div key={i} className="text-sm"><span className="px-2 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan text-xs font-medium mr-2">{b.trait}</span><span className="text-muted-foreground">{b.evidence}</span></div>
              ))}
            </div>
          </div>
        )}

        {r.analysis ? <ResponseAnalysis analysis={r.analysis} /> : <p className="text-xs text-muted-foreground">Análise pendente.</p>}
      </motion.div>
    </section>
  );
}