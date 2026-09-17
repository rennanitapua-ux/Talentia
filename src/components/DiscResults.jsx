import React from 'react';
import { DISC_PROFILES } from '@/lib/discTest';
import { Brain } from 'lucide-react';

export default function DiscResults({ results, compact = false }) {
  if (!results) return null;
  const { scores, dominant, secondary, profile_code } = results;
  const profile = DISC_PROFILES[dominant];
  const secondaryProfile = DISC_PROFILES[secondary];
  const dimensions = [
    { letter: 'D', name: 'Dominância', color: '#ef4444' },
    { letter: 'I', name: 'Influência', color: '#f59e0b' },
    { letter: 'S', name: 'Estabilidade', color: '#10b981' },
    { letter: 'C', name: 'Conformidade', color: '#3b82f6' },
  ];

  return (
    <div className={compact ? '' : 'glass rounded-2xl p-6 shadow-card'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-5">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Perfil Comportamental DISC</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold" style={{ background: `${profile.color}20`, color: profile.color }}>
            {profile_code}
          </span>
        </div>
      )}

      {/* Score bars */}
      <div className="space-y-3 mb-5">
        {dimensions.map(d => (
          <div key={d.letter}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: d.color }}>{d.letter} — {d.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{scores[d.letter]}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${scores[d.letter]}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Dominant profile card */}
      <div className="rounded-xl p-4 mb-3" style={{ background: `${profile.color}0d`, border: `1px solid ${profile.color}33` }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-lg">{profile.icon}</span>
          <span className="text-sm font-bold" style={{ color: profile.color }}>{profile.name} ({dominant})</span>
          <span className="text-[10px] text-muted-foreground">— perfil dominante</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.traits.map((t, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px]" style={{ background: `${profile.color}15`, color: profile.color }}>{t}</span>
          ))}
        </div>
        {!compact && (
          <>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-mono text-emerald-400 uppercase mb-1.5 text-[10px] tracking-wider">Pontos Fortes</div>
                <ul className="space-y-1 text-muted-foreground">
                  {profile.strengths.slice(0, 3).map((s, i) => <li key={i} className="flex gap-1.5"><span className="text-emerald-400/60">•</span>{s}</li>)}
                </ul>
              </div>
              <div>
                <div className="font-mono text-amber-400 uppercase mb-1.5 text-[10px] tracking-wider">Pontos de Atenção</div>
                <ul className="space-y-1 text-muted-foreground">
                  {profile.weaknesses.slice(0, 3).map((s, i) => <li key={i} className="flex gap-1.5"><span className="text-amber-400/60">•</span>{s}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground leading-relaxed" style={{ borderColor: `${profile.color}25` }}>
              <span className="font-medium" style={{ color: profile.color }}>Estilo de trabalho:</span> {profile.work_style}
            </div>
          </>
        )}
      </div>

      {/* Secondary profile */}
      {!compact && secondaryProfile && (
        <div className="rounded-xl p-3" style={{ background: `${secondaryProfile.color}08`, border: `1px solid ${secondaryProfile.color}20` }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{secondaryProfile.icon}</span>
            <span className="text-xs font-medium" style={{ color: secondaryProfile.color }}>{secondaryProfile.name} ({secondary})</span>
            <span className="text-[10px] text-muted-foreground">— perfil secundário</span>
          </div>
        </div>
      )}
    </div>
  );
}