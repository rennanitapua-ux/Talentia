import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, AlertTriangle, MessageSquare, CheckCircle2, Clock, FileText, Phone, Briefcase, Brain, TrendingUp, Download, Printer, Gauge } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import AnalysisReport from '@/components/AnalysisReport';
import DiscSummaryCard from '@/components/company/DiscSummaryCard';
import IntegrityCard from '@/components/company/IntegrityCard';
import BehaviorProfile from '@/components/company/BehaviorProfile';
import SoftSkillsDetail from '@/components/company/SoftSkillsDetail';
import CompetencyLevels from '@/components/company/CompetencyLevels';
import SituationReplay from '@/components/company/SituationReplay';
import { getRecommendation } from '@/lib/skillScoring';
import { getSituations } from '@/lib/situations';

const HIRING_STATUS = {
  em_analise: { label: 'Em Análise', color: '#64748b', bg: 'bg-muted', text: 'text-muted-foreground' },
  convocacao_entrevista: { label: 'Convocado para Entrevista', color: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  entrevista_agendada: { label: 'Entrevista Agendada', color: '#8b5cf6', bg: 'bg-brand-violet/15', text: 'text-brand-violet' },
  aprovado: { label: 'Aprovado', color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  reprovado: { label: 'Reprovado', color: '#ef4444', bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

export default function CompanyCandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sim, setSim] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    base44.entities.Simulation.get(id).then(async (s) => {
      setSim(s);
      if (s?.job_id) {
        const j = await base44.entities.Job.get(s.job_id);
        setJob(j);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateHiringStatus = async (status) => {
    setUpdatingStatus(true);
    try {
      await base44.entities.Simulation.update(sim.id, { hiring_status: status });
      setSim({ ...sim, hiring_status: status });
    } catch (e) {
      alert('Erro ao atualizar status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Simulação não encontrada</div>;

  const rec = getRecommendation(sim.overall_score || 0);
  const responses = sim.responses || [];
  const competencies = Object.keys(sim.skill_scores || {});
  const aiFlags = sim.ai_flags || [];
  const totalTime = sim.total_time_seconds || responses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
  const hiringStatus = HIRING_STATUS[sim.hiring_status] || HIRING_STATUS.em_analise;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{sim.candidate_name}</div>
            <div className="text-xs text-muted-foreground/70">{sim.job_title} · {sim.company_name}</div>
          </div>
          <SkillScoreBadge score={sim.overall_score || 0} size="md" />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-muted border border-border text-foreground/80 hover:bg-accent text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Candidate profile + hiring status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center text-xl font-bold flex-shrink-0">
                {sim.candidate_profile_photo ? (
                  <img src={sim.candidate_profile_photo} alt={sim.candidate_name} className="w-full h-full object-cover" />
                ) : (
                  (sim.candidate_name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl text-foreground mb-1">{sim.candidate_name}</h2>
                {sim.candidate_email && <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><MessageSquare className="w-3 h-3" />{sim.candidate_email}</div>}
                {sim.candidate_phone && <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3" />{sim.candidate_phone}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sim.candidate_resume_url && (
                <a href={sim.candidate_resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-medium hover:bg-[hsl(190,85%,45%,0.12)] transition-colors">
                  <FileText className="w-4 h-4" />
                  Ver Currículo
                  <Download className="w-3 h-3 ml-auto" />
                </a>
              )}
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-muted border border-border text-muted-foreground text-xs">
                <Clock className="w-4 h-4 text-muted-foreground/70" />
                Tempo total: {formatTime(totalTime)}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Status do Processo</span>
            </div>
            <div className={`px-3 py-2.5 rounded-xl ${hiringStatus.bg} mb-4`}>
              <span className={`text-sm font-bold ${hiringStatus.text}`}>{hiringStatus.label}</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(HIRING_STATUS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => updateHiringStatus(key)}
                  disabled={updatingStatus || sim.hiring_status === key}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    sim.hiring_status === key
                      ? `${val.bg} ${val.text} border border-current`
                      : 'bg-muted text-muted-foreground hover:bg-accent border border-transparent'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* DISC (clickable for full detail) + integrity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <DiscSummaryCard sim={sim} />
          <IntegrityCard sim={sim} />
        </div>

        {/* How the candidate acts */}
        {sim.behavioral_profile && (
          <div className="mb-8">
            <BehaviorProfile profile={sim.behavioral_profile} />
          </div>
        )}

        {/* Soft Skills deep analysis */}
        <SoftSkillsDetail sim={sim} />

        {/* Required vs demonstrated levels */}
        <CompetencyLevels sim={sim} />

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Avaliação Final</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-2 rounded-xl" style={{ background: rec.color === 'emerald' ? 'hsl(160,60%,45%,0.1)' : rec.color === 'amber' ? 'hsl(30,80%,55%,0.1)' : 'hsl(0,72%,51%,0.1)' }}>
                <span className="text-sm font-bold" style={{ color: rec.color === 'emerald' ? 'hsl(160,60%,55%)' : rec.color === 'amber' ? 'hsl(30,80%,60%)' : 'hsl(0,72%,60%)' }}>
                  {sim.recommendation || rec.label}
                </span>
              </div>
              {sim.focus_violations > 0 && (
                <div className="flex items-center gap-1.5 text-[hsl(0,72%,60%)] text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {sim.focus_violations} violações
                </div>
              )}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{sim.summary || 'Avaliação em processamento.'}</p>
          </div>
        </motion.div>

        {/* Enhanced Analysis Report */}
        <div className="mb-8">
          <AnalysisReport sim={sim} />
        </div>

        {/* Personality Analysis */}
        {sim.personality_analysis && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <InsightCard icon={Brain} title="Análise de Personalidade" accent="cyan">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.personality_analysis}</p>
            </InsightCard>
            <InsightCard icon={TrendingUp} title="Estilo de Trabalho" accent="violet">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.work_style}</p>
            </InsightCard>
            <InsightCard icon={CheckCircle2} title="Pontos Fortes" accent="emerald">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.strengths_detail}</p>
            </InsightCard>
            <InsightCard icon={AlertTriangle} title="Pontos de Atenção" accent="amber">
              <p className="text-sm text-foreground/80 leading-relaxed">{sim.weaknesses_detail}</p>
            </InsightCard>
          </div>
        )}

        {/* Skill Graph */}
        {competencies.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Skill Graph</span>
              </div>
              <SkillGraph scores={sim.skill_scores} competencies={competencies} />
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-foreground">Skill DNA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-[hsl(160,60%,55%)] uppercase mb-2 tracking-wider">Fortalezas</div>
                  {(sim.skill_dna?.strengths || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-xl bg-[hsl(160,60%,45%,0.04)] border border-[hsl(160,60%,45%,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{s.competency}</span>
                        <span className="text-xs font-mono text-[hsl(160,60%,55%)]">{s.score}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.evidence}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-mono text-[hsl(30,80%,60%)] uppercase mb-2 tracking-wider">Áreas de Desenvolvimento</div>
                  {(sim.skill_dna?.growth_areas || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-xl bg-[hsl(30,80%,55%,0.04)] border border-[hsl(30,80%,55%,0.2)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{s.competency}</span>
                        <span className="text-xs font-mono text-[hsl(30,80%,60%)]">{s.score}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Composition + Assessment Confidence */}
        {sim.score_composition?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Composição do Score</span>
              <span className="text-xs text-muted-foreground/60 ml-auto">como o score geral foi calculado</span>
            </div>
            <div className="space-y-3">
              {sim.score_composition.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{item.competency}</span>
                      <span className="text-xs font-mono text-muted-foreground">{item.score}/100 · peso {(item.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                  <div className="text-right w-20">
                    <div className="text-sm font-mono font-bold text-primary">+{item.contribution?.toFixed(1) || '0.0'}</div>
                    <div className="text-[10px] text-muted-foreground/60">contribuição</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold text-foreground">Score Geral</span>
                <span className="text-2xl font-bold font-mono text-primary">{sim.overall_score || 0}</span>
              </div>
            </div>
            {sim.overall_confidence && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground/70">Confiança da avaliação:</span>
                <span className={`font-medium px-2 py-0.5 rounded-md ${
                  sim.overall_confidence === 'high' ? 'bg-emerald-500/15 text-emerald-400' :
                  sim.overall_confidence === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-rose-500/15 text-rose-400'
                }`}>
                  {sim.overall_confidence === 'high' ? 'Alta' : sim.overall_confidence === 'medium' ? 'Média' : 'Baixa'}
                </span>
                {sim.assessment_confidence?.reasoning && (
                  <span className="text-muted-foreground/60">— {sim.assessment_confidence.reasoning}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Situation-by-situation replay */}
        <SituationReplay responses={responses} situations={getSituations(job)} />
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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}