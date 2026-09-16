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
    <div className={compact ? '' : 'bg-slate-900/60 border border-slate-800 rounded-2xl p-6'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold">Perfil Comportamental DISC</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold" style={{ background: `${profile.color}20`, color: profile.color }}>
            {profile_code}
          </span>
        </div>
      )}

      {/* Score bars */}
      <div className="space-y-2.5 mb-5">
        {dimensions.map(d => (
          <div key={d.letter}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: d.color }}>{d.letter} — {d.name}</span>
              <span className="text-xs font-mono text-slate-400">{scores[d.letter]}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${scores[d.letter]}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Dominant profile card */}
      <div className="rounded-xl p-4 mb-3" style={{ background: `${profile.color}10`, border: `1px solid ${profile.color}40` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{profile.icon}</span>
          <span className="text-sm font-bold" style={{ color: profile.color }}>{profile.name} ({dominant})</span>
          <span className="text-[10px] text-slate-500">— perfil dominante</span>
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
                <div className="font-mono text-emerald-400 uppercase mb-1 text-[10px]">Pontos Fortes</div>
                <ul className="space-y-0.5 text-slate-400">
                  {profile.strengths.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div>
                <div className="font-mono text-amber-400 uppercase mb-1 text-[10px]">Pontos de Atenção</div>
                <ul className="space-y-0.5 text-slate-400">
                  {profile.weaknesses.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-slate-400" style={{ borderColor: `${profile.color}30` }}>
              <span className="font-medium" style={{ color: profile.color }}>Estilo de trabalho:</span> {profile.work_style}
            </div>
          </>
        )}
      </div>

      {/* Secondary profile */}
      {!compact && secondaryProfile && (
        <div className="rounded-xl p-3" style={{ background: `${secondaryProfile.color}08`, border: `1px solid ${secondaryProfile.color}25` }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{secondaryProfile.icon}</span>
            <span className="text-xs font-medium" style={{ color: secondaryProfile.color }}>{secondaryProfile.name} ({secondary})</span>
            <span className="text-[10px] text-slate-500">— perfil secundário</span>
          </div>
        </div>
      )}
    </div>
  );
}