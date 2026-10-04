// TalentIA — Aderência à vaga
// O número 0-10 NÃO é uma nota universal. É o NÍVEL NECESSÁRIO para esta vaga.
// A avaliação compara NÍVEL DEMONSTRADO pelo candidato vs. NÍVEL NECESSÁRIO pela vaga.
// Nunca "nota alta = bom, nota baixa = ruim". O contexto da vaga define o que é suficiente.

export const ADERENCIA = {
  ATENDE: {
    key: 'atende',
    label: 'Atende ao necessário',
    short: 'Atende',
    color: '#34d399',
    description: 'O candidato demonstrou o nível exigido para esta vaga.',
  },
  SUPERA: {
    key: 'supera',
    label: 'Atende e supera',
    short: 'Supera',
    color: '#2dd4ee',
    description: 'Demonstrou nível acima do necessário para a vaga.',
  },
  PARCIAL: {
    key: 'parcial',
    label: 'Parcialmente atende',
    short: 'Parcial',
    color: '#fbbf24',
    description: 'Próximo do nível necessário, mas ainda abaixo — requer avaliação.',
  },
  ABAIXO: {
    key: 'abaixo',
    label: 'Abaixo do necessário',
    short: 'Abaixo',
    color: '#f87171',
    description: 'Demonstrou nível significativamente abaixo do exigido.',
  },
  VALIDAR: {
    key: 'validar',
    label: 'Necessita validação',
    short: 'Validar',
    color: '#a64eff',
    description: 'Há alguma evidência, mas insuficiente para concluir — validar em entrevista.',
  },
  INSUFICIENTE: {
    key: 'insuficiente',
    label: 'Dados insuficientes',
    short: 'Insuficiente',
    color: '#94a3b8',
    description: 'Não foi possível avaliar — ausência de informação não é informação negativa.',
  },
};

// Classifica uma competência comparando nível demonstrado vs. exigido.
// demonstrated: 0-10 (nível evidenciado pelo candidato)
// required: 0-10 (nível necessário para a vaga) ou null (sem alvo definido)
// score: 0-100 (score bruto da IA, usado para detectar ausência)
// confidence: 'high' | 'medium' | 'low'
// notAssessable: boolean (sem evidência)
export function classifyCompetency({ demonstrated, required, score, confidence, notAssessable }) {
  if (notAssessable || demonstrated == null || score == null) return ADERENCIA.INSUFICIENTE;
  if (confidence === 'low' && (required == null || Math.abs(demonstrated - (required || 0)) <= 2)) {
    return ADERENCIA.VALIDAR;
  }
  if (required == null) return ADERENCIA.ATENDE;
  const gap = demonstrated - required;
  if (gap >= 2) return ADERENCIA.SUPERA;
  if (gap >= 0) return ADERENCIA.ATENDE;
  if (gap >= -2) return ADERENCIA.PARCIAL;
  return ADERENCIA.ABAIXO;
}

// Constrói o resumo de aderência a partir do demonstrated_levels + skill_scores + confidence.
// Retorna: { perCompetency, distribution, headline, counts, total }
export function buildAderenciaSummary(demonstrated_levels, skill_scores, score_confidence, competencies) {
  const perCompetency = {};
  const distribution = { atende: 0, supera: 0, parcial: 0, abaixo: 0, validar: 0, insuficiente: 0 };
  const comps = competencies?.length ? competencies : Object.keys(demonstrated_levels || {});

  comps.forEach((name) => {
    const dl = demonstrated_levels?.[name] || {};
    const score = skill_scores?.[name];
    const confidence = score_confidence?.[name] || (dl.confidence) || 'medium';
    const klass = classifyCompetency({
      demonstrated: dl.demonstrated,
      required: dl.required,
      score,
      confidence,
      notAssessable: dl.demonstrated == null || score == null,
    });
    perCompetency[name] = {
      class: klass,
      demonstrated: dl.demonstrated,
      required: dl.required,
      gap: dl.gap,
      score,
      confidence,
    };
    distribution[klass.key]++;
  });

  const total = comps.length;
  const counts = {
    atende: distribution.atende + distribution.supera,
    supera: distribution.supera,
    parcial: distribution.parcial,
    abaixo: distribution.abaixo,
    validar: distribution.validar,
    insuficiente: distribution.insuficiente,
  };

  // Headline contextual — nunca "nota X = mediano"
  let headline;
  if (total === 0) headline = 'Sem competências definidas para esta vaga.';
  else if (counts.insuficiente === total) headline = 'Dados insuficientes para avaliar aderência à vaga.';
  else if (counts.abaixo > total / 2) headline = 'Candidato abaixo do nível necessário na maioria das competências exigidas.';
  else if (counts.atende >= total * 0.7) headline = 'Candidato atende aos requisitos principais da vaga.';
  else if (counts.supera >= 2) headline = 'Candidato atende e supera vários requisitos da vaga.';
  else if (counts.parcial + counts.validar >= total / 2) headline = 'Candidato parcialmente atende — pontos exigem validação em entrevista.';
  else headline = 'Candidato atende parte dos requisitos; alguns pontos precisam de validação.';

  return { perCompetency, distribution, headline, counts, total };
}

export const ADERENCIA_ORDER = ['supera', 'atende', 'parcial', 'abaixo', 'validar', 'insuficiente'];