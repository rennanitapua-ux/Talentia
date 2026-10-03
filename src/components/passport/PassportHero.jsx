import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import SkillGraph from '@/components/SkillGraph';
import { userName } from '@/lib/accounts';

export default function PassportHero({ user, completed }) {
  const scores = {};
  completed.forEach((s) => Object.entries(s.skill_scores || {}).forEach(([c, v]) => (scores[c] = scores[c] || []).push(v)));
  const aggregated = Object.fromEntries(Object.entries(scores).map(([c, l]) => [c, Math.round(l.reduce((a, b) => a + b, 0) / l.length)]));
  const comps = Object.keys(aggregated);
  const avg = completed.length ? Math.round(completed.reduce((a, s) => a + (s.overall_score || 0), 0) / completed.length) : null;

  return (
    <section className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 rounded-2xl surface p-7 flex flex-col">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-violet">Skill Passport</div>
        <h1 className="font-display text-3xl font-bold mt-2">Olá, {userName(user) || 'candidato'}</h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.work_area || 'Suas simulações e vagas abertas em um só lugar.'}</p>
        <div className="grid grid-cols-3 gap-3 mt-7">
          {[['Skill Score', avg ?? '—'], ['Concluídas', completed.length], ['Competências', comps.length]].map(([label, value]) => (
            <div key={label}>
              <div className="font-display text-2xl font-bold">{value}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <Link to="/candidate/profile" className="mt-auto pt-7 text-sm text-primary hover:underline inline-flex items-center gap-1.5">
          <UserRound className="w-4 h-4" /> Completar perfil e currículo
        </Link>
      </div>
      <div className="lg:col-span-3 rounded-2xl surface p-6">
        <div className="text-sm font-semibold mb-1">Mapa de competências</div>
        <p className="text-xs text-muted-foreground mb-2">Média das simulações concluídas</p>
        {comps.length >= 3 ? (
          <SkillGraph scores={aggregated} competencies={comps} height={280} />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground text-center px-6">
            Conclua uma simulação para ver seu mapa de competências.
          </div>
        )}
      </div>
    </section>
  );
}