// Profundidade do processo seletivo.
// Regra de ouro: TODA vaga tem DISC + perguntas estruturadas + pelo menos 1 questão aberta.
// O nível muda quantidade/complexidade — nunca a estrutura mínima obrigatória.

// TOTAL = choiceCount + openCount (questões da vaga, SEM contar o DISC que é separado).
// A empresa pode alterar livremente — estes são os defaults por nível.
export const DEPTH_LEVELS = [
  {
    key: 'leve',
    label: 'Leve',
    tagline: 'Objetiva e rápida',
    description: 'Para vagas de maior volume ou funções de apoio/entrada. 6 questões no total, incluindo 1 aberta.',
    choiceCount: 5,
    openCount: 1,
    totalCount: 6,
  },
  {
    key: 'padrao',
    label: 'Padrão',
    tagline: 'Equilibrada',
    description: 'Recomendada para a maioria das vagas profissionais. 10 questões no total, incluindo 1 aberta.',
    choiceCount: 9,
    openCount: 1,
    totalCount: 10,
  },
  {
    key: 'aprofundada',
    label: 'Aprofundada',
    tagline: 'Completa',
    description: 'Para liderança, gestão ou posições estratégicas. 15 questões no total, incluindo 2 abertas.',
    choiceCount: 13,
    openCount: 2,
    totalCount: 15,
  },
  {
    key: 'personalizada',
    label: 'Personalizada',
    tagline: 'Você configura',
    description: 'Escolha a quantidade total de perguntas e quantas são abertas. DISC e pelo menos 1 questão aberta continuam obrigatórios.',
    choiceCount: 10,
    openCount: 1,
    totalCount: 11,
  },
];

export const DEPTH_BY_KEY = Object.fromEntries(DEPTH_LEVELS.map((d) => [d.key, d]));

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Resolve a configuração concreta (choiceCount + openCount + totalCount) para um nível.
// totalCount = choiceCount + openCount (questões da vaga, SEM o DISC).
export function depthConfig(depth, customConfig) {
  const d = DEPTH_BY_KEY[depth] || DEPTH_BY_KEY.padrao;
  if (depth === 'personalizada' && customConfig) {
    const choiceCount = clamp(Number(customConfig.choiceCount) || 10, 4, 20);
    const openCount = clamp(Number(customConfig.openCount) || 1, 1, 5);
    return { choiceCount, openCount, totalCount: choiceCount + openCount };
  }
  return { choiceCount: d.choiceCount, openCount: d.openCount, totalCount: d.choiceCount + d.openCount };
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

// Validação da estrutura obrigatória antes de publicar.
// Verifica estrutura mínima E consistência da contagem (total = objetivas + abertas).
export function validateMandatoryStructure({ situations, competencies, depth, expectedConfig }) {
  const choiceQuestions = (situations || []).filter((s) => (s.options || []).length > 0);
  const openQuestions = (situations || []).filter((s) => (s.options || []).length === 0);
  const issues = [];
  if (!depth) issues.push('Defina a profundidade do processo seletivo.');
  if (choiceQuestions.length < 1) issues.push('Adicione pelo menos 1 pergunta estruturada (múltipla escolha).');
  if (openQuestions.length < 1) issues.push('Adicione pelo menos 1 questão aberta.');
  if ((competencies || []).length < 2) issues.push('Configure as competências exigidas pela vaga.');

  // Validação de consistência: cada questão deve ter competências associadas
  const withoutComps = (situations || []).filter((s) => !s.competencies || s.competencies.length === 0);
  if (withoutComps.length > 0) issues.push(`${withoutComps.length} questão(ões) sem competência associada.`);

  // Validação de duplicidade semântica básica (mesmo título)
  const titles = (situations || []).map((s) => (s.title || s.question || '').trim().toLowerCase()).filter(Boolean);
  const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupTitles.length > 0) issues.push('Existem questões duplicadas (mesmo título).');

  // Verifica se a contagem bate com o configurado (se expectedConfig fornecido)
  const expectedChoice = expectedConfig?.choiceCount;
  const expectedOpen = expectedConfig?.openCount;
  const countMismatch =
    (expectedChoice != null && choiceQuestions.length !== expectedChoice) ||
    (expectedOpen != null && openQuestions.length !== expectedOpen);

  return {
    valid: issues.length === 0,
    issues,
    choiceCount: choiceQuestions.length,
    openCount: openQuestions.length,
    totalCount: choiceQuestions.length + openQuestions.length,
    expectedChoice,
    expectedOpen,
    countMismatch,
    disc: true, // DISC é sempre incluído no fluxo da simulação
  };
}