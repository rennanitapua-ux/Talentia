import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import SkillScoreBadge from '@/components/SkillScoreBadge';

export default function TopCandidates({ sims }) {
  const navigate = useNavigate();
  if (!sims.length) {
    return <div className="rounded-xl surface p-6 text-center text-xs text-muted-foreground">Nenhum candidato avaliado ainda.</div>;
  }
  return (
    <div className="space-y-2">
      {sims.map((sim, i) => (
        <button key={sim.id} onClick={() => navigate(`/company/candidates/${sim.id}`)}
          className="w-full flex items-center gap-3 rounded-xl surface p-3 text-left hover:border-primary/35 transition-colors">
          <span className="w-5 text-xs font-mono text-muted-foreground">{i + 1}</span>
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{sim.candidate_name?.charAt(0).toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate flex items-center gap-1.5">
              {sim.candidate_name}
              {(sim.ai_flags || []).length > 0 && <Bot className="w-3.5 h-3.5 text-rose-400" title="Suspeita de IA" />}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{sim.job_title}{sim.disc_profile ? ` · DISC ${sim.disc_profile}` : ''}</div>
          </div>
          <SkillScoreBadge score={sim.overall_score || 0} size="sm" />
        </button>
      ))}
    </div>
  );
}