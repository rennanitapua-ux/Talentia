import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, ArrowLeft, Briefcase, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import Logo from '@/components/Logo';
import Background from '@/components/Background';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Job.list('-created_date', 50),
      base44.entities.Simulation.filter({ status: 'completed' }, '-completed_at', 50),
    ]).then(([j, s]) => {
      setJobs(j || []);
      setSimulations(s || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalCandidates = simulations.length;
  const avgScore = totalCandidates ? Math.round(simulations.reduce((a, s) => a + (s.overall_score || 0), 0) / totalCandidates) : 0;
  const topCandidates = [...simulations].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).slice(0, 5);

  return (
    <div className="min-h-screen relative">
      <Background />

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <Logo size="sm" withText />
          </div>
          <button
            onClick={() => navigate('/company/jobs/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Vagas Ativas', value: jobs.filter(j => j.status === 'published').length, icon: Briefcase, color: 'text-primary' },
            { label: 'Candidatos', value: totalCandidates, icon: Users, color: 'text-brand-violet' },
            { label: 'Score Médio', value: avgScore, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Total de Vagas', value: jobs.length, icon: Award, color: 'text-amber-400' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="text-3xl font-bold font-mono text-foreground">{loading ? '—' : m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Jobs list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Vagas</h2>
              <span className="text-xs text-muted-foreground font-mono">{jobs.length} total</span>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 && !loading && (
                <div className="glass rounded-xl p-12 text-center border-dashed">
                  <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">Nenhuma vaga criada ainda</p>
                  <p className="text-muted-foreground/60 text-xs">Crie sua primeira vaga e a IA gerará simulações automaticamente</p>
                </div>
              )}
              {jobs.map((job, i) => {
                const jobSims = simulations.filter(s => s.job_id === job.id);
                return (
                  <motion.button
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/company/jobs/${job.id}`)}
                    className="w-full text-left glass rounded-xl p-5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                            job.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
                          }`}>{job.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{job.role} · {job.sector}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-primary">{jobSims.length}</div>
                        <div className="text-[10px] text-muted-foreground">candidatos</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.competencies || []).slice(0, 4).map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">{c}</span>
                      ))}
                      {(job.competencies || []).length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[10px]">+{job.competencies.length - 4}</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Top candidates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Top Candidatos
              </h2>
            </div>
            <div className="space-y-2">
              {topCandidates.length === 0 && (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-muted-foreground text-xs">Sem candidatos avaliados ainda</p>
                </div>
              )}
              {topCandidates.map((sim, i) => (
                <button
                  key={sim.id}
                  onClick={() => navigate(`/company/candidates/${sim.id}`)}
                  className="w-full flex items-center gap-3 glass rounded-xl p-3 hover:border-brand-violet/30 transition-all text-left"
                >
                  <div className="text-xs font-mono text-muted-foreground/60 w-4">{i + 1}</div>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                    {sim.candidate_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{sim.candidate_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{sim.job_title}</div>
                  </div>
                  <SkillScoreBadge score={sim.overall_score || 0} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}