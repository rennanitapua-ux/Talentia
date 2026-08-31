import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Building2, MapPin, ArrowRight, Search, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CandidateJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    base44.entities.Job.filter({ status: 'published' }, '-created_date', 50).then(j => {
      setJobs(j || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.role?.toLowerCase().includes(search.toLowerCase()) ||
    j.sector?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Vagas Disponíveis</div>
            <div className="text-[10px] text-slate-500 font-mono">SkillOS / Candidate Portal</div>
          </div>
          <button onClick={() => navigate('/candidate/passport')} className="text-xs text-violet-400 hover:text-violet-300">
            Meu Skill Passport →
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mostre seu potencial real</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Cada vaga é uma simulação viva gerada por IA. Você não responde um teste — você vive o trabalho. Suas decisões geram evidências que formam seu Skill DNA permanente.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cargo, setor..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Jobs grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 animate-pulse h-48" />
          ))}
          {filtered.map((job, i) => (
            <motion.button
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/candidate/simulate/${job.id}`)}
              className="text-left bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-violet-500/40 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3 h-3" />
                    {job.company_name}
                    <span>·</span>
                    {job.sector}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{job.company_context}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(job.competencies || []).slice(0, 3).map((c, j) => (
                  <span key={j} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">{c}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Target className="w-3 h-3" />
                  {(job.simulation_scenarios || []).length} cenários
                </div>
                <div className="text-xs text-violet-400 font-medium">Iniciar simulação →</div>
              </div>
            </motion.button>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-2 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma vaga encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}