import React, { useState, useEffect } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Formulário de questão aberta (adicionar ou editar).
// Produz um objeto situation com type:'open' e options:[].
export default function OpenQuestionForm({ initial, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setContext(initial.context || '');
      setQuestion(initial.question || '');
      setPrompt(initial.justification_prompt || '');
    }
  }, [initial]);

  const valid = question.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const situation = {
      id: initial?.id || `open_${Date.now()}`,
      type: 'open',
      title: title.trim() || 'Questão aberta',
      character: null,
      context: context.trim(),
      question: question.trim(),
      options: [],
      justification_prompt:
        prompt.trim() ||
        'Conte sobre uma situação real que você viveu: o que aconteceu, o que você fez e qual foi o resultado. Escreva com suas próprias palavras.',
      competencies: initial?.competencies || [],
      soft_skills: initial?.soft_skills || [],
      difficulty: initial?.difficulty || 'intermediario',
      is_custom: true,
    };
    onAdd(situation);
  };

  return (
    <div className="rounded-xl border border-violet/30 bg-violet/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet">Questão aberta</span>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="space-y-2">
        <Label>Título curto (opcional)</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Situação difícil com cliente" className="bg-background/60" />
      </div>
      <div className="space-y-2">
        <Label>Contexto da situação (opcional)</Label>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="Cenário em 1-2 frases, se quiser situar o candidato..." className="bg-background/60 resize-none" />
      </div>
      <div className="space-y-2">
        <Label>Pergunta *</Label>
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2}
          placeholder="Ex.: Conte sobre uma situação em que você precisou lidar com um erro. O que aconteceu e como você resolveu?"
          className="bg-background/60 resize-none" />
        <p className="text-xs text-muted-foreground/70">Busque evidência: situação, ação, decisão e resultado. Não use sempre a mesma pergunta genérica.</p>
      </div>
      <div className="space-y-2">
        <Label>Instruções para o candidato (opcional)</Label>
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Como o candidato deve responder..." className="bg-background/60" />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
        <button onClick={submit} disabled={!valid} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-40">
          <Check className="w-4 h-4" /> {initial ? 'Salvar questão' : 'Adicionar questão'}
        </button>
      </div>
    </div>
  );
}