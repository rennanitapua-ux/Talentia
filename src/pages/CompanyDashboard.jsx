import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { userName } from '@/lib/accounts';
import AppHeader from '@/components/AppHeader';
import Background from '@/components/Background';
import MetricCard from '@/components/company/MetricCard';
import JobRow from '@/components/company/JobRow';
import TopCandidates from '@/components/company/TopCandidates';
import { filledSeats } from '@/lib/seats';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ loading: true, error: false, user: null, jobs: [], sims: [] });

  const load = async () => {
    setData((d) => ({ ...d, loading: true, error: false }));
    try {
      const user = await base44.auth.me();
      // Redirect to company onboarding if culture profile doesn't exist yet
      const profiles = await base44.entities.CompanyProfile.filter({ user_id: user.id });
      if (!profiles?.[0] && user.account_type === 'company') {
        navigate('/company/onboarding', { replace: true });
        return;
      }
      const jobs = await base44.entities.Job.filter({ created_by_id: user.id }, '-created_date', 100);
      const sims = jobs.length
        ? await base44.entities.Simulation.filter({ job_id: { $in: jobs.map((j) => j.id) } }, '-created_date', 500)
        : [];
      setData({ loading: false, error: false, user, jobs, sims });
    } catch {
      setData((d) => ({ ...d, loading: false, error: true }));
    }
  };

  useEffect(() => { load(); }, []);

  const { loading, error, user, jobs, sims } = data;
  const completed = sims.filter((s) => s.status === 'completed');
  const inProgress = sims.filter((s) => s.status === 'in_progress' && (s.responses || []).length > 0);
  const avgScore = completed.length ? Math.round(completed.reduce((a, s) => a + (s.overall_score || 0), 0) / completed.length) : 0;
  const top = [...completed].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).slice(0, 6);
  const dash = loading ? '—' : null;

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Olá{user ? `, ${userName(user)}` : ''}</p>
            <h1 className="font-display text-3xl font-bold mt-1">{user?.company_name || 'Painel da empresa'}</h1>
          </div>
          <button onClick={() => navigate('/company/jobs/new')} className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Publicar vaga
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl surface p-10 text-center">
            <p className="text-sm text-muted-foreground">Não conseguimos carregar seus dados agora.</p>
            <button onClick={load} className="mt-4 h-10 px-4 rounded-lg border border-border text-sm inline-flex items-center gap-2 hover:bg-muted"><RefreshCw className="w-4 h-4" /> Atualizar</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <MetricCard icon={Briefcase} label="Vagas ativas" value={dash ?? jobs.filter((j) => j.status === 'published').length} hint={`${jobs.length} no total`} />
              <MetricCard icon={Users} label="Candidatos avaliados" value={dash ?? completed.length} tone="text-brand-violet" />
              <MetricCard icon={TrendingUp} label="Skill Score médio" value={dash ?? (completed.length ? avgScore : '—')} tone="text-emerald-400" />
              <MetricCard icon={Clock} label="Em avaliação agora" value={dash ?? inProgress.length} tone="text-amber-400" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <section className="lg:col-span-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Vagas</h2>
                {!loading && jobs.length === 0 ? (
                  <div className="rounded-2xl surface p-12 text-center">
                    <Briefcase className="w-9 h-9 text-muted-foreground/50 mx-auto mb-4" />
                    <div className="font-semibold">Vamos criar sua primeira vaga</div>
                    <p className="text-sm text-muted-foreground mt-1 mb-5">Descreva o problema real e as situações do dia a dia. A simulação é gerada para você.</p>
                    <button onClick={() => navigate('/company/jobs/new')} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Criar primeira vaga</button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {jobs.map((job) => (
                      <JobRow key={job.id} job={job}
                        evaluated={completed.filter((s) => s.job_id === job.id).length}
                        inProgress={inProgress.filter((s) => s.job_id === job.id).length}
                        filledSeats={filledSeats(completed.filter((s) => s.job_id === job.id))} />
                    ))}
                  </div>
                )}
              </section>
              <aside>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Ranking de candidatos</h2>
                <TopCandidates sims={top} />
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}