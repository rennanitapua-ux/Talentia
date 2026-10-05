// Profundidade do processo seletivo.
// Regra de ouro: TODA vaga tem DISC + perguntas estruturadas + pelo menos 1 questão aberta.
// O nível muda quantidade/complexidade — nunca a estrutura mínima obrigatória.

export const DEPTH_LEVELS = [
  {
    key: 'leve',
    label: 'Leve',
    tagline: 'Objetiva e rápida',
    description: 'Para vagas de maior volume ou funções de apoio/entrada. Mantém DISC, perguntas essenciais e uma questão aberta.',
    choiceCount: 6,
    openCount: 1,
  },
  {
    key: 'padrao',
    label: 'Padrão',
    tagline: 'Equilibrada',
    description: 'Recomendada para a maioria das vagas profissionais. Perguntas comportamentais, técnicas e uma questão aberta.',
    choiceCount: 10,
    openCount: 1,
  },
  {
    key: 'aprofundada',
    label: 'Aprofundada',
    tagline: 'Completa',
    description: 'Para liderança, gestão ou posições estratégicas. Mais perguntas, múltiplas questões abertas e análise cruzada.',
    choiceCount: 14,
    openCount: 2,
  },
  {
    key: 'personalizada',
    label: 'Personalizada',
    tagline: 'Você configura',
    description: 'Escolha quantidade de perguntas e questões abertas. DISC, perguntas e pelo menos 1 questão aberta continuam obrigatórios.',
    choiceCount: 10,
    openCount: 1,
  },
];

export const DEPTH_BY_KEY = Object.fromEntries(DEPTH_LEVELS.map((d) => [d.key, d]));

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Resolve a configuração concreta (choiceCount + openCount) para um nível.
export function depthConfig(depth, customConfig) {
  const d = DEPTH_BY_KEY[depth] || DEPTH_BY_KEY.padrao;
  if (depth === 'personalizada' && customConfig) {
    return {
      choiceCount: clamp(Number(customConfig.choiceCount) || 10, 4, 20),
      openCount: clamp(Number(customConfig.openCount) || 1, 1, 5),
    };
  }
  return { choiceCount: d.choiceCount, openCount: d.openCount };
}

// Recomendação de nível com base nos sinais da vaga (heurística — a empresa decide).
export function recommendDepth(job) {
  const level = job?.seniority_level != null ? Number(job.seniority_level) : 6;
  const comps = job?.competencies || [];
  const title = (job?.title || '').toLowerCase();
  const isLeadership =
    comps.some((c) => /lider|líder|gestão|gestao|estratég|estrateg|planejamento/i.test(c)) ||
    /gerente|supervisor|coordenador|diretor|líder|lider|head|chief|ceo|cto|cfo|coo/i.test(title);
  if (isLeadership || level >= 8) return 'aprofundada';
  if (level <= 3) return 'leve';
  return 'padrao';
}

// Validação da estrutura mínima obrigatória antes de publicar.
export function validateMandatoryStructure({ situations, competencies, depth }) {
  const choiceQuestions = (situations || []).filter((s) => (s.options || []).length > 0);
  const openQuestions = (situations || []).filter((s) => (s.options || []).length === 0);
  const issues = [];
  if (!depth) issues.push('Defina a profundidade do processo seletivo.');
  if (choiceQuestions.length < 1) issues.push('Adicione pelo menos 1 pergunta estruturada (múltipla escolha).');
  if (openQuestions.length < 1) issues.push('Adicione pelo menos 1 questão aberta.');
  if ((competencies || []).length < 2) issues.push('Configure as competências exigidas pela vaga.');
  return {
    valid: issues.length === 0,
    issues,
    choiceCount: choiceQuestions.length,
    openCount: openQuestions.length,
    disc: true, // DISC é sempre incluído no fluxo da simulação
  };
}