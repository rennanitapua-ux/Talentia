import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import Background from '@/components/Background';
import StepBasics from '@/components/jobs/StepBasics';
import StepProblem from '@/components/jobs/StepProblem';
import StepCompetencies from '@/components/jobs/StepCompetencies';
import StepAssessment from '@/components/jobs/StepAssessment';
import { generateAssessment, buildFallbackAssessment } from '@/lib/ai/generateAssessment';

const STEPS = ['Vaga', 'Problema e situações', 'Competências', 'Simulação'];

export default function CompanyJobCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    company_name: '', title: '', sector: '', difficulty: 'mid', openings: 1,
    company_problems: '', situations: [], company_context: '', product: '', client: '', competencies: [],
  });
  const [assessment, setAssessment] = useState({ status: 'idle', count: 12, data: null });
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    base44.auth.me().then((u) => u?.company_name && setForm((f) => (f.company_name ? f : { ...f, company_name: u.company_name }))).catch(() => {});
  }, []);

  const missing = [
    !form.company_name.trim() || !form.title.trim() || !form.sector ? 'Preencha empresa, cargo e área.' : '',
    !form.company_problems.trim() || form.situations.length < 1 ? 'Descreva o problema real e adicione pelo menos 1 situação.' : '',
    form.competencies.length < 2 ? 'Escolha pelo menos 2 competências.' : '',
  ][step];

  const generate = async (useFallback = false) => {
    setAssessment((a) => ({ ...a, status: 'generating' }));
    const data = useFallback ? buildFallbackAssessment(form, assessment.count) : await generateAssessment(form, assessment.count);
    setAssessment((a) => ({ ...a, status: data ? 'ready' : 'error', data }));
  };

  const removeSituation = (idx) =>
    setAssessment((a) => ({ ...a, data: { ...a.data, situations: a.data.situations.filter((_, i) => i !== idx) } }));

  const publish = async () => {
    setPublishing(true);
    setPublishError('');
    try {
      const { data } = assessment;
      const job = await base44.entities.Job.create({
        ...form, role: form.title, openings: Number(form.openings) || 1, status: 'published',
        virtual_company_profile: data.virtual_company_profile,
        assessment: { version: 2, source: data.source, generated_at: new Date().toISOString(), situations: data.situations },
        simulation_scenarios: [],
      });
      navigate(`/company/jobs/${job.id}`);
    } catch (e) {
      setPublishError('Não conseguimos publicar agora. Seus dados continuam aqui — tente novamente.');
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Background />
      <AppHeader area="company" />
      <main className="relative max-w-3xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold">Nova vaga</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Conte o problema real e as situações do dia a dia — a TalentOS cria a simulação.</p>

        <ol className="mt-8 mb-6 grid grid-cols-4 gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="space-y-2">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center gap-1.5 text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {i < step && <Check className="w-3 h-3 text-primary" />}
                <span className="truncate">{label}</span>
              </div>
            </li>
          ))}
        </ol>

        <section className="rounded-2xl surface p-6 sm:p-8">
          {step === 0 && <StepBasics form={form} update={update} />}
          {step === 1 && <StepProblem form={form} update={update} />}
          {step === 2 && <StepCompetencies form={form} update={update} />}
          {step === 3 && (
            <StepAssessment
              state={assessment}
              setCount={(count) => setAssessment((a) => ({ ...a, count }))}
              onGenerate={() => generate(false)}
              onFallback={() => generate(true)}
              onRemove={removeSituation}
              onPublish={publish}
              publishing={publishing}
              competencyCount={form.competencies.length}
            />
          )}
          {publishError && <p className="mt-4 text-sm text-destructive">{publishError}</p>}
        </section>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button onClick={() => (step === 0 ? navigate('/company') : setStep(step - 1))} className="h-11 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          {step < 3 && (
            <div className="flex items-center gap-4">
              {missing && <span className="hidden sm:inline text-xs text-muted-foreground">{missing}</span>}
              <button onClick={() => setStep(step + 1)} disabled={!!missing} className="h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-40">
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}