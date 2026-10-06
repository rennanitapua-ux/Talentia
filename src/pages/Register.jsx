import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight, User, Info } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import RoleToggle from "@/components/auth/RoleToggle";
import RoleFields from "@/components/auth/RoleFields";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { saveAccountProfile, roleHome, postLoginUrl } from "@/lib/accounts";

export default function Register() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = safeReturnTo();
  const isNewEmail = params.get("notice") === "new";
  const [role, setRole] = useState(params.get("role") === "company" ? "company" : "candidate");
  const [form, setForm] = useState({ name: "", email: params.get("email") || "", password: "", company_name: "", birth_date: "", work_area: "" });
  const [error, setError] = useState("");
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExists(false);
    if (form.password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email.trim(), password: form.password });
      setShowOtp(true);
    } catch (err) {
      const msg = err.message || "";
      if (/exist|already|registered|cadastrad/i.test(msg)) {
        setExists(true);
        setError("Este e-mail já tem uma conta.");
      } else {
        setError(msg || "Não foi possível criar a conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email.trim(), otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      await saveAccountProfile(role, { ...form, email: form.email.trim() }).catch((e) => console.error(e));
      // Garante que a sessão está válida antes de redirecionar — evita loop de volta ao cadastro
      const authed = await base44.auth.isAuthenticated().catch(() => false);
      if (!authed) {
        setError("Não foi possível validar sua sessão. Tente novamente.");
        setLoading(false);
        return;
      }
      window.location.href = returnTo !== "/" ? returnTo : roleHome(role);
    } catch (err) {
      setError(err.message || "Código inválido");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(form.email.trim());
      toast({ title: "Código enviado", description: "Verifique seu e-mail para o novo código." });
    } catch (err) {
      setError(err.message || "Falha ao reenviar código");
    }
  };

  if (showOtp) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle={`Enviamos um código de 6 dígitos para ${form.email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Verificar e entrar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Não recebeu o código? <button onClick={handleResend} className="text-primary font-medium hover:underline">Reenviar</button>
        </p>
      </AuthLayout>
    );
  }

  const loginLink = `/login?role=${role}&step=password&email=${encodeURIComponent(form.email)}${returnTo !== "/" ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Leva menos de um minuto"
      footer={<>Já tem uma conta? <Link to={`/login?role=${role}`} className="text-primary font-medium hover:underline">Entrar</Link></>}
    >
      {isNewEmail && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-sm text-foreground/90">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>Não encontramos uma conta com <strong className="font-semibold">{form.email}</strong>. Crie a sua abaixo.</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error} {exists && <Link to={loginLink} className="underline font-medium">Entrar com senha</Link>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <RoleToggle value={role} onChange={setRole} />
        <div className="space-y-2">
          <Label htmlFor="name">{role === "company" ? "Seu nome" : "Nome completo"}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="name" autoComplete="name" placeholder="Seu nome" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-10 h-12 bg-background/60" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10 h-12 bg-background/60" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-10 h-12 bg-background/60" required />
          </div>
        </div>
        <RoleFields role={role} form={form} update={update} />
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando conta...</> : <>Criar conta<ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="w-full h-12 text-sm font-medium bg-transparent" onClick={() => base44.auth.loginWithProvider("google", postLoginUrl(role, returnTo))}>
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continuar com Google
      </Button>
    </AuthLayout>
  );
}