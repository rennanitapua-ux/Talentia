import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { LEVELS, getSituations, estimateMinutes } from '@/lib/situations';

export default function OpenJobs({ jobs }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const list = jobs.filter((j) => !term || [j.title, j.company_name, j.sector].join(' ').toLowerCase().includes(term));

  return (
    <div>
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cargo, empresa ou área"
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl surface p-8 text-center text-sm text-muted-foreground">Nenhuma vaga aberta encontrada.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((j) => {
            const n = getSituations(j).length;
            return (
              <button key={j.id} onClick={() => navigate(`/candidate/simulate/${j.id}`)}
                className="group text-left rounded-2xl surface p-5 hover:border-brand-violet/40 transition-colors flex flex-col">
                <div className="font-semibold">{j.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{[j.company_name, j.sector, LEVELS[j.difficulty]].filter(Boolean).join(' · ')}</div>
                {j.company_problems && <p className="text-sm text-foreground/70 mt-3 line-clamp-2 leading-relaxed">{j.company_problems}</p>}
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{j.openings || 1} {(j.openings || 1) > 1 ? 'vagas' : 'vaga'} · {n} situações · ~{estimateMinutes(n)} min</span>
                  <span className="flex items-center gap-1 text-brand-violet font-medium">Iniciar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}