import React, { useState } from 'react';
import { Plus, Trash2, Target, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function StepValues({ form, update }) {
  const [newVal, setNewVal] = useState({ name: '', description: '', expected_behavior: '' });

  const addValue = () => {
    if (!newVal.name.trim()) return;
    update('values', [...(form.values || []), { ...newVal }]);
    setNewVal({ name: '', description: '', expected_behavior: '' });
  };

  const removeValue = (i) => {
    update('values', (form.values || []).filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-foreground mb-1">Propósito, valores e expectativas</h3>
        <p className="text-sm text-muted-foreground">O TalentOS transforma valor em comportamento esperado — isto alimenta a avaliação de aderência.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purpose">Propósito</Label>
          <Textarea id="purpose" value={form.purpose || ''} onChange={(e) => update('purpose', e.target.value)} placeholder="Por que sua empresa existe?" className="min-h-[70px] bg-background/60 resize-none text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mission">Missão</Label>
          <Textarea id="mission" value={form.mission || ''} onChange={(e) => update('mission', e.target.value)} placeholder="O que a empresa busca realizar?" className="min-h-[70px] bg-background/60 resize-none text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vision">Visão</Label>
          <Textarea id="vision" value={form.vision || ''} onChange={(e) => update('vision', e.target.value)} placeholder="Onde pretende chegar?" className="min-h-[70px] bg-background/60 resize-none text-sm" />
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <Label className="text-sm font-medium text-foreground mb-3 block">Valores e comportamentos esperados</Label>
        <p className="text-xs text-muted-foreground mb-4">Não basta "Transparência". Explique o comportamento esperado: "Esperamos que problemas sejam comunicados antes que se tornem maiores."</p>

        <div className="space-y-3">
          {(form.values || []).map((v, i) => (
            <div key={i} className="rounded-xl bg-muted/30 border border-border/50 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm text-primary">{v.name}</span>
                <button onClick={() => removeValue(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              {v.description && <p className="text-sm text-foreground/80 mb-1">{v.description}</p>}
              {v.expected_behavior && <p className="text-xs text-muted-foreground italic">→ {v.expected_behavior}</p>}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border p-4 space-y-3">
          <Input value={newVal.name} onChange={(e) => setNewVal({ ...newVal, name: e.target.value })} placeholder="Nome do valor (ex.: Transparência)" className="h-11 bg-background/60" />
          <Input value={newVal.description} onChange={(e) => setNewVal({ ...newVal, description: e.target.value })} placeholder="Descrição do valor" className="h-11 bg-background/60" />
          <Input value={newVal.expected_behavior} onChange={(e) => setNewVal({ ...newVal, expected_behavior: e.target.value })} placeholder="Comportamento esperado (ex.: problemas comunicados antes de crescerem)" className="h-11 bg-background/60" />
          <Button type="button" variant="outline" onClick={addValue} disabled={!newVal.name.trim()} className="w-full h-10 text-sm">
            <Plus className="w-4 h-4 mr-2" /> Adicionar valor
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> O que faz uma pessoa dar certo aqui?</Label>
          <Textarea value={form.what_succeeds || ''} onChange={(e) => update('what_succeeds', e.target.value)} placeholder="Descreva comportamentos, atitudes e forma de trabalhar que ajudam alguém a ter sucesso na empresa." className="min-h-[80px] bg-background/60 resize-none" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> O que costuma gerar dificuldades aqui?</Label>
          <Textarea value={form.what_doesnt_work || ''} onChange={(e) => update('what_doesnt_work', e.target.value)} placeholder="Ex.: dificuldade com falta de autonomia, ambientes muito acelerados, excesso de burocracia..." className="min-h-[80px] bg-background/60 resize-none" />
        </div>
      </div>
    </div>
  );
}