import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getSituations } from '@/lib/situations';
import { userName } from '@/lib/accounts';
import { emptyIntegrity, totalViolations, buildResponse, analyzeResponse, finalizeSimulation } from '@/lib/simulationRunner';
import SimulationLock from '@/components/SimulationLock';
import DiscTest from '@/components/DiscTest';
import SimulationIntro from '@/components/simulation/SimulationIntro';
import SimulationTopBar from '@/components/simulation/SimulationTopBar';
import SituationCard from '@/components/simulation/SituationCard';
import FinishingScreen from '@/components/simulation/FinishingScreen';
import IntegrityAlert from '@/components/simulation/IntegrityAlert';

const VIOLATION_KEY = { tab: 'tab_switches', blur: 'focus_losses', fullscreen: 'fullscreen_exits' };

export default function CandidateSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ctx, setCtx] = useState({ loading: true, job: null, user: null, profile: null });
  const [phase, setPhase] = useState('intro');
  const [sim, setSim] = useState(null);
  const [index, setIndex] = useState(0);
  const [violations, setViolations] = useState(0);
  const [alert, setAlert] = useState(null);
  const [finishStep, setFinishStep] = useState(0);
  const [finishError, setFinishError] = useState(false);
  const responsesRef = useRef([]);
  const integrityRef = useRef(emptyIntegrity());
  const pendingRef = useRef([]);
  const saveChain = useRef(Promise.resolve());
  const simIdRef = useRef(null);
  const startedAt = useRef(Date.now());

  const baseSituations = getSituations(ctx.job);
  const situations = baseSituations;

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const job = await base44.entities.Job.get(id).catch(() => null);
      if (!job) return setCtx({ loading: false, job: null });
      const [mine, profiles] = await Promise.all([
        base44.entities.Simulation.filter({ job_id: id, candidate_user_id: user.id }, '-created_date', 20),
        base44.entities.CandidateProfile.filter({ user_id: user.id }),
      ]);
      const done = mine.find((s) => s.status === 'completed');
      if (done) return navigate(`/candidate/results/${done.id}`, { replace: true });
      const open = mine.find((s) => s.status === 'in_progress');
      if (open) {
        responsesRef.current = open.responses || [];
        integrityRef.current = { ...emptyIntegrity(), ...(open.integrity || {}) };
        simIdRef.current = open.id;
        setViolations(totalViolations(integrityRef.current));
        setSim(open);
        if (open.disc_results) {
          setIndex(responsesRef.current.length);
          setPhase('simulating');
        }
      }
      setCtx({ loading: false, job, user, profile: profiles?.[0] || null });
    })();
  }, [id, navigate]);

  const save = () => {
    saveChain.current = saveChain.current
      .then(() => base44.entities.Simulation.update(simIdRef.current, {
        responses: responsesRef.current,
        integrity: integrityRef.current,
        focus_violations: totalViolations(integrityRef.current),
      }))
      .catch(() => {});
    return saveChain.current;
  };

  const flash = (type) => {
    const at = Date.now();
    setAlert({ type, at });
    setTimeout(() => setAlert((a) => (a?.at === at ? null : a)), 4500);
  };

  const bump = (key) => {
    integrityRef.current = { ...integrityRef.current, [key]: (integrityRef.current[key] || 0) + 1 };
    setViolations(totalViolations(integrityRef.current));
    save();
  };

  const startSimulation = async (results, answers) => {
    const disc = { disc_results: results, disc_profile: results?.profile_code || '', disc_answers: answers };
    let current = sim;
    if (current) {
      await base44.entities.Simulation.update(current.id, disc);
      current = { ...current, ...disc };
    } else {
      const { job, user, profile } = ctx;
      current = await base44.entities.Simulation.create({
        job_id: id, job_title: job.title, company_name: job.company_name, company_user_id: job.created_by_id,
        assessment_snapshot: baseSituations,
        candidate_name: profile?.full_name || userName(user) || 'Candidato',
        candidate_user_id: user.id, candidate_email: user.email,
        candidate_phone: profile?.phone || '', candidate_resume_url: profile?.resume_url || '',
        candidate_profile_photo: profile?.profile_photo_url || '',
        status: 'in_progress', started_at: new Date().toISOString(), responses: [],
        integrity: emptyIntegrity(), focus_violations: 0, hiring_status: 'em_analise', ...disc,
      });
    }
    simIdRef.current = current.id;
    setSim(current);
    setIndex(responsesRef.current.length);
    startedAt.current = Date.now();
    setPhase('simulating');
  };

  const handleSubmit = async ({ option, justification, typing }) => {
    const situation = situations[index];
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const response = buildResponse({ situation, index, option, justification, typing, seconds });
    const pos = responsesRef.current.length;
    responsesRef.current = [...responsesRef.current, response];
    save();
    pendingRef.current.push(
      analyzeResponse(ctx.job, situations, response).then((analysis) => {
        responsesRef.current = responsesRef.current.map((r, i) => (i === pos ? { ...r, analysis } : r));
        if (analysis.ai_detection?.is_ai_generated && analysis.ai_detection.confidence >= 60) flash('ai');
        return save();
      })
    );

    startedAt.current = Date.now();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIndex((i) => i + 1);
  };

  const finish = async () => {
    setPhase('finishing');
    setFinishError(false);
    await Promise.allSettled(pendingRef.current);
    await saveChain.current;
    try {
      await finalizeSimulation({
        sim: { ...sim, id: simIdRef.current }, job: ctx.job, situations,
        responses: responsesRef.current, integrity: integrityRef.current, onStep: setFinishStep,
      });
    } catch (e) {
      // finalizeSimulation é à prova de falhas, mas se algo escapar, garante que
      // a simulação fica marcada como concluída para o candidato ver seus resultados.
      console.error('finalizeSimulation threw', e?.message);
      try {
        await base44.entities.Simulation.update(simIdRef.current, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      } catch (e2) { console.error('Fallback save also failed', e2?.message); }
    }
    // Vincula a candidatura (Application) à simulação concluída
    try {
      const apps = await base44.entities.Application.filter({ job_id: id, candidate_user_id: ctx.user.id });
      if (apps?.[0]) {
        await base44.entities.Application.update(apps[0].id, {
          simulation_id: simIdRef.current,
          stage: 'completed',
          completed_at: new Date().toISOString(),
          history: [...(apps[0].history || []), { at: new Date().toISOString(), stage: 'completed', status: apps[0].status || 'em_analise', note: 'Simulação concluída' }],
        });
      }
    } catch (e) {
      console.warn('Application link failed', e?.message);
    }
    // Sempre navega para os resultados — o candidato nunca fica preso.
    navigate(`/candidate/results/${simIdRef.current}`, { replace: true });
  };

  useEffect(() => {
    if (phase === 'simulating' && situations.length > 0 && index >= situations.length) finish();
  }, [phase, index, situations.length]);

  if (ctx.loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!ctx.job || situations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-muted-foreground">{ctx.job ? 'Esta vaga ainda não tem uma simulação configurada.' : 'Vaga não encontrada.'}</p>
        <Link to="/candidate" className="text-sm text-primary hover:underline">Ver vagas abertas</Link>
      </div>
    );
  }
  if (phase === 'intro') return <SimulationIntro job={ctx.job} total={situations.length} onStart={() => setPhase('disc')} />;
  if (phase === 'disc') return <DiscTest onComplete={startSimulation} />;
  if (phase === 'finishing') return <FinishingScreen step={finishStep} error={finishError} onRetry={finish} />;

  const situation = situations[index];
  return (
    <SimulationLock onViolation={(type) => bump(VIOLATION_KEY[type] || 'focus_losses')} violationCount={violations}>
      <div className="min-h-screen bg-background">
        <IntegrityAlert alert={alert} />
        <SimulationTopBar job={ctx.job} index={index} total={situations.length} violations={violations} />
        <main className="max-w-3xl mx-auto px-5 py-10 pb-24">
          {situation && (
            <SituationCard
              key={situation.id}
              situation={situation}
              index={index}
              total={situations.length}
              onSubmit={handleSubmit}
              onPasteBlocked={() => { bump('paste_attempts'); flash('paste'); }}
            />
          )}
        </main>
      </div>
    </SimulationLock>
  );
}