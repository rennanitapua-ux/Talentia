import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
      <Background />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo size="xl" withText />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-[11px] font-medium tracking-[0.15em] uppercase">Sistema Operacional de Talentos</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 text-center text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]"
        >
          Contrate por habilidades,
          <br />
          <span className="text-gradient">não por currículos.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-center text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed"
        >
          A TalentOS conecta empresas e candidatos com base no que realmente importa: habilidades, potencial e resultado.
        </motion.p>

        {/* Blocks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid sm:grid-cols-2 gap-4 w-full max-w-xl"
        >
          <button
            onClick={() => handleEnter('company')}
            className="group flex items-center gap-4 p-5 rounded-2xl glass hover:border-primary/30 transition-all duration-300 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground">Empresa</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">Encontre talentos com base em habilidades reais.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          <button
            onClick={() => handleEnter('candidate')}
            className="group flex items-center gap-4 p-5 rounded-2xl glass hover:border-brand-violet/30 transition-all duration-300 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-violet/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-brand-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground">Candidato</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">Mostre suas habilidades e conquiste a vaga certa.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-violet group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </motion.div>

        {/* User session indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Sessão ativa: {user.full_name || user.email}
          </motion.div>
        )}
      </div>
    </div>
  );
}