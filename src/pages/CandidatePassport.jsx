import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import Background from '@/components/Background';
import PassportHero from '@/components/passport/PassportHero';
import MySimulations from '@/components/passport/MySimulations';
import OpenJobs from '@/components/passport/OpenJobs';
import { getSituations } from '@/lib/situations';

// One entry per job: the completed simulation if there is one, otherwise the latest attempt.
function latestPerJob(sims) {
  const map = {};
  sims.forEach((s) => {
    const cur = map[s.job_id];
    if (!cur || (s.status === 'completed' && cur.status !== 'completed')) map[s.job_id] = s;
  });
  return Object.values(map);
}

export default function CandidatePassport() {
  const [state, setState] = useState({ loading: true, user: null, sims: [], jobs: [] });

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const [sims, jobs] = await Promise.all([
        base44.entities.Simulation.filter({ candidate_user_id: user.id }, '-created_date', 100),
        base44.entities.Job.filter({ status: 'published' }, '-created_date', 100),
      ]);
      setState({ loading: false, user, sims: latestPerJob(sims), jobs });
    })();
  }, []);

  const { loading, user, sims, jobs } = state;
  const completed = sims.filter((s) => s.status === 'completed');
  const doneJobIds = new Set(completed.map((s) => s.job_id));
  const openJobs = jobs.filter((j) => !doneJobIds.has(j.id) && getSituations(j).length > 0);

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="candidate" />
      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10 space-y-12">
        {loading ? (
          <div className="py-24 flex justify-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <PassportHero user={user} completed={completed} />
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Minhas simulações</h2>
              <MySimulations sims={sims} />
            </section>
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Vagas abertas</h2>
              <OpenJobs jobs={openJobs} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}