import { askJSON, clamp } from '@/lib/ai/llm';
import { BEHAVIOR_AXES, localBehaviorProfile } from '@/lib/ai/behavior';
import { getRecommendation } from '@/lib/skillScoring';
import { DISC_QUESTIONS } from '@/lib/discTest';
import { SOFT_SKILLS, SKILL_BY_KEY, inferSoftSkills } from '@/lib/softSkills';

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

// Aggregates per-response soft_skill_evidence into a structured per-skill, per-dimension breakdown.
function localSoftSkillsDetail(responses, targetSkills) {
  const detail = {};
  (targetSkills.length ? targetSkills : SOFT_SKILLS.slice(0, 4)).forEach((skill) => {
    detail[skill.key] = {
      label: skill.label,
      score: 0,
      confidence: 'low',
      dimensions: {},
    };
    skill.dimensions.forEach((dim) => {
      detail[skill.key].dimensions[dim.key] = { label: dim.label, score: 0, evidence: [], count: 0 };
    });
  });

  responses.forEach((r) => {
    const evidence = r.analysis?.soft_skill_evidence || [];
    evidence.forEach((e) => {
      if (!detail[e.skill]) {
        const skill = SKILL_BY_KEY[e.skill];
        if (!skill) return;
        detail[e.skill] = {
          label: skill.label,
          score: 0,
          confidence: 'low',
          dimensions: {},
        };
        skill.dimensions.forEach((dim) => {
          detail[e.skill].dimensions[dim.key] = { label: dim.label, score: 0, evidence: [], count: 0 };
        });
      }
      const dimEntry = detail[e.skill].dimensions[e.dimension];
      if (!dimEntry) {
        detail[e.skill].dimensions[e.dimension] = { label: e.dimension_label || e.dimension, score: 0, evidence: [], count: 0 };
      }
      const de = detail[e.skill].dimensions[e.dimension];
      de.evidence.push({ situation: r.phase_title, score: e.score, quote: e.evidence_quote, note: e.evidence });
      de.count++;
      de.score = Math.round((de.score * (de.count - 1) + e.score) / de.count);
    });
  });

  // Compute per-skill score = avg of dimension scores
  Object.values(detail).forEach((skill) => {
    const dimScores = Object.values(skill.dimensions).filter((d) => d.count > 0).map((d) => d.score);
    if (dimScores.length) {
      skill.score = avg(dimScores);
      skill.confidence = dimScores.length >= 3 ? 'medium' : 'low';
    }
  });

  return detail;
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
  const targetSkills = inferSoftSkills(job);
  const skillsBlock = targetSkills.map((s) => `${s.label} (${s.key}): ${s.dimensions.map((d) => d.key).join(', ')}`).join('; ');

  const items = responses.map((r, i) => ({
    n: i + 1,
    situacao: r.phase_title,
    pergunta: r.question_short || r.question_prompt,
    escolha: r.choice_text || null,
    qualidade_escolha: r.choice_quality || null,
    comportamento_escolha: r.choice_behavior || null,
    justificativa: String(r.justification || r.answer || '').slice(0, 700),
    nota: r.analysis?.response_score ?? null,
    soft_skills_medidas: (r.analysis?.soft_skill_evidence || []).map((e) => ({
      skill: e.skill_label,
      dimension: e.dimension_label,
      score: e.score,
      evidence: e.evidence,
      quote: e.evidence_quote,
    })),
    sinais: (r.analysis?.behavior_signals || []).map((b) => b.trait).join(', '),
    suspeita_ia: r.analysis?.ai_detection?.is_ai_generated ? r.analysis.ai_detection.confidence : 0,
    tempo_s: r.time_spent_seconds,
  }));

  const localSoft = localSoftSkillsDetail(responses, targetSkills);

  const prompt = `Você é o TalentOS gerando o RELATÓRIO FINAL de um candidato para recrutadores. Seja rigoroso, específico e baseado em EVIDÊNCIAS de soft skills. Português do Brasil.

CANDIDATO: ${candidateName}
VAGA: ${job.title} · ${job.sector || ''} · problema real: ${job.company_problems || '—'}
COMPETÊNCIAS: ${competencies.join(', ')}
SOFT SKILLS AVALIADAS: ${skillsBlock}
INTEGRIDADE: saídas de aba ${integrity?.tab_switches || 0}, perdas de foco ${integrity?.focus_losses || 0}, tentativas de colar ${integrity?.paste_attempts || 0}, suspeitas de IA ${integrity?.ai_suspicions || 0}

DISC (complementar, nunca decide sozinho):
${discText(disc, discAnswers)}

RESPOSTAS (escolha + justificativa + nota individual + soft skills medidas com evidência):
${JSON.stringify(items)}

REGRAS: 
- NUNCA invente; cite situações pelo número.
- NUNCA use adjetivos vazios ("excelente", "grande potencial", "bom profissional"). Cada afirmação deve ter evidência: qual situação, o que o candidato fez/dis.
- Diferencie fato observado de interpretação.
- Alternativas "bad" e "weak" devem pesar negativamente.
- soft_skills_detail: para CADA soft skill avaliada, dê score 0-100, confidence (high/medium/low) e para cada sub-dimensão: score, evidence (citando situações por número) e growth (se aplicável).
- O score da sub-dimensão deve refletir o que o candidato DEMONSTROU nas respostas, não potencial.
- soft_skills_narrative: parágrafo que conecta as evidências — como a pessoa pensa, decide, comunica, reage a problemas e trabalha com outros. Cite situações específicas.

Gere também:
- behavioral_profile: como a pessoa AGE, com base nas escolhas e justificativas. Para cada eixo, position 0-100 (0 = traço da esquerda, 100 = traço da direita) e evidência citando situações. Eixos: ${BEHAVIOR_AXES.map((a) => `${a.key} (${a.left} ↔ ${a.right})`).join('; ')}.
- disc_interpretation: leitura detalhada do DISC combinada com o comportamento observado.

Responda SOMENTE com JSON válido:
{"profile_summary":"","summary":"","soft_skills_narrative":"","soft_skills_detail":{"comunicacao":{"score":0,"confidence":"high|medium|low","dimensions":{"clareza":{"score":0,"evidence":"","growth":""}}}},"skill_scores":{"competência":{"score":0,"confidence":"high|medium|low"}},"skill_dna":{"strengths":[{"competency":"","score":0,"evidence":""}],"growth_areas":[{"competency":"","score":0,"evidence":""}]},"hard_skills":[{"name":"","evidence":""}],"soft_skills":[{"name":"","score":0,"evidence":""}],"behavioral_profile":{"summary":"","decision_style":"","under_pressure":"","axes":{"impulsividade":{"position":50,"evidence":""}},"dominant_traits":[""],"risks":[""]},"disc_interpretation":{"headline":"","description":"","under_pressure":"","communication":"","motivators":[""],"fears":[""],"how_to_manage":[""],"fit_with_role":"","interview_tips":[""]},"personality_analysis":"","work_style":"","strengths_detail":"","weaknesses_detail":"","job_compatibility":{"demonstrated":[{"competency":"","evidence":""}],"partial":[{"competency":"","evidence":""}],"not_evidenced":[{"competency":"","note":""}],"needs_investigation":[{"competency":"","reason":""}]},"consistency_analysis":"","interview_questions":[{"question":"","rationale":"","competency":""}],"overall_confidence":"high|medium|low","assessment_confidence":{"level":"high|medium|low","reasoning":"","evidence_count":0}}`;

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

  // Merge AI soft_skills_detail with local; AI takes priority but local fills gaps
  const soft_skills_detail = { ...localSoft };
  if (ai.soft_skills_detail) {
    Object.entries(ai.soft_skills_detail).forEach(([key, val]) => {
      if (!soft_skills_detail[key]) {
        const skill = SKILL_BY_KEY[key];
        soft_skills_detail[key] = {
          label: skill?.label || key,
          score: clamp(val.score),
          confidence: val.confidence || 'low',
          dimensions: {},
        };
      }
      soft_skills_detail[key].score = clamp(val.score ?? soft_skills_detail[key].score);
      soft_skills_detail[key].confidence = val.confidence || soft_skills_detail[key].confidence;
      if (val.dimensions) {
        Object.entries(val.dimensions).forEach(([dimKey, dimVal]) => {
          const localDim = soft_skills_detail[key].dimensions[dimKey];
          if (localDim) {
            localDim.score = clamp(dimVal.score ?? localDim.score);
            if (dimVal.evidence) localDim.ai_evidence = dimVal.evidence;
            if (dimVal.growth) localDim.growth = dimVal.growth;
          } else {
            soft_skills_detail[key].dimensions[dimKey] = {
              label: dimVal.label || dimKey,
              score: clamp(dimVal.score),
              evidence: [],
              count: 1,
              ai_evidence: dimVal.evidence,
              growth: dimVal.growth,
            };
          }
        });
      }
    });
  }

  return {
    profile_summary: ai.profile_summary || '',
    summary: ai.summary || 'Relatório gerado a partir das notas individuais de cada situação.',
    soft_skills_narrative: ai.soft_skills_narrative || '',
    soft_skills_detail,
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