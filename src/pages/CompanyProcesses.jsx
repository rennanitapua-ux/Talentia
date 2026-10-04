import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, RefreshCw, Armchair, Eye, ChevronRight, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import Background from '@/components/Background';
import { seatStatus } from '@/lib/seats';

const STAGES = [
  { key: 'em_analise', label: 'Em Análise', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  { key: 'convocacao_entrevista', label: 'Convocado', dot: 'bg-blue-400', text: 'text-blue-400' },
  { key: 'entrevista_agendada', label: 'Entrevista', dot: 'bg-brand-violet', text: 'text-brand-violet' },
  { key: 'aprovado', label: 'Aprovado', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  { key: 'reprovado', label: 'Reprovado', dot: 'bg-rose-400', text: 'text-rose-400' },
];

export default function CompanyProcesses() {
  const navigate = useNavigate();
  const [data, setData] = useState({ loading: true, error: false, jobs: [], sims: [] });
  const [stageFilter, setStageFilter] = useState('all');

  const load = async () => {
    setData((d) => ({ ...d, loading: true, error: false }));
    try {
      const user = await base44.auth.me();
      const jobs = await base44.entities.Job.filter({ created_by_id: user.id }, '-created_date', 100);
      const sims = jobs.length
        ? await base44.entities.Simulation.filter({ job_id: { $in: jobs.map((j) => j.id) } }, '-created_date', 500)
        : [];
      setData({ loading: false, error: false, jobs, sims });
    } catch {
      setData((d) => ({ ...d, loading: false, error: true }));
    }
  };

  useEffect(() => { load(); }, []);

  const completed = useMemo(() => (data.sims || []).filter((s) => s.status === 'completed'), [data.sims]);

  // Aggregated counts per stage across all jobs
  const stageCounts = useMemo(() => {
    const counts = { em_analise: 0, convocacao_entrevista: 0, entrevista_agendada: 0, aprovado: 0, reprovado: 0 };
    completed.forEach((s) => { counts[s.hiring_status || 'em_analise']++; });
    return counts;
  }, [completed]);

  // Per-job pipeline summary
  const jobPipelines = useMemo(() => {
    return data.jobs.map((job) => {
      const jobSims = completed.filter((s) => s.job_id === job.id);
      const seats = seatStatus(job, jobSims);
      const byStage = {};
      STAGES.forEach((st) => { byStage[st.key] = jobSims.filter((s) => (s.hiring_status || 'em_analise') === st.key); });
      return { job, jobSims, seats, byStage };
    });
  }, [data.jobs, completed]);

  const filteredPipelines = useMemo(() => {
    if (stageFilter === 'all') return jobPipelines;
    return jobPipelines.filter((p) => p.byStage[stageFilter]?.length > 0);
  }, [jobPipelines, stageFilter]);

  if (data.loading) {
    return (
      <div className="min-h-screen relative">
        <Background />
        <AppHeader area="company" />
        <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-primary" /> Processos seletivos
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Pipeline consolidado de todas as suas vagas — acompanhe cada candidato por etapa.</p>
          </div>
          <button onClick={load} className="h-10 px-4 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {data.error ? (
          <div className="rounded-2xl surface p-10 text-center">
            <p className="text-sm text-muted-foreground">Não conseguimos carregar os processos agora.</p>
            <button onClick={load} className="mt-4 h-10 px-4 rounded-lg border border-border text-sm inline-flex items-center gap-2 hover:bg-muted"><RefreshCw className="w-4 h-4" /> Tentar de novo</button>
          </div>
        ) : data.jobs.length === 0 ? (
          <div className="rounded-2xl surface p-12 text-center">
            <ClipboardList className="w-9 h-9 text-muted-foreground/50 mx-auto mb-4" />
            <div className="font-semibold">Nenhuma vaga publicada ainda</div>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Publique uma vaga para acompanhar o pipeline de candidatos aqui.</p>
            <button onClick={() => navigate('/company/jobs/new')} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Publicar vaga</button>
          </div>
        ) : (
          <>
            {/* Stage summary across all jobs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {STAGES.map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStageFilter(stageFilter === st.key ? 'all' : st.key)}
                  className={`text-left bg-card/60 border rounded-xl p-4 transition-all ${stageFilter === st.key ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border hover:border-border/80'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className="text-xs font-medium text-foreground/80">{st.label}</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${st.text}`}>{stageCounts[st.key]}</div>
                </button>
              ))}
            </div>

            {stageFilter !== 'all' && (
              <div className="flex items-center gap-2 mb-4 text-xs">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Filtrando por <span className="text-foreground font-medium">{STAGES.find((s) => s.key === stageFilter)?.label}</span></span>
                <button onClick={() => setStageFilter('all')} className="text-primary hover:text-primary/80">Limpar</button>
              </div>
            )}

            {/* Per-job pipeline cards */}
            <div className="space-y-4">
              {filteredPipelines.length === 0 && (
                <div className="rounded-2xl surface p-10 text-center text-sm text-muted-foreground">
                  Nenhuma vaga com candidatos nesta etapa.
                </div>
              )}
              {filteredPipelines.map(({ job, jobSims, seats, byStage }, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card/60 border border-border rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate(`/company/jobs/${job.id}`)} className="flex-1 text-left group">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {job.title}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary" />
                      </div>
                      <div className="text-[11px] text-muted-foreground/70 font-mono">{job.role} · {job.sector}</div>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Armchair className={`w-4 h-4 ${seats.full ? 'text-emerald-400' : 'text-primary'}`} />
                      <span>{seats.filled}/{seats.openings} assentos</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase ${job.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : job.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/15 text-amber-400'}`}>
                      {job.status === 'published' ? 'aberta' : job.status === 'closed' ? 'encerrada' : 'rascunho'}
                    </span>
                  </div>

                  {jobSims.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 py-3 text-center">Sem candidatos avaliados ainda.</p>
                  ) : (
                    <div className="grid md:grid-cols-5 gap-3">
                      {STAGES.map((st) => {
                        const list = byStage[st.key] || [];
                        return (
                          <div key={st.key} className="bg-muted/20 border border-border/60 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/60">
                              <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              <span className="text-[11px] font-medium text-foreground/70">{st.label}</span>
                              <span className="text-[11px] font-mono text-muted-foreground/60 ml-auto">{list.length}</span>
                            </div>
                            <div className="space-y-1.5">
                              {list.length === 0 && <p className="text-[10px] text-muted-foreground/30 text-center py-2">—</p>}
                              {list.slice(0, 4).map((sim) => (
                                <button
                                  key={sim.id}
                                  onClick={() => navigate(`/company/candidates/${sim.id}`)}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border hover:border-primary/30 transition-all text-left"
                                >
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                                    {sim.candidate_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-[11px] text-foreground/80 truncate flex-1">{sim.candidate_name}</span>
                                  <span className="text-[10px] font-mono text-muted-foreground/60">{sim.overall_score || 0}</span>
                                </button>
                              ))}
                              {list.length > 4 && (
                                <button onClick={() => navigate(`/company/jobs/${job.id}`)} className="w-full text-[10px] text-center text-primary hover:text-primary/80 py-1">
                                  +{list.length - 4} mais
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}