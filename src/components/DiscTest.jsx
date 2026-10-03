import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Check } from 'lucide-react';
import { getShuffledQuestions, calculateDiscResults } from '@/lib/discTest';
import Logo from '@/components/Logo';
import Background from '@/components/Background';

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
    <div className="min-h-screen flex flex-col relative">
      <Background />

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl px-6 py-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <Logo size="sm" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide">Avaliação Comportamental</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pergunta {idx + 1} de {questions.length}</span>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
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
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Antes da simulação
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-snug text-foreground mb-2">
                  Descubra como você trabalha
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Responda rápido, com o que você realmente faria. Não há respostas certas ou erradas.</p>
                <div className="rounded-2xl border border-border bg-card/60 p-5 mb-1">
                  <p className="text-base leading-relaxed text-foreground">{current.question}</p>
                </div>
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
                          ? 'bg-primary/10 border-primary/50'
                          : 'glass hover:border-border'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4" /> : opt.displayLabel}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground flex-1 pt-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!selected}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
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