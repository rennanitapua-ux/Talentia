import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function StepProblem({ form, update }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    if (!draft.trim()) return;
    update('situations', [...form.situations, draft.trim()]);
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Qual problema real essa pessoa vai resolver?</Label>
        <Textarea value={form.company_problems} onChange={(e) => update('company_problems', e.target.value)} rows={3}
          placeholder="Ex.: Recebemos 100 clientes por dia e perdemos vendas por demora no atendimento e erros nos pedidos."
          className="bg-background/60 resize-none" />
      </div>

      <div className="space-y-2">
        <Label>Situações reais do dia a dia</Label>
        <p className="text-xs text-muted-foreground">Descreva o que acontece de verdade nessa função. A IA transforma cada situação em perguntas da simulação.</p>
        <div className="flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Ex.: Cliente recebe peça errada e ameaça cancelar a compra" className="h-11 bg-background/60" />
          <button type="button" onClick={add} className="h-11 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        <div className="space-y-2 pt-1">
          {form.situations.map((s, i) => (
            <div key={i} className="flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-sm">
              <span className="text-xs font-mono text-primary mt-0.5">{i + 1}</span>
              <span className="flex-1 text-foreground/85">{s}</span>
              <button type="button" onClick={() => update('situations', form.situations.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-rose-400"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[['company_context', 'Contexto da empresa', 'Ex.: Loja com 3 unidades'], ['product', 'Produto ou serviço', 'Ex.: Peças de moto'], ['client', 'Cliente típico', 'Ex.: Motoboys e oficinas']].map(([k, label, ph]) => (
          <div key={k} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{label} <span className="opacity-60">(opcional)</span></Label>
            <Input value={form[k]} onChange={(e) => update(k, e.target.value)} placeholder={ph} className="h-10 bg-background/60" />
          </div>
        ))}
      </div>
    </div>
  );
}