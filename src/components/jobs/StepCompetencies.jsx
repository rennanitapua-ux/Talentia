import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { COMPETENCY_LIBRARY } from '@/lib/jobOptions';

export default function StepCompetencies({ form, update }) {
  const [custom, setCustom] = useState('');
  const selected = form.competencies;
  const toggle = (c) => update('competencies', selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) update('competencies', [...selected, v]);
    setCustom('');
  };
  const all = [...COMPETENCY_LIBRARY, ...selected.filter((c) => !COMPETENCY_LIBRARY.includes(c))];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Escolha de 2 a 6 competências. Cada situação da simulação vai medir uma ou duas delas.</p>
      <div className="flex flex-wrap gap-2">
        {all.map((c) => {
          const on = selected.includes(c);
          return (
            <button key={c} type="button" onClick={() => toggle(c)}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-sm transition-colors ${on ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}>
              {on && <Check className="w-3.5 h-3.5 text-primary" />}
              {c}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 max-w-md">
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Adicionar competência própria" className="h-10 bg-background/60" />
        <button type="button" onClick={addCustom} className="h-10 px-3 rounded-md border border-border text-sm text-foreground hover:bg-muted flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>
      <div className="text-xs text-muted-foreground">{selected.length} selecionada(s)</div>
    </div>
  );
}