import React from 'react';
import { ShieldCheck, ShieldAlert, Bot } from 'lucide-react';

const ROWS = [
  ['tab_switches', 'Saídas da aba'],
  ['focus_losses', 'Perdas de foco da janela'],
  ['fullscreen_exits', 'Saídas da tela cheia'],
  ['paste_attempts', 'Tentativas de colar'],
];

export default function IntegrityCard({ sim }) {
  const i = sim.integrity || {};
  const flags = sim.ai_flags || [];
  const total = sim.integrity ? ROWS.reduce((s, [k]) => s + (i[k] || 0), 0) : sim.focus_violations || 0;
  const clean = total === 0 && flags.length === 0;
  const Icon = clean ? ShieldCheck : ShieldAlert;

  return (
    <section className="rounded-2xl surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${clean ? 'text-emerald-400' : 'text-rose-400'}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${clean ? 'text-emerald-400' : 'text-rose-400'}`}>Integridade</span>
        <span className="ml-auto text-xs text-muted-foreground">{clean ? 'Sem ocorrências' : `${total + flags.length} ocorrência(s)`}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {ROWS.map(([k, label]) => (
          <div key={k} className="rounded-lg bg-muted/40 border border-border px-3 py-2.5">
            <div className={`font-mono text-lg font-semibold ${(i[k] || 0) > 0 ? 'text-rose-400' : 'text-foreground'}`}>{sim.integrity ? i[k] || 0 : '—'}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm font-medium mb-2"><Bot className="w-4 h-4 text-brand-violet" /> Suspeita de uso de IA</div>
        {flags.length === 0 ? (
          <p className="text-xs text-emerald-400">Nenhuma justificativa com padrão de IA.</p>
        ) : (
          <ul className="space-y-2">
            {flags.map((f, idx) => (
              <li key={idx} className="text-xs">
                <span className="text-rose-400 font-medium">{f.situation_title || `Situação ${(f.situation_index ?? f.phase_index ?? 0) + 1}`} — {f.confidence}%</span>
                {f.analysis && <span className="text-muted-foreground"> · {f.analysis}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}