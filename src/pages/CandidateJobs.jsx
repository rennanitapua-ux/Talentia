import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Building2, ArrowRight, Search, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';

export default function CandidateJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
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
    <div className="min-h-screen relative">
      <Background />

      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Vagas Disponíveis</div>
          </div>
          <button onClick={() => navigate('/candidate/passport')} className="text-xs text-brand-violet hover:text-brand-violet/80 transition-colors">
            Meu Skill Passport →
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Mostre seu potencial real</h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Cada vaga é uma simulação viva gerada por IA. Você não responde um teste — você vive o trabalho. Suas decisões geram evidências que formam seu Skill DNA permanente.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cargo, setor..."
            className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Jobs grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse h-48" />
          ))}
          {filtered.map((job, i) => (
            <motion.button
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/candidate/simulate/${job.id}`)}
              className="text-left glass rounded-xl p-5 hover:border-brand-violet/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-brand-violet transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building2 className="w-3 h-3" />
                    {job.company_name}
                    <span>·</span>
                    {job.sector}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-brand-violet group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.company_context}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(job.competencies || []).slice(0, 3).map((c, j) => (
                  <span key={j} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">{c}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  {(job.simulation_scenarios || []).length} cenários
                </div>
                <div className="text-xs text-brand-violet font-medium">Iniciar simulação →</div>
              </div>
            </motion.button>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-2 glass rounded-xl p-12 text-center border-dashed">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma vaga encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}