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
              const color = marker.color === 'emerald' ? 'text-[hsl(160,60%,55%)]' : marker.color === 'amber' ? 'text-[hsl(30,80%,60%)]' : 'text-[hsl(0,72%,60%)]';
              return (
                <div key={comp} className="p-3.5 rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium text-white">{comp}</span>
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${color} bg-current/10`}>{data.evidence}</span>
                    </div>
                    <span className={`text-lg font-bold font-mono ${color}`}>{data.score}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-1">{data.justification}</p>
                  {data.evidence_quote && (
                    <p className="text-xs text-slate-500 italic mt-1.5 pl-3 border-l-2 border-[hsl(240,8%,16%)]">"{data.evidence_quote}"</p>
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
                      <span className="w-1 h-1 rounded-full bg-[hsl(190,85%,50%)]" />
                      <span className="font-medium text-slate-200">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-slate-500 pl-2.5 leading-relaxed">{s.evidence}</p>}
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
                      <span className="w-1 h-1 rounded-full bg-[hsl(280,65%,60%)]" />
                      <span className="font-medium text-slate-200">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-slate-500 pl-2.5 leading-relaxed">{s.evidence}</p>}
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
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)]">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[hsl(190,85%,45%,0.1)] flex items-center justify-center text-[10px] font-mono text-[hsl(190,85%,55%)]">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white mb-1">{e.skill}</div>
                  <p className="text-xs text-slate-400 italic mb-1">"{e.evidence_quote}"</p>
                  <p className="text-xs text-slate-500 leading-relaxed">→ {e.interpretation}</p>
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
                <span className="px-2.5 py-1 rounded-lg bg-[hsl(280,65%,60%,0.1)] border border-[hsl(280,65%,60%,0.25)] text-xs font-medium text-[hsl(280,65%,65%)]">
                  {depthLabel(responseDepth.level)}
                </span>
              </div>
              {responseDepth.reasoning && <p className="text-xs text-slate-400 leading-relaxed">{responseDepth.reasoning}</p>}
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
                  <span className="text-slate-500">Exemplos:</span>
                  <span className={qualityMetrics.has_concrete_examples ? 'text-[hsl(160,60%,55%)]' : 'text-slate-600'}>
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
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(160,60%,55%)] flex-shrink-0 mt-0.5" />
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
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-[hsl(30,80%,60%)] flex-shrink-0 mt-0.5" />
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
        <div className={`p-4 rounded-xl border ${aiDetection.is_ai_generated ? 'bg-[hsl(0,72%,51%,0.04)] border-[hsl(0,72%,51%,0.25)]' : 'bg-[hsl(160,60%,45%,0.04)] border-[hsl(160,60%,45%,0.2)]'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Bot className={`w-4 h-4 ${aiDetection.is_ai_generated ? 'text-[hsl(0,72%,60%)]' : 'text-[hsl(160,60%,55%)]'}`} />
            <span className="text-sm font-medium text-white">
              {aiDetection.is_ai_generated ? 'Possível resposta gerada por IA' : 'Resposta autêntica'}
            </span>
            <span className="text-xs font-mono text-slate-500">({aiDetection.confidence}%)</span>
          </div>
          {aiDetection.indicators?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {aiDetection.indicators.map((ind, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-[hsl(240,8%,12%)] text-[10px] text-slate-400">{ind}</span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 leading-relaxed">{aiDetection.analysis}</p>
        </div>
      )}

      {/* Detailed Feedback */}
      {detailedFeedback && (
        <div className="p-4 rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)]">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Feedback Detalhado</div>
          <p className="text-xs text-slate-300 leading-relaxed">{detailedFeedback}</p>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, accent, compact, children }) {
  const accentColor = accent === 'cyan' ? 'text-[hsl(190,85%,55%)]'
    : accent === 'violet' ? 'text-[hsl(280,65%,65%)]'
    : accent === 'emerald' ? 'text-[hsl(160,60%,55%)]'
    : accent === 'amber' ? 'text-[hsl(30,80%,60%)]'
    : 'text-slate-400';
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className={`w-3.5 h-3.5 ${accentColor}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-medium text-slate-300">{value ?? '—'}</span>
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