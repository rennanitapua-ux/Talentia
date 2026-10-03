import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';
import RoleCard from '@/components/home/RoleCard';

const ease = [0.22, 1, 0.36, 1];
const fade = (delay) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } });

const ROLES = [
  { role: 'company', icon: Building2, title: 'Empresa', tone: 'cyan', text: 'Encontre os melhores talentos com base em habilidades reais, não em currículos.' },
  { role: 'candidate', icon: User, title: 'Candidato', tone: 'violet', text: 'Mostre o que você sabe fazer e conquiste a vaga certa para o seu perfil.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  const enter = (role) => navigate(authed ? `/onboarding?role=${role}` : `/login?role=${role}`);

  return (
    <div className="min-h-screen relative flex flex-col">
      <Background />
      <motion.header {...fade(0)} className="relative z-10 flex justify-center pt-10">
        <Logo size="md" withText />
      </motion.header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-14">
        <motion.h1 {...fade(0.1)} className="font-display text-center text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.25rem] font-extrabold tracking-tight text-foreground">
          Contrate por
          <br />
          <span className="text-gradient">habilidades</span>,
          <br />
          não por <span className="text-gradient">currículos</span>.
        </motion.h1>

        <motion.p {...fade(0.25)} className="mt-7 max-w-xl text-center text-base md:text-lg text-muted-foreground leading-relaxed">
          A TalentOS conecta empresas e candidatos com base no que realmente importa: habilidades, potencial e resultado.
        </motion.p>

        <motion.div {...fade(0.4)} className="mt-14 grid sm:grid-cols-2 gap-5 w-full max-w-4xl">
          {ROLES.map((r) => (
            <RoleCard key={r.role} {...r} onClick={() => enter(r.role)} />
          ))}
        </motion.div>
      </main>
    </div>
  );
}