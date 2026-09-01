import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Users, Play, Eye, Award, Briefcase, Target, Layers, GitCompare, Link2, Check, Copy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillScoreBadge from '@/components/SkillScoreBadge';

export default function CompanyJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('candidates');
  const [copied, setCopied] = useState(false);

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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  if (!job) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Vaga não encontrada</div>;

  const ranked = [...simulations].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
  const shareUrl = `${window.location.origin}/candidate/simulate/${id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/company')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">{job.title}</div>
            <div className="text-[10px] text-slate-500 font-mono">{job.role} · {job.sector} · {job.company_name}</div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 uppercase">{job.status}</span>
        </div>
      </header>

      {/* Share link bar */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-violet-500/5 to-transparent border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-cyan-200">Link do Candidato</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">compartilhe para receber respostas</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 font-mono truncate">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                copied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Abrir Simulação
            </a>
            <button
              onClick={() => navigate(`/company/jobs/${id}/compare`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Perfil da Empresa Virtual</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{job.virtual_company_profile}</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <Users className="w-4 h-4 text-violet-400 mb-2" />
            <div className="text-2xl font-bold font-mono">{simulations.length}</div>
            <div className="text-xs text-slate-500">Candidatos</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <Target className="w-4 h-4 text-cyan-400 mb-2" />
            <div className="text-2xl font-bold font-mono">{(job.competencies || []).length}</div>
            <div className="text-xs text-slate-500">Competências</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <Layers className="w-4 h-4 text-amber-400 mb-2" />
            <div className="text-2xl font-bold font-mono">{(job.simulation_scenarios || []).length}</div>
            <div className="text-xs text-slate-500">Fases</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-800">
          {[
            { id: 'candidates', label: 'Candidatos', icon: Users },
            { id: 'scenarios', label: 'Cenários', icon: Layers },
            { id: 'competencies', label: 'Competências', icon: Target },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'candidates' && (
          <div className="space-y-3">
            {ranked.length === 0 && (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
                <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-1">Nenhum candidato ainda</p>
                <p className="text-slate-600 text-xs">Compartilhe o link da vaga com candidatos</p>
                <button onClick={() => navigate('/candidate')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300">
                  <Eye className="w-3.5 h-3.5" />
                  Ver como candidato
                </button>
              </div>
            )}
            {ranked.map((sim, i) => (
              <motion.button
                key={sim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/company/candidates/${sim.id}`)}
                className="w-full text-left bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all group flex items-center gap-5"
              >
                <div className="text-2xl font-bold font-mono text-slate-600 w-8 text-center">{i + 1}</div>
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-slate-300">
                  {sim.candidate_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{sim.candidate_name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{sim.status === 'completed' ? 'Completo' : 'Em andamento'}</span>
                    {sim.recommendation && (
                      <span className="text-xs text-slate-400">{sim.recommendation}</span>
                    )}
                    {sim.focus_violations > 0 && (
                      <span className="text-xs text-rose-400 flex items-center gap-1">⚠ {sim.focus_violations} violações</span>
                    )}
                  </div>
                </div>
                {sim.status === 'completed' && <SkillScoreBadge score={sim.overall_score || 0} size="md" />}
                {sim.status !== 'completed' && <span className="text-xs text-amber-400 font-mono">em andamento</span>}
                <Eye className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
              </motion.button>
            ))}
          </div>
        )}

        {tab === 'scenarios' && (
          <div className="space-y-4">
            {(job.simulation_scenarios || []).map((ph, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-cyan-400">FASE {String(i + 1).padStart(2, '0')}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    ph.type === 'choice' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-violet-500/15 text-violet-300'
                  }`}>
                    {ph.type === 'choice' ? 'Múltipla Escolha' : 'Resposta Escrita'}
                  </span>
                  <span className="text-xs text-slate-500">· {ph.questions?.length || 0} perguntas</span>
                </div>
                <div className="text-sm font-medium mb-3">{ph.title}</div>
                <div className="space-y-2">
                  {(ph.questions || []).map((q, j) => (
                    <div key={j} className="bg-slate-800/30 rounded-lg p-3 border border-slate-800">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-600 mt-0.5">Q{j + 1}.</span>
                        <span className="text-xs text-slate-300 flex-1">{q.prompt}</span>
                      </div>
                      {q.multiple_choice?.length > 0 && (
                        <div className="mt-2 pl-5 space-y-1">
                          {q.multiple_choice.map((opt, k) => (
                            <div key={k} className="flex items-start gap-1.5 text-[11px]">
                              <span className="font-mono text-slate-600">{opt.id.toUpperCase()}.</span>
                              <span className="text-slate-500">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'competencies' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(job.competencies || []).map((c, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <Target className="w-4 h-4 text-cyan-400 mb-2" />
                <div className="text-sm font-medium">{c}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}