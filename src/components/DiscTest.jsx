import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Check } from 'lucide-react';
import { DISC_QUESTIONS, calculateDiscResults } from '@/lib/discTest';

export default function DiscTest({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const current = DISC_QUESTIONS[idx];
  const progress = ((idx) / DISC_QUESTIONS.length) * 100;

  const handleSelect = (letter) => {
    setSelected(letter);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, { questionId: current.id, letter: selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (idx + 1 < DISC_QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      const results = calculateDiscResults(newAnswers);
      onComplete(results, newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Teste Comportamental DISC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Questão {idx + 1} de {DISC_QUESTIONS.length}</span>
            <span className="text-xs font-mono text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <motion.div className="h-full bg-cyan-400" animate={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-6 text-center">{current.question}</h2>
              <div className="space-y-3">
                {current.options.map((opt) => (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelect(opt.letter)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      selected === opt.letter
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
                      selected === opt.letter ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {selected === opt.letter ? <Check className="w-3.5 h-3.5" /> : opt.letter}
                    </span>
                    <span className="text-sm flex-1">{opt.text}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!selected}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {idx + 1 < DISC_QUESTIONS.length ? 'Próxima' : 'Finalizar Teste'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}