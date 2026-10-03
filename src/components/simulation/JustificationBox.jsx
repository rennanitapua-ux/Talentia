import React from 'react';
import { ClipboardX } from 'lucide-react';

export default function JustificationBox({ label, prompt, value, onChange, minChars, onBlocked }) {
  const block = (e) => {
    e.preventDefault();
    onBlocked();
  };
  const length = value.trim().length;

  return (
    <div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={block}
        onCopy={block}
        onCut={block}
        onDrop={block}
        onContextMenu={(e) => e.preventDefault()}
        rows={4}
        autoComplete="off"
        placeholder="Escreva com suas próprias palavras..."
        className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 resize-none transition-colors"
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
        <span className={length >= minChars ? 'text-emerald-400' : ''}>{length} caracteres · mínimo {minChars}</span>
        <span className="flex items-center gap-1"><ClipboardX className="w-3 h-3" /> Colar bloqueado</span>
      </div>
    </div>
  );
}