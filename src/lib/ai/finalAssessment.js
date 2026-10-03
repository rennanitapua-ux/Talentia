import { askJSON, clamp } from '@/lib/ai/llm';
import { BEHAVIOR_AXES, localBehaviorProfile } from '@/lib/ai/behavior';
import { getRecommendation } from '@/lib/skillScoring';
import { DISC_QUESTIONS } from '@/lib/discTest';

const avg = (list) => (list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0);

function localSkillScores(responses, competencies) {
  const buckets = {};
  responses.forEach((r) => {
    (r.competencies?.length ? r.competencies : competencies).forEach((c) => {
      (buckets[c] = buckets[c] || []).push(r.analysis?.response_score ?? r.choice_score ?? 0);
    });
  });
  const out = {};
  competencies.forEach((c) => { out[c] = avg(buckets[c] || []); });
  return out;
}

function discText(disc, answers) {
  if (!disc?.scores) return 'DISC não realizado.';
  const lines = (answers || []).map((a) => {
    const q = DISC_QUESTIONS.find((x) => x.id === a.questionId);
    const o = q?.options.find((x) => x.letter === a.letter);
    return q && o ? `- ${q.question} → "${o.text}" (${a.letter})` : null;
  }).filter(Boolean);
  return `D=${disc.scores.D}% I=${disc.scores.I}% S=${disc.scores.S}% C=${disc.scores.C}% · perfil ${disc.profile_code}\n${lines.join('\n')}`;
}

export async function generateFinalAssessment({ candidateName, job, responses, disc, discAnswers, integrity }) {
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas'];
  const items = responses.map((r, i) => ({
    n: i + 1,
    situacao: r.phase_title,
    pergunta: r.question_short || r.question_prompt,
    escolha: r.choice_text || null,
    qualidade_escolha: r.choice_quality || null,
    comportamento_escolha: r.choice_behavior || null,
    justificativa: String(r.justification || r.answer || '').slice(0, 700),
    nota: r.analysis?.response_score ?? null,
    sinais: (r.analysis?.behavior_signals || []).map((b) => b.trait).join(', '),
    suspeita_ia: r.analysis?.ai_detection?.is_ai_generated ? r.analysis.ai_detection.confidence : 0,
    tempo_s: r.time_spent_seconds,
  }));

  const prompt = `Você é o TalentOS gerando o RELATÓRIO FINAL de um candidato para recrutadores. Seja rigoroso, específico e baseado em evidências. Português do Brasil.

CANDIDATO: ${candidateName}
VAGA: ${job.title} · ${job.sector || ''} · problema real: ${job.company_problems || '—'}
COMPETÊNCIAS: ${competencies.join(', ')}
INTEGRIDADE: saídas de aba ${integrity?.tab_switches || 0}, perdas de foco ${integrity?.focus_losses || 0}, tentativas de colar ${integrity?.paste_attempts || 0}, suspeitas de IA ${integrity?.ai_suspicions || 0}

DISC (complementar, nunca decide sozinho):
${discText(disc, discAnswers)}

RESPOSTAS (escolha + justificativa + nota individual):
${JSON.stringify(items)}

REGRAS: nunca invente; cite situações pelo número; diferencie fato observado de interpretação; alternativas "bad" e "weak" devem pesar negativamente; sem adjetivos vazios ("excelente", "grande potencial").

Gere também:
- behavioral_profile: como a pessoa AGE, com base nas escolhas e justificativas. Para cada eixo, position 0-100 (0 = traço da esquerda, 100 = traço da direita) e evidência citando situações. Eixos: ${BEHAVIOR_AXES.map((a) => `${a.key} (${a.left} ↔ ${a.right})`).join('; ')}.
- disc_interpretation: leitura detalhada do DISC combinada com o comportamento observado.

Responda SOMENTE com JSON válido:
{"profile_summary":"","summary":"","skill_scores":{"competência":{"score":0,"confidence":"high|medium|low"}},"skill_dna":{"strengths":[{"competency":"","score":0,"evidence":""}],"growth_areas":[{"competency":"","score":0,"evidence":""}]},"hard_skills":[{"name":"","evidence":""}],"soft_skills":[{"name":"","evidence":""}],"behavioral_profile":{"summary":"","decision_style":"","under_pressure":"","axes":{"impulsividade":{"position":50,"evidence":""}},"dominant_traits":[""],"risks":[""]},"disc_interpretation":{"headline":"","description":"","under_pressure":"","communication":"","motivators":[""],"fears":[""],"how_to_manage":[""],"fit_with_role":"","interview_tips":[""]},"personality_analysis":"","work_style":"","strengths_detail":"","weaknesses_detail":"","job_compatibility":{"demonstrated":[{"competency":"","evidence":""}],"partial":[{"competency":"","evidence":""}],"not_evidenced":[{"competency":"","note":""}],"needs_investigation":[{"competency":"","reason":""}]},"consistency_analysis":"","interview_questions":[{"question":"","rationale":"","competency":""}],"overall_confidence":"high|medium|low","assessment_confidence":{"level":"high|medium|low","reasoning":"","evidence_count":0}}`;

  const ai = (await askJSON(prompt, { models: ['claude-sonnet-5', 'gemini_3_flash'], validate: (p) => p.summary || p.skill_scores })) || {};

  // Scores: AI per competency when available, otherwise computed from the individual notes.
  const local = localSkillScores(responses, competencies);
  const skill_scores = {};
  const score_confidence = {};
  competencies.forEach((c) => {
    const v = ai.skill_scores?.[c];
    const aiScore = typeof v === 'number' ? v : v?.score;
    skill_scores[c] = aiScore !== undefined ? clamp(aiScore) : local[c];
    if (v?.confidence) score_confidence[c] = v.confidence;
  });
  const responseAvg = avg(responses.map((r) => r.analysis?.response_score ?? r.choice_score ?? 0));
  const skillAvg = avg(Object.values(skill_scores));
  const overall_score = Math.round(responseAvg * 0.6 + skillAvg * 0.4);
  const weight = 1 / competencies.length;

  const behavior = ai.behavioral_profile?.axes ? ai.behavioral_profile : localBehaviorProfile(responses);

  return {
    profile_summary: ai.profile_summary || '',
    summary: ai.summary || 'Relatório gerado a partir das notas individuais de cada situação.',
    skill_scores,
    score_confidence,
    skill_graph: skill_scores,
    score_composition: competencies.map((c) => ({ competency: c, score: skill_scores[c], weight, contribution: skill_scores[c] * weight * 0.4 })),
    skill_dna: ai.skill_dna || { strengths: [], growth_areas: [] },
    hard_skills: ai.hard_skills || [],
    soft_skills: ai.soft_skills || [],
    behavioral_profile: behavior,
    disc_interpretation: ai.disc_interpretation || null,
    personality_analysis: ai.personality_analysis || '',
    work_style: ai.work_style || '',
    strengths_detail: ai.strengths_detail || '',
    weaknesses_detail: ai.weaknesses_detail || '',
    job_compatibility: ai.job_compatibility || {},
    consistency_analysis: ai.consistency_analysis || '',
    interview_questions: ai.interview_questions || [],
    overall_score,
    overall_confidence: ai.overall_confidence || 'medium',
    assessment_confidence: ai.assessment_confidence || { level: 'low', reasoning: 'Relatório gerado sem a análise completa da IA.', evidence_count: responses.length },
    recommendation: getRecommendation(overall_score).label,
  };
}