import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QUALITY_SCORE } from '@/lib/situations';

const QUALITIES = [
  { key: 'best', label: 'Melhor decisão', color: 'text-emerald-400 border-emerald-500/30' },
  { key: 'good', label: 'Aceitável', color: 'text-sky-400 border-sky-500/30' },
  { key: 'weak', label: 'Fraca', color: 'text-amber-400 border-amber-500/30' },
  { key: 'bad', label: 'Ruim', color: 'text-rose-400 border-rose-500/30' },
];

const LETTERS = ['a', 'b', 'c', 'd'];

export default function CustomQuestionForm({ initial, onAdd, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [context, setContext] = useState(initial?.context || '');
  const [question, setQuestion] = useState(initial?.question || '');
  const [options, setOptions] = useState(
    initial?.options?.length === 4
      ? initial.options.map((o) => ({ text: o.text, quality: o.quality }))
      : [
          { text: '', quality: 'best' },
          { text: '', quality: 'good' },
          { text: '', quality: 'weak' },
          { text: '', quality: 'bad' },
        ]
  );

  const setOpt = (i, field, val) => setOptions((o) => o.map((x, idx) => (idx === i ? { ...x, [field]: val } : x)));
  const valid = title.trim() && question.trim() && options.every((o) => o.text.trim());

  const submit = () => {
    if (!valid) return;
    const situation = {
      id: initial?.id || `custom_${Date.now()}`,
      type: 'choice',
      title: title.trim(),
      character: null,
      context: context.trim(),
      question: question.trim(),
      options: options.map((o, i) => ({
        id: LETTERS[i],
        text: o.text.trim(),
        quality: o.quality,
        score: QUALITY_SCORE[o.quality],
        behavior: o.behavior || '',
      })),
      justification_prompt: initial?.justification_prompt || 'Se quiser, conte um pouco mais sobre sua escolha (opcional).',
      competencies: initial?.competencies || [],
      soft_skills: initial?.soft_skills || [],
      difficulty: initial?.difficulty || 'intermediario',
      is_custom: true,
    };
    onAdd(situation);
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{initial ? 'Editar pergunta' : 'Sua pergunta para o teste'}</span>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="space-y-2">
        <Label>Título curto</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Cliente insiste em desconto" className="bg-background/60" />
      </div>
      <div className="space-y-2">
        <Label>Contexto da situação</Label>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="Descreva o cenário em 1-2 frases..." className="bg-background/60 resize-none" />
      </div>
      <div className="space-y-2">
        <Label>Pergunta</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex.: O que você faz primeiro?" className="bg-background/60" />
      </div>

      <div className="space-y-2">
        <Label>4 alternativas — classifique cada uma</Label>
        {options.map((o, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="w-6 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-mono font-semibold text-muted-foreground flex-shrink-0">{LETTERS[i].toUpperCase()}</span>
            <Input value={o.text} onChange={(e) => setOpt(i, 'text', e.target.value)} placeholder={`Alternativa ${LETTERS[i].toUpperCase()}`} className="flex-1 bg-background/60" />
            <select
              value={o.quality}
              onChange={(e) => setOpt(i, 'quality', e.target.value)}
              className="h-9 rounded-md border border-border bg-background/60 px-2 text-xs text-foreground focus:outline-none"
            >
              {QUALITIES.map((q) => (
                <option key={q.key} value={q.key}>{q.label}</option>
              ))}
            </select>
          </div>
        ))}
        <p className="text-xs text-muted-foreground/70">Use 1 "Melhor decisão", 1 "Aceitável", 1 "Fraca" e 1 "Ruim" — a ruim deve ser tentadora para quem despreparado.</p>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
        <button onClick={submit} disabled={!valid} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-40">
          <Check className="w-4 h-4" /> {initial ? 'Salvar pergunta' : 'Adicionar pergunta'}
        </button>
      </div>
    </div>
  );
}