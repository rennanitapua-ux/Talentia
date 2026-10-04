import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

// Input de tags para arrays de strings (competências, certificações).
export default function TagInput({ title, icon: Icon, values = [], onChange, placeholder = 'Digite e pressione Enter' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) { setDraft(''); return; }
    onChange([...values, v]);
    setDraft('');
  };
  const remove = (v) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-[10px] font-mono text-muted-foreground/60">{values.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
            {v}
            <button type="button" onClick={() => remove(v)} className="hover:text-primary/70"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {values.length === 0 && <span className="text-xs text-muted-foreground/50">Nenhum item ainda.</span>}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none" />
        <button type="button" onClick={add} className="px-3 rounded-lg bg-muted border border-border text-foreground/80 hover:bg-accent"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}