import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WORK_AREAS } from '@/lib/accounts';
import { SENIORITY_LABELS } from '@/lib/jobOptions';

export default function StepBasics({ form, update }) {
  const openings = Number(form.openings) || 1;
  const level = Number(form.seniority_level != null ? form.seniority_level : 6);
  const setLevel = (v) => update('seniority_level', v);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Empresa</Label>
          <Input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="Nome da empresa" className="h-11 bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label>Cargo</Label>
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex.: Atendente Comercial" className="h-11 bg-background/60" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Área</Label>
          <Select value={form.sector} onValueChange={(v) => update('sector', v)}>
            <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
            <SelectContent>{WORK_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Número de vagas</Label>
          <div className="flex items-center h-11 rounded-md border border-input bg-background/60">
            <button type="button" onClick={() => update('openings', Math.max(1, openings - 1))} className="w-11 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="w-4 h-4" /></button>
            <input type="number" min={1} value={openings} onChange={(e) => update('openings', Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 min-w-0 bg-transparent text-center text-sm font-semibold focus:outline-none" />
            <button type="button" onClick={() => update('openings', openings + 1)} className="w-11 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label>Nível de domínio exigido</Label>
          <span className="text-xs font-mono text-primary font-semibold">{level}/10 · {SENIORITY_LABELS[level]}</span>
        </div>
        <input
          type="range" min={0} max={10} step={1} value={level}
          onChange={(e) => setLevel(parseInt(e.target.value, 10))}
          className="w-full accent-primary h-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground/60 px-0.5">
          <span>0 · Estágio</span>
          <span>5 · Pleno</span>
          <span>10 · Topo do mercado</span>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 3, 6, 8, 10].map((p) => (
            <button key={p} type="button" onClick={() => setLevel(p)}
              className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${level === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70 mt-1">Escala de domínio da função — 0 = iniciante, 10 = referência absoluta. Substitui a senioridade fixa.</p>
      </div>
    </div>
  );
}