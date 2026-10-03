import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WORK_AREAS } from '@/lib/accounts';
import { DIFFICULTY_OPTIONS } from '@/lib/jobOptions';

export default function StepBasics({ form, update }) {
  const openings = Number(form.openings) || 1;
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
        <Label>Senioridade</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button key={d.value} type="button" onClick={() => update('difficulty', d.value)}
              className={`h-10 rounded-lg border text-sm font-medium transition-colors ${form.difficulty === d.value ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}