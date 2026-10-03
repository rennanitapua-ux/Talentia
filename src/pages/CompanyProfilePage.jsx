import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Edit3, Save, Building2, MapPin, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Background from '@/components/Background';
import Logo from '@/components/Logo';
import AppHeader from '@/components/AppHeader';
import StepBasics from '@/components/company/onboarding/StepBasics';
import StepCulture from '@/components/company/onboarding/StepCulture';
import StepValues from '@/components/company/onboarding/StepValues';

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      const profiles = await base44.entities.CompanyProfile.filter({ user_id: u.id });
      setProfile(profiles?.[0] || null);
      if (profiles?.[0]) setForm({ ...profiles[0] });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.CompanyProfile.update(profile.id, form);
      setProfile({ ...profile, ...form });
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Você ainda não completou o onboarding da empresa.</p>
        <Button onClick={() => navigate('/company/onboarding')}>Completar onboarding</Button>
      </div>
    );
  }

  const TABS = [
    { key: 'basics', label: 'Identidade', component: StepBasics },
    { key: 'culture', label: 'Cultura', component: StepCulture },
    { key: 'values', label: 'Propósito', component: StepValues },
  ];
  const ActiveTab = TABS.find((t) => t.key === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background relative">
      <Background />
      <div className="relative z-10">
        <AppHeader />
        <div className="max-w-3xl mx-auto px-5 py-8 pb-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl text-foreground">{profile.company_name}</h1>
              <p className="text-sm text-muted-foreground">{profile.trade_name || profile.sector || 'Perfil da empresa'}</p>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setForm({ ...profile }); setEditing(false); }}>Cancelar</Button>
                <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}><Edit3 className="w-4 h-4 mr-2" />Editar</Button>
            )}
          </div>

          {editing ? (
            <>
              <div className="flex gap-2 mb-5">
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <ActiveTab form={form} update={update} />
              </div>
            </>
          ) : (
            <ReadonlyProfile profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReadonlyProfile({ profile: p }) {
  return (
    <div className="space-y-5">
      {p.description && (
        <Card icon={Building2} title="Sobre a empresa">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{p.description}</p>
        </Card>
      )}
      {(p.valued?.length || p.decision_making?.length || p.autonomy_level) && (
        <Card icon={Sparkles} title="Cultura">
          <div className="space-y-4">
            {p.valued?.length > 0 && <Field label="O que é valorizado"><Tags items={p.valued} /></Field>}
            {p.decision_making?.length > 0 && <Field label="Tomada de decisão"><Tags items={p.decision_making} /></Field>}
            {p.autonomy_level && <Field label="Autonomia"><span className="text-sm text-foreground/80">{p.autonomy_level}</span></Field>}
            {p.autonomy_description && <p className="text-sm text-muted-foreground italic">{p.autonomy_description}</p>}
            {p.management_style?.length > 0 && <Field label="Estilo de gestão"><Tags items={p.management_style} /></Field>}
            {p.error_handling?.length > 0 && <Field label="Lida com erros"><Tags items={p.error_handling} /></Field>}
            {p.error_description && <p className="text-sm text-muted-foreground italic">{p.error_description}</p>}
            {p.collaboration?.length > 0 && <Field label="Trabalho em equipe"><Tags items={p.collaboration} /></Field>}
            {p.communication?.length > 0 && <Field label="Comunicação"><Tags items={p.communication} /></Field>}
            {p.work_rhythm && <Field label="Ritmo"><span className="text-sm text-foreground/80">{p.work_rhythm}</span></Field>}
            {p.rhythm_description && <p className="text-sm text-muted-foreground italic">{p.rhythm_description}</p>}
            {p.work_environment?.length > 0 && <Field label="Ambiente"><Tags items={p.work_environment} /></Field>}
          </div>
        </Card>
      )}
      {(p.purpose || p.mission || p.vision || p.values?.length) && (
        <Card icon={Target} title="Propósito e valores">
          <div className="space-y-4">
            {p.purpose && <Field label="Propósito"><p className="text-sm text-foreground/80">{p.purpose}</p></Field>}
            {p.mission && <Field label="Missão"><p className="text-sm text-foreground/80">{p.mission}</p></Field>}
            {p.vision && <Field label="Visão"><p className="text-sm text-foreground/80">{p.vision}</p></Field>}
            {p.values?.length > 0 && (
              <div className="space-y-2">
                {p.values.map((v, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 border border-border/50 p-3">
                    <div className="font-semibold text-sm text-primary mb-0.5">{v.name}</div>
                    {v.description && <p className="text-sm text-foreground/80">{v.description}</p>}
                    {v.expected_behavior && <p className="text-xs text-muted-foreground italic mt-1">→ {v.expected_behavior}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
      {p.what_succeeds && (
        <Card icon={Target} title="O que faz uma pessoa dar certo aqui">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{p.what_succeeds}</p>
        </Card>
      )}
      {p.what_doesnt_work && (
        <Card icon={AlertTriangle} title="O que costuma gerar dificuldades">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{p.what_doesnt_work}</p>
        </Card>
      )}
      {(p.city || p.state || p.website) && (
        <Card icon={MapPin} title="Localização e presença">
          <div className="space-y-1 text-sm text-foreground/80">
            {p.city && <p>{p.city}{p.state ? ` — ${p.state}` : ''}</p>}
            {p.website && <p className="text-primary hover:underline">{p.website}</p>}
            {p.linkedin && <p className="text-primary hover:underline">{p.linkedin}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return <div><div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>{children}</div>;
}

function Tags({ items }) {
  return <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} className="px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 text-xs text-foreground/80">{i}</span>)}</div>;
}