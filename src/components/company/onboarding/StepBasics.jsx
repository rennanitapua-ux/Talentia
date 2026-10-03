import React, { useState } from 'react';
import { Building2, MapPin, Globe, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SECTORS } from '@/lib/companyCulture';

export default function StepBasics({ form, update }) {
  const [cepLoading, setCepLoading] = useState(false);

  const lookupCep = async (cepRaw) => {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        update('street', data.logradouro || '');
        update('neighborhood', data.bairro || '');
        update('city', data.localidade || '');
        update('state', data.uf || '');
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading text-lg text-foreground mb-1">Dados da empresa</h3>
        <p className="text-sm text-muted-foreground mb-4">Identidade básica da sua organização.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Razão social / Nome da empresa *</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="company_name" value={form.company_name || ''} onChange={(e) => update('company_name', e.target.value)} className="pl-10 h-11 bg-background/60" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trade_name">Nome fantasia</Label>
          <Input id="trade_name" value={form.trade_name || ''} onChange={(e) => update('trade_name', e.target.value)} className="h-11 bg-background/60" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" value={form.cnpj || ''} onChange={(e) => update('cnpj', e.target.value)} placeholder="00.000.000/0000-00" className="h-11 bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Setor</Label>
          <Select value={form.sector || ''} onValueChange={(v) => update('sector', v)}>
            <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Endereço</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={form.cep || ''} onChange={(e) => { update('cep', e.target.value); if (e.target.value.replace(/\D/g, '').length === 8) lookupCep(e.target.value); }} placeholder="00000-000" className="h-11 bg-background/60" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" value={form.street || ''} onChange={(e) => update('street', e.target.value)} disabled={cepLoading} className="h-11 bg-background/60" />
          </div>
        </div>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2"><Label htmlFor="number">Número</Label><Input id="number" value={form.number || ''} onChange={(e) => update('number', e.target.value)} className="h-11 bg-background/60" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="complement">Complemento</Label><Input id="complement" value={form.complement || ''} onChange={(e) => update('complement', e.target.value)} className="h-11 bg-background/60" /></div>
          <div className="space-y-2"><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" value={form.neighborhood || ''} onChange={(e) => update('neighborhood', e.target.value)} disabled={cepLoading} className="h-11 bg-background/60" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2"><Label htmlFor="city">Cidade</Label><Input id="city" value={form.city || ''} onChange={(e) => update('city', e.target.value)} disabled={cepLoading} className="h-11 bg-background/60" /></div>
          <div className="space-y-2"><Label htmlFor="state">Estado</Label><Input id="state" value={form.state || ''} onChange={(e) => update('state', e.target.value)} disabled={cepLoading} className="h-11 bg-background/60" /></div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Presença digital</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="website">Site</Label><Input id="website" value={form.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="www.empresa.com.br" className="h-11 bg-background/60" /></div>
          <div className="space-y-2"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={form.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="linkedin.com/company/..." className="h-11 bg-background/60" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="founded_year">Ano de fundação</Label>
            <Input id="founded_year" type="number" value={form.founded_year || ''} onChange={(e) => update('founded_year', parseInt(e.target.value) || undefined)} className="h-11 bg-background/60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee_count">Número de funcionários</Label>
            <Select value={form.employee_count || ''} onValueChange={(v) => update('employee_count', v)}>
              <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Sobre a empresa</h4>
        <Textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="O que sua empresa faz? Quais produtos ou serviços oferece? Quem atende? Como funciona?" className="min-h-[100px] bg-background/60 resize-none" />
      </div>
    </div>
  );
}