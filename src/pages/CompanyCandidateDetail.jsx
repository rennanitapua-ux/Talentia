import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, AlertTriangle, Bot, MessageSquare, CheckCircle2, XCircle, CircleDot, Play, MousePointerClick, PenLine, Clock, FileText, Phone, MapPin, User, Briefcase, Brain, TrendingUp, Calendar, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import DiscResults from '@/components/DiscResults';
import { getEvidenceMarker, getRecommendation } from '@/lib/skillScoring';
import { DISC_PROFILES } from '@/lib/discTest';

const HIRING_STATUS = {
  em_analise: { label: 'Em Análise', color: '#64748b', bg: 'bg-slate-500/15', text: 'text-slate-400' },
  convocacao_entrevista: { label: 'Convocado para Entrevista', color: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  entrevista_agendada: { label: 'Entrevista Agendada', color: '#8b5cf6', bg: 'bg-violet-500/15', text: 'text-violet-400' },
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Simulação não encontrada</div>;

  const rec = getRecommendation(sim.overall_score || 0);
  const responses = sim.responses || [];
  const current = responses[activeResponse];
  const competencies = Object.keys(sim.skill_scores || {});
  const aiFlags = sim.ai_flags || [];
  const totalTime = sim.total_time_seconds || responses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
  const hiringStatus = HIRING_STATUS[sim.hiring_status] || HIRING_STATUS.em_analise;
  const discProfile = sim.disc_results ? DISC_PROFILES[sim.disc_results.dominant] : null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">{sim.candidate_name}</div>
            <div className="text-[10px] text-slate-500 font-mono">{sim.job_title} · {sim.company_name}</div>
          </div>
          <SkillScoreBadge score={sim.overall_score || 0} size="md" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Candidate profile + hiring status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Profile card */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xl font-bold flex-shrink-0">
                {sim.candidate_profile_photo ? (
                  <img src={sim.candidate_profile_photo} alt={sim.candidate_name} className="w-full h-full object-cover" />
                ) : (
                  (sim.candidate_name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{sim.candidate_name}</h2>
                {sim.candidate_email && <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1"><MessageSquare className="w-3 h-3" />{sim.candidate_email}</div>}
                {sim.candidate_phone && <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3" />{sim.candidate_phone}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {sim.candidate_resume_url && (
                <a href={sim.candidate_resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-colors">
                  <FileText className="w-4 h-4" />
                  Ver Currículo
                  <Download className="w-3 h-3 ml-auto" />
                </a>
              )}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-400 text-xs">
                <Clock className="w-4 h-4 text-slate-500" />
                Tempo total: {formatTime(totalTime)}
              </div>
            </div>
          </div>

          {/* Hiring status management */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Status do Processo</span>
            </div>
            <div className={`px-3 py-2 rounded-lg ${hiringStatus.bg} mb-4`}>
              <span className={`text-sm font-bold ${hiringStatus.text}`}>{hiringStatus.label}</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(HIRING_STATUS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => updateHiringStatus(key)}
                  disabled={updatingStatus || sim.hiring_status === key}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    sim.hiring_status === key
                      ? `${val.bg} ${val.text} border border-current`
                      : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/60 border border-transparent'
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

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Avaliação Final</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 rounded-lg" style={{ background: `${rec.color === 'emerald' ? '#10b98115' : rec.color === 'amber' ? '#f59e0b15' : '#f43f5e15'}` }}>
                <span className="text-sm font-bold" style={{ color: rec.color === 'emerald' ? '#10b981' : rec.color === 'amber' ? '#f59e0b' : '#f43f5e' }}>
                  {sim.recommendation || rec.label}
                </span>
              </div>
              {sim.focus_violations > 0 && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {sim.focus_violations} violações de integridade
                </div>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{sim.summary || 'Avaliação em processamento.'}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">Detecção de IA</span>
            </div>
            {aiFlags.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Sem evidências de IA
              </div>
            ) : (
              <div className="space-y-2">
                {aiFlags.map((flag, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-3 h-3" />
                      Fase {(flag.phase_index || 0) + 1} — {flag.confidence}% confiança
                    </div>
                    <div className="text-slate-500 mt-0.5 pl-4">{flag.analysis}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Personality Analysis */}
        {sim.personality_analysis && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Análise de Personalidade</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.personality_analysis}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold">Estilo de Trabalho</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.work_style}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">Pontos Fortes</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.strengths_detail}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold">Pontos de Atenção</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{sim.weaknesses_detail}</p>
            </div>
          </div>
        )}

        {/* Skill Graph */}
        {competencies.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Skill Graph</span>
              </div>
              <SkillGraph scores={sim.skill_scores} competencies={competencies} />
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Skill DNA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase mb-2">Fortalezas</div>
                  {(sim.skill_dna?.strengths || []).map((s, i) => (
                    <div key={i} className="mb-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-xs font-mono text-emerald-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{s.evidence}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-400 uppercase mb-2">Áreas de Desenvolvimento</div>
                  {(sim.skill_dna?.growth_areas || []).map((s, i) => (
                    <div key={i} className="mb-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-xs font-mono text-amber-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{s.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response replay */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            Replay da Simulação
          </h3>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {responses.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveResponse(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeResponse === i ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
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
            <motion.div key={activeResponse} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
              {/* Phase badge + time */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium ${
                  current.is_choice ? 'bg-cyan-500/15 text-cyan-300' : 'bg-violet-500/15 text-violet-300'
                }`}>
                  {current.is_choice ? <MousePointerClick className="w-3 h-3" /> : <PenLine className="w-3 h-3" />}
                  {current.is_choice ? 'Múltipla Escolha' : 'Resposta Escrita'}
                </span>
                <span className="text-xs text-slate-500">{current.phase_title || `Fase ${current.phase_index + 1}`}</span>
                {current.time_spent_seconds != null && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                    <Clock className="w-3 h-3" />
                    {Math.floor(current.time_spent_seconds / 60)}m {current.time_spent_seconds % 60}s
                  </span>
                )}
              </div>

              {/* Question */}
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase mb-2">Pergunta</div>
                <div className="flex items-start gap-3">
                  {current.character_name && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {current.character_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    {current.character_name && (
                      <div className="text-xs text-slate-500 mb-1">{current.character_name} · {current.character_role}</div>
                    )}
                    <p className="text-sm text-slate-200 italic">"{current.question_prompt}"</p>
                  </div>
                </div>
              </div>

              {/* Candidate response */}
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase mb-2">Resposta do Candidato</div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-200">{current.answer || '—'}</p>
                </div>
              </div>

              {/* Analysis — only for write questions */}
              {current.analysis && !current.is_choice && (
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">Análise da IA</div>
                  <div className="space-y-3">
                    {Object.entries(current.analysis.competency_scores || {}).map(([comp, data]) => {
                      const marker = getEvidenceMarker(data.score);
                      const Icon = data.evidence === '✓' ? CheckCircle2 : data.evidence === '✗' ? XCircle : CircleDot;
                      const color = marker.color === 'emerald' ? 'text-emerald-400' : marker.color === 'amber' ? 'text-amber-400' : 'text-rose-400';
                      return (
                        <div key={comp} className="bg-slate-800/30 rounded-lg p-3 border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color}`} />
                              <span className="text-sm font-medium">{comp}</span>
                            </div>
                            <span className={`text-lg font-bold font-mono ${color}`}>{data.score}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">{data.justification}</p>
                          {data.evidence_quote && (
                            <p className="text-xs text-slate-500 italic mt-1">"{data.evidence_quote}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {current.analysis.ai_detection && (
                    <div className={`mt-3 p-3 rounded-lg border ${current.analysis.ai_detection.is_ai_generated ? 'bg-rose-500/5 border-rose-500/30' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className={`w-3.5 h-3.5 ${current.analysis.ai_detection.is_ai_generated ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <span className="text-xs font-medium">
                          {current.analysis.ai_detection.is_ai_generated ? 'Possível resposta gerada por IA' : 'Resposta autêntica'}
                        </span>
                        <span className="text-xs font-mono text-slate-500">({current.analysis.ai_detection.confidence}%)</span>
                      </div>
                      <p className="text-xs text-slate-400">{current.analysis.ai_detection.analysis}</p>
                    </div>
                  )}

                  {current.analysis.detailed_feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                      <div className="text-xs font-mono text-slate-500 uppercase mb-1">Feedback Detalhado</div>
                      <p className="text-xs text-slate-300">{current.analysis.detailed_feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Choice question — no AI analysis note */}
              {current.is_choice && (
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Resposta de múltipla escolha — análise de IA aplicada apenas em respostas escritas. Apenas integridade (tela, colar, pesquisar) é monitorada.
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