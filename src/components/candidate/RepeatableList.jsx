import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

// Editor genérico de listas repetíveis (experiências, formação, cursos, idiomas).
// items: array de objetos. fields: [{ key, label, type, options, full }]. onChange(newItems).
export default function RepeatableList({ title, icon: Icon, items = [], fields = [], onChange, addLabel = 'Adicionar' }) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  const add = () => onChange([...items, {}]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">{items.length}</span>
        </div>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border bg-input/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-accent disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 rounded hover:bg-accent disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button type="button" onClick={() => remove(i)} className="p-1 rounded hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.key} className={f.full || f.type === 'textarea' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] font-medium text-muted-foreground/70 mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={item[f.key] || ''} onChange={(e) => update(i, f.key, e.target.value)} rows={2}
                      placeholder={f.placeholder || ''}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none resize-none" />
                  ) : f.type === 'select' ? (
                    <select value={item[f.key] || ''} onChange={(e) => update(i, f.key, e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                      <option value="">—</option>
                      {f.options?.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === 'date' ? 'date' : 'text'} value={item[f.key] || ''} onChange={(e) => update(i, f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-3 border border-dashed border-border rounded-xl">Nenhum item adicionado.</p>
        )}
      </div>
    </div>
  );
}