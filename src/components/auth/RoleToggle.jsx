import React from 'react';
import { Building2, User } from 'lucide-react';

const ROLES = [
  { value: 'company', label: 'Empresa', icon: Building2 },
  { value: 'candidate', label: 'Candidato', icon: User },
];

export default function RoleToggle({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/60 border border-border">
      {ROLES.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            value === v ? 'bg-card text-foreground shadow-soft border border-border' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className={`w-4 h-4 ${value === v ? (v === 'company' ? 'text-brand-cyan' : 'text-brand-violet') : ''}`} />
          {label}
        </button>
      ))}
    </div>
  );
}