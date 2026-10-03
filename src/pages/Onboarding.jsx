import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import RoleToggle from '@/components/auth/RoleToggle';
import RoleFields from '@/components/auth/RoleFields';
import { safeReturnTo } from '@/lib/authReturnTo';
import { roleHome, registerAccount, saveAccountProfile } from '@/lib/accounts';

// Post-login router: sends known accounts to their area, asks new ones (e.g. Google sign-up) for their profile.
export default function Onboarding() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const returnTo = safeReturnTo();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(params.get('role') === 'company' ? 'company' : 'candidate');
  const [form, setForm] = useState({ name: '', company_name: '', birth_date: '', work_area: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const go = (type) => navigate(returnTo !== '/' ? returnTo : roleHome(type), { replace: true });

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.account_type) {
        registerAccount(u.email, u.account_type).catch(() => {});
        go(u.account_type);
        return;
      }
      setForm((f) => ({ ...f, name: u.full_name || '' }));
      setUser(u);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (role === 'candidate' && (!form.birth_date || !form.work_area)) return setError('Informe sua data de nascimento e área de atuação.');
    setSaving(true);
    try {
      await saveAccountProfile(role, { ...form, email: user.email });
      go(role);
    } catch (err) {
      setError('Não foi possível salvar agora. Tente novamente.');
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <AuthLayout title="Complete seu acesso" subtitle="Só mais um passo para entrar na TalentOS">
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <RoleToggle value={role} onChange={setRole} />
        <div className="space-y-2">
          <Label htmlFor="name">{role === 'company' ? 'Seu nome' : 'Nome completo'}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} className="pl-10 h-12 bg-background/60" required />
          </div>
        </div>
        <RoleFields role={role} form={form} update={update} />
        <Button type="submit" className="w-full h-12 font-medium" disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <>Continuar<ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>
    </AuthLayout>
  );
}