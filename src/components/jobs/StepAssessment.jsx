import React, { useState } from 'react';
import { Loader2, RefreshCw, Sparkles, AlertTriangle, Send, Plus } from 'lucide-react';
import SituationPreview from '@/components/jobs/SituationPreview';
import CustomQuestionForm from '@/components/jobs/CustomQuestionForm';
import { SITUATION_COUNTS } from '@/lib/jobOptions';
import { estimateMinutes } from '@/lib/situations';

export default function StepAssessment({ state, setCount, onGenerate, onFallback, onRemove, onAddCustom, onPublish, publishing, competencyCount }) {
  const { status, count, data } = state;
  const situations = data?.situations || [];
  const [showCustom, setShowCustom] = useState(false);

  if (status === 'generating') {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
        <div className="font-semibold">Construindo sua avaliação</div>
        <p className="text-sm text-muted-foreground mt-1">Transformando suas situações reais em {count} situações de simulação…</p>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{situations.length} situações</span> · {competencyCount} competências · ~{estimateMinutes(situations.length)} min
            {data.source === 'fallback' && <span className="ml-2 text-amber-400">(situações base)</span>}
          </div>
          <button onClick={onGenerate} className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-muted"><RefreshCw className="w-3.5 h-3.5" /> Regenerar</button>
        </div>
        <div className="space-y-3">
          {situations.map((s, i) => <SituationPreview key={s.id} situation={s} index={i} onRemove={situations.length > 4 ? () => onRemove(i) : null} />)}
        </div>
        {showCustom ? (
          <CustomQuestionForm
            onAdd={(s) => { onAddCustom(s); setShowCustom(false); }}
            onCancel={() => setShowCustom(false)}
          />
        ) : (
          <button onClick={() => setShowCustom(true)} className="w-full h-11 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Adicionar minha própria pergunta
          </button>
        )}
        <button onClick={onPublish} disabled={publishing || situations.length < 4}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50">
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publicar vaga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">Não conseguimos gerar a simulação agora.</div>
            <div className="text-muted-foreground mt-1">Tente novamente ou continue com situações base montadas a partir do que você escreveu.</div>
            <button onClick={onFallback} className="mt-3 text-primary text-sm font-medium hover:underline">Continuar com situações base</button>
          </div>
        </div>
      )}
      <div>
        <div className="text-sm font-medium mb-2">Quantas situações a simulação terá?</div>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {SITUATION_COUNTS.map((n) => (
            <button key={n} type="button" onClick={() => setCount(n)}
              className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${count === n ? 'border-primary/60 bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Cada situação tem múltipla escolha (4 alternativas) + comentário opcional. Você também pode adicionar suas próprias perguntas depois. ~{estimateMinutes(count)} min.</p>
      </div>
      <button onClick={onGenerate} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90">
        <Sparkles className="w-4 h-4" /> {status === 'error' ? 'Tentar novamente' : 'Gerar simulação com IA'}
      </button>
    </div>
  );
}