import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Quote, Eye, Lightbulb, Ban, HelpCircle } from 'lucide-react';
import { bandFor, tierColor } from '@/lib/softSkillsRubric';

const CONF_LABEL = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const CONF_CLS = { high: 'bg-emerald-500/10 text-emerald-400', medium: 'bg-amber-500/10 text-amber-400', low: 'bg-rose-500/10 text-rose-400' };

function EvidenceLayer({ dim }) {
  const hasObserved = !!dim.observed || !!dim.ai_evidence;
  const hasInferred = !!dim.inferred;
  const notAssessable = dim.not_assessable && !hasObserved;
  if (notAssessable) {
    return (
      <div className="flex items-start gap-2 text-xs text-muted-foreground/60 py-1">
        <Ban className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>Não foi possível avaliar suficientemente esta sub-dimensão nas respostas coletadas.</span>
      </div>
    );
  }
  return (
    <div className="space-y-2 py-1">
      {hasObserved && (
        <div className="flex items-start gap-2">
          <Eye className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
          <div className="text-xs text-foreground/80 leading-relaxed">
            <span className="text-primary/70 font-medium uppercase tracking-wider text-[10px] mr-1">Observado</span>
            {dim.ai_evidence || dim.observed}
          </div>
        </div>
      )}
      {hasInferred && (
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-400" />
          <div className="text-xs text-foreground/60 leading-relaxed">
            <span className="text-amber-400/70 font-medium uppercase tracking-wider text-[10px] mr-1">Inferido</span>
            {dim.inferred}
          </div>
        </div>
      )}
      {(dim.evidence || []).map((ev, i) => (
        <div key={i} className="text-xs text-muted-foreground leading-relaxed pl-5 border-l border-border">
          <span className="text-foreground/60 font-medium">{ev.situation}</span>
          {ev.note && ev.note !== (dim.ai_evidence || dim.observed) ? ` — ${ev.note}` : ''}
          {ev.quote && (
            <div className="flex items-start gap-1.5 mt-1 text-foreground/50">
              <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="italic">{ev.quote}</span>
            </div>
          )}
        </div>
      ))}
      {dim.growth && (
        <div className="text-xs text-amber-400/80 leading-relaxed pl-5">⚠ {dim.growth}</div>
      )}
    </div>
  );
}

function DimRow({ dim }) {
  const [open, setOpen] = useState(false);
  const hasContent = !dim.not_assessable || dim.observed || dim.ai_evidence || dim.inferred || (dim.evidence && dim.evidence.length);
  const color = dim.score == null ? '#64748b' : tierColor(bandFor(dim.score).tier);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => hasContent && setOpen(!open)}
        className="w-full flex items-center gap-3 py-2.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm text-foreground/90">{dim.label}</div>
        </div>
        {dim.score == null ? (
          <span className="text-[10px] text-muted-foreground/50 italic">não avaliado</span>
        ) : (
          <>
            <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${dim.score}%`, background: color }} />
            </div>
            <span className="text-xs font-mono w-8 text-right" style={{ color }}>{dim.score}</span>
          </>
        )}
        {hasContent && <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && hasContent && (
        <div className="pb-3 pl-1">
          <EvidenceLayer dim={dim} />
        </div>
      )}
    </div>
  );
}

export default function SoftSkillsDetail({ sim }) {
  const detail = sim.soft_skills_detail;
  const narrative = sim.soft_skills_narrative;
  const interviewQuestions = (sim.interview_questions || []).filter((q) => q.gap || q.rationale);
  if (!detail || Object.keys(detail).length === 0) return null;

  const skills = Object.entries(detail).sort((a, b) => {
    const sa = a[1].score == null ? -1 : a[1].score;
    const sb = b[1].score == null ? -1 : b[1].score;
    return sb - sa;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-violet" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-violet">Análise de Soft Skills</span>
        </div>
        <h3 className="font-heading text-lg text-foreground mb-1">Como o candidato pensa, decide e age</h3>
        <p className="text-xs text-muted-foreground/70 mb-5">Cada score nasce da evidência observada nas respostas. Clique para ver o que sustenta cada conclusão.</p>

        {narrative && (
          <p className="text-sm text-foreground/80 leading-relaxed mb-6 pb-6 border-b border-border whitespace-pre-line">{narrative}</p>
        )}

        <div className="space-y-5">
          {skills.map(([key, skill]) => {
            const notAssessable = skill.not_assessable && skill.score == null;
            const color = skill.score == null ? '#64748b' : tierColor(bandFor(skill.score).tier);
            const band = skill.score == null ? null : bandFor(skill.score);
            const dims = Object.entries(skill.dimensions || {}).sort((a, b) => {
              const ba = a[1].score == null ? -1 : a[1].score;
              const bb = b[1].score == null ? -1 : b[1].score;
              return bb - ba;
            });
            return (
              <div key={key} className="rounded-xl bg-muted/30 border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-foreground">{skill.label}</span>
                    {skill.confidence && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CONF_CLS[skill.confidence] || CONF_CLS.low}`}>
                        conf. {CONF_LABEL[skill.confidence] || skill.confidence}
                      </span>
                    )}
                  </div>
                  {notAssessable ? (
                    <span className="text-xs text-muted-foreground/50 italic flex items-center gap-1">
                      <Ban className="w-3 h-3" /> não avaliado
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {band && <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">{band.label}</span>}
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${skill.score || 0}%`, background: color }} />
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color }}>{skill.score}</span>
                    </div>
                  )}
                </div>
                <div className="pl-1">
                  {dims.map(([dimKey, dim]) => (
                    <DimRow key={dimKey} dim={dim} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {interviewQuestions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Perguntas para Entrevista (lacunas de evidência)</span>
            </div>
            <div className="space-y-2.5">
              {interviewQuestions.map((q, i) => (
                <div key={i} className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                  <div className="text-xs font-medium text-amber-400/90 mb-1">{q.competency}</div>
                  <p className="text-sm text-foreground/85 leading-relaxed">{q.question}</p>
                  {q.rationale && <p className="text-xs text-muted-foreground/70 mt-1.5 italic">{q.rationale}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}