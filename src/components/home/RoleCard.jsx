import React from 'react';
import { ArrowRight } from 'lucide-react';

const TONES = {
  cyan: {
    box: 'bg-brand-cyan/10 border-brand-cyan/25',
    icon: 'text-brand-cyan',
    hover: 'hover:border-brand-cyan/35',
    glow: 'bg-brand-cyan/15',
    arrow: 'group-hover:bg-brand-cyan group-hover:border-brand-cyan group-hover:text-background',
  },
  violet: {
    box: 'bg-brand-violet/10 border-brand-violet/25',
    icon: 'text-brand-violet',
    hover: 'hover:border-brand-violet/35',
    glow: 'bg-brand-violet/15',
    arrow: 'group-hover:bg-brand-violet group-hover:border-brand-violet group-hover:text-background',
  },
};

export default function RoleCard({ icon: Icon, title, text, tone, onClick }) {
  const t = TONES[tone];
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden text-left rounded-2xl surface p-7 sm:p-8 flex flex-col min-h-[250px] transition-all duration-300 hover:-translate-y-1 ${t.hover}`}
    >
      <span className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${t.glow}`} />
      <span className={`relative w-12 h-12 rounded-xl border flex items-center justify-center ${t.box}`}>
        <Icon className={`w-5 h-5 ${t.icon}`} />
      </span>
      <span className="relative mt-7 text-xl font-semibold text-foreground">{title}</span>
      <span className="relative mt-2 text-[15px] text-muted-foreground leading-relaxed max-w-sm">{text}</span>
      <span className="relative mt-auto pt-8 flex justify-end">
        <span className={`w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground transition-all duration-300 ${t.arrow}`}>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}