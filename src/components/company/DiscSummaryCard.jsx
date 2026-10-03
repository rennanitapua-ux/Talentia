import React, { useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import { DISC_PROFILES } from '@/lib/discTest';
import DiscDetailDialog from '@/components/company/DiscDetailDialog';

export default function DiscSummaryCard({ sim }) {
  const [open, setOpen] = useState(false);
  const r = sim.disc_results;

  if (!r?.scores) {
    return (
      <section className="rounded-2xl surface p-6">
        <div className="flex items-center gap-2 mb-3"><Brain className="w-4 h-4 text-primary" /><span className="text-xs font-semibold uppercase tracking-wider text-primary">Perfil DISC</span></div>
        <p className="text-sm text-muted-foreground">O teste DISC não foi registrado nesta avaliação.</p>
      </section>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="group w-full text-left rounded-2xl surface p-6 hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Perfil DISC</span>
          <span className="ml-auto text-xs text-muted-foreground group-hover:text-foreground flex items-center gap-1">Ver resultado completo <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-display text-3xl font-bold">{r.profile_code}</span>
          <span className="text-sm text-muted-foreground">{DISC_PROFILES[r.dominant]?.name} · {DISC_PROFILES[r.secondary]?.name}</span>
        </div>
        <div className="space-y-2.5">
          {['D', 'I', 'S', 'C'].map((k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground">{DISC_PROFILES[k].name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.scores[k]}%`, background: DISC_PROFILES[k].color }} />
              </div>
              <span className="w-10 text-right text-xs font-mono">{r.scores[k]}%</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">{(sim.disc_answers || []).length} respostas registradas · clique para ver cada resposta e a interpretação</p>
      </button>
      <DiscDetailDialog open={open} onOpenChange={setOpen} sim={sim} />
    </>
  );
}