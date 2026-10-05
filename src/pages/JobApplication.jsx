import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2, FileText, User, Briefcase, ShieldCheck, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';
import { userName } from '@/lib/accounts';

// Fluxo de candidatura por link da vaga: /candidatura/vaga/:jobId
// Público até identificação. Se não autenticado → cadastro/login com returnTo.
// Se autenticado + perfil incompleto → completar perfil. Se completo → cria candidatura e vai à simulação.
export default function JobApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, user: null, job: null, profile: null, application: null, error: null });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) { setState({ loading: false, user: null }); return; }
      const job = await base44.entities.Job.get(jobId).catch(() => null);
      if (!job) { setState({ loading: false, user, job: null, error: 'Vaga não encontrada ou não publicada.' }); return; }
      const [profiles, apps] = await Promise.all([
        base44.entities.CandidateProfile.filter({ user_id: user.id }),
        base44.entities.Application.filter({ job_id: jobId, candidate_user_id: user.id }),
      ]);
      setState({
        loading: false, user, job,
        profile: profiles?.[0] || null,
        application: apps?.[0] || null,
      });
    })();
  }, [jobId]);

  const startLogin = () => {
    const returnTo = `/candidatura/vaga/${jobId}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };
  const startRegister = () => {
    const returnTo = `/candidatura/vaga/${jobId}`;
    navigate(`/register?returnTo=${encodeURIComponent(returnTo)}&role=candidate`);
  };

  const profileComplete = (p) => {
    const base = !!(p && p.completed && p.full_name && p.cpf);
    if (!base) return false;
    if (state.job?.resume_required === false) return true;
    return !!p.resume_url;
  };

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

  // Não autenticado — identificação
  if (!state.user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-5">
        <Background />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-6"><Logo size="lg" withText /></div>
          <div className="glass rounded-2xl shadow-card p-8">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Candidatura</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Candidate-se à vaga</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Para se candidatar, você precisa de uma conta TalentIA. Se já tem, entre. Se não, crie agora — é rápido e seus dados ficam guardados para futuras candidaturas.
            </p>
            <div className="space-y-3">
              <button onClick={startLogin} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                <LogIn className="w-4 h-4" /> Já tenho conta — Entrar
              </button>
              <button onClick={startRegister} className="w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center gap-2 hover:bg-accent transition-colors">
                Criar conta <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
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
          <button onClick={() => navigate('/candidate')} className="mt-4 text-sm text-primary hover:underline">Ver vagas abertas</button>
        </div>
      </div>
    );
  }

  const { job, profile, application } = state;
  const complete = profileComplete(profile);

  // Perfil incompleto — orientar completar
  if (!complete) {
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
              <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Vaga: {job.title}</div>
              <h1 className="text-2xl font-bold mb-2">Complete seu perfil profissional</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Antes de responder à simulação, precisamos do seu perfil completo. Esses dados ficam salvos — você não precisa repetir em próximas candidaturas.
              </p>
            </div>
            <div className="glass rounded-2xl shadow-card p-6 space-y-4">
              <Step icon={User} label="Dados pessoais e CPF" done={!!(profile?.full_name && profile?.cpf)} />
              <Step icon={FileText} label="Endereço e contato" done={!!(profile?.cep && profile?.phone)} />
              <Step icon={Briefcase} label="Experiência e currículo" done={job.resume_required === false ? true : !!profile?.resume_url} />
              <Step icon={ShieldCheck} label="Privacidade configurada" done={profile != null} />
            </div>
            <button
              onClick={() => navigate(`/candidate/profile?returnTo=${encodeURIComponent(`/candidatura/vaga/${jobId}`)}`)}
              className="w-full mt-6 h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Completar perfil <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Perfil completo — pronto para candidatar
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
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Candidatura</div>
            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
            <p className="text-sm text-muted-foreground">{job.company_name} · {job.sector || ''}</p>
          </div>
          <div className="glass rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Perfil completo</div>
                <div className="text-xs text-muted-foreground">Olá, {profile.full_name}. Você está pronto para a simulação desta vaga.</div>
              </div>
            </div>
            {application && (
              <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                Você já iniciou esta candidatura. Continue de onde parou.
              </div>
            )}
            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-5">
              A simulação avalia como você age em situações reais da vaga. Suas respostas geram evidências usadas pela IA para analisar aderência ao contexto — não é uma prova de certo/errado.
            </p>
            <button
              onClick={apply}
              disabled={creating}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando...</> : <>{application ? 'Continuar simulação' : 'Iniciar simulação'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, done }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-foreground/80 flex-1">{label}</span>
      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] font-mono text-muted-foreground/60">pendente</span>}
    </div>
  );
}