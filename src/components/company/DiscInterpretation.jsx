import React from 'react';
import { Sparkles } from 'lucide-react';

const LISTS = [
  ['motivators', 'O que motiva'],
  ['fears', 'O que tende a evitar'],
  ['how_to_manage', 'Como liderar essa pessoa'],
  ['interview_tips', 'O que explorar na entrevista'],
];

export default function DiscInterpretation({ data }) {
  if (!data) return null;
  return (
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <Sparkles className="w-3.5 h-3.5" /> Interpretação combinada com a simulação
      </div>
      {data.headline && <div className="text-base font-semibold">{data.headline}</div>}
      {data.description && <p className="text-sm text-foreground/85 leading-relaxed">{data.description}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {[['Sob pressão', data.under_pressure], ['Comunicação', data.communication], ['Aderência ao cargo', data.fit_with_role]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs text-muted-foreground mb-0.5">{k}</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {LISTS.filter(([k]) => data[k]?.length).map(([k, title]) => (
          <div key={k}>
            <div className="text-xs font-semibold text-foreground mb-1.5">{title}</div>
            <ul className="space-y-1">{data[k].map((it, i) => <li key={i} className="text-sm text-foreground/80">• {it}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}