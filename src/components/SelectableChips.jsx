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
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <AnimatePresence mode="wait">
        {collapsed && value ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2.5"
          >
            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-sm text-cyan-200 flex-1 truncate">{selectedLabel}</span>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-cyan-300 uppercase tracking-wider"
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
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
            {note && <p className="text-[10px] text-slate-500 mt-1.5">{note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}