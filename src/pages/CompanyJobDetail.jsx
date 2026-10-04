import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Users, Play, Eye, Award, Briefcase, Target, Layers, GitCompare, Link2, Check, Copy, Filter, ChevronDown, Armchair, Brain, BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import { getEvidenceMarker } from '@/lib/skillScoring';
import { getSituations } from '@/lib/situations';
import SituationPreview from '@/components/jobs/SituationPreview';
import { seatStatus } from '@/lib/seats';
import { ADERENCIA, ADERENCIA_ORDER } from '@/lib/aderencia';
import { generateAssessment, buildFallbackAssessment } from '@/lib/ai/generateAssessment';
import AssessmentVersionHistory from '@/components/company/AssessmentVersionHistory';

const HIRING_STATUS = {
  em_analise: { label: 'Em Análise', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
  convocacao_entrevista: { label: 'Convocado', color: 'text-blue-400', bg: 'bg-blue-500/15', dot: 'bg-blue-400' },
  entrevista_agendada: { label: 'Entrevista', color: 'text-brand-violet', bg: 'bg-brand-violet/15', dot: 'bg-brand-violet' },
  aprovado: { label: 'Aprovado', color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-400' },
  reprovado: { label: 'Reprovado', color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-400' },
};

const PIPELINE_STEPS = ['em_analise', 'convocacao_entrevista', 'entrevista_agendada', 'aprovado'];

export default function CompanyJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('candidates');
  const [copied, setCopied] = useState(false);
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Job.get(id),
      base44.entities.Simulation.filter({ job_id: id }, '-overall_score', 50),
    ]).then(([j, s]) => {
      setJob(j);
      setSimulations(s || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Regenera a simulação preservando a versão atual no histórico.
  // Candidatos que já responderam continuam vinculados à versão antiga.
  const regenerateAssessment = async (useFallback = false) => {
    if (!job) return;
    const hasResponses = simulations.some((s) => (s.responses || []).length > 0);
    if (hasResponses) {
      const ok = window.confirm('Já existem candidatos que responderam a esta simulação. A versão atual será preservada no histórico e novos candidatos responderão à nova versão. Continuar?');
      if (!ok) return;
    }
    setRegenerating(true);
    try {
      const data = useFallback ? buildFallbackAssessment(job, (job.assessment?.situations?.length) || 12) : await generateAssessment(job, (job.assessment?.situations?.length) || 12);
      if (!data) { alert('Não conseguimos gerar a simulação agora. Tente novamente.'); return; }
      const versions = job.assessment_versions || [];
      if (job.assessment) {
        versions.push({
          saved_at: new Date().toISOString(),
          source: job.assessment.source,
          situations_count: (job.assessment.situations || []).length,
          note: hasResponses ? 'Regenerada após respostas' : 'Regenerada',
          assessment: job.assessment,
        });
      }
      const updated = await base44.entities.Job.update(job.id, {
        assessment: { version: 2, source: data.source, generated_at: new Date().toISOString(), situations: data.situations },
        virtual_company_profile: data.virtual_company_profile || job.virtual_company_profile,
        assessment_versions: versions,
      });
      setJob(updated);
    } catch (e) {
      alert('Erro ao regenerar simulação.');
    } finally {
      setRegenerating(false);
    }
  };

  const ranked = useMemo(() => {
    let list = [...simulations].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    if (scoreFilter !== 'all') {
      list = list.filter(s => {
        const score = s.overall_score || 0;
        if (scoreFilter === 'high') return score >= 75;
        if (scoreFilter === 'medium') return score >= 50 && score < 75;
        if (scoreFilter === 'low') return score < 50;
        return true;
      });
    }
    if (statusFilter !== 'all') {
      list = list.filter(s => (s.hiring_status || 'em_analise') === statusFilter);
    }
    return list;
  }, [simulations, scoreFilter, statusFilter]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!job) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Vaga não encontrada</div>;

  const shareUrl = `${window.location.origin}/candidatura/vaga/${id}`;
  const completedSims = simulations.filter(s => s.status === 'completed');
  const inProgressSims = simulations.filter(s => s.status === 'in_progress');
  const seats = seatStatus(job, simulations);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/company')} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">{job.title}</div>
            <div className="text-[10px] text-muted-foreground/70 font-mono">{job.role} · {job.sector} · {job.company_name}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${job.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>{job.status}</span>
        </div>
      </header>

      {/* Share link bar */}
      <div className="bg-gradient-to-r from-primary/10 via-brand-violet/5 to-transparent border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">Link do Candidato</span>
            <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">compartilhe para receber respostas</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px] bg-card border border-border rounded-lg px-3 py-2.5 text-xs text-foreground/80 font-mono truncate">
              {shareUrl}
            </div>
            <button
              onClick={() => navigate(`/company/jobs/${id}/intelligence`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-brand-violet/15 text-brand-violet hover:bg-brand-violet/25 border border-brand-violet/30 transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              Inteligência da vaga
            </button>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                copied ? 'bg-emerald-500 text-primary-foreground' : 'bg-muted hover:bg-accent text-foreground/90 border border-border'
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Abrir Simulação
            </a>
            <button
              onClick={() => navigate(`/company/jobs/${id}/compare`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-muted text-foreground/80 hover:bg-accent border border-border transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              Comparar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Virtual company profile */}
        {job.virtual_company_profile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">Perfil da Empresa Virtual</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.virtual_company_profile}</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card/60 border border-border rounded-xl p-4">
            <Users className="w-4 h-4 text-brand-violet mb-2" />
            <div className="text-2xl font-bold font-mono">{completedSims.length}</div>
            <div className="text-xs text-muted-foreground/70">Avaliados</div>
          </div>
          <div className="bg-card/60 border border-border rounded-xl p-4">
            <div className="w-4 h-4 mb-2 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /></div>
            <div className="text-2xl font-bold font-mono">{inProgressSims.length}</div>
            <div className="text-xs text-muted-foreground/70">Em andamento</div>
          </div>
          <div className="bg-card/60 border border-border rounded-xl p-4">
            <Target className="w-4 h-4 text-primary mb-2" />
            <div className="text-2xl font-bold font-mono">{(job.competencies || []).length}</div>
            <div className="text-xs text-muted-foreground/70">Competências</div>
          </div>
          <div className="bg-card/60 border border-border rounded-xl p-4">
            <Layers className="w-4 h-4 text-amber-400 mb-2" />
            <div className="text-2xl font-bold font-mono">{getSituations(job).length}</div>
            <div className="text-xs text-muted-foreground/70">Situações</div>
          </div>
        </div>

        {/* Seat tracker */}
        <div className="bg-card/60 border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Armchair className={`w-4 h-4 ${seats.full ? 'text-emerald-400' : 'text-primary'}`} />
              <span className="text-sm font-semibold text-foreground">Assentos</span>
              <span className="text-xs text-muted-foreground/70">{seats.filled} de {seats.openings} preenchidos</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${seats.full ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
              {seats.full ? 'Lotada' : `${seats.available} ${seats.available > 1 ? 'disponíveis' : 'disponível'}`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${seats.full ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${seats.pct}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {[
            { id: 'candidates', label: 'Candidatos', icon: Users },
            { id: 'pipeline', label: 'Pipeline', icon: Filter },
            { id: 'analysis', label: 'Análise', icon: BarChart3 },
            { id: 'scenarios', label: 'Situações', icon: Layers },
            { id: 'competencies', label: 'Competências', icon: Target },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground/70 hover:text-foreground/80'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Candidates tab with filters */}
        {tab === 'candidates' && (
          <div>
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-xs font-medium text-foreground/80 hover:bg-accent transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Filtros
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-xs text-muted-foreground/70">{ranked.length} de {simulations.length} candidatos</span>
              {(scoreFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => { setScoreFilter('all'); setStatusFilter('all'); }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-4 mb-4 flex-wrap">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground/70 uppercase mb-1.5">Score</label>
                  <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none">
                    <option value="all">Todos os scores</option>
                    <option value="high">Alto (75+)</option>
                    <option value="medium">Médio (50-74)</option>
                    <option value="low">Baixo (&lt;50)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground/70 uppercase mb-1.5">Etapa</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none">
                    <option value="all">Todas as etapas</option>
                    {Object.entries(HIRING_STATUS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {ranked.length === 0 && (
                <div className="bg-card/40 border border-dashed border-border rounded-xl p-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">{simulations.length === 0 ? 'Nenhum candidato ainda' : 'Nenhum candidato corresponde aos filtros'}</p>
                  <p className="text-muted-foreground/50 text-xs">{simulations.length === 0 ? 'Compartilhe o link da vaga com candidatos' : 'Ajuste os filtros para ver mais resultados'}</p>
                  {simulations.length === 0 && (
                    <button onClick={() => navigate('/candidate')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm text-foreground/80">
                      <Eye className="w-3.5 h-3.5" />
                      Ver como candidato
                    </button>
                  )}
                </div>
              )}
              {ranked.map((sim, i) => {
                const hiring = HIRING_STATUS[sim.hiring_status || 'em_analise'] || HIRING_STATUS.em_analise;
                return (
                  <motion.button
                    key={sim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/company/candidates/${sim.id}`)}
                    className="w-full text-left bg-card/60 border border-border rounded-xl p-5 hover:border-primary/40 transition-all group flex items-center gap-5"
                  >
                    <div className="text-2xl font-bold font-mono text-muted-foreground/50 w-8 text-center">{i + 1}</div>
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground/80">
                      {sim.candidate_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{sim.candidate_name}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${hiring.bg} ${hiring.color}`}>{hiring.label}</span>
                        {sim.focus_violations > 0 && (
                          <span className="text-xs text-rose-400 flex items-center gap-1">⚠ {sim.focus_violations} violações</span>
                        )}
                        {sim.status !== 'completed' && (
                          <span className="text-xs text-amber-400 font-mono">em andamento</span>
                        )}
                      </div>
                    </div>
                    {sim.status === 'completed' && <SkillScoreBadge score={sim.overall_score || 0} size="md" />}
                    <Eye className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipeline tab */}
        {tab === 'pipeline' && (
          <div>
            {completedSims.length === 0 ? (
              <div className="bg-card/40 border border-dashed border-border rounded-xl p-12 text-center">
                <Filter className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Pipeline vazio — nenhum candidato avaliado ainda</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                {PIPELINE_STEPS.map((step) => {
                  const stepSims = completedSims.filter(s => (s.hiring_status || 'em_analise') === step);
                  const statusInfo = HIRING_STATUS[step];
                  return (
                    <div key={step} className="bg-card/40 border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                        <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                        <span className="text-xs font-semibold text-foreground/80">{statusInfo.label}</span>
                        <span className="text-xs font-mono text-muted-foreground/60 ml-auto">{stepSims.length}</span>
                      </div>
                      <div className="space-y-2">
                        {stepSims.length === 0 && (
                          <p className="text-[11px] text-muted-foreground/40 text-center py-4">Vazio</p>
                        )}
                        {stepSims.map(sim => (
                          <button
                            key={sim.id}
                            onClick={() => navigate(`/company/candidates/${sim.id}`)}
                            className="w-full text-left p-3 rounded-lg bg-muted/40 border border-border hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                {sim.candidate_name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-foreground truncate flex-1">{sim.candidate_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted-foreground/60">{sim.overall_score || 0}/100</span>
                              <span className="text-[10px] text-muted-foreground/50">{sim.recommendation?.split(' —')[0] || ''}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {completedSims.filter(s => s.hiring_status === 'reprovado').length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-xs font-semibold text-rose-400">Reprovados</span>
                  <span className="text-xs font-mono text-muted-foreground/60">{completedSims.filter(s => s.hiring_status === 'reprovado').length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {completedSims.filter(s => s.hiring_status === 'reprovado').map(sim => (
                    <button
                      key={sim.id}
                      onClick={() => navigate(`/company/candidates/${sim.id}`)}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                        {sim.candidate_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground/70">{sim.candidate_name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/50">{sim.overall_score || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'analysis' && (
          <div className="space-y-6">
            {/* Distribuição de aderência dos candidatos desta vaga */}
            <div className="bg-card/60 border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Distribuição de aderência</h3>
                </div>
                <button onClick={() => navigate(`/company/jobs/${id}/intelligence`)} className="flex items-center gap-1.5 text-xs text-brand-violet hover:text-brand-violet/80">
                  <Brain className="w-3.5 h-3.5" /> Ver inteligência completa da vaga
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70 mb-5">Nível demonstrado vs. exigido por competência — somado por candidato. Nunca "nota alta = melhor"; o contexto da vaga define o suficiente.</p>
              {(() => {
                const dist = { atende: 0, supera: 0, parcial: 0, abaixo: 0, validar: 0, insuficiente: 0 };
                completedSims.forEach((s) => {
                  if (!s.aderencia?.distribution) return;
                  Object.keys(dist).forEach((k) => { dist[k] += s.aderencia.distribution[k] || 0; });
                });
                const max = Math.max(1, ...Object.values(dist));
                const hasAny = Object.values(dist).some((v) => v > 0);
                if (!hasAny) return <p className="text-xs text-muted-foreground/50 py-4 text-center">Nenhum candidato avaliado com aderência calculada ainda.</p>;
                return (
                  <div className="space-y-2.5">
                    {ADERENCIA_ORDER.map((key) => {
                      const entry = Object.values(ADERENCIA).find((a) => a.key === key);
                      const count = dist[key] || 0;
                      const pct = Math.round((count / max) * 100);
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <div className="w-28 text-xs text-foreground/80 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                            {entry.short}
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: entry.color }} />
                          </div>
                          <div className="w-10 text-right text-xs font-mono text-muted-foreground">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Resumo por candidato */}
            <div className="bg-card/60 border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Aderência por candidato</h3>
              <div className="space-y-2">
                {completedSims.length === 0 && <p className="text-xs text-muted-foreground/50 py-4 text-center">Nenhum candidato avaliado ainda.</p>}
                {completedSims.map((s) => {
                  const a = s.aderencia;
                  const top = a ? Object.entries(a.distribution || {}).sort(([, x], [, y]) => y - x)[0] : null;
                  const topEntry = top ? Object.values(ADERENCIA).find((ad) => ad.key === top[0]) : null;
                  return (
                    <button key={s.id} onClick={() => navigate(`/company/candidates/${s.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all text-left">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{s.candidate_name?.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-foreground flex-1 truncate">{s.candidate_name}</span>
                      {topEntry && <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: `${topEntry.color}20`, color: topEntry.color }}>{topEntry.short} {top[1]}</span>}
                      <span className="text-xs font-mono text-muted-foreground">{s.overall_score || 0}</span>
                      <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'scenarios' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{getSituations(job).length} situações</span>
                {(job.assessment_versions || []).length > 0 && <span className="ml-2 text-brand-violet">· {(job.assessment_versions || []).length} versão{(job.assessment_versions || []).length > 1 ? 'ões' : ''} anterior{(job.assessment_versions || []).length > 1 ? 'es' : ''}</span>}
              </div>
              <button
                onClick={() => regenerateAssessment(false)}
                disabled={regenerating}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-foreground/80 hover:bg-muted transition-colors disabled:opacity-60"
              >
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {regenerating ? 'Gerando…' : 'Regenerar simulação'}
              </button>
            </div>
            {getSituations(job).map((s, i) => (
              <SituationPreview key={s.id || i} situation={s} index={i} />
            ))}
            {(job.assessment_versions || []).length > 0 && (
              <AssessmentVersionHistory versions={job.assessment_versions} currentCount={getSituations(job).length} />
            )}
          </div>
        )}

        {tab === 'competencies' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(job.competencies || []).map((c, i) => (
              <div key={i} className="bg-card/60 border border-border rounded-xl p-4">
                <Target className="w-4 h-4 text-primary mb-2" />
                <div className="text-sm font-medium">{c}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}