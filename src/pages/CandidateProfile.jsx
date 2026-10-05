import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, MapPin, Camera, Loader2, Check, Upload, FileCheck2, FileText, AlertCircle, Building, Search, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';
import Background from '@/components/Background';
import { maskCPF, validateCPF, maskCEP, fetchAddressByCEP } from '@/lib/cpfUtils';
import { extractResume, mergeExtracted } from '@/lib/ai/extractResume';
import CandidateProfessionalSections from '@/components/candidate/CandidateProfessionalSections';
import { useSignedUrl, getSignedUrl } from '@/lib/useSignedUrl';

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [extractingResume, setExtractingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', cpf: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    linkedin: '', bio: '',
    birth_date: '', country: 'Brasil', current_role: '', desired_role: '', professional_summary: '',
    experiences: [], education: [], courses: [], certifications: [], competencies: [], languages: [],
    resume_url: '', resume_name: '', profile_photo_url: '',
    profile_visible: true, resume_visible: true, phone_visible: true, email_visible: true, allow_contact: true,
  });
  const fileResumeRef = useRef(null);
  const filePhotoRef = useRef(null);
  const { url: photoUrl } = useSignedUrl(form.profile_photo_url);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.CandidateProfile.filter({ user_id: u.id }).then(profiles => {
          if (profiles && profiles.length > 0) {
            const p = profiles[0];
            setProfile(p);
            setForm({
              full_name: p.full_name || u.full_name || '',
              email: u.email || '',
              phone: p.phone || '',
              cpf: p.cpf || '',
              cep: p.cep || '',
              street: p.street || '',
              number: p.number || '',
              complement: p.complement || '',
              neighborhood: p.neighborhood || '',
              city: p.city || '',
              state: p.state || '',
              linkedin: p.linkedin || '',
              bio: p.bio || '',
              birth_date: p.birth_date || '',
              country: p.country || 'Brasil',
              current_role: p.current_role || '',
              desired_role: p.desired_role || '',
              professional_summary: p.professional_summary || '',
              experiences: p.experiences || [],
              education: p.education || [],
              courses: p.courses || [],
              certifications: p.certifications || [],
              competencies: p.competencies || [],
              languages: p.languages || [],
              resume_url: p.resume_url || '',
              resume_name: p.resume_name || '',
              profile_photo_url: p.profile_photo_url || '',
              profile_visible: true,
              resume_visible: true,
              phone_visible: true,
              email_visible: true,
              allow_contact: true,
            });
          } else {
            setForm(f => ({ ...f, full_name: u.full_name || '', email: u.email || '' }));
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleCpfChange = (value) => {
    const masked = maskCPF(value);
    update('cpf', masked);
    if (masked.replace(/\D/g, '').length === 11) {
      if (!validateCPF(masked)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleCepChange = async (value) => {
    const masked = maskCEP(value);
    update('cep', masked);
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      setCepLoading(true);
      const address = await fetchAddressByCEP(masked);
      setCepLoading(false);
      if (address) {
        setForm(f => ({
          ...f,
          street: address.street || f.street,
          neighborhood: address.neighborhood || f.neighborhood,
          city: address.city || f.city,
          state: address.state || f.state,
        }));
      }
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      update('resume_url', result.file_uri);
      update('resume_name', file.name);
      // Extração por IA — preenche campos vazios do formulário
      setExtractingResume(true);
      try {
        const signedUrl = await getSignedUrl(result.file_uri);
        const extracted = await extractResume(signedUrl);
        if (extracted) {
          setForm(f => mergeExtracted(f, extracted));
        }
      } catch (e) {
        console.warn('Resume extraction failed', e);
      } finally {
        setExtractingResume(false);
      }
    } catch (err) {
      alert('Erro ao enviar currículo. Tente novamente.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      update('profile_photo_url', result.file_uri);
    } catch (err) {
      alert('Erro ao enviar foto. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      alert('Por favor, preencha seu nome completo.');
      return;
    }
    if (form.cpf && !validateCPF(form.cpf)) {
      setCpfError('CPF inválido');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        user_id: user.id,
        email: user.email,
        completed: true,
      };
      if (profile) {
        await base44.entities.CandidateProfile.update(profile.id, data);
      } else {
        await base44.entities.CandidateProfile.create(data);
      }
      // Also save CPF and address to User entity for identification
      try {
        await base44.auth.updateMe({
          cpf: form.cpf,
          phone: form.phone,
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
        });
      } catch (e) {
        console.error('Failed to update user:', e);
      }
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      navigate(returnTo || '/candidate');
    } catch (err) {
      alert('Erro ao salvar perfil. Tente novamente.');
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <Background />

      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Logo size="sm" withText />
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Complete seu perfil</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As empresas verão esses dados quando você se candidatar. Seu currículo e foto ficam visíveis para os recrutadores.
            </p>
          </div>

          <div className="glass rounded-2xl shadow-card p-6 md:p-8 space-y-8">
            {/* Photo upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center">
                  {form.profile_photo_url ? (
                    <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => filePhotoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={filePhotoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Foto de perfil</div>
                <div className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou WebP — clique no ícone</div>
              </div>
            </div>

            {/* Section: Dados pessoais */}
            <SectionHeader title="Dados pessoais" />
            <div className="space-y-5">
              <Field label="Nome completo *">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                </div>
              </Field>

              <Field label="E-mail">
                <div className="relative">
                  <input value={form.email} disabled
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="CPF" hint="Usado para identificação da conta">
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={form.cpf} onChange={e => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      className={`w-full bg-input border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors ${
                        cpfError ? 'border-destructive/50' : 'border-border focus:border-primary/50'
                      }`} />
                  </div>
                  {cpfError && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {cpfError}
                    </div>
                  )}
                </Field>
                <Field label="Telefone / WhatsApp">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                  </div>
                </Field>
              </div>
            </div>

            {/* Section: Endereço */}
            <SectionHeader title="Endereço" />
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <Field label="CEP">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={form.cep} onChange={e => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                    {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary animate-spin" />}
                  </div>
                </Field>
                <div className="col-span-2">
                  <Field label="Rua / Endereço">
                    <input value={form.street} onChange={e => update('street', e.target.value)}
                      placeholder="Nome da rua"
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Número">
                  <input value={form.number} onChange={e => update('number', e.target.value)}
                    placeholder="Nº"
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                </Field>
                <Field label="Complemento (opcional)">
                  <input value={form.complement} onChange={e => update('complement', e.target.value)}
                    placeholder="Apto, sala..."
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                </Field>
                <Field label="Bairro">
                  <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Field label="Cidade">
                    <input value={form.city} onChange={e => update('city', e.target.value)}
                      placeholder="Cidade"
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                  </Field>
                </div>
                <Field label="Estado (UF)">
                  <input value={form.state} onChange={e => update('state', e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none transition-colors" />
                </Field>
              </div>
            </div>

            {/* Section: Profissional */}
            <SectionHeader title="Profissional" />
            <div className="space-y-5">
              <Field label="Bio / Resumo profissional">
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                  placeholder="Conte um pouco sobre sua experiência e objetivos..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none resize-none transition-colors" />
              </Field>

              <Field label="Currículo / CV">
                <input ref={fileResumeRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={handleResumeUpload} className="hidden" />
                {form.resume_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <FileCheck2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary truncate">{form.resume_name || 'Currículo enviado'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Clique para trocar o arquivo</div>
                      </div>
                      <button onClick={() => fileResumeRef.current?.click()} disabled={extractingResume} className="text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-accent disabled:opacity-50">
                        Trocar
                      </button>
                    </div>
                    {extractingResume && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Extraindo dados do currículo com IA…
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileResumeRef.current?.click()}
                    disabled={uploadingResume}
                    className="w-full flex items-center justify-center gap-2 px-4 py-7 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all duration-200"
                  >
                    {uploadingResume ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-5 h-5" /> Clique para enviar (PDF, DOC, imagem)</>
                    )}
                  </button>
                )}
                <p className="text-xs text-muted-foreground/60 mt-2">Formatos: PDF, DOC, DOCX, PNG, JPG. A empresa terá acesso a este arquivo.</p>
              </Field>
            </div>

            {/* Section: Dados profissionais detalhados */}
            <SectionHeader title="Trajetória profissional" />
            <CandidateProfessionalSections form={form} update={update} />

            {/* Section: Privacidade */}
            <SectionHeader title="Privacidade" />
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3">
              <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seu perfil, currículo, telefone e e-mail são visíveis para empresas em processos seletivos, e você pode ser contatado por elas. Seu endereço completo nunca é compartilhado — apenas cidade e estado.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.full_name.trim() || !!cpfError}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4" /> Salvar e Continuar</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="block text-xs font-medium text-muted-foreground tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, checked, locked, onChange }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground/70">{desc}</div>
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={locked ? undefined : () => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'} ${locked ? 'cursor-not-allowed opacity-90' : ''}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}