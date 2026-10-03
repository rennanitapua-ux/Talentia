import React from 'react';
import { Check } from 'lucide-react';

export default function OptionList({ options, value, onChange }) {
  return (
    <div className="space-y-2.5" role="radiogroup">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`w-full text-left flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 ${
              active
                ? 'border-primary/60 bg-primary/10 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                : 'border-border bg-card/40 hover:border-primary/30 hover:bg-card/70'
            }`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
              active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {active ? <Check className="w-3.5 h-3.5" /> : opt.id.toUpperCase()}
            </span>
            <span className={`text-sm leading-relaxed pt-0.5 ${active ? 'text-foreground' : 'text-foreground/85'}`}>{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}