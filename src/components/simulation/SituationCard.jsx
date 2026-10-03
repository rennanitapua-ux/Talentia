import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import OptionList from '@/components/simulation/OptionList';
import JustificationBox from '@/components/simulation/JustificationBox';

export default function SituationCard({ situation, index, total, onSubmit, onPasteBlocked }) {
  const [choice, setChoice] = useState(null);
  const [text, setText] = useState('');
  const typing = useRef({ keystrokes: 0, bulk_inserts: 0, blocked_pastes: 0 });
  const options = situation.options || [];
  const hasOptions = options.length > 0;
  const minChars = hasOptions ? 20 : 40;
  const ready = (!hasOptions || choice) && text.trim().length >= minChars;

  const handleChange = (value) => {
    const delta = value.length - text.length;
    typing.current.keystrokes += 1;
    if (delta > 30) typing.current.bulk_inserts += 1;
    setText(value);
  };

  const handleBlocked = () => {
    typing.current.blocked_pastes += 1;
    onPasteBlocked();
  };

  const submit = () => {
    if (!ready) return;
    onSubmit({
      option: options.find((o) => o.id === choice) || null,
      justification: text.trim(),
      typing: { ...typing.current, chars: text.trim().length },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-7">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="font-semibold text-primary">Situação {index + 1} de {total}</span>
          <span>·</span>
          <span className="truncate">{situation.title}</span>
        </div>
        {situation.character?.name && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold">
              {situation.character.name.charAt(0)}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{situation.character.name}</span> · {situation.character.role}
            </div>
          </div>
        )}
        {situation.context && <p className="text-[15px] text-foreground/85 leading-relaxed whitespace-pre-line">{situation.context}</p>}
        <h2 className="mt-4 font-display text-xl md:text-2xl font-bold text-foreground leading-snug">{situation.question}</h2>
      </div>

      {hasOptions && <OptionList options={options} value={choice} onChange={setChoice} />}

      <JustificationBox
        label={hasOptions ? 'Justifique sua escolha' : 'Sua resposta'}
        prompt={situation.justification_prompt || 'Explique seu raciocínio em poucas frases.'}
        value={text}
        onChange={handleChange}
        minChars={minChars}
        onBlocked={handleBlocked}
      />

      <button
        onClick={submit}
        disabled={!ready}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {index + 1 === total ? 'Concluir simulação' : 'Confirmar e continuar'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}