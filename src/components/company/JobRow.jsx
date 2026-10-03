import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ChevronRight, Users } from 'lucide-react';
import { LEVELS, getSituations } from '@/lib/situations';

export default function JobRow({ job, evaluated, inProgress }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/candidate/simulate/${job.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/company/jobs/${job.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/company/jobs/${job.id}`)}
      className="group flex items-center gap-4 rounded-xl surface px-5 py-4 cursor-pointer hover:border-primary/35 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${job.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
            {job.status === 'published' ? 'Ativa' : job.status === 'closed' ? 'Encerrada' : 'Rascunho'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 truncate">
          {[job.sector, LEVELS[job.difficulty], `${job.openings || 1} ${(job.openings || 1) > 1 ? 'vagas' : 'vaga'}`, `${getSituations(job).length} situações`].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground" title="Avaliados / em andamento">
        <Users className="w-4 h-4" />
        <span className="text-foreground font-semibold">{evaluated}</span>
        {inProgress > 0 && <span className="text-xs">+{inProgress}</span>}
      </div>
      <button onClick={copy} className="h-9 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-muted transition-colors">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar link'}</span>
      </button>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
    </div>
  );
}