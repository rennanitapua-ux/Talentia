import React from 'react';
import { ClipboardX } from 'lucide-react';

export default function JustificationBox({ label, prompt, value, onChange, minChars, onBlocked, optional = false }) {
  const block = (e) => {
    e.preventDefault();
    onBlocked();
  };
  const length = value.trim().length;

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {optional && <span className="text-[10px] font-medium text-muted-foreground/60 px-1.5 py-0.5 rounded bg-muted">opcional</span>}
      </div>
      <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={block}
        onCopy={block}
        onCut={block}
        onDrop={block}
        onContextMenu={(e) => e.preventDefault()}
        rows={optional ? 3 : 4}
        autoComplete="off"
        maxLength={800}
        placeholder={optional ? 'Se quiser, conte um pouco mais sobre sua resposta...' : 'Escreva com suas próprias palavras...'}
        className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 resize-none transition-colors"
      />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
        {optional ? (
          <span className="text-muted-foreground/60">{length > 0 ? `${length} caracteres` : 'Pode avançar sem escrever'}</span>
        ) : (
          <span className={length >= minChars ? 'text-emerald-400' : ''}>{length} caracteres · mínimo {minChars}</span>
        )}
        <span className="flex items-center gap-1"><ClipboardX className="w-3 h-3" /> Colar bloqueado</span>
      </div>
    </div>
  );
}