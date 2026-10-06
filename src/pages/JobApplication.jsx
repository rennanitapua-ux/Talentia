import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';
import { userName } from '@/lib/accounts';

// Fluxo de candidatura por link da vaga: /candidatura/vaga/:jobId
// O candidato só chega aqui pelo link enviado pela empresa.
// 1. Se não autenticado → leva direto ao CADASTRO (primeiro cadastro, depois o processo).
//    Quem já tem conta entra pelo link "já tenho conta" na página de cadastro.
// 2. Se autenticado → mostra a vaga e um único botão para entrar na simulação.
//    Perfil é opcional e pode ser completado depois — não bloqueia o início.
export default function JobApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, user: null, job: null, profile: null, application: null, error: null });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Após um hard redirect do cadastro, o SDK pode precisar de um momento
      // para inicializar. Tentamos me() duas vezes antes de desistir.
      let user = await base44.auth.me().catch(() => null);
      if (!user) {
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;
        user = await base44.auth.me().catch(() => null);
      }
      if (!user) { if (!cancelled) setState({ loading: false, user: null }); return; }
      const job = await base44.entities.Job.get(jobId).catch(() => null);
      if (!job) { if (!cancelled) setState({ loading: false, user, job: null, error: 'Vaga não encontrada ou não publicada.' }); return; }
      // Empresa (dono da vaga ou com perfil de empresa) não pode se candidatar como candidato.
      // Desconecta e envia ao cadastro de candidato para criar uma sessão de candidato separada.
      const isOwner = job.created_by_id === user.id;
      const companyProfiles = await base44.entities.CompanyProfile.filter({ user_id: user.id }).catch(() => []);
      if (isOwner || (companyProfiles && companyProfiles.length > 0)) {
        const returnTo = `/candidatura/vaga/${jobId}`;
        base44.auth.logout(`${window.location.origin}/register?returnTo=${encodeURIComponent(returnTo)}&role=candidate`);
        return;
      }
      const [profiles, apps] = await Promise.all([
        base44.entities.CandidateProfile.filter({ user_id: user.id }),
        base44.entities.Application.filter({ job_id: jobId, candidate_user_id: user.id }),
      ]);
      if (!cancelled) {
        setState({
          loading: false, user, job,
          profile: profiles?.[0] || null,
          application: apps?.[0] || null,
        });
      }
    })();

    return () => { cancelled = true; };
  }, [jobId]);

  // Não autenticado → cadastro primeiro. A página de cadastro tem link para login.
  useEffect(() => {
    if (!state.loading && !state.user) {
      const returnTo = `/candidatura/vaga/${jobId}`;
      navigate(`/register?returnTo=${encodeURIComponent(returnTo)}&role=candidate`, { replace: true });
    }
  }, [state.loading, state.user, jobId, navigate]);

  const apply = async () => {
    setCreating(true);
    try {
      const { user, job, profile, application } = state;
      if (!application) {
        await base44.entities.Application.create({
          job_id: jobId,
          job_title: job.title,
          company_user_id: job.created_by_id,
          candidate_user_id: user.id,
          candidate_profile_id: profile?.id || '',
          candidate_name: profile?.full_name || userName(user),
          candidate_email: user.email,
          stage: 'simulation',
          status: 'em_analise',
          applied_at: new Date().toISOString(),
          history: [{ at: new Date().toISOString(), stage: 'simulation', status: 'em_analise', note: 'Candidatura iniciada' }],
        });
      }
      navigate(`/candidate/simulate/${jobId}`);
    } catch (e) {
      setCreating(false);
      alert('Não foi possível iniciar a candidatura. Tente novamente.');
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  // Não autenticado — redirecionando ao cadastro (useEffect acima). Mostra loader.
  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <span className="text-sm">Preparando seu cadastro...</span>
        </div>
      </div>
    );
  }

  // Vaga não encontrada
  if (!state.job) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-5">
        <Background />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">{state.error || 'Vaga indisponível.'}</p>
        </div>
      </div>
    );
  }

  const { job, application } = state;

  return (
    <div className="min-h-screen relative">
      <Background />
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Logo size="sm" withText />
        </div>
      </header>
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Vaga: {job.title}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{application ? 'Continuar candidatura' : 'Bem-vindo à simulação'}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.company_name} · {job.sector || '—'}
            </p>
            {job.company_problems && (
              <p className="text-sm text-foreground/70 leading-relaxed mt-3">{job.company_problems}</p>
            )}
          </div>
          <div className="glass rounded-2xl shadow-card p-6">
            {application && (
              <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                Você já iniciou esta candidatura. Continue de onde parou.
              </div>
            )}
            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-5">
              A simulação avalia como você age em situações reais da vaga. Suas respostas geram evidências usadas pela IA para analisar aderência ao contexto — não é uma prova de certo/errado. Você pode completar seu perfil depois, sem perder o que já respondeu.
            </p>
            <button
              onClick={apply}
              disabled={creating}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando...</> : <>{application ? 'Continuar simulação' : 'Iniciar simulação'} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Conectado como <span className="text-foreground">{state.user.email}</span> ·{' '}
              <button
                onClick={() => base44.auth.logout(`${window.location.origin}/register?returnTo=${encodeURIComponent(`/candidatura/vaga/${jobId}`)}&role=candidate`)}
                className="text-primary hover:underline"
              >
                Não é você? Trocar de conta
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}