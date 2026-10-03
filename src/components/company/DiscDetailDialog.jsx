import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DISC_PROFILES } from '@/lib/discTest';
import DiscProfileBlock from '@/components/company/DiscProfileBlock';
import DiscInterpretation from '@/components/company/DiscInterpretation';
import DiscAnswersList from '@/components/company/DiscAnswersList';

const DIM_DESC = {
  D: 'Foco em resultado, decisão rápida e controle da situação.',
  I: 'Foco em pessoas, comunicação, entusiasmo e persuasão.',
  S: 'Foco em estabilidade, cooperação, paciência e ritmo constante.',
  C: 'Foco em precisão, regras, qualidade e análise.',
};

export default function DiscDetailDialog({ open, onOpenChange, sim }) {
  const r = sim.disc_results;
  if (!r?.scores) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-card border-border gap-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Perfil DISC · {r.profile_code}</DialogTitle>
          <DialogDescription>
            {sim.candidate_name} — ferramenta complementar de estilo comportamental. Não é diagnóstico nem critério único de contratação.
          </DialogDescription>
        </DialogHeader>

        <section className="grid sm:grid-cols-2 gap-3">
          {['D', 'I', 'S', 'C'].map((k) => (
            <div key={k} className={`rounded-xl border p-4 ${k === r.dominant ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{DISC_PROFILES[k].name} <span className="text-muted-foreground font-mono text-xs">({k})</span></span>
                <span className="font-mono text-sm font-semibold" style={{ color: DISC_PROFILES[k].color }}>{r.scores[k]}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${r.scores[k]}%`, background: DISC_PROFILES[k].color }} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{DIM_DESC[k]}</p>
            </div>
          ))}
        </section>

        <DiscProfileBlock letter={r.dominant} label="Perfil dominante" />
        {r.secondary && r.secondary !== r.dominant && <DiscProfileBlock letter={r.secondary} label="Perfil secundário" compact />}
        <DiscInterpretation data={sim.disc_interpretation} />
        <DiscAnswersList answers={sim.disc_answers} />
      </DialogContent>
    </Dialog>
  );
}