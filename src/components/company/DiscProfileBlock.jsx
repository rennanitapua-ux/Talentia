import React from 'react';
import { DISC_PROFILES } from '@/lib/discTest';

function List({ title, items, tone }) {
  return (
    <div>
      <div className={`text-xs font-semibold mb-2 ${tone}`}>{title}</div>
      <ul className="space-y-1">
        {items.map((it) => <li key={it} className="text-sm text-foreground/80">• {it}</li>)}
      </ul>
    </div>
  );
}

export default function DiscProfileBlock({ letter, label, compact = false }) {
  const p = DISC_PROFILES[letter];
  if (!p) return null;
  return (
    <section className="rounded-xl border border-border p-5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-semibold">{p.name}</span>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color: p.color, background: `${p.color}1f` }}>{letter}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.traits.map((t) => <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-xs">{t}</span>)}
      </div>
      {!compact && (
        <div className="grid sm:grid-cols-2 gap-5 mb-4">
          <List title="Pontos fortes" items={p.strengths} tone="text-emerald-400" />
          <List title="Pontos de atenção" items={p.weaknesses} tone="text-amber-400" />
        </div>
      )}
      <dl className="space-y-3">
        {[['Estilo de trabalho', p.work_style], ['Comunicação', p.communication], ['Ambiente em que rende mais', p.ideal_environment]].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-foreground mb-0.5">{k}</dt>
            <dd className="text-sm text-foreground/85 leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}