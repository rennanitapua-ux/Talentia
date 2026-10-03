import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ClipboardX } from 'lucide-react';

const COPY = {
  paste: { icon: ClipboardX, title: 'Colar bloqueado', text: 'Copiar, colar e arrastar texto são bloqueados. A tentativa foi registrada.' },
  ai: { icon: Bot, title: 'Alerta de suspeita de IA', text: 'Sua última justificativa tem padrões de texto gerado por IA. Isso foi registrado para a empresa.' },
};

export default function IntegrityAlert({ alert }) {
  const item = alert ? COPY[alert.type] : null;
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={alert.at}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-md rounded-xl border border-rose-500/40 bg-card/95 backdrop-blur-xl px-4 py-3.5 shadow-float"
        >
          <div className="flex items-start gap-3">
            <item.icon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-rose-300">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.text}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}