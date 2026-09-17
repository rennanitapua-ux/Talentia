import React from 'react';
import { getScoreLabel, getTierColor } from '@/lib/skillScoring';

export default function SkillScoreBadge({ score, size = 'md' }) {
  const { label, tier } = getScoreLabel(score);
  const color = getTierColor(tier);
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold font-mono border-2`}
        style={{ color, borderColor: color, background: `${color}15` }}
      >
        {score}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>{tier}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}