import React from 'react';
import {
  CheckCircle2, XCircle, CircleDot, Bot, Wrench, Heart,
  Link2, Gauge, ThumbsUp, Search, FileText, AlertTriangle
} from 'lucide-react';
import { getEvidenceMarker } from '@/lib/skillScoring';

export default function ResponseAnalysis({ analysis }) {
  if (!analysis) return null;

  const competencyScores = analysis.competency_scores || {};
  const skillsIdentified = analysis.skills_identified || {};
  const evidenceChain = analysis.evidence_chain || [];
  const responseDepth = analysis.response_depth || {};
  const qualityMetrics = analysis.quality_metrics || {};
  const positivePoints = analysis.positive_points || [];
  const pointsToInvestigate = analysis.points_to_investigate || [];
  const aiDetection = analysis.ai_detection;
  const detailedFeedback = analysis.detailed_feedback;

  return (
    <div className="space-y-5">
      {/* Competency Scores */}
      {Object.keys(competencyScores).length > 0 && (
        <Section icon={Gauge} title="Competências Avaliadas" accent="cyan">
          <div className="space-y-3">
            {Object.entries(competencyScores).map(([comp, data]) => {
              const marker = getEvidenceMarker(data.score);
              const Icon = data.evidence === '✓' ? CheckCircle2 : data.evidence === '✗' ? XCircle : CircleDot;
              const color = marker.color === 'emerald' ? 'text-emerald-400' : marker.color === 'amber' ? 'text-amber-400' : 'text-rose-400';
              return (
                <div key={comp} className="p-3.5 rounded-xl bg-muted border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium text-foreground">{comp}</span>
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${color} bg-current/10`}>{data.evidence}</span>
                    </div>
                    <span className={`text-lg font-bold font-mono ${color}`}>{data.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-1">{data.justification}</p>
                  {data.evidence_quote && (
                    <p className="text-xs text-muted-foreground/70 italic mt-1.5 pl-3 border-l-2 border-border">"{data.evidence_quote}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Skills Identified */}
      {(skillsIdentified.hard_skills?.length > 0 || skillsIdentified.soft_skills?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {skillsIdentified.hard_skills?.length > 0 && (
            <Section icon={Wrench} title="Hard Skills" accent="cyan" compact>
              <div className="space-y-2">
                {skillsIdentified.hard_skills.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      <span className="font-medium text-foreground/90">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-muted-foreground/70 pl-2.5 leading-relaxed">{s.evidence}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
          {skillsIdentified.soft_skills?.length > 0 && (
            <Section icon={Heart} title="Soft Skills" accent="violet" compact>
              <div className="space-y-2">
                {skillsIdentified.soft_skills.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1 h-1 rounded-full bg-brand-violet" />
                      <span className="font-medium text-foreground/90">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-muted-foreground/70 pl-2.5 leading-relaxed">{s.evidence}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Evidence Chain */}
      {evidenceChain.length > 0 && (
        <Section icon={Link2} title="Cadeia de Evidências" accent="cyan">
          <div className="space-y-3">
            {evidenceChain.map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted border border-border">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-mono text-primary">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground mb-1">{e.skill}</div>
                  <p className="text-xs text-muted-foreground italic mb-1">"{e.evidence_quote}"</p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">→ {e.interpretation}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Response Depth + Quality Metrics */}
      {(responseDepth.level || qualityMetrics.clarity != null) && (
        <div className="grid md:grid-cols-2 gap-4">
          {responseDepth.level && (
            <Section icon={FileText} title="Profundidade" accent="violet" compact>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-brand-violet/10 border border-brand-violet/25 text-xs font-medium text-brand-violet">
                  {depthLabel(responseDepth.level)}
                </span>
              </div>
              {responseDepth.reasoning && <p className="text-xs text-muted-foreground leading-relaxed">{responseDepth.reasoning}</p>}
            </Section>
          )}
          {qualityMetrics.clarity != null && (
            <Section icon={Gauge} title="Métricas de Qualidade" accent="cyan" compact>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Clareza" value={qualityMetrics.clarity} />
                <Metric label="Comunicação" value={qualityMetrics.communication} />
                <Metric label="Raciocínio" value={qualityMetrics.reasoning} />
                <Metric label="Resol. Problemas" value={qualityMetrics.problem_solving} />
                <Metric label="Coerência" value={qualityMetrics.coherence} />
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground/70">Exemplos:</span>
                  <span className={qualityMetrics.has_concrete_examples ? 'text-emerald-400' : 'text-muted-foreground/50'}>
                    {qualityMetrics.has_concrete_examples ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Positive Points + Points to Investigate */}
      {(positivePoints.length > 0 || pointsToInvestigate.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {positivePoints.length > 0 && (
            <Section icon={ThumbsUp} title="Pontos Positivos" accent="emerald" compact>
              <ul className="space-y-1.5">
                {positivePoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {pointsToInvestigate.length > 0 && (
            <Section icon={Search} title="A Investigar" accent="amber" compact>
              <ul className="space-y-1.5">
                {pointsToInvestigate.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* AI Detection */}
      {aiDetection && (
        <div className={`p-4 rounded-xl border ${aiDetection.is_ai_generated ? 'bg-rose-500/5 border-rose-500/25' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Bot className={`w-4 h-4 ${aiDetection.is_ai_generated ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-sm font-medium text-foreground">
              {aiDetection.is_ai_generated ? 'Possível resposta gerada por IA' : 'Resposta autêntica'}
            </span>
            <span className="text-xs font-mono text-muted-foreground/70">({aiDetection.confidence}%)</span>
          </div>
          {aiDetection.indicators?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {aiDetection.indicators.map((ind, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-accent text-[10px] text-muted-foreground">{ind}</span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">{aiDetection.analysis}</p>
        </div>
      )}

      {/* Detailed Feedback */}
      {detailedFeedback && (
        <div className="p-4 rounded-xl bg-muted border border-border">
          <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-2">Feedback Detalhado</div>
          <p className="text-xs text-foreground/80 leading-relaxed">{detailedFeedback}</p>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, accent, compact, children }) {
  const accentColor = accent === 'cyan' ? 'text-primary'
    : accent === 'violet' ? 'text-brand-violet'
    : accent === 'emerald' ? 'text-emerald-400'
    : accent === 'amber' ? 'text-amber-400'
    : 'text-muted-foreground';
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className={`w-3.5 h-3.5 ${accentColor}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="font-mono font-medium text-foreground/80">{value ?? '—'}</span>
    </div>
  );
}

function depthLabel(level) {
  const labels = {
    superficial: 'Superficial',
    explanation: 'Explicação',
    examples: 'Com Exemplos',
    context_results: 'Contexto e Resultados',
    practical_experience: 'Experiência Prática',
  };
  return labels[level] || level;
}