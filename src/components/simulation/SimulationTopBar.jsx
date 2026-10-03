import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';

export default function SimulationTopBar({ job, index, total, violations }) {
  const progress = total ? Math.min(100, (index / total) * 100) : 0;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-5 h-16 flex items-center gap-4">
        <Logo size="xs" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{job.title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{job.company_name}</div>
        </div>
        {violations > 0 ? (
          <span className="flex items-center gap-1 text-xs text-rose-400" title="Ocorrências de integridade registradas">
            <AlertTriangle className="w-3.5 h-3.5" /> {violations}
          </span>
        ) : (
          <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Protegido</span>
        )}
        <span className="text-xs font-mono text-muted-foreground">{Math.min(index + 1, total)}/{total}</span>
      </div>
      <div className="h-0.5 bg-muted">
        <motion.div className="h-full bg-gradient-to-r from-brand-cyan via-primary to-brand-violet" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>
    </header>
  );
}