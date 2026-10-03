import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Quote } from 'lucide-react';
import { getScoreColor } from '@/lib/skillScoring';

const CONF_LABEL = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const CONF_CLS = { high: 'bg-emerald-500/10 text-emerald-400', medium: 'bg-amber-500/10 text-amber-400', low: 'bg-rose-500/10 text-rose-400' };

function DimRow({ dim }) {
  const [open, setOpen] = useState(false);
  const color = getScoreColor(dim.score);
  const hasEvidence = (dim.evidence?.length || dim.ai_evidence) ? true : false;
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => hasEvidence && setOpen(!open)}
        className="w-full flex items-center gap-3 py-2.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm text-foreground/90">{dim.label}</div>
        </div>
        <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${dim.score}%`, background: color }} />
        </div>
        <span className="text-xs font-mono w-8 text-right" style={{ color }}>{dim.score}</span>
        {hasEvidence && <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && hasEvidence && (
        <div className="pb-3 pl-1 space-y-2">
          {dim.ai_evidence && (
            <p className="text-xs text-foreground/70 leading-relaxed">{dim.ai_evidence}</p>
          )}
          {dim.growth && (
            <p className="text-xs text-amber-400/80 leading-relaxed">⚠ {dim.growth}</p>
          )}
          {(dim.evidence || []).map((ev, i) => (
            <div key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 border-l border-border">
              <span className="text-foreground/60 font-medium">{ev.situation}</span> — {ev.note}
              {ev.quote && (
                <div className="flex items-start gap-1.5 mt-1 text-foreground/50">
                  <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="italic">{ev.quote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SoftSkillsDetail({ sim }) {
  const detail = sim.soft_skills_detail;
  const narrative = sim.soft_skills_narrative;
  if (!detail || Object.keys(detail).length === 0) return null;

  const skills = Object.entries(detail).sort((a, b) => (b[1].score || 0) - (a[1].score || 0));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-violet" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-violet">Análise de Soft Skills</span>
        </div>
        <h3 className="font-heading text-lg text-foreground mb-4">Como o candidato pensa, decide e age</h3>

        {narrative && (
          <p className="text-sm text-foreground/80 leading-relaxed mb-6 pb-6 border-b border-border whitespace-pre-line">{narrative}</p>
        )}

        <div className="space-y-5">
          {skills.map(([key, skill]) => {
            const color = getScoreColor(skill.score || 0);
            const dims = Object.entries(skill.dimensions || {}).sort((a, b) => (b[1].score || 0) - (a[1].score || 0));
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
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${skill.score || 0}%`, background: color }} />
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color }}>{skill.score || 0}</span>
                  </div>
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
      </div>
    </motion.div>
  );
}