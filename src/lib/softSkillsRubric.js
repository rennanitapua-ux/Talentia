// TalentIA — Rubrica formal de Soft Skills
// O score nasce da evidência. Sem evidência → "não foi possível avaliar" (confiança baixa).
// Nunca transformar inferência em fato. Nunca atribuir competência sem evidência.

export const RUBRIC_BANDS = [
  { min: 0, max: 20, label: 'Nenhuma evidência relevante', tier: 'none' },
  { min: 21, max: 40, label: 'Evidência muito limitada', tier: 'limited' },
  { min: 41, max: 60, label: 'Evidência básica', tier: 'basic' },
  { min: 61, max: 75, label: 'Evidência consistente', tier: 'consistent' },
  { min: 76, max: 90, label: 'Evidência forte', tier: 'strong' },
  { min: 91, max: 100, label: 'Evidência muito forte e consistente em múltiplas situações', tier: 'exceptional' },
];

export function bandFor(score) {
  return RUBRIC_BANDS.find((b) => score >= b.min && score <= b.max) || RUBRIC_BANDS[0];
}

export function tierColor(tier) {
  return {
    none: '#64748b',
    limited: '#f97316',
    basic: '#eab308',
    consistent: '#22c55e',
    strong: '#3b82f6',
    exceptional: '#a855f7',
  }[tier] || '#64748b';
}

// Determina confiança com base na quantidade e variedade de evidências.
// count = número de situações que produziram evidência para esta skill/dimensão.
export function confidenceFor(count) {
  if (count >= 3) return 'high';
  if (count === 2) return 'medium';
  return 'low';
}

// Se não houver evidência suficiente, NÃO inventar score. Retorna estrutura "não avaliado".
export function notAssessable(dimensionLabel) {
  return {
    score: null,
    not_assessable: true,
    label: dimensionLabel,
    note: 'Não foi possível avaliar suficientemente esta competência nas respostas coletadas.',
    confidence: 'low',
    evidence: [],
    count: 0,
  };
}

// Modelo de evidência: COMPETÊNCIA → comportamento observado → evidência → interpretação → confiança
export function buildEvidenceRecord({ skillLabel, dimensionLabel, observed, evidenceQuote, interpretation, confidence, situationRef }) {
  return {
    skill: skillLabel,
    dimension: dimensionLabel,
    observed: observed || null,           // O que efetivamente apareceu na resposta (fato)
    inferred: interpretation || null,     // Interpretação possível do observado (inferência)
    evidence_quote: evidenceQuote || null, // Trecho real da resposta
    situation: situationRef || null,       // Qual situação gerou esta evidência
    confidence: confidence || 'low',
  };
}

// Gera perguntas de entrevista a partir das LACUNAS de evidência.
// Para cada skill exigida pela vaga sem evidência suficiente, cria uma pergunta de investigação.
export function interviewQuestionsFromGaps({ targetSkills, softSkillsDetail, job }) {
  const questions = [];
  (targetSkills || []).forEach((skill) => {
    const detail = softSkillsDetail?.[skill.key];
    if (!detail) {
      questions.push({
        competency: skill.label,
        question: `Nas situações avaliadas não houve evidência sobre ${skill.label.toLowerCase()}. Conte sobre uma situação recente em que esta competência foi importante — o que você fez e qual foi o resultado?`,
        rationale: `Sem evidência coletada para ${skill.label} durante a simulação.`,
        gap: true,
      });
      return;
    }
    // Encontra dimensões com score baixo ou não avaliadas
    Object.entries(detail.dimensions || {}).forEach(([dimKey, dim]) => {
      const score = dim.score;
      const isGap = score === null || score === undefined || (typeof score === 'number' && score < 41);
      if (isGap && (dim.evidence?.length || dim.ai_evidence || dim.count > 0)) {
        const dimLabel = dim.label || dimKey;
        questions.push({
          competency: `${skill.label} → ${dimLabel}`,
          question: `Nas situações avaliadas houve pouca evidência de ${dimLabel.toLowerCase()}. Você consegue descrever uma situação em que precisou demonstrar isso e como conduziu?`,
          rationale: dim.ai_evidence || `Evidência limitada para ${dimLabel} (score ${score ?? 'n/a'}).`,
          gap: true,
        });
      }
    });
  });
  return questions.slice(0, 6);
}

// Formata a separação observado/inferido/não-avaliado para exibição
export function formatEvidenceLayer(record) {
  if (!record || record.not_assessable) {
    return { layer: 'not_assessed', text: record?.note || 'Não foi possível avaliar.' };
  }
  if (record.observed && record.inferred && record.observed !== record.inferred) {
    return {
      layer: 'mixed',
      observed: record.observed,
      inferred: record.inferred,
      quote: record.evidence_quote,
    };
  }
  return {
    layer: 'observed',
    text: record.observed || record.inferred,
    quote: record.evidence_quote,
  };
}