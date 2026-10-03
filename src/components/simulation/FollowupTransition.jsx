import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export default function FollowupTransition() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <Loader2 className="w-4 h-4 text-primary animate-spin absolute -bottom-1 -right-1" />
      </div>
      <div className="text-sm font-semibold text-foreground mb-1">Analisando sua resposta…</div>
      <div className="text-xs text-muted-foreground/70">Preparando a próxima situação com base no que você respondeu.</div>
    </motion.div>
  );
}