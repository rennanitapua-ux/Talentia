import React from 'react';
import { Building2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WORK_AREAS } from '@/lib/accounts';

export default function RoleFields({ role, form, update }) {
  if (role === 'company') {
    return (
      <div className="space-y-2">
        <Label htmlFor="company_name">Nome da empresa</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="company_name" value={form.company_name} onChange={(e) => update('company_name', e.target.value)}
            placeholder="Ex.: FM Motos" className="pl-10 h-12 bg-background/60" required />
        </div>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de nascimento <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input id="birth_date" type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)}
            max={new Date().toISOString().slice(0, 10)} className="pl-10 h-12 bg-background/60 [color-scheme:dark]" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Área de atuação <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <Select value={form.work_area} onValueChange={(v) => update('work_area', v)}>
          <SelectTrigger className="h-12 bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {WORK_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}