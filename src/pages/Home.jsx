import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, ArrowRight, Cpu, ShieldCheck, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleEnter = (selectedRole) => {
    if (!user) return;
    if (selectedRole === 'company') navigate('/company');
    else navigate('/candidate');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 text-xs font-mono tracking-wider uppercase">Sistema Operacional de Competências</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-4">
            Skill<span className="text-cyan-400">OS</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Não aplicamos testes. Criamos um ambiente de trabalho vivo, gerado por IA, onde cada candidato demonstra competências em situações reais — e cada decisão gera evidências explicáveis.
          </p>
        </motion.div>

        {/* User badge */}
        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-10">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-semibold text-sm">
                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium">{user.full_name || user.email}</div>
                <div className="text-xs text-slate-500">Sessão ativa</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Role selection */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setRole('company')}
            onMouseEnter={() => setRole('company')}
            className={`group relative text-left p-7 rounded-2xl border transition-all duration-300 ${
              role === 'company'
                ? 'bg-cyan-500/10 border-cyan-400/50 shadow-xl shadow-cyan-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                role === 'company' ? 'bg-cyan-500/20' : 'bg-slate-800'
              }`}>
                <Building2 className={`w-6 h-6 ${role === 'company' ? 'text-cyan-300' : 'text-slate-400'}`} />
              </div>
              <ArrowRight className={`w-5 h-5 transition-all ${role === 'company' ? 'text-cyan-400 translate-x-1' : 'text-slate-600 group-hover:translate-x-1'}`} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Empresa</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crie vagas, gere simulações por IA, veja ranking de candidatos com Skill Score explicável, evidências ✓/✗ e Skill Graph.
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setRole('candidate')}
            onMouseEnter={() => setRole('candidate')}
            className={`group relative text-left p-7 rounded-2xl border transition-all duration-300 ${
              role === 'candidate'
                ? 'bg-violet-500/10 border-violet-400/50 shadow-xl shadow-violet-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                role === 'candidate' ? 'bg-violet-500/20' : 'bg-slate-800'
              }`}>
                <User className={`w-6 h-6 ${role === 'candidate' ? 'text-violet-300' : 'text-slate-400'}`} />
              </div>
              <ArrowRight className={`w-5 h-5 transition-all ${role === 'candidate' ? 'text-violet-400 translate-x-1' : 'text-slate-600 group-hover:translate-x-1'}`} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Candidato</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Navegue por vagas, viva simulações reais, mostre seu potencial e receba seu Skill DNA + Skill Passport permanente.
            </p>
          </motion.button>
        </div>

        {/* Enter button */}
        {role && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={() => handleEnter(role)}
              className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                role === 'company'
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/30'
              }`}
            >
              Entrar como {role === 'company' ? 'Empresa' : 'Candidato'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Feature strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
          {[
            { icon: Cpu, label: 'IA Rigorosa', desc: 'Análise minuciosa' },
            { icon: ShieldCheck, label: 'Anti-Trapaça', desc: 'Tela protegida' },
            { icon: Activity, label: 'Evidências', desc: '✓/✗ explicável' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <f.icon className="w-5 h-5 text-slate-500 mx-auto mb-2" />
              <div className="text-xs font-medium text-slate-300">{f.label}</div>
              <div className="text-[10px] text-slate-600">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}