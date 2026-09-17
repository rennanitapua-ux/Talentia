import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, AlertTriangle, Bot, MessageSquare, CheckCircle2, Play, MousePointerClick, PenLine, Clock, FileText, Phone, Briefcase, Brain, TrendingUp, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import DiscResults from '@/components/DiscResults';
import AnalysisReport from '@/components/AnalysisReport';
import ResponseAnalysis from '@/components/ResponseAnalysis';
import { getRecommendation } from '@/lib/skillScoring';
import { DISC_PROFILES } from '@/lib/discTest';
import Logo from '@/components/Logo';

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
  const [activeResponse, setActiveResponse] = useState(0);
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-[hsl(190,85%,45%)] border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Simulação não encontrada</div>;

  const rec = getRecommendation(sim.overall_score || 0);
  const responses = sim.responses || [];
  const current = responses[activeResponse];
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
                      : 'bg-muted text-muted-foreground hover:bg-[hsl(240,8%,14%)] border border-transparent'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* DISC Results */}
        {sim.disc_results && (
          <div className="mb-8">
            <DiscResults results={sim.disc_results} />
          </div>
        )}

        {/* Summary + AI Detection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-card">
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
            <p className="text-sm text-foreground/80 leading-relaxed">{sim.summary || 'Avaliação em processamento.'}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-brand-violet" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-violet">Detecção de IA</span>
            </div>
            {aiFlags.length === 0 ? (
              <div className="flex items-center gap-2 text-[hsl(160,60%,55%)] text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Sem evidências de IA
              </div>
            ) : (
              <div className="space-y-2">
                {aiFlags.map((flag, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 text-[hsl(0,72%,60%)]">
                      <AlertTriangle className="w-3 h-3" />
                      Fase {(flag.phase_index || 0) + 1} — {flag.confidence}% confiança
                    </div>
                    <div className="text-muted-foreground/70 mt-0.5 pl-4">{flag.analysis}</div>
                  </div>
                ))}
              </div>
            )}
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

        {/* Response replay */}
        <div>
          <h3 className="font-heading text-xl text-foreground mb-5 flex items-center gap-2.5">
            <Play className="w-4 h-4 text-primary" />
            Replay da Simulação
          </h3>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {responses.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveResponse(i)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
                  activeResponse === i
                    ? 'bg-primary text-[hsl(240,15%,3.5%)] font-semibold'
                    : 'bg-card text-muted-foreground hover:bg-[hsl(240,10%,10%)] border border-border'
                }`}
              >
                Q{String(i + 1).padStart(2, '0')}
                {r.time_spent_seconds != null && (
                  <span className="ml-1.5 text-[10px] opacity-60">{Math.floor(r.time_spent_seconds / 60)}:{String(r.time_spent_seconds % 60).padStart(2, '0')}</span>
                )}
              </button>
            ))}
          </div>

          {current && (
            <motion.div key={activeResponse} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  current.is_choice ? 'bg-primary/10 text-primary' : 'bg-brand-violet/10 text-brand-violet'
                }`}>
                  {current.is_choice ? <MousePointerClick className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
                  {current.is_choice ? 'Múltipla Escolha' : 'Resposta Escrita'}
                </span>
                <span className="text-xs text-muted-foreground/70">{current.phase_title || `Fase ${current.phase_index + 1}`}</span>
                {current.time_spent_seconds != null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/70 ml-auto">
                    <Clock className="w-3 h-3" />
                    {Math.floor(current.time_spent_seconds / 60)}m {current.time_spent_seconds % 60}s
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-2.5">Pergunta</div>
                <div className="flex items-start gap-3">
                  {current.character_name && (
                    <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {current.character_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    {current.character_name && (
                      <div className="text-xs text-muted-foreground/70 mb-1">{current.character_name} · {current.character_role}</div>
                    )}
                    <p className="text-sm text-foreground/90 italic leading-relaxed">"{current.question_prompt}"</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-2.5">Resposta do Candidato</div>
                <div className="bg-muted border border-border rounded-xl p-4">
                  <p className="text-sm text-foreground/90 leading-relaxed">{current.answer || '—'}</p>
                </div>
              </div>

              {current.analysis && !current.is_choice && (
                <div>
                  <div className="text-xs font-mono text-muted-foreground/70 uppercase tracking-wider mb-3">Análise Detalhada</div>
                  <ResponseAnalysis analysis={current.analysis} />
                </div>
              )}

              {current.is_choice && (
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Resposta de múltipla escolha — análise de IA aplicada apenas em respostas escritas. Integridade (tela, colar, pesquisar) é monitorada.
                  </div>
                </div>
              )}
            </motion.div>
          )}
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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}