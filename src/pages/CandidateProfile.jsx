import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, MapPin, Linkedin, FileText, Camera, Loader2, Check, Upload, FileCheck2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <Logo size="sm" withText />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Complete seu perfil</h1>
          <p className="text-slate-400 text-sm mb-8">As empresas verão esses dados quando você se candidatar. Seu currículo e foto ficam visíveis para os recrutadores.</p>

          {/* Photo upload */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                {form.profile_photo_url ? (
                  <img src={form.profile_photo_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <button
                onClick={() => filePhotoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400"
              >
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={filePhotoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <div>
              <div className="text-sm font-medium">Foto de perfil</div>
              <div className="text-xs text-slate-500">JPG, PNG ou WebP — clique na câmera</div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={form.city} onChange={e => update('city', e.target.value)}
                    placeholder="São Paulo, SP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">LinkedIn</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/seuperfil"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio / Resumo profissional</label>
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                placeholder="Conte um pouco sobre sua experiência e objetivos..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none resize-none" />
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Currículo / CV</label>
              <input ref={fileResumeRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={handleResumeUpload} className="hidden" />
              {form.resume_url ? (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <FileCheck2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-emerald-300 truncate">{form.resume_name || 'Currículo enviado'}</div>
                    <div className="text-xs text-slate-500">Clique para trocar o arquivo</div>
                  </div>
                  <button onClick={() => fileResumeRef.current?.click()} className="text-xs text-slate-400 hover:text-cyan-400">
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileResumeRef.current?.click()}
                  disabled={uploadingResume}
                  className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {uploadingResume ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Clique para enviar (PDF, DOC, imagem)</>
                  )}
                </button>
              )}
              <p className="text-[10px] text-slate-600 mt-1.5">Formatos aceitos: PDF, DOC, DOCX, PNG, JPG. A empresa terá acesso a este arquivo.</p>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !form.full_name.trim()}
            className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4" /> Salvar e Continuar</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}