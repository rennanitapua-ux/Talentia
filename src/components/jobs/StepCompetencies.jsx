import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { COMPETENCY_LIBRARY } from '@/lib/jobOptions';

const LEVEL_LABELS = ['—', 'Básico', 'Iniciante', 'Operacional', 'Sólido', 'Proficiente', 'Avançado', 'Especialista', 'Referência', 'Líder', 'Topo do mercado'];

export default function StepCompetencies({ form, update }) {
  const [custom, setCustom] = useState('');
  const selected = form.competencies;
  const requirements = form.competency_requirements || [];

  const toggle = (c) => {
    if (selected.includes(c)) {
      update('competencies', selected.filter((x) => x !== c));
      update('competency_requirements', requirements.filter((r) => r.name !== c));
    } else {
      update('competencies', [...selected, c]);
      update('competency_requirements', [...requirements, { name: c, required_level: 7 }]);
    }
  };
  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) {
      update('competencies', [...selected, v]);
      update('competency_requirements', [...requirements, { name: v, required_level: 7 }]);
    }
    setCustom('');
  };
  const setLevel = (name, level) => {
    update('competency_requirements', requirements.map((r) => (r.name === name ? { ...r, required_level: level } : r)));
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

      {selected.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-baseline justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Nível exigido por competência</h4>
            <span className="text-xs text-muted-foreground/70">0–10 · arraste para definir o mínimo aceitável</span>
          </div>
          <div className="space-y-4">
            {requirements.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{r.name}</span>
                  <span className="text-xs font-mono text-primary font-semibold">{r.required_level}/10 · {LEVEL_LABELS[r.required_level]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={0} max={10} step={1} value={r.required_level}
                    onChange={(e) => setLevel(r.name, parseInt(e.target.value))}
                    className="flex-1 accent-primary h-2"
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    {[0, 5, 7, 10].map((p) => (
                      <button key={p} type="button" onClick={() => setLevel(r.name, p)}
                        className={`px-2 h-7 rounded-md text-[11px] font-medium transition-colors ${r.required_level === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">{selected.length} selecionada(s)</div>
    </div>
  );
}