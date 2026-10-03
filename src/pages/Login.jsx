import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { findAccount, postLoginUrl, ROLE_LABEL } from "@/lib/accounts";

export default function Login() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") === "company" ? "company" : "candidate";
  const returnTo = safeReturnTo();
  const [step, setStep] = useState(params.get("step") === "password" && params.get("email") ? "password" : "email");
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let account = null;
    let lookupFailed = false;
    try {
      account = await findAccount(email);
    } catch {
      lookupFailed = true;
    }
    setLoading(false);
    if (account || lookupFailed) {
      setAccountType(account?.account_type || null);
      setStep("password");
      return;
    }
    const qs = new URLSearchParams({ email: email.trim(), role, notice: "new" });
    if (returnTo !== "/") qs.set("returnTo", returnTo);
    navigate(`/register?${qs.toString()}`);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      window.location.href = postLoginUrl(accountType || role, returnTo);
    } catch (err) {
      setError("Senha incorreta. Tente novamente ou redefina sua senha.");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", postLoginUrl(role, returnTo));
  };

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle={step === "email" ? `Acesso ${role === "company" ? "para empresas" : "para candidatos"} · digite seu e-mail para continuar` : "Digite sua senha para entrar"}
      footer={
        <>
          Novo por aqui?{" "}
          <Link to={`/register?role=${role}${returnTo !== "/" ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="text-primary font-medium hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {step === "email" ? (
        <>
          <Button variant="outline" className="w-full h-12 text-sm font-medium mb-5 bg-transparent" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continuar com Google
          </Button>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="email" autoFocus placeholder="voce@exemplo.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-background/60" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : <>Continuar<ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={handlePassword} className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-muted/50 border border-border">
            <div className="min-w-0">
              <div className="text-sm text-foreground truncate">{email}</div>
              {accountType && <div className="text-[11px] text-muted-foreground">Conta {ROLE_LABEL[accountType]}</div>}
            </div>
            <button type="button" onClick={() => { setStep("email"); setPassword(""); setError(""); }} className="text-xs text-primary hover:underline flex-shrink-0">
              Trocar
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" autoFocus placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 bg-background/60" required />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar senha">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando...</> : <>Entrar<ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}