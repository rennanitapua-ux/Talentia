import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';

const ease = [0.22, 1, 0.36, 1];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleEnter = (role) => {
    if (role === 'company') navigate('/company');
    else navigate('/candidate');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      <Background />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Logo — larger, more presence */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease }}
        >
          <Logo size="xl" withText />
        </motion.div>

        {/* Cyan-outlined capsule badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/[0.05] backdrop-blur-sm">
            <span className="w-1 h-1 rounded-full bg-brand-cyan" />
            <span className="text-brand-cyan/90 text-[10px] font-medium tracking-[0.22em] uppercase">Sistema Operacional de Talentos</span>
          </div>
        </motion.div>

        {/* Headline — large, two-tone: white + blue */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="mt-7 text-center text-4xl md:text-[3.25rem] font-bold tracking-tight leading-[1.1]"
        >
          <span className="text-foreground">Contrate por habilidades,</span>
          <br />
          <span className="text-primary">não por currículos.</span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="mt-6 text-center text-muted-foreground text-base md:text-[17px] max-w-lg leading-relaxed"
        >
          A TalentOS conecta empresas e candidatos com base no que realmente importa: habilidades, potencial e resultado.
        </motion.p>

        {/* Two large premium cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="mt-14 grid sm:grid-cols-2 gap-5 w-full"
        >
          {/* Empresa card */}
          <motion.button
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease }}
            onClick={() => handleEnter('company')}
            className="group relative flex flex-col p-7 rounded-2xl bg-card/60 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-400 text-left overflow-hidden shadow-float"
          >
            {/* Ambient glow on hover */}
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/8 blur-3xl group-hover:bg-primary/15 transition-colors duration-700" />
            {/* Icon block */}
            <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5.5 h-5.5 text-primary" style={{ width: '22px', height: '22px' }} />
            </div>
            {/* Title + description */}
            <h3 className="relative text-xl font-semibold text-foreground mt-5">Empresa</h3>
            <p className="relative text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Encontre talentos com base em habilidades reais.</p>
            {/* Circular arrow button */}
            <div className="relative flex justify-end mt-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <ArrowUpRight className="w-4.5 h-4.5 text-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </motion.button>

          {/* Candidato card */}
          <motion.button
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease }}
            onClick={() => handleEnter('candidate')}
            className="group relative flex flex-col p-7 rounded-2xl bg-card/60 backdrop-blur-xl border border-brand-violet/20 hover:border-brand-violet/40 transition-all duration-400 text-left overflow-hidden shadow-float"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-violet/8 blur-3xl group-hover:bg-brand-violet/15 transition-colors duration-700" />
            <div className="relative w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/25 flex items-center justify-center flex-shrink-0">
              <User className="text-brand-violet" style={{ width: '22px', height: '22px' }} />
            </div>
            <h3 className="relative text-xl font-semibold text-foreground mt-5">Candidato</h3>
            <p className="relative text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Mostre suas habilidades e conquiste a vaga certa.</p>
            <div className="relative flex justify-end mt-6">
              <div className="w-10 h-10 rounded-full bg-brand-violet/10 border border-brand-violet/25 flex items-center justify-center group-hover:bg-brand-violet group-hover:border-brand-violet transition-all duration-300">
                <ArrowUpRight className="text-brand-violet group-hover:text-violet-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* User session indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-12 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sessão ativa: {user.full_name || user.email}
          </motion.div>
        )}
      </div>
    </div>
  );
}