import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Background from '@/components/Background';
import Logo from '@/components/Logo';
import StepBasics from '@/components/company/onboarding/StepBasics';
import StepCulture from '@/components/company/onboarding/StepCulture';
import StepValues from '@/components/company/onboarding/StepValues';

const STEPS = [
  { key: 'basics', label: 'Identidade', component: StepBasics },
  { key: 'culture', label: 'Cultura', component: StepCulture },
  { key: 'values', label: 'Propósito', component: StepValues },
];

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [existing, setExisting] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ values: [], valued: [], decision_making: [], management_style: [], error_handling: [], collaboration: [], communication: [], work_environment: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const CurrentStep = STEPS[step].component;

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.CompanyProfile.filter({ user_id: u.id });
      if (profiles?.[0]) {
        setExisting(profiles[0]);
        setForm((f) => ({ ...f, ...profiles[0] }));
      } else {
        update('company_name', u.company_name || '');
      }
    })();
  }, []);

  const canProceed = () => {
    if (step === 0) return (form.company_name || '').trim().length > 0;
    return true;
  };

  const next = () => {
    if (!canProceed()) { setError('Informe o nome da empresa para continuar.'); return; }
    setError('');
    if (step < STEPS.length - 1) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    save();
  };

  const back = () => {
    setError('');
    if (step > 0) { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, user_id: user.id, completed: true, company_name: (form.company_name || '').trim() };
      if (existing) {
        await base44.entities.CompanyProfile.update(existing.id, payload);
      } else {
        await base44.entities.CompanyProfile.create(payload);
      }
      // Ensure the user's display_name and company_name are set
      await base44.auth.updateMe({ account_type: 'company', company_name: payload.company_name, display_name: user.full_name || user.display_name || '' }).catch(() => {});
      navigate('/company', { replace: true });
    } catch (e) {
      setError('Não foi possível salvar agora. Tente novamente.');
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Background />
      <div className="relative z-10">
        <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <Logo size="sm" withText />
            <span className="text-xs text-muted-foreground">Onboarding da empresa</span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-5 py-8 pb-32">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground/50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${i < step ? 'bg-primary text-primary-foreground border-primary' : i === step ? 'border-primary text-primary' : 'border-border'}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <CurrentStep form={form} update={update} />
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <Button onClick={next} disabled={saving || !canProceed()} className="h-11 px-6">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : step === STEPS.length - 1 ? <>Concluir onboarding<Check className="w-4 h-4 ml-2" /></>
                : <>Continuar<ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}