import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2, Users, TrendingUp, Award, ArrowLeft, Briefcase, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import Logo from '@/components/Logo';

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <Logo size="sm" withText />
          </div>
          <button
            onClick={() => navigate('/company/jobs/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Vagas Ativas', value: jobs.filter(j => j.status === 'published').length, icon: Briefcase, color: 'text-cyan-400' },
            { label: 'Candidatos', value: totalCandidates, icon: Users, color: 'text-violet-400' },
            { label: 'Score Médio', value: avgScore, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Total de Vagas', value: jobs.length, icon: BarChart3, color: 'text-amber-400' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <span className="text-[10px] font-mono text-slate-600 uppercase">metric</span>
              </div>
              <div className="text-3xl font-bold font-mono">{loading ? '—' : m.value}</div>
              <div className="text-xs text-slate-500 mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Jobs list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Vagas</h2>
              <span className="text-xs text-slate-500 font-mono">{jobs.length} total</span>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 && !loading && (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
                  <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-1">Nenhuma vaga criada ainda</p>
                  <p className="text-slate-600 text-xs">Crie sua primeira vaga e a IA gerará simulações automaticamente</p>
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
                    className="w-full text-left bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{job.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                            job.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'
                          }`}>{job.status}</span>
                        </div>
                        <div className="text-xs text-slate-500">{job.role} · {job.sector}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-cyan-400">{jobSims.length}</div>
                        <div className="text-[10px] text-slate-600">candidatos</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.competencies || []).slice(0, 4).map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">{c}</span>
                      ))}
                      {(job.competencies || []).length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px]">+{job.competencies.length - 4}</span>
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
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Top Candidatos
              </h2>
            </div>
            <div className="space-y-2">
              {topCandidates.length === 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-slate-500 text-xs">Sem candidatos avaliados ainda</p>
                </div>
              )}
              {topCandidates.map((sim, i) => (
                <button
                  key={sim.id}
                  onClick={() => navigate(`/company/candidates/${sim.id}`)}
                  className="w-full flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3 hover:border-violet-500/40 transition-all text-left"
                >
                  <div className="text-xs font-mono text-slate-600 w-4">{i + 1}</div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-300">
                    {sim.candidate_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{sim.candidate_name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{sim.job_title}</div>
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