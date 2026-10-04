import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, RefreshCw, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Background from '@/components/Background';
import AppHeader from '@/components/AppHeader';
import ExecutiveSummary from '@/components/intelligence/ExecutiveSummary';
import AggregateStats from '@/components/intelligence/AggregateStats';
import CompetencyFrequency from '@/components/intelligence/CompetencyFrequency';
import AIAnalysisPanel from '@/components/intelligence/AIAnalysisPanel';
import { computeLocalMetrics, generateIntelligenceReport } from '@/lib/ai/candidateIntelligence';
import { ADERENCIA, ADERENCIA_ORDER } from '@/lib/aderencia';

// Inteligência da Vaga — análise agregada SOMENTE dos candidatos desta vaga.
export default function JobIntelligence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ loading: true, error: false, job: null, sims: [], profile: null });
  const [report, setReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const job = await base44.entities.Job.get(id).catch(() => null);
        if (!job) { setData({ loading: false, error: true, job: null, sims: [] }); return; }
        const [profiles, sims] = await Promise.all([
          base44.entities.CompanyProfile.filter({ user_id: job.created_by_id || user.id }),
          base44.entities.Simulation.filter({ job_id: id }, '-created_date', 500),
        ]);
        setData({ loading: false, error: false, job, sims: sims || [], profile: profiles?.[0] || null });
      } catch {
        setData({ loading: false, error: true, job: null, sims: [] });
      }
    })();
  }, [id]);

  const metrics = useMemo(
    () => data.job ? computeLocalMetrics([data.job], data.sims, { jobId: id }) : null,
    [data.job, data.sims, id]
  );

  const runAI = useCallback(async () => {
    if (!metrics || !metrics.hasEnoughData) { setReport(null); return; }
    setAiLoading(true);
    const r = await generateIntelligenceReport(metrics, data.profile, data.job);
    setReport(r);
    setAiLoading(false);
  }, [metrics, data.profile, data.job]);

  useEffect(() => {
    if (data.loading || data.error) return;
    if (metrics?.hasEnoughData && !report && !aiLoading) runAI();
  }, [metrics, data.loading, data.error]);

  // Distribuição de aderência dos candidatos desta vaga
  const aderenciaDistribution = useMemo(() => {
    const dist = { atende: 0, supera: 0, parcial: 0, abaixo: 0, validar: 0, insuficiente: 0 };
    (data.sims || []).forEach((s) => {
      if (s.status !== 'completed' || !s.aderencia) return;
      const d = s.aderencia.distribution || {};
      Object.keys(dist).forEach((k) => { dist[k] += d[k] || 0; });
    });
    return dist;
  }, [data.sims]);

  const { loading, error, job } = data;
  if (loading) return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10">
        <button onClick={() => navigate(`/company/jobs/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar à vaga
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-brand-violet" />
              <h1 className="font-display text-2xl font-bold">Inteligência da Vaga</h1>
            </div>
            <p className="text-sm text-muted-foreground">{job?.title} · análise exclusiva dos candidatos desta vaga.</p>
          </div>
          {metrics?.hasEnoughData && (
            <button onClick={runAI} disabled={aiLoading} className="h-10 px-4 rounded-xl border border-border text-sm inline-flex items-center gap-2 hover:bg-muted disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} /> Reanalisar
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl surface p-10 text-center">
            <p className="text-sm text-muted-foreground">Não conseguimos carregar os dados desta vaga.</p>
          </div>
        ) : !metrics || metrics.total === 0 ? (
          <div className="rounded-2xl surface p-12 text-center">
            <Brain className="w-9 h-9 text-muted-foreground/50 mx-auto mb-4" />
            <div className="font-semibold">Nenhum candidato nesta vaga ainda</div>
            <p className="text-sm text-muted-foreground mt-1">Compartilhe o link da vaga para receber candidaturas.</p>
          </div>
        ) : (
          <>
            <ExecutiveSummary metrics={metrics} report={report} />
            <AggregateStats metrics={metrics} />

            {/* Distribuição de aderência */}
            <div className="rounded-2xl surface p-6 mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Distribuição de aderência</h3>
              <p className="text-xs text-muted-foreground/70 mb-4">Quantos candidatos atendem, superam, parcialmente atendem ou precisam de validação — somado por competência.</p>
              <div className="space-y-2.5">
                {ADERENCIA_ORDER.map((key) => {
                  const entry = Object.values(ADERENCIA).find((a) => a.key === key);
                  const count = aderenciaDistribution[key] || 0;
                  const max = Math.max(1, ...Object.values(aderenciaDistribution));
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-foreground/80 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                        {entry.short}
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: entry.color }} />
                      </div>
                      <div className="w-10 text-right text-xs font-mono text-muted-foreground">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <CompetencyFrequency metrics={metrics} />
            <AIAnalysisPanel report={report} loading={aiLoading} sample={metrics.sample} />
          </>
        )}
      </main>
    </div>
  );
}