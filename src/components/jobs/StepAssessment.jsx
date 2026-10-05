import React, { useState } from 'react';
import { Loader2, RefreshCw, Sparkles, AlertTriangle, Send, Plus, Check, ShieldCheck, FileText, Edit3 } from 'lucide-react';
import SituationPreview from '@/components/jobs/SituationPreview';
import OpenQuestionPreview from '@/components/jobs/OpenQuestionPreview';
import CustomQuestionForm from '@/components/jobs/CustomQuestionForm';
import OpenQuestionForm from '@/components/jobs/OpenQuestionForm';
import { DEPTH_LEVELS, depthConfig, recommendDepth, validateMandatoryStructure } from '@/lib/processDepth';
import { estimateMinutes } from '@/lib/situations';

export default function StepAssessment({
  state, depth, depthCustom, form, onUpdateDepth, onUpdateDepthCustom,
  onGenerate, onFallback, onPublish, publishing, competencyCount,
  onRemove, onAdd, onReplace, onMove, onDuplicate,
}) {
  const { status, data } = state;
  const situations = data?.situations || [];
  const [showCustom, setShowCustom] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null); // index being edited
  const [showOpen, setShowOpen] = useState(false);
  const [editingOpen, setEditingOpen] = useState(null); // index being edited

  const choices = situations.filter((s) => (s.options || []).length > 0);
  const opens = situations.filter((s) => (s.options || []).length === 0);
  const recommended = recommendDepth(form);

  // ---- Ready state: review generated questions + validation ----
  if (status === 'ready') {
    const expectedCfg = depthConfig(depth, depthCustom);
    const validation = validateMandatoryStructure({ situations, competencies: form.competencies, depth, expectedConfig: expectedCfg });
    const totalMin = estimateMinutes(choices.length) + opens.length * 3;
    const totalCount = choices.length + opens.length;
    const expectedTotal = expectedCfg.totalCount;

    return (
      <div className="space-y-6">
        {/* Contagem exata — total + objetivas + abertas + DISC separado */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Contagem de questões</span>
            <span className={`text-2xl font-bold font-mono ${totalCount === expectedTotal ? 'text-primary' : 'text-amber-400'}`}>
              {totalCount}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{choices.length}</div>
              <div className="text-muted-foreground">Objetivas</div>
              <div className="text-[10px] text-muted-foreground/60">esperado: {expectedCfg.choiceCount}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{opens.length}</div>
              <div className="text-muted-foreground">Abertas</div>
              <div className="text-[10px] text-muted-foreground/60">esperado: {expectedCfg.openCount}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{totalCount}</div>
              <div className="text-muted-foreground">Total</div>
              <div className="text-[10px] text-muted-foreground/60">esperado: {expectedTotal}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-violet">DISC</div>
              <div className="text-muted-foreground">À parte</div>
              <div className="text-[10px] text-muted-foreground/60">obrigatório</div>
            </div>
          </div>
          {validation.countMismatch && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>A contagem atual ({totalCount}) não bate com o configurado ({expectedTotal}). Ajuste as questões ou regenere.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="text-sm text-muted-foreground">
            {data.source === 'fallback' && <span className="ml-2 text-amber-400">(situações base)</span>}
          </div>
          <button onClick={() => onGenerate(depthConfig(depth, depthCustom))} className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-muted">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerar
          </button>
        </div>

        {/* Perguntas estruturadas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Perguntas estruturadas
              <span className="text-xs text-muted-foreground font-normal">({choices.length})</span>
            </h3>
            <button onClick={() => { setShowCustom(false); setEditingChoice(null); setShowOpen(false); setEditingOpen(null); setShowCustom(true); }}
              className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-muted text-foreground">
              <Plus className="w-3.5 h-3.5" /> Adicionar pergunta
            </button>
          </div>
          <div className="space-y-3">
            {choices.map((s) => {
              const realIndex = situations.indexOf(s);
              return <SituationPreview key={s.id} situation={s} index={realIndex}
                onEdit={() => { setEditingChoice(realIndex); setShowCustom(false); }}
                onDuplicate={() => onDuplicate(realIndex)}
                onMoveUp={() => onMove(realIndex, -1)} onMoveDown={() => onMove(realIndex, 1)}
                canMoveUp={realIndex > 0} canMoveDown={realIndex < situations.length - 1}
                onRemove={choices.length > 1 ? () => onRemove(realIndex) : null}
              />;
            })}
          </div>
          {editingChoice !== null && (
            <div className="mt-3">
              <CustomQuestionForm initial={situations[editingChoice]}
                onAdd={(s) => { onReplace(editingChoice, s); setEditingChoice(null); }}
                onCancel={() => setEditingChoice(null)} />
            </div>
          )}
          {showCustom && editingChoice === null && (
            <div className="mt-3">
              <CustomQuestionForm
                onAdd={(s) => { onAdd(s); setShowCustom(false); }}
                onCancel={() => setShowCustom(false)} />
            </div>
          )}
        </div>

        {/* Questões abertas */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3 mt-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-violet" /> Questões abertas
              <span className="text-xs text-muted-foreground font-normal">({opens.length})</span>
            </h3>
            <button onClick={() => { setShowOpen(true); setEditingOpen(null); setShowCustom(false); setEditingChoice(null); }}
              className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-muted text-foreground">
              <Plus className="w-3.5 h-3.5" /> Adicionar questão aberta
            </button>
          </div>
          <div className="space-y-3">
            {opens.map((s) => {
              const realIndex = situations.indexOf(s);
              return <OpenQuestionPreview key={s.id} situation={s} index={realIndex}
                onEdit={() => { setEditingOpen(realIndex); setShowOpen(false); }}
                onDuplicate={() => onDuplicate(realIndex)}
                onMoveUp={() => onMove(realIndex, -1)} onMoveDown={() => onMove(realIndex, 1)}
                canMoveUp={realIndex > 0} canMoveDown={realIndex < situations.length - 1}
                onRemove={opens.length > 1 ? () => onRemove(realIndex) : null}
              />;
            })}
          </div>
          {editingOpen !== null && (
            <div className="mt-3">
              <OpenQuestionForm initial={situations[editingOpen]}
                onAdd={(s) => { onReplace(editingOpen, s); setEditingOpen(null); }}
                onCancel={() => setEditingOpen(null)} />
            </div>
          )}
          {showOpen && editingOpen === null && (
            <div className="mt-3">
              <OpenQuestionForm
                onAdd={(s) => { onAdd(s); setShowOpen(false); }}
                onCancel={() => setShowOpen(false)} />
            </div>
          )}
        </div>

        {/* Validação da estrutura obrigatória */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Estrutura obrigatória</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            <CheckRow ok={validation.disc} label="DISC (sempre incluído)" />
            <CheckRow ok={validation.choiceCount >= 1} label={`${validation.choiceCount} pergunta(s) estruturada(s)`} />
            <CheckRow ok={validation.openCount >= 1} label={`${validation.openCount} questão(ões) aberta(s)`} />
            <CheckRow ok={competencyCount >= 2} label={`${competencyCount} competência(s) exigida(s)`} />
            <CheckRow ok={!validation.countMismatch} label={`Contagem exata: ${validation.totalCount || 0} = ${validation.choiceCount} + ${validation.openCount}`} />
            <CheckRow ok={true} label="DISC separado das questões da vaga" />
          </div>
          {(!validation.valid || validation.countMismatch) && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{[...validation.issues, validation.countMismatch ? `Quantidade configurada (${expectedTotal}) ≠ atual (${totalCount}).` : ''].filter(Boolean).join(' ')}</span>
            </div>
          )}
        </div>

        <button onClick={onPublish} disabled={publishing || !validation.valid || validation.countMismatch}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publicar vaga
        </button>
      </div>
    );
  }

  // ---- Generating ----
  if (status === 'generating') {
    const cfg = depthConfig(depth, depthCustom);
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
        <div className="font-semibold">Construindo sua avaliação</div>
        <p className="text-sm text-muted-foreground mt-1">{cfg.choiceCount} perguntas + {cfg.openCount} questão(ões) aberta(s) + DISC…</p>
      </div>
    );
  }

  // ---- Idle / error: depth selection + generate ----
  return (
    <div className="space-y-6">
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">Não conseguimos gerar a simulação agora.</div>
            <div className="text-muted-foreground mt-1">Tente novamente ou continue com situações base montadas a partir do que você escreveu.</div>
            <button onClick={() => onFallback(depthConfig(depth, depthCustom))} className="mt-3 text-primary text-sm font-medium hover:underline">Continuar com situações base</button>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-lg text-foreground mb-1">Como você quer conduzir a candidatura?</h3>
        <p className="text-sm text-muted-foreground mb-4">O nível define a quantidade e a profundidade da avaliação.</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {DEPTH_LEVELS.map((d) => {
            const active = depth === d.key;
            const isRec = recommended === d.key;
            return (
              <button key={d.key} type="button" onClick={() => onUpdateDepth(d.key)}
                className={`text-left p-4 rounded-xl border transition-all relative ${active ? 'border-primary/60 bg-primary/10' : 'border-border hover:border-primary/30 hover:bg-muted/40'}`}>
                {isRec && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Recomendado</span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{d.label}</span>
                  <span className="text-[11px] text-muted-foreground">· {d.tagline}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.description}</p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">DISC</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.key === 'personalizada' ? 'Você define' : `${d.totalCount} questões`}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.key === 'personalizada' ? '≥1 aberta' : `${d.choiceCount} + ${d.openCount} aberta(s)`}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-3">
          <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>Todas as opções incluem <strong className="text-foreground">DISC</strong>, <strong className="text-foreground">perguntas estruturadas</strong> e pelo menos <strong className="text-foreground">1 questão aberta</strong>. A profundidade muda a quantidade e a complexidade — nunca a estrutura mínima.</span>
        </div>

        {depth === 'personalizada' && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Perguntas estruturadas (objetivas)</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min={4} max={20} value={depthCustom?.choiceCount || 10}
                    onChange={(e) => onUpdateDepthCustom({ ...depthCustom, choiceCount: parseInt(e.target.value) })}
                    className="flex-1 accent-primary h-2" />
                  <span className="text-sm font-mono font-semibold text-primary w-8 text-right">{depthCustom?.choiceCount || 10}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Questões abertas</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min={1} max={5} value={depthCustom?.openCount || 1}
                    onChange={(e) => onUpdateDepthCustom({ ...depthCustom, openCount: parseInt(e.target.value) })}
                    className="flex-1 accent-primary h-2" />
                  <span className="text-sm font-mono font-semibold text-primary w-8 text-right">{depthCustom?.openCount || 1}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm bg-muted/30 rounded-lg py-2 border border-border">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold font-mono text-primary">{(depthCustom?.choiceCount || 10) + (depthCustom?.openCount || 1)}</span>
              <span className="text-muted-foreground/60 text-xs">questões + DISC à parte</span>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => onGenerate(depthConfig(depth, depthCustom))} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90">
        <Sparkles className="w-4 h-4" /> {status === 'error' ? 'Tentar novamente' : 'Gerar avaliação com IA'}
      </button>
    </div>
  );
}

function CheckRow({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground/50'}`}>
        {ok ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-current" />}
      </span>
      <span className={ok ? 'text-foreground/80' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}