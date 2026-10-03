import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import Background from '@/components/Background';
import IntelligenceFilters from '@/components/intelligence/IntelligenceFilters';
import ExecutiveSummary from '@/components/intelligence/ExecutiveSummary';
import AggregateStats from '@/components/intelligence/AggregateStats';
import CompetencyFrequency from '@/components/intelligence/CompetencyFrequency';
import JobComparison from '@/components/intelligence/JobComparison';
import AIAnalysisPanel from '@/components/intelligence/AIAnalysisPanel';
import { computeLocalMetrics, generateIntelligenceReport } from '@/lib/ai/candidateIntelligence';

export default function CompanyIntelligence() {
  const navigate = useNavigate();
  const [data, setData] = useState({ loading: true, error: false, jobs: [], sims: [], profile: null });
  const [filters, setFilters] = useState({ jobId: 'all', period: 'all', status: 'all' });
  const [report, setReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setData((d) => ({ ...d, loading: true, error: false }));
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.CompanyProfile.filter({ user_id: user.id });
      const profile = profiles?.[0] || null;
      if (!profile && user.account_type === 'company') {
        navigate('/company/onboarding', { replace: true });
        return;
      }
      const jobs = await base44.entities.Job.filter({ created_by_id: user.id }, '-created_date', 100);
      const sims = jobs.length
        ? await base44.entities.Simulation.filter({ job_id: { $in: jobs.map((j) => j.id) } }, '-created_date', 500)
        : [];
      setData({ loading: false, error: false, jobs, sims, profile });
    } catch {
      setData((d) => ({ ...d, loading: false, error: true }));
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(
    () => computeLocalMetrics(data.jobs, data.sims, filters),
    [data.jobs, data.sims, filters]
  );

  const runAI = useCallback(async () => {
    if (!metrics.hasEnoughData) { setReport(null); return; }
    setAiLoading(true);
    const r = await generateIntelligenceReport(metrics, data.profile);
    setReport(r);
    setAiLoading(false);
  }, [metrics, data.profile]);

  useEffect(() => {
    if (data.loading || data.error) return;
    if (metrics.hasEnoughData && !report && !aiLoading) runAI();
    if (!metrics.hasEnoughData) setReport(null);
  }, [metrics.hasEnoughData, data.loading]);

  const { loading, error, jobs } = data;

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-brand-violet" />
              <h1 className="font-display text-2xl font-bold">Inteligência dos Candidatos</h1>
            </div>
            <p className="text-sm text-muted-foreground">Padrões, lacunas e insights do seu processo seletivo — baseados exclusivamente nos dados disponíveis.</p>
          </div>
          {metrics.hasEnoughData && (
            <button onClick={runAI} disabled={aiLoading} className="h-10 px-4 rounded-xl border border-border text-sm inline-flex items-center gap-2 hover:bg-muted disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} /> Reanalisar
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="rounded-2xl surface p-10 text-center">
            <p className="text-sm text-muted-foreground">Não conseguimos carregar os dados agora.</p>
            <button onClick={load} className="mt-4 h-10 px-4 rounded-lg border border-border text-sm inline-flex items-center gap-2 hover:bg-muted"><RefreshCw className="w-4 h-4" /> Tentar novamente</button>
          </div>
        ) : metrics.total === 0 ? (
          <div className="rounded-2xl surface p-12 text-center">
            <Brain className="w-9 h-9 text-muted-foreground/50 mx-auto mb-4" />
            <div className="font-semibold">Ainda não há candidaturas</div>
            <p className="text-sm text-muted-foreground mt-1">Assim que candidatos responderem às suas simulações, a inteligência da base aparecerá aqui.</p>
          </div>
        ) : (
          <>
            <IntelligenceFilters filters={filters} setFilters={setFilters} jobs={jobs} />
            <ExecutiveSummary metrics={metrics} report={report} />
            <AggregateStats metrics={metrics} />
            <CompetencyFrequency metrics={metrics} />
            <JobComparison metrics={metrics} />
            <AIAnalysisPanel report={report} loading={aiLoading} sample={metrics.sample} />
          </>
        )}
      </main>
    </div>
  );
}