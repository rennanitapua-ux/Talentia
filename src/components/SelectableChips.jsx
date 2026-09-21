import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';

export default function SelectableChips({ label, options, value, onChange, columns = 2, maxH = null, note = null }) {
  const [collapsed, setCollapsed] = useState(!!value);
  const selected = options.find(o => (o.value ?? o) === value);
  const selectedLabel = selected ? (selected.label ?? selected) : null;

  const gridClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <AnimatePresence mode="wait">
        {collapsed && value ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2.5"
          >
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-primary flex-1 truncate">{selectedLabel}</span>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary/80 uppercase tracking-wider"
            >
              <Pencil className="w-3 h-3" />
              Trocar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <div
              className={`grid gap-2 ${gridClass} ${maxH ? 'overflow-y-auto' : ''}`}
              style={maxH ? { maxHeight: maxH } : undefined}
            >
              {options.map(opt => {
                const val = opt.value ?? opt;
                const lbl = opt.label ?? opt;
                const active = value === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { onChange(val); setCollapsed(true); }}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      active
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-card border-border text-foreground/80 hover:border-primary/30 hover:bg-accent'
                    }`}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
            {note && <p className="text-[10px] text-muted-foreground/60 mt-1.5">{note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}