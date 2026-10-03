import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import Background from '@/components/Background';
import Logo from '@/components/Logo';
import { estimateMinutes } from '@/lib/situations';

const RULES = [
  'A simulação abre em tela cheia. Sair da aba ou da janela é registrado.',
  'Copiar, colar e arrastar texto são bloqueados.',
  'Cada justificativa é analisada por IA, inclusive para detectar texto gerado por IA.',
  'O tempo de cada situação é registrado. Suas respostas são salvas automaticamente.',
];

export default function SimulationIntro({ job, total, onStart }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 py-12">
      <Background />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-2xl">
        <Logo size="sm" withText className="mb-8" />
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">Processo seletivo</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{job.title}</h1>
        <p className="text-muted-foreground mt-2">{job.company_name}{job.openings ? ` · ${job.openings} ${job.openings > 1 ? 'vagas' : 'vaga'}` : ''}</p>
        {job.company_problems && <p className="mt-5 text-sm text-foreground/80 leading-relaxed">{job.company_problems}</p>}

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl surface p-5">
            <Brain className="w-5 h-5 text-brand-violet mb-3" />
            <div className="text-sm font-semibold">1. Teste comportamental DISC</div>
            <div className="text-xs text-muted-foreground mt-1">12 perguntas · cerca de 4 minutos</div>
          </div>
          <div className="rounded-2xl surface p-5">
            <Layers className="w-5 h-5 text-primary mb-3" />
            <div className="text-sm font-semibold">2. Simulação de trabalho</div>
            <div className="text-xs text-muted-foreground mt-1">{total} situações · múltipla escolha + justificativa · ~{estimateMinutes(total)} min</div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl surface p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Modo protegido</div>
          <ul className="space-y-1.5">
            {RULES.map((r) => <li key={r} className="text-xs text-muted-foreground leading-relaxed">• {r}</li>)}
          </ul>
        </div>

        <button onClick={onStart} className="mt-8 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
          Começar avaliação <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}