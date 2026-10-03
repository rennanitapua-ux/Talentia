import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, PlayCircle } from 'lucide-react';
import SkillScoreBadge from '@/components/SkillScoreBadge';

const HIRING = {
  em_analise: { label: 'Em análise', cls: 'bg-muted text-muted-foreground' },
  convocacao_entrevista: { label: 'Convocado para entrevista', cls: 'bg-sky-500/10 text-sky-400' },
  entrevista_agendada: { label: 'Entrevista agendada', cls: 'bg-brand-violet/10 text-brand-violet' },
  aprovado: { label: 'Aprovado', cls: 'bg-emerald-500/10 text-emerald-400' },
  reprovado: { label: 'Processo encerrado', cls: 'bg-rose-500/10 text-rose-400' },
};

export default function MySimulations({ sims }) {
  const navigate = useNavigate();
  if (!sims.length) {
    return <div className="rounded-2xl surface p-8 text-center text-sm text-muted-foreground">Você ainda não iniciou nenhuma simulação. Escolha uma vaga abaixo.</div>;
  }
  return (
    <div className="space-y-2.5">
      {sims.map((s) => {
        const done = s.status === 'completed';
        const hiring = HIRING[s.hiring_status] || HIRING.em_analise;
        return (
          <button key={s.id} onClick={() => navigate(done ? `/candidate/results/${s.id}` : `/candidate/simulate/${s.job_id}`)}
            className="group w-full flex items-center gap-4 rounded-xl surface px-5 py-4 text-left hover:border-primary/35 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{s.job_title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.company_name}</div>
            </div>
            {done ? (
              <>
                <span className={`hidden sm:inline px-2.5 py-1 rounded-full text-[11px] font-medium ${hiring.cls}`}>{hiring.label}</span>
                <SkillScoreBadge score={s.overall_score || 0} size="sm" />
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-400"><PlayCircle className="w-4 h-4" /> Continuar · {(s.responses || []).length} respondidas</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </button>
        );
      })}
    </div>
  );
}