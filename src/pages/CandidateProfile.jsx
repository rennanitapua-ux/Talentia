import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, MapPin, Linkedin, Camera, Loader2, Check, Upload, FileCheck2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/Logo';

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', city: '', linkedin: '', bio: '',
    resume_url: '', resume_name: '', profile_photo_url: '',
  });
  const fileResumeRef = useRef(null);
  const filePhotoRef = useRef(null);

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
              phone: p.phone || '',
              city: p.city || '',
              linkedin: p.linkedin || '',
              bio: p.bio || '',
              resume_url: p.resume_url || '',
              resume_name: p.resume_name || '',
              profile_photo_url: p.profile_photo_url || '',
            });
          } else {
            setForm(f => ({ ...f, full_name: u.full_name || '' }));
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const result = await base44.integrations.Core.UploadPublicFile({ file });
      update('resume_url', result.file_url);
      update('resume_name', file.name);
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
      const result = await base44.integrations.Core.UploadPublicFile({ file });
      update('profile_photo_url', result.file_url);
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
      navigate('/candidate');
    } catch (err) {
      alert('Erro ao salvar perfil. Tente novamente.');
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[hsl(240,15%,3.5%)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[hsl(190,85%,45%)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(240,15%,3.5%)] text-white">
      <header className="border-b border-[hsl(240,8%,14%)] bg-[hsl(240,12%,5%)]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-[hsl(240,8%,12%)] transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <Logo size="sm" withText />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="font-heading text-3xl text-white mb-2">Complete seu perfil</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              As empresas verão esses dados quando você se candidatar. Seu currículo e foto ficam visíveis para os recrutadores.
            </p>
          </div>

          <div className="bg-[hsl(240,12%,6%)] border border-[hsl(240,8%,14%)] rounded-2xl p-6 md:p-8 shadow-card space-y-8">
            {/* Photo upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[hsl(240,8%,10%)] border border-[hsl(240,8%,16%)] overflow-hidden flex items-center justify-center">
                  {form.profile_photo_url ? (
                    <img src={form.profile_photo_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-slate-600" />
                  )}
                </div>
                <button
                  onClick={() => filePhotoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[hsl(190,85%,45%)] text-[hsl(240,15%,3.5%)] flex items-center justify-center hover:bg-[hsl(190,85%,50%)] transition-colors shadow-lg"
                >
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={filePhotoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Foto de perfil</div>
                <div className="text-xs text-slate-500 mt-0.5">JPG, PNG ou WebP — clique no ícone</div>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-5">
              <Field label="Nome completo *">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[hsl(190,85%,45%,0.5)] focus:outline-none transition-colors" />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefone / WhatsApp">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[hsl(190,85%,45%,0.5)] focus:outline-none transition-colors" />
                  </div>
                </Field>
                <Field label="Cidade">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.city} onChange={e => update('city', e.target.value)}
                      placeholder="São Paulo, SP"
                      className="w-full bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[hsl(190,85%,45%,0.5)] focus:outline-none transition-colors" />
                  </div>
                </Field>
              </div>

              <Field label="LinkedIn">
                <div className="relative">
                  <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                    className="w-full bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[hsl(190,85%,45%,0.5)] focus:outline-none transition-colors" />
                </div>
              </Field>

              <Field label="Bio / Resumo profissional">
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                  placeholder="Conte um pouco sobre sua experiência e objetivos..."
                  className="w-full bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[hsl(190,85%,45%,0.5)] focus:outline-none resize-none transition-colors" />
              </Field>

              {/* Resume upload */}
              <Field label="Currículo / CV">
                <input ref={fileResumeRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={handleResumeUpload} className="hidden" />
                {form.resume_url ? (
                  <div className="flex items-center gap-3 bg-[hsl(160,60%,45%,0.06)] border border-[hsl(160,60%,45%,0.25)] rounded-xl p-4">
                    <FileCheck2 className="w-5 h-5 text-[hsl(160,60%,55%)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[hsl(160,60%,65%)] truncate">{form.resume_name || 'Currículo enviado'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Clique para trocar o arquivo</div>
                    </div>
                    <button onClick={() => fileResumeRef.current?.click()} className="text-xs text-slate-400 hover:text-[hsl(190,85%,55%)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[hsl(240,8%,12%)]">
                      Trocar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileResumeRef.current?.click()}
                    disabled={uploadingResume}
                    className="w-full flex items-center justify-center gap-2 px-4 py-7 rounded-xl border-2 border-dashed border-[hsl(240,8%,16%)] hover:border-[hsl(190,85%,45%,0.4)] text-slate-500 hover:text-[hsl(190,85%,55%)] transition-all duration-200"
                  >
                    {uploadingResume ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-5 h-5" /> Clique para enviar (PDF, DOC, imagem)</>
                    )}
                  </button>
                )}
                <p className="text-xs text-slate-600 mt-2">Formatos: PDF, DOC, DOCX, PNG, JPG. A empresa terá acesso a este arquivo.</p>
              </Field>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !form.full_name.trim()}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[hsl(190,85%,45%)] text-[hsl(240,15%,3.5%)] font-semibold text-sm hover:bg-[hsl(190,85%,50%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[hsl(190,85%,45%,0.15)]"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4" /> Salvar e Continuar</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2 tracking-wide">{label}</label>
      {children}
    </div>
  );
}