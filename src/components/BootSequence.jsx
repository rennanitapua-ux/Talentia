import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  '> Inicializando TalentOS v1.0...',
  '> Carregando módulo de competências...',
  '> Conectando ao motor de simulação IA...',
  '> Gerando perfil da empresa virtual...',
  '> Estruturando cenários de trabalho...',
  '> Calibrando análise de evidências...',
  '> Ativando detecção de IA...',
  '> TalentOS pronto.',
];

export default function BootSequence({ onComplete, label = 'Gerando simulação' }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), 350);
      return () => clearTimeout(timer);
    }
    const done = setTimeout(onComplete, 400);
    return () => clearTimeout(done);
  }, [visibleLines, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      <div className="w-full max-w-lg px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-mono text-sm tracking-widest uppercase">{label}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground font-mono">TalentOS</h2>
          <p className="text-muted-foreground/60 text-xs mt-1 font-mono">Sistema Operacional de Talentos</p>
        </div>
        <div className="bg-card/80 border border-border rounded-xl p-5 font-mono text-xs space-y-1.5 min-h-[200px]">
          <AnimatePresence>
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={i === BOOT_LINES.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground'}
              >
                {line}
                {i === visibleLines - 1 && visibleLines < BOOT_LINES.length && (
                  <span className="inline-block w-2 h-3 bg-primary ml-1 animate-pulse" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}