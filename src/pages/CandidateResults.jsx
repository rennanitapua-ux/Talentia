import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Bot, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Clock, Brain, Briefcase, MessageSquare, PenLine, MousePointerClick } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import DiscResults from '@/components/DiscResults';
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
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Resultado não encontrado</div>;

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
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/candidate')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Seu Resultado</div>
            <div className="text-[10px] text-slate-500 font-mono">{sim.job_title} · {sim.company_name}</div>
          </div>
          <button onClick={() => navigate('/candidate/passport')} className="text-xs text-violet-400 hover:text-violet-300">
            Ver Talent Passport →
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero result */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300 text-xs font-mono tracking-wider uppercase">Avaliação Completa</span>
          </div>
          <div className="flex justify-center mb-4">
            <SkillScoreBadge score={sim.overall_score || 0} size="xl" />
          </div>
          <div className="inline-block px-4 py-1.5 rounded-lg" style={{ background: rec.color === 'emerald' ? '#10b98115' : rec.color === 'amber' ? '#f59e0b15' : '#f43f5e15' }}>
            <span className="text-sm font-bold" style={{ color: rec.color === 'emerald' ? '#10b981' : rec.color === 'amber' ? '#f59e0b' : '#f43f5e' }}>
              {sim.recommendation || rec.label}
            </span>
          </div>
          {totalTime > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Tempo total: {formatTime(totalTime)}
            </div>
          )}
        </motion.div>

        {/* Hiring process tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">Andamento do Processo de Contratação</span>
          </div>
          {sim.hiring_status === 'reprovado' ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-sm font-medium text-rose-300">Processo Encerrado</div>
                <div className="text-xs text-slate-400">Infelizmente você não avançou neste processo. Continue se candidatando a outras vagas.</div>
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isComplete ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                      } ${isCurrent ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] text-center ${isComplete ? 'text-cyan-300' : 'text-slate-600'}`}>{s.label}</span>
                    </div>
                    {i < HIRING_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full ${currentStepIdx > i ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <div className="mt-4 p-3 rounded-lg bg-slate-800/30 text-xs text-slate-400">
            Status atual: <span className="font-medium" style={{ color: hiringStatus.color }}>{hiringStatus.label}</span>
            <br />
            <span className="text-slate-500">A empresa atualiza seu status automaticamente. Volte a esta página para acompanhar.</span>
          </div>
        </motion.div>

        {/* DISC Results */}
        {sim.disc_results && (
          <div className="mb-6">
            <DiscResults results={sim.disc_results} />
          </div>
        )}

        {/* Personality Analysis */}
        {sim.personality_analysis && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Análise de Personalidade</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.personality_analysis}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold">Estilo de Trabalho</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.work_style}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">Seus Pontos Fortes</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.strengths_detail}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold">Pontos a Desenvolver</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.weaknesses_detail}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Resumo da Avaliação</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{sim.summary || 'Avaliação em processamento.'}</p>
        </motion.div>

        {/* AI detection notice */}
        {aiFlags.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-300">Atenção: Padrões de IA Detectados</span>
            </div>
            <p className="text-xs text-slate-400">
              Detectamos {aiFlags.length} resposta(s) com possível uso de IA externa. Isso foi registrado e comunicado à empresa. Respostas autênticas demonstram seu potencial real.
            </p>
          </motion.div>
        )}

        {aiFlags.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Respostas Autênticas</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Nenhuma evidência de uso de IA externa foi detectada em suas respostas escritas.</p>
          </motion.div>
        )}

        {/* Skill Graph + DNA */}
        {competencies.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Seu Skill Graph</span>
              </div>
              <SkillGraph scores={sim.skill_scores} competencies={competencies} />
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Seu Skill DNA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase mb-2">Fortalezas</div>
                  {(sim.skill_dna?.strengths || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-sm font-mono text-emerald-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400">{s.evidence}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-400 uppercase mb-2">Áreas para Desenvolver</div>
                  {(sim.skill_dna?.growth_areas || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-sm font-mono text-amber-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400">{s.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response history — questions and progress */}
        {responses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PenLine className="w-4 h-4 text-violet-400" />
              Suas Respostas ({responses.length} perguntas)
            </h3>
            <div className="space-y-3">
              {responses.map((r, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      r.is_choice ? 'bg-cyan-500/15 text-cyan-300' : 'bg-violet-500/15 text-violet-300'
                    }`}>
                      {r.is_choice ? <MousePointerClick className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
                      {r.is_choice ? 'Escolha' : 'Escrita'}
                    </span>
                    <span className="text-xs text-slate-500">Q{i + 1} · {r.phase_title || `Fase ${r.phase_index + 1}`}</span>
                    {r.time_spent_seconds != null && (
                      <span className="flex items-center gap-1 text-xs text-slate-600 ml-auto">
                        <Clock className="w-3 h-3" />
                        {Math.floor(r.time_spent_seconds / 60)}m {r.time_spent_seconds % 60}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 italic mb-2">"{r.question_prompt}"</p>
                  <p className="text-sm text-slate-200">{r.answer || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/candidate/passport')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400">
            <Award className="w-4 h-4" />
            Ver no Talent Passport
          </button>
          <button onClick={() => navigate('/candidate')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700">
            <TrendingUp className="w-4 h-4" />
            Explorar Mais Vagas
          </button>
        </div>
      </div>
    </div>
  );
}