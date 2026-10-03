import { base44 } from '@/api/base44Client';

export const ROLE_LABEL = { company: 'Empresa', candidate: 'Candidato' };

export const WORK_AREAS = [
  'Comercial / Vendas', 'Atendimento ao Cliente', 'Marketing', 'Tecnologia', 'Dados & Analytics',
  'Produto', 'Design', 'Financeiro', 'Recursos Humanos', 'Administrativo', 'Logística', 'Operações',
  'Engenharia', 'Jurídico', 'Saúde', 'Educação', 'Customer Success', 'Outra',
];

export const roleHome = (type) => (type === 'company' ? '/company' : '/candidate');

export const userName = (u) => u?.display_name || u?.full_name || (u?.email ? u.email.split('@')[0] : '');

export async function hashEmail(email) {
  const data = new TextEncoder().encode(String(email || '').trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Returns the directory record ({ account_type }) if an account exists for this e-mail.
export async function findAccount(email) {
  const email_hash = await hashEmail(email);
  const found = await base44.entities.AccountDirectory.filter({ email_hash }, '-created_date', 1);
  return found?.[0] || null;
}

export async function registerAccount(email, account_type) {
  const email_hash = await hashEmail(email);
  const found = await base44.entities.AccountDirectory.filter({ email_hash }, '-created_date', 1);
  if (found?.[0]) {
    if (found[0].account_type !== account_type) {
      await base44.entities.AccountDirectory.update(found[0].id, { account_type });
    }
    return;
  }
  await base44.entities.AccountDirectory.create({ email_hash, account_type });
}

// Saves the role-specific profile on the user and indexes the e-mail for the unified login.
export async function saveAccountProfile(role, { email, name, company_name, birth_date, work_area }) {
  const data = { account_type: role, display_name: (name || '').trim() };
  if (role === 'company') data.company_name = (company_name || '').trim();
  else Object.assign(data, { birth_date: birth_date || '', work_area: work_area || '' });
  await base44.auth.updateMe(data);
  await registerAccount(email, role).catch(() => {});
}

export function postLoginUrl(role, returnTo) {
  const qs = new URLSearchParams({ role });
  if (returnTo && returnTo !== '/') qs.set('returnTo', returnTo);
  return `/onboarding?${qs.toString()}`;
}