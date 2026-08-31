import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, Lock, ClipboardX } from 'lucide-react';

// Fullscreen lock + anti-cheating: detects tab switches, window blur, fullscreen exit
export default function SimulationLock({ onViolation, violationCount, children }) {
  const [warning, setWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  const triggerViolation = (msg) => {
    setWarningMsg(msg);
    setWarning(true);
    onViolation?.(msg);
    setTimeout(() => setWarning(false), 4000);
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) triggerViolation('Saída da aba detectada — tentativa de consulta registrada.');
    };
    const handleBlur = () => triggerViolation('Janela perdeu foco — comportamento registrado.');
    const handleFullscreen = () => {
      if (!document.fullscreenElement) triggerViolation('Tela cheia abandonada — simulação comprometida.');
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Sair da simulação pode invalidar seus resultados. Deseja continuar?';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Try to enter fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-rose-950/95 border border-rose-500/50 rounded-xl px-5 py-4 shadow-2xl shadow-rose-500/20 max-w-md"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-rose-300 font-semibold text-sm">Violação de Integridade</div>
                <div className="text-rose-200/80 text-xs mt-0.5">{warningMsg}</div>
                <div className="text-rose-400/60 text-[10px] mt-1 font-mono">
                  Violações registradas: {violationCount + 1}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Modo Protegido</span>
        <ClipboardX className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[10px] font-mono text-rose-400/70 uppercase">Colar Off</span>
        <Eye className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </div>
  );
}