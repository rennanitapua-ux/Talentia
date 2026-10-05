import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Bot, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Clock, Brain, Briefcase, MessageSquare, PenLine, MousePointerClick } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import DiscResults from '@/components/DiscResults';
import AnalysisReport from '@/components/AnalysisReport';
import SoftSkillsDetail from '@/components/company/SoftSkillsDetail';
import { getRecommendation } from '@/lib/skillScoring';

const HIRING_STATUS = {
  em_analise: { label: 'Em Análise', color: '#64748b', icon: Clock },
  convocacao_entrevista: { label: 'Convocado para Entrevista', color: '#3b82f6', icon: MessageSquare },
  entrevista_agendada: { label: 'Entrevista Agendada', color: '#8b5cf6', icon: Briefcase },
  aprovado: { label: 'Aprovado', color: '#10b981', icon: CheckCircle2 },
  reprovado: { label: 'Reprovado', color: '#ef4444', icon: AlertTriangle },
};

const HIRING_FLOW = ['em_analise', 'convocacao_entrevista', 'entrevista_agendada', 'aprovado'];

export default function CandidateResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Simulation.get(id).then(s => {
      setSim(s);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Atualiza o resultado quando o enriquecimento da IA terminar (em segundo plano).
    const unsubscribe = base44.entities.Simulation.subscribe((event) => {
      if (event.id === id && event.type === 'update') {
        base44.entities.Simulation.get(id).then(setSim).catch(() => {});
      }
    });
    return unsubscribe;
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Resultado não encontrado</div>;

  const competencies = Object.keys(sim.skill_scores || {});
  const rec = getRecommendation(sim.overall_score || 0);
  const aiFlags = sim.ai_flags || [];
  const responses = sim.responses || [];
  const totalTime = sim.total_time_seconds || responses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
  const hiringStatus = HIRING_STATUS[sim.hiring_status] || HIRING_STATUS.em_analise;
  const currentStepIdx = HIRING_FLOW.indexOf(sim.hiring_status);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/candidate')} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Seu Resultado</div>
            <div className="text-xs text-muted-foreground/70">{sim.job_title} · {sim.company_name}</div>
          </div>
          <button onClick={() => navigate('/candidate')} className="text-xs text-brand-violet hover:text-brand-violet/80 transition-colors">
            Ver Talent Passport →
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero result */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-violet/5 border border-brand-violet/20 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
            <span className="text-brand-violet text-xs font-medium tracking-wide uppercase">Avaliação Completa</span>
          </div>
          <div className="flex justify-center mb-5">
            <SkillScoreBadge score={sim.overall_score || 0} size="xl" />
          </div>
          <div className="inline-block px-4 py-2 rounded-xl" style={{ background: rec.color === 'emerald' ? 'hsl(160,60%,45%,0.1)' : rec.color === 'amber' ? 'hsl(30,80%,55%,0.1)' : 'hsl(0,72%,51%,0.1)' }}>
            <span className="text-sm font-bold" style={{ color: rec.color === 'emerald' ? 'hsl(160,60%,55%)' : rec.color === 'amber' ? 'hsl(30,80%,60%)' : 'hsl(0,72%,60%)' }}>
              {sim.recommendation || rec.label}
            </span>
          </div>
          {totalTime > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground/70">
              <Clock className="w-3 h-3" />
              Tempo total: {formatTime(totalTime)}
            </div>
          )}
        </motion.div>

        {/* Hiring process tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Andamento do Processo de Contratação</span>
          </div>
          {sim.hiring_status === 'reprovado' ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(0,72%,51%,0.04)] border border-[hsl(0,72%,51%,0.2)]">
              <AlertTriangle className="w-5 h-5 text-[hsl(0,72%,60%)]" />
              <div>
                <div className="text-sm font-medium text-[hsl(0,72%,65%)]">Processo Encerrado</div>
                <div className="text-xs text-muted-foreground mt-0.5">Infelizmente você não avançou neste processo. Continue se candidatando a outras vagas.</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {HIRING_FLOW.map((status, i) => {
                const s = HIRING_STATUS[status];
                const isComplete = currentStepIdx >= i;
                const isCurrent = currentStepIdx === i;
                const Icon = s.icon;
                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                        isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/50 border border-border'
                      } ${isCurrent ? 'ring-2 ring-[hsl(190,85%,45%,0.4)] ring-offset-2 ring-offset-background' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] text-center ${isComplete ? 'text-primary' : 'text-muted-foreground/50'}`}>{s.label}</span>
                    </div>
                    {i < HIRING_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full ${currentStepIdx > i ? 'bg-primary' : 'bg-accent'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <div className="mt-4 p-3.5 rounded-xl bg-muted text-xs text-muted-foreground">
            Status atual: <span className="font-medium" style={{ color: hiringStatus.color }}>{hiringStatus.label}</span>
            <br />
            <span className="text-muted-foreground/70">A empresa atualiza seu status automaticamente. Volte a esta página para acompanhar.</span>
          </div>
        </motion.div>

        {/* DISC Results */}
        {sim.disc_results && (
          <div className="mb-8">
            <DiscResults results={sim.disc_results} />
          </div>
        )}

        {/* Enhanced Analysis Report */}
        <div className="mb-8">
          <AnalysisReport sim={sim} />
        </div>

        {/* Soft Skills deep analysis */}
        <SoftSkillsDetail sim={sim} />

        {/* Personality Analysis */}
        {sim.personality_analysis && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <InsightCard icon={Brain} title="Análise de Personalidade" accent="cyan">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.personality_analysis}</p>
            </InsightCard>
            <InsightCard icon={TrendingUp} title="Estilo de Trabalho" accent="violet">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.work_style}</p>
            </InsightCard>
            <InsightCard icon={CheckCircle2} title="Seus Pontos Fortes" accent="emerald">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.strengths_detail}</p>
            </InsightCard>
            <InsightCard icon={AlertTriangle} title="Pontos a Desenvolver" accent="amber">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.weaknesses_detail}</p>
            </InsightCard>
          </div>
        )}

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Resumo da Avaliação</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{sim.summary || 'Avaliação em processamento.'}</p>
        </motion.div>

        {/* AI detection notice */}
        {aiFlags.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[hsl(0,72%,51%,0.04)] border border-[hsl(0,72%,51%,0.2)] rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[hsl(0,72%,60%)]" />
              <span className="text-sm font-medium text-[hsl(0,72%,65%)]">Atenção: Padrões de IA Detectados</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detectamos {aiFlags.length} resposta(s) com possível uso de IA externa. Isso foi registrado e comunicado à empresa. Respostas autênticas demonstram seu potencial real.
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[hsl(160,60%,45%,0.04)] border border-[hsl(160,60%,45%,0.2)] rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[hsl(160,60%,55%)]" />
              <span className="text-sm font-medium text-[hsl(160,60%,65%)]">Respostas Autênticas</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Nenhuma evidência de uso de IA externa foi detectada em suas respostas escritas.</p>
          </motion.div>
        )}

        {/* Skill Graph + DNA */}
        {competencies.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Seu Skill Graph</span>
              </div>
              <SkillGraph scores={sim.skill_scores} competencies={competencies} />
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-foreground">Seu Skill DNA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-[hsl(160,60%,55%)] uppercase mb-2 tracking-wider">Fortalezas</div>
                  {(sim.skill_dna?.strengths || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-xl bg-[hsl(160,60%,45%,0.04)] border border-[hsl(160,60%,45%,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{s.competency}</span>
                        <span className="text-sm font-mono text-[hsl(160,60%,55%)]">{s.score}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.evidence}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-mono text-[hsl(30,80%,60%)] uppercase mb-2 tracking-wider">Áreas para Desenvolver</div>
                  {(sim.skill_dna?.growth_areas || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-xl bg-[hsl(30,80%,55%,0.04)] border border-[hsl(30,80%,55%,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{s.competency}</span>
                        <span className="text-sm font-mono text-[hsl(30,80%,60%)]">{s.score}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response history */}
        {responses.length > 0 && (
          <div className="mb-8">
            <h3 className="font-heading text-xl text-foreground mb-5 flex items-center gap-2.5">
              <PenLine className="w-4 h-4 text-brand-violet" />
              Suas Respostas ({responses.length} perguntas)
            </h3>
            <div className="space-y-3">
              {responses.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      r.is_choice ? 'bg-primary/10 text-primary' : 'bg-brand-violet/10 text-brand-violet'
                    }`}>
                      {r.is_choice ? <MousePointerClick className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
                      {r.is_choice && r.justification ? 'Escolha + justificativa' : r.is_choice ? 'Escolha' : 'Escrita'}
                    </span>
                    <span className="text-xs text-muted-foreground/70">Q{i + 1} · {r.phase_title || `Fase ${r.phase_index + 1}`}</span>
                    {r.time_spent_seconds != null && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/50 ml-auto">
                        <Clock className="w-3 h-3" />
                        {Math.floor(r.time_spent_seconds / 60)}m {r.time_spent_seconds % 60}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/70 italic mb-2.5 leading-relaxed">"{r.question_prompt}"</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{r.answer || '—'}</p>
                  {r.justification && r.justification !== r.answer && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 pl-3 border-l-2 border-primary/30">{r.justification}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/candidate')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-violet text-foreground font-semibold text-sm hover:bg-brand-violet/90 transition-colors shadow-lg shadow-brand-violet/20">
            <Award className="w-4 h-4" />
            Ver no Talent Passport
          </button>
          <button onClick={() => navigate('/candidate')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-accent border border-border text-foreground/80 font-semibold text-sm hover:bg-accent transition-colors">
            <TrendingUp className="w-4 h-4" />
            Explorar Mais Vagas
          </button>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, accent, children }) {
  const accentColor = accent === 'cyan' ? 'text-primary'
    : accent === 'violet' ? 'text-brand-violet'
    : accent === 'emerald' ? 'text-emerald-400'
    : 'text-amber-400';
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}