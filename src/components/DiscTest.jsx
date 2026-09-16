import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Check } from 'lucide-react';
import { getShuffledQuestions, calculateDiscResults } from '@/lib/discTest';
import Logo from '@/components/Logo';

export default function DiscTest({ onComplete }) {
  const questions = useMemo(() => getShuffledQuestions(), []);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const current = questions[idx];
  const progress = ((idx) / questions.length) * 100;

  const handleSelect = (letter) => {
    setSelected(letter);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, { questionId: current.id, letter: selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      const results = calculateDiscResults(newAnswers);
      onComplete(results, newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(240,15%,3.5%)] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[hsl(240,8%,14%)] bg-[hsl(240,12%,5%)]/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <Logo size="sm" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(190,85%,45%,0.08)] border border-[hsl(190,85%,45%,0.2)]">
              <Brain className="w-3.5 h-3.5 text-[hsl(190,85%,55%)]" />
              <span className="text-xs font-medium text-[hsl(190,85%,65%)] tracking-wide">Avaliação Comportamental</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Questão {idx + 1} de {questions.length}</span>
            <span className="text-xs font-mono text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[hsl(240,8%,14%)] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[hsl(190,85%,45%)] to-[hsl(190,85%,55%)] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8">
                <div className="text-xs font-mono text-[hsl(190,85%,55%)] uppercase tracking-[0.2em] mb-3">
                  Situação {idx + 1}
                </div>
                <h2 className="font-heading text-2xl md:text-3xl leading-snug text-white mb-2">
                  {current.question}
                </h2>
                <p className="text-sm text-slate-500">Escolha a opção que mais se parece com você.</p>
              </div>

              <div className="space-y-3">
                {current.options.map((opt) => {
                  const isSelected = selected === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      onClick={() => handleSelect(opt.letter)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 group ${
                        isSelected
                          ? 'bg-[hsl(190,85%,45%,0.1)] border-[hsl(190,85%,45%,0.5)] shadow-[0_0_0_1px_hsl(190,85%,45%,0.3)]'
                          : 'bg-[hsl(240,12%,6%)] border-[hsl(240,8%,14%)] hover:border-[hsl(240,8%,22%)] hover:bg-[hsl(240,10%,8%)]'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[hsl(190,85%,45%)] text-[hsl(240,15%,3.5%)]'
                          : 'bg-[hsl(240,8%,12%)] text-slate-500 group-hover:bg-[hsl(240,8%,16%)] group-hover:text-slate-300'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4" /> : opt.displayLabel}
                      </span>
                      <span className="text-sm leading-relaxed text-slate-200 flex-1 pt-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!selected}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[hsl(190,85%,45%)] text-[hsl(240,15%,3.5%)] font-semibold text-sm hover:bg-[hsl(190,85%,50%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[hsl(190,85%,45%,0.2)]"
                >
                  {idx + 1 < questions.length ? 'Próxima questão' : 'Finalizar teste'}
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