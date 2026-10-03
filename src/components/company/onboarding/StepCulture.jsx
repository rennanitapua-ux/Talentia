import React from 'react';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  VALUED_OPTIONS, DECISION_OPTIONS, MANAGEMENT_OPTIONS, ERROR_OPTIONS,
  COLLABORATION_OPTIONS, COMMUNICATION_OPTIONS, ENVIRONMENT_OPTIONS,
} from '@/lib/companyCulture';

function MultiSelect({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = (selected || []).includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              active
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            }`}
          >
            {active && <Check className="w-3 h-3 inline mr-1" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{title}</Label>
      {children}
    </div>
  );
}

export default function StepCulture({ form, update }) {
  const toggle = (field, value) => {
    const arr = form[field] || [];
    update(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-foreground mb-1">Como sua empresa funciona?</h3>
        <p className="text-sm text-muted-foreground">Isto ajuda o TalentIA a entender o contexto real e criar avaliações alinhadas à sua cultura.</p>
      </div>

      <Section title="O que é mais valorizado na empresa? (selecione múltiplos)">
        <MultiSelect options={VALUED_OPTIONS} selected={form.valued} onToggle={(v) => toggle('valued', v)} />
      </Section>

      <Section title="Quando surge um problema importante, normalmente:">
        <MultiSelect options={DECISION_OPTIONS} selected={form.decision_making} onToggle={(v) => toggle('decision_making', v)} />
      </Section>

      <div className="grid sm:grid-cols-2 gap-5">
        <Section title="Quanto de autonomia os funcionários possuem?">
          <Select value={form.autonomy_level || ''} onValueChange={(v) => update('autonomy_level', v)}>
            <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {['Baixa', 'Moderada', 'Alta', 'Muito alta'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </Section>
        <Section title="Ritmo de trabalho">
          <Select value={form.work_rhythm || ''} onValueChange={(v) => update('work_rhythm', v)}>
            <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {['Previsível', 'Moderado', 'Acelerado', 'Muito acelerado', 'Variável'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </Section>
      </div>

      <Section title="Explique como funciona a autonomia na sua empresa">
        <Textarea value={form.autonomy_description || ''} onChange={(e) => update('autonomy_description', e.target.value)} className="min-h-[70px] bg-background/60 resize-none" />
      </Section>

      <Section title="Como os gestores normalmente trabalham? (selecione múltiplos)">
        <MultiSelect options={MANAGEMENT_OPTIONS} selected={form.management_style} onToggle={(v) => toggle('management_style', v)} />
      </Section>

      <Section title="Quando um funcionário comete um erro, qual costuma ser a abordagem?">
        <MultiSelect options={ERROR_OPTIONS} selected={form.error_handling} onToggle={(v) => toggle('error_handling', v)} />
      </Section>

      <Section title="Explique como sua empresa normalmente lida com erros">
        <Textarea value={form.error_description || ''} onChange={(e) => update('error_description', e.target.value)} className="min-h-[70px] bg-background/60 resize-none" />
      </Section>

      <Section title="Como funciona o trabalho em equipe?">
        <MultiSelect options={COLLABORATION_OPTIONS} selected={form.collaboration} onToggle={(v) => toggle('collaboration', v)} />
      </Section>

      <Section title="Como a comunicação funciona na empresa?">
        <MultiSelect options={COMMUNICATION_OPTIONS} selected={form.communication} onToggle={(v) => toggle('communication', v)} />
      </Section>

      <Section title="Ambiente de trabalho (selecione os que se aplicam)">
        <MultiSelect options={ENVIRONMENT_OPTIONS} selected={form.work_environment} onToggle={(v) => toggle('work_environment', v)} />
      </Section>

      <Section title="Como é um dia típico de trabalho?">
        <Textarea value={form.rhythm_description || ''} onChange={(e) => update('rhythm_description', e.target.value)} className="min-h-[70px] bg-background/60 resize-none" />
      </Section>
    </div>
  );
}