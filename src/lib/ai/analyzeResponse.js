import { askJSON, clamp } from '@/lib/ai/llm';
import { QUALITY_META } from '@/lib/situations';
import { SKILL_BY_KEY } from '@/lib/softSkills';
import { buildEvidenceRecord } from '@/lib/softSkillsRubric';

const DECISION_RANGE = { best: [80, 100], good: [55, 75], weak: [25, 45], bad: [0, 20] };

// Bulk inserts (text appearing at once) or far fewer edits than characters suggest text was not typed.
function typingSuspicion(typing) {
  const chars = typing?.chars || 0;
  const edits = typing?.keystrokes || 0;
  return (typing?.bulk_inserts || 0) > 0 || (chars > 60 && edits < chars * 0.15);
}

function localAnalysis({ option, justification, typing, situation }) {
  const len = (justification || '').trim().length;
  const decision = option ? option.score ?? 50 : 50;
  // Não recompensa texto longo — fallback sem IA dá nota conservadora fixa
  const just = len < 5 ? 5 : 35;
  const suspicious = typingSuspicion(typing);
  // Soft skill evidence from the situation's own tags + the behavior of the chosen option
  const softSkillEvidence = (situation?.soft_skills || []).map((ss) => {
    const skill = SKILL_BY_KEY[ss.skill];
    const dim = skill?.dimensions.find((d) => d.key === ss.dimension);
    const hasJust = len > 0;
    return {
      skill: ss.skill,
      skill_label: skill?.label || ss.skill,
      dimension: ss.dimension,
      dimension_label: dim?.label || ss.dimension,
      score: hasJust ? Math.round(decision * 0.6 + just * 0.4) : null,
      not_assessable: !hasJust,
      observed: hasJust ? `Escolheu "${option?.text || '—'}" e justificou.` : 'Escolheu uma alternativa sem justificativa.',
      inferred: hasJust ? `A escolha e a justificativa sugerem comportamento relacionado a ${dim?.label || ss.dimension}.` : null,
      evidence_quote: (justification || '').slice(0, 200) || null,
      confidence: hasJust ? 'low' : 'low',
    };
  });
  return {
    decision_score: decision,
    justification_score: just,
    coherence: 'parcial',
    competency_scores: {},
    soft_skill_evidence: softSkillEvidence,
    behavior_signals: option?.behavior ? [{ trait: option.behavior, evidence: `Escolheu: "${option.text}"` }] : [],
    positive_points: [],
    points_to_investigate: [],
    ai_detection: {
      is_ai_generated: suspicious,
      confidence: suspicious ? 70 : 0,
      indicators: suspicious ? ['Texto inserido sem digitação correspondente'] : [],
      analysis: suspicious ? 'Quantidade de texto incompatível com as teclas digitadas.' : 'Análise automática indisponível.',
    },
    detailed_feedback: 'Análise detalhada indisponível no momento — nota calculada pela qualidade da escolha e pela justificativa.',
    source: 'local',
  };
}

function finalize(a, { option, typing, situation }) {
  let decision = clamp(a.decision_score);
  if (option && DECISION_RANGE[option.quality]) {
    const [min, max] = DECISION_RANGE[option.quality];
    decision = Math.max(min, Math.min(max, decision));
  }
  const justification = clamp(a.justification_score);
  const ai = a.ai_detection || {};
  if (typingSuspicion(typing)) {
    ai.is_ai_generated = true;
    ai.confidence = Math.max(clamp(ai.confidence), 70);
    ai.indicators = [...(ai.indicators || []), 'Texto inserido sem digitação correspondente'];
  }
  // Normalize soft_skill_evidence: clamp scores, preserve not_assessable
  const softSkillEvidence = (a.soft_skill_evidence || []).map((e) => ({
    ...e,
    score: e.not_assessable ? null : clamp(e.score ?? 0),
  }));
  return {
    ...a,
    decision_score: decision,
    justification_score: justification,
    response_score: option ? Math.round(decision * 0.55 + justification * 0.45) : justification,
    soft_skill_evidence: softSkillEvidence,
    ai_detection: { is_ai_generated: !!ai.is_ai_generated, confidence: clamp(ai.confidence), indicators: ai.indicators || [], analysis: ai.analysis || '' },
  };
}

export async function analyzeSituationResponse({ job, situation, option, justification, typing, seconds }) {
  const optionsText = (situation.options || [])
    .map((o) => `${o.id.toUpperCase()}) ${o.text} [${QUALITY_META[o.quality]?.label || o.quality}; comportamento: ${o.behavior || '—'}]`)
    .join('\n');

  // Build the soft skills context for this situation
  const targetSkills = (situation.soft_skills || []).map((ss) => {
    const skill = SKILL_BY_KEY[ss.skill];
    const dim = skill?.dimensions.find((d) => d.key === ss.dimension);
    return `- ${skill?.label || ss.skill} → ${dim?.label || ss.dimension} (procurar: ${dim?.look_for || '—'})`;
  }).join('\n');

  const prompt = `Você é o avaliador do TalentIA. Avalie com RIGOR uma resposta de simulação de trabalho, extraindo EVIDÊNCIAS de soft skills. Português do Brasil.

VAGA: ${job?.title || ''} (${job?.sector || ''}). Competências da vaga: ${(job?.competencies || []).join(', ')}
SITUAÇÃO: ${situation.title}
${situation.context}
PERGUNTA: ${situation.question}
${optionsText ? `ALTERNATIVAS (qualidade definida pela empresa):\n${optionsText}` : 'QUESTÃO ABERTA (sem alternativas).'}
ESCOLHA DO CANDIDATO: ${option ? `${option.id.toUpperCase()}) ${option.text} [${option.quality}]` : 'não se aplica'}
JUSTIFICATIVA ESCRITA: """${justification || ''}"""
SINAIS: ${typing?.keystrokes || 0} teclas digitadas para ${typing?.chars || 0} caracteres; ${typing?.blocked_pastes || 0} tentativas de colar bloqueadas; ${seconds || 0}s na questão.
COMPETÊNCIAS DESTA SITUAÇÃO: ${(situation.competencies || []).join(', ')}

SOFT SKILLS QUE ESTA SITUAÇÃO MIRA:
${targetSkills || '—'}

REGRAS (EVIDÊNCIA, NÃO ADJETIVOS):
- A escolha pesa muito: "bad" → decision_score 0-20; "weak" → 25-45; "good" → 55-75; "best" → 80-100. Ajuste dentro da faixa conforme a justificativa.
- justification_score (0-100): clareza, raciocínio, coerência com a escolha e uso dos fatos da situação. Texto vazio, sem sentido ou genérico → 0-15. Justificativa que contradiz a escolha → no máximo 30.
- NÃO identificar uma soft skill só porque o candidato ESCREVEU "sou organizado" ou "tenho boa comunicação". Procure COMPORTAMENTO DEMONSTRADO: o que ele descreveu que faria, com que critérios, em que ordem.
- soft_skill_evidence: para CADA sub-dimensão que esta situação mira, produza:
  - "observed": o que EFETIVAMENTE apareceu na resposta (fato — ex.: "descreveu 3 etapas antes de decidir").
  - "inferred": interpretação possível do observado (inferência — ex.: "sugere análise de alternativas").
  - "evidence_quote": trecho REAL da justificativa que sustenta (máx 200 chars). Se não houver, null.
  - "score": 0-100 refletindo o DEMONSTRADO, ou null se "not_assessable".
  - "not_assessable": true quando NÃO há evidência suficiente para avaliar esta sub-dimensão (justificativa vazia, genérica ou que não toca o comportamento). Neste caso score=null.
  - "confidence": high/medium/low.
- behavior_signals: como a pessoa age nesta situação (impulsiva, calma, ansiosa, ponderada, evasiva, assertiva, colaborativa, autoritária, analítica, passiva...), sempre com a evidência.
- ai_detection: sinais de texto gerado por IA (linguagem genérica e polida demais, estrutura perfeita em tópicos, ausência de voz própria, muitos caracteres para poucas teclas). confidence 0-100. Trate como INDÍCIO, nunca como fato provado.
- Evite elogios vazios. Seja específico. Cite trechos reais.

Responda SOMENTE com JSON válido:
{"decision_score":0,"justification_score":0,"coherence":"coerente|parcial|incoerente","competency_scores":{"competência":{"score":0,"evidence":"✓|~|✗","justification":"","evidence_quote":""}},"soft_skill_evidence":[{"skill":"key_da_skill","skill_label":"Comunicação","dimension":"clareza","dimension_label":"Clareza e objetividade","observed":"","inferred":"","evidence_quote":"","score":0,"not_assessable":false,"confidence":"high|medium|low"}],"behavior_signals":[{"trait":"","evidence":""}],"quality_metrics":{"clarity":0,"reasoning":0,"coherence":0,"problem_solving":0,"communication":0,"has_concrete_examples":false},"response_depth":{"level":"superficial|explanation|examples|context_results|practical_experience","reasoning":""},"positive_points":[""],"points_to_investigate":[""],"ai_detection":{"is_ai_generated":false,"confidence":0,"indicators":[],"analysis":""},"detailed_feedback":""}`;

  const parsed = await askJSON(prompt, { validate: (p) => p.decision_score !== undefined || p.justification_score !== undefined });
  return finalize(parsed || localAnalysis({ option, justification, typing, situation }), { option, typing, situation });
}