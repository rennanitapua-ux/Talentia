import React from 'react';
import { DISC_QUESTIONS, DISC_PROFILES } from '@/lib/discTest';

export default function DiscAnswersList({ answers }) {
  const rows = (answers || []).map((a, i) => {
    const q = DISC_QUESTIONS.find((x) => x.id === a.questionId);
    const opt = q?.options.find((o) => o.letter === a.letter);
    return { i, question: q?.question || `Pergunta ${i + 1}`, text: opt?.text || '—', letter: a.letter };
  });
  if (!rows.length) return null;

  return (
    <section>
      <div className="text-sm font-semibold mb-1">Respostas do teste ({rows.length})</div>
      <p className="text-xs text-muted-foreground mb-3">As alternativas foram embaralhadas para o candidato — a letra exibida nunca indicava o perfil.</p>
      <div className="divide-y divide-border rounded-xl border border-border">
        {rows.map((r) => {
          const p = DISC_PROFILES[r.letter];
          return (
            <div key={r.i} className="p-4 flex items-start gap-3">
              <span className="text-xs font-mono text-muted-foreground mt-0.5 w-6">{String(r.i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">{r.question}</div>
                <div className="text-sm text-foreground mt-1">“{r.text}”</div>
              </div>
              {p && (
                <span className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: p.color, background: `${p.color}1f` }}>
                  {p.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}