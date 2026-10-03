import React from 'react';
import { Activity } from 'lucide-react';
import { BEHAVIOR_AXES } from '@/lib/ai/behavior';
import { clamp } from '@/lib/ai/llm';

export default function BehaviorProfile({ profile }) {
  if (!profile?.axes) return null;
  return (
    <section className="rounded-2xl surface p-6">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-brand-cyan" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Como a pessoa age</span>
      </div>
      {profile.summary && <p className="text-sm text-foreground/85 leading-relaxed">{profile.summary}</p>}

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
        {BEHAVIOR_AXES.map((a) => {
          const v = profile.axes[a.key] || { position: 50 };
          const pos = clamp(v.position ?? 50);
          return (
            <div key={a.key}>
              <div className="flex justify-between text-xs mb-2">
                <span className={pos <= 40 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>{a.left}</span>
                <span className={pos >= 60 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>{a.right}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-gradient-to-r from-brand-violet/50 via-muted to-brand-cyan/50">
                <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-foreground ring-4 ring-background" style={{ left: `${pos}%` }} />
              </div>
              {v.evidence && <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{v.evidence}</p>}
            </div>
          );
        })}
      </div>

      {(profile.decision_style || profile.under_pressure) && (
        <div className="grid md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-border">
          {profile.decision_style && <div><div className="text-xs text-muted-foreground mb-1">Estilo de decisão</div><p className="text-sm text-foreground/85 leading-relaxed">{profile.decision_style}</p></div>}
          {profile.under_pressure && <div><div className="text-xs text-muted-foreground mb-1">Sob pressão</div><p className="text-sm text-foreground/85 leading-relaxed">{profile.under_pressure}</p></div>}
        </div>
      )}
      {(profile.dominant_traits?.length > 0 || profile.risks?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-5">
          {(profile.dominant_traits || []).map((t, i) => <span key={`t${i}`} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">{t}</span>)}
          {(profile.risks || []).map((t, i) => <span key={`r${i}`} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs">⚠ {t}</span>)}
        </div>
      )}
    </section>
  );
}