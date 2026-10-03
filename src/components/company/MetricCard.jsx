import React from 'react';

export default function MetricCard({ icon: Icon, label, value, hint, tone = 'text-primary' }) {
  return (
    <div className="rounded-2xl surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}