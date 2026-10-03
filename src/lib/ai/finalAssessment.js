import { askJSON, clamp } from '@/lib/ai/llm';
import { BEHAVIOR_AXES, localBehaviorProfile } from '@/lib/ai/behavior';
import { getRecommendation } from '@/lib/skillScoring';
import { DISC_QUESTIONS } from '@/lib/discTest';
import { SOFT_SKILLS, SKILL_BY_KEY, inferSoftSkills } from '@/lib/softSkills';
import { confidenceFor, interviewQuestionsFromGaps } from '@/lib/softSkillsRubric';

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
// Aplica a rubrica: sem evidência → not_assessable (score null, confiança low). Nunca inventa score.
function localSoftSkillsDetail(responses, targetSkills) {
  const detail = {};
  (targetSkills.length ? targetSkills : SOFT_SKILLS.slice(0, 5)).forEach((skill) => {
    detail[skill.key] = {
      label: skill.label,
      score: null,
      not_assessable: true,
      confidence: 'low',
      dimensions: {},
    };
    skill.dimensions.forEach((dim) => {
      detail[skill.key].dimensions[dim.key] = {
        label: dim.label,
        score: null,
        not_assessable: true,
        evidence: [],
        count: 0,
        observed: null,
        inferred: null,
      };
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
          score: null,
          not_assessable: true,
          confidence: 'low',
          dimensions: {},
        };
        skill.dimensions.forEach((dim) => {
          detail[e.skill].dimensions[dim.key] = {
            label: dim.label,
            score: null,
            not_assessable: true,
            evidence: [],
            count: 0,
            observed: null,
            inferred: null,
          };
        });
      }
      const dimEntry = detail[e.skill].dimensions[e.dimension];
      if (!dimEntry) {
        detail[e.skill].dimensions[e.dimension] = {
          label: e.dimension_label || e.dimension,
          score: null,
          not_assessable: true,
          evidence: [],
          count: 0,
          observed: null,
          inferred: null,
        };
      }
      const de = detail[e.skill].dimensions[e.dimension];
      de.count++;
      de.not_assessable = false;
      // Preserve observed/inferred from per-response analysis
      if (e.observed) de.observed = de.observed ? `${de.observed}; ${e.observed}` : e.observed;
      if (e.inferred) de.inferred = de.inferred ? `${de.inferred}; ${e.inferred}` : e.inferred;
      de.evidence.push({
        situation: r.phase_title,
        situation_index: r.phase_index,
        score: e.score,
        quote: e.evidence_quote,
        note: e.observed || e.evidence,
        inferred: e.inferred,
      });
      // Running average only when there's a real score
      if (typeof e.score === 'number') {
        de.score = de.score === null ? e.score : Math.round((de.score * (de.count - 1) + e.score) / de.count);
      }
    });
  });

  // Compute per-skill score = avg of assessed dimension scores; confidence by evidence count
  Object.values(detail).forEach((skill) => {
    const assessedDims = Object.values(skill.dimensions).filter((d) => !d.not_assessable && typeof d.score === 'number');
    if (assessedDims.length) {
      skill.score = avg(assessedDims.map((d) => d.score));
      skill.not_assessable = false;
      const totalEvidence = assessedDims.reduce((sum, d) => sum + d.count, 0);
      skill.confidence = confidenceFor(Math.floor(totalEvidence / Math.max(assessedDims.length, 1)));
    } else {
      skill.score = null;
      skill.not_assessable = true;
      skill.confidence = 'low';
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

export async function generateFinalAssessment({ candidateName, job, responses, disc, discAnswers, integrity, companyProfile }) {
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas'];
  const targetSkills = inferSoftSkills(job);
  const skillsBlock = targetSkills.map((s) => `${s.label} (${s.key}): ${s.dimensions.map((d) => d.key).join(', ')}`).join('; ');

  // Perfil cultural da empresa para análise contextual profunda
  const cp = companyProfile || {};
  const companyCultureBlock = [
    `Empresa: ${cp.company_name || job.company_name || '—'}`,
    `Segmento: ${cp.sector || job.sector || '—'} · Tamanho: ${cp.employee_count || '—'}`,
    `Missão: ${cp.mission || '—'}`,
    `Visão: ${cp.vision || '—'}`,
    `Valores declarados: ${(cp.values || []).map((v) => `${v.name}: ${v.expected_behavior || v.description || ''}`).join('; ') || '—'}`,
    `O que valoriza: ${(cp.valued || []).join(', ') || '—'}`,
    `Tomada de decisão: ${(cp.decision_making || []).join(', ') || '—'}`,
    `Autonomia: ${cp.autonomy_level || '—'} — ${cp.autonomy_description || ''}`,
    `Estilo de gestão: ${(cp.management_style || []).join(', ') || '—'}`,
    `Tolerância a erros: ${(cp.error_handling || []).join(', ') || '—'} — ${cp.error_description || ''}`,
    `Colaboração: ${(cp.collaboration || []).join(', ') || '—'}`,
    `Comunicação: ${(cp.communication || []).join(', ') || '—'}`,
    `Ritmo: ${cp.work_rhythm || '—'} — ${cp.rhythm_description || ''}`,
    `Ambiente: ${(cp.work_environment || []).join(', ') || '—'}`,
    `O que faz dar certo: ${cp.what_succeeds || '—'}`,
    `O que gera dificuldades: ${cp.what_doesnt_work || '—'}`,
    `Propósito: ${cp.purpose || '—'}`,
  ].join('\n');

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
      observed: e.observed || null,
      inferred: e.inferred || null,
      score: e.score,
      not_assessable: e.not_assessable || false,
      quote: e.evidence_quote,
    })),
    sinais: (r.analysis?.behavior_signals || []).map((b) => b.trait).join(', '),
    suspeita_ia: r.analysis?.ai_detection?.is_ai_generated ? r.analysis.ai_detection.confidence : 0,
    tempo_s: r.time_spent_seconds,
  }));

  const localSoft = localSoftSkillsDetail(responses, targetSkills);

  const prompt = `Você é o TalentOS gerando o RELATÓRIO FINAL de um candidato para recrutadores. Seja rigoroso, específico e baseado em EVIDÊNCIAS de soft skills. Português do Brasil.

CANDIDATO: ${candidateName}
VAGA: ${job.title} · ${job.sector || ''} · nível de domínio: ${job.seniority_level != null ? `${job.seniority_level}/10` : '—'} · problema real: ${job.company_problems || '—'}
COMPETÊNCIAS: ${competencies.join(', ')}
SOFT SKILLS AVALIADAS: ${skillsBlock}
INTEGRIDADE: saídas de aba ${integrity?.tab_switches || 0}, perdas de foco ${integrity?.focus_losses || 0}, tentativas de colar ${integrity?.paste_attempts || 0}, suspeitas de IA ${integrity?.ai_suspicions || 0}

PERFIL CULTURAL DA EMPRESA (use para análise contextual — NUNCA invente, separe declarado de observado):
${companyCultureBlock}

DISC (complementar, NUNCA decide sozinho, NUNCA diagnóstico, NUNCA preconceito — nenhum fator é universalmente melhor):
${discText(disc, discAnswers)}

RESPOSTAS (escolha + comentário opcional + nota individual + soft skills medidas com observado/inferido):
${JSON.stringify(items)}

REGRAS (EVIDÊNCIA — não adjetivos):
- NUNCA invente; cite situações pelo número (ex.: "na situação 3, o candidato...").
- NUNCA use adjetivos vazios ("excelente", "grande potencial", "bom profissional"). Cada afirmação deve ter evidência: qual situação, o que o candidato fez/disse.
- NUNCA atribua uma competência só porque o candidato escreveu "sou líder/organizado/comunicativo". Exija comportamento demonstrado.
- Diferencie OBSERVADO (fato que apareceu na resposta) de INFERIDO (interpretação possível). Nunca transforme inferência em fato.
- Se não houver evidência suficiente para uma skill/dimensão, marque score null e not_assessable=true. É melhor "não foi possível avaliar" do que inventar.
- Alternativas "bad" e "weak" devem pesar negativamente.
- soft_skills_detail: para CADA soft skill, dê score 0-100 (ou null se não avaliável), confidence (high/medium/low) e para cada sub-dimensão: score, observed, inferred, evidence (citando situações por número) e growth (se aplicável).
- soft_skills_narrative: parágrafo que conecta as evidências — como a pessoa pensa, decide, comunica, reage a problemas e trabalha com outros. Cite situações específicas. Responda "o que essa pessoa demonstrou?", não "qual personalidade ela possui?".
- consistency_analysis: compare as respostas. Procure padrões, contradições, mudanças de estratégia. NÃO acuse o candidato de mentir — mostre "ponto para investigação" quando houver divergência.
- interview_questions: gere perguntas personalizadas a partir das LACUNAS de evidência — competências exigidas pela vaga com pouca ou nenhuma evidência. Cada pergunta deve referenciar uma evidência real (ou a ausência dela).
- job_compatibility: para cada competência da vaga, classifique: demonstrated / partial / not_evidenced / needs_investigation, sempre com evidence citando situações.

ANÁLISE CONTEXTUAL DA EMPRESA (company_analysis):
- Separe CLARAMENTE: cultura_declarada (o que a empresa afirma), cultura_observada (padrões inferidos das informações — marque como inferência), contexto_operacao (condições reais do trabalho), comportamentos_necessarios (para a função naquele contexto), evidencias (informações concretas usadas).
- Quando não houver informação suficiente, use "dados insuficientes" ou "necessita validação". NUNCA invente características.
- A importância de cada competência depende do CONTEXTO da vaga e da empresa, não de valor genérico.

CATEGORIZAÇÃO DE EVIDÊNCIAS (evidence_categories):
- fortes: evidências concretas e consistentes — cada item com {item, evidence, source, confidence}.
- suporte: sinais positivos, mas com menor profundidade de evidência.
- validar: dúvidas que precisam ser investigadas (possíveis inconsistências — NÃO acuse mentira, sugira pergunta de entrevista).
- insuficientes: não há informação suficiente para concluir — NUNCA interprete ausência como negativa.
- atencao: aspectos que merecem investigação, sem transformar em deficiência.
- Para cada item: o que foi identificado, qual evidência sustenta, de onde veio, nível de confiança.
- Diferencie OPINIÃO (autodeclaração) de EVIDÊNCIA (comportamento observável). Dê mais valor à evidência concreta.
- Texto longo ≠ evidência forte. Considere especificidade, concretude, contexto, coerência.
- O comentário opcional do candidato é EVIDÊNCIA ADICIONAL — não substitui a alternativa marcada, não penalize ausência de comentário.

Gere também:
- behavioral_profile: como a pessoa AGE, com base nas escolhas e justificativas. Para cada eixo, position 0-100 (0 = traço da esquerda, 100 = traço da direita) e evidência citando situações. Eixos: ${BEHAVIOR_AXES.map((a) => `${a.key} (${a.left} ↔ ${a.right})`).join('; ')}.
- disc_interpretation: leitura detalhada do DISC combinada com o comportamento observado. NUNCA usar DISC como diagnóstico.

Responda SOMENTE com JSON válido:
{"profile_summary":"","summary":"","soft_skills_narrative":"","soft_skills_detail":{"comunicacao":{"score":0,"confidence":"high|medium|low","dimensions":{"clareza":{"score":0,"observed":"","inferred":"","evidence":"","growth":""}}}},"skill_scores":{"competência":{"score":0,"confidence":"high|medium|low"}},"skill_dna":{"strengths":[{"competency":"","score":0,"evidence":""}],"growth_areas":[{"competency":"","score":0,"evidence":""}]},"hard_skills":[{"name":"","evidence":""}],"soft_skills":[{"name":"","score":0,"evidence":""}],"behavioral_profile":{"summary":"","decision_style":"","under_pressure":"","axes":{"impulsividade":{"position":50,"evidence":""}},"dominant_traits":[""],"risks":[""]},"disc_interpretation":{"headline":"","description":"","under_pressure":"","communication":"","motivators":[""],"fears":[""],"how_to_manage":[""],"fit_with_role":"","interview_tips":[""]},"personality_analysis":"","work_style":"","strengths_detail":"","weaknesses_detail":"","job_compatibility":{"demonstrated":[{"competency":"","evidence":""}],"partial":[{"competency":"","evidence":""}],"not_evidenced":[{"competency":"","note":""}],"needs_investigation":[{"competency":"","reason":""}]},"consistency_analysis":"","interview_questions":[{"question":"","rationale":"","competency":""}],"company_analysis":{"cultura_declarada":[""],"cultura_observada":[""],"contexto_operacao":[""],"comportamentos_necessarios":[""],"evidencias":[""]},"evidence_categories":{"fortes":[{"item":"","evidence":"","source":"","confidence":"high|medium|low"}],"suporte":[{"item":"","evidence":"","source":"","confidence":"high|medium|low"}],"validar":[{"item":"","reason":"","interview_question":""}],"insuficientes":[{"item":"","note":""}],"atencao":[{"item":"","note":"","interview_question":""}]},"overall_confidence":"high|medium|low","assessment_confidence":{"level":"high|medium|low","reasoning":"","evidence_count":0}}`;

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

  // Observações de comportamento durante a avaliação
  const times = responses.map((r) => r.time_spent_seconds || 0).filter(Boolean);
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const minTime = times.length ? Math.min(...times) : 0;
  const maxTime = times.length ? Math.max(...times) : 0;
  const timeVariance = times.length > 1 ? Math.round(Math.sqrt(times.reduce((s, t) => s + Math.pow(t - avgTime, 2), 0) / times.length)) : 0;
  const rushed = times.filter((t) => t > 0 && t < 15).length;
  const longPauses = times.filter((t) => t > 240).length;
  const totalChars = responses.reduce((s, r) => s + (r.typing?.chars || (r.justification || '').length || 0), 0);
  const avgChars = responses.length ? Math.round(totalChars / responses.length) : 0;
  const bulkInserts = responses.reduce((s, r) => s + (r.typing?.bulk_inserts || 0), 0);
  const blockedPastes = responses.reduce((s, r) => s + (r.typing?.blocked_pastes || 0), 0);
  const observations = [];
  if (rushed > 0) observations.push({ type: 'rushed', label: `${rushed} resposta(s) muito rápida(s)`, detail: 'Tempo abaixo de 15s pode indicar baixa reflexão.', severity: rushed > 1 ? 'warn' : 'info' });
  if (longPauses > 0) observations.push({ type: 'pause', label: `${longPauses} pausa(s) longa(s)`, detail: 'Mais de 4 min em uma questão pode indicar hesitação ou dúvida.', severity: 'info' });
  if (avgTime > 0 && timeVariance > avgTime * 0.6) observations.push({ type: 'inconsistent', label: 'Ritmo inconsistente', detail: 'Grande variação de tempo entre as questões.', severity: 'info' });
  if (bulkInserts > 0) observations.push({ type: 'bulk', label: `${bulkInserts} inserção(ões) de bloco de texto`, detail: 'Texto inserido em massa — possível uso de fonte externa.', severity: 'warn' });
  if (blockedPastes > 0) observations.push({ type: 'paste', label: `${blockedPastes} tentativa(s) de colar bloqueada(s)`, detail: 'Tentou colar texto na resposta (bloqueado).', severity: 'warn' });
  if (integrity?.tab_switches > 0) observations.push({ type: 'tab', label: `${integrity.tab_switches} saída(s) de aba`, detail: 'Mudou de aba durante a simulação.', severity: 'warn' });
  if (avgChars > 0 && avgChars < 60) observations.push({ type: 'short', label: 'Respostas curtas', detail: `Média de ${avgChars} caracteres por resposta.`, severity: 'info' });
  if (observations.length === 0) observations.push({ type: 'steady', label: 'Comportamento estável', detail: 'Ritmo consistente, sem sinais de atalho ou distração.', severity: 'ok' });
  const behavioral_observations = {
    avg_time_per_question: avgTime, min_time: minTime, max_time: maxTime,
    time_variance: timeVariance, rushed_answers: rushed, long_pauses: longPauses,
    avg_chars: avgChars, bulk_inserts: bulkInserts, blocked_pastes: blockedPastes,
    observations,
  };

  // Níveis 0-10: exigido pela vaga vs. demonstrado pelo candidato
  const reqMap = {};
  (job.competency_requirements || []).forEach((r) => { reqMap[r.name] = r.required_level; });
  const demonstrated_levels = {};
  competencies.forEach((c) => {
    const demonstrated = Math.round((skill_scores[c] || 0) / 10);
    const required = reqMap[c] != null ? reqMap[c] : null;
    const gap = required !== null ? demonstrated - required : null;
    demonstrated_levels[c] = {
      demonstrated,
      required,
      gap,
      status: required === null ? 'no_target' : gap >= 0 ? 'meets' : gap >= -1 ? 'close' : 'below',
    };
  });

  const behavior = ai.behavioral_profile?.axes ? ai.behavioral_profile : localBehaviorProfile(responses);

  // Merge AI soft_skills_detail with local; AI takes priority but local fills gaps.
  // Preserves not_assessable when neither has evidence.
  const soft_skills_detail = { ...localSoft };
  if (ai.soft_skills_detail) {
    Object.entries(ai.soft_skills_detail).forEach(([key, val]) => {
      if (!soft_skills_detail[key]) {
        const skill = SKILL_BY_KEY[key];
        soft_skills_detail[key] = {
          label: skill?.label || key,
          score: val.score == null ? null : clamp(val.score),
          not_assessable: val.score == null,
          confidence: val.confidence || 'low',
          dimensions: {},
        };
      }
      const entry = soft_skills_detail[key];
      if (val.score != null) {
        entry.score = clamp(val.score ?? entry.score);
        entry.not_assessable = false;
      }
      entry.confidence = val.confidence || entry.confidence;
      if (val.dimensions) {
        Object.entries(val.dimensions).forEach(([dimKey, dimVal]) => {
          const localDim = entry.dimensions[dimKey];
          if (localDim) {
            if (dimVal.score != null) {
              localDim.score = clamp(dimVal.score ?? localDim.score);
              localDim.not_assessable = false;
            }
            if (dimVal.observed) localDim.observed = dimVal.observed;
            if (dimVal.inferred) localDim.inferred = dimVal.inferred;
            if (dimVal.evidence) localDim.ai_evidence = dimVal.evidence;
            if (dimVal.growth) localDim.growth = dimVal.growth;
          } else {
            entry.dimensions[dimKey] = {
              label: dimVal.label || dimKey,
              score: dimVal.score == null ? null : clamp(dimVal.score),
              not_assessable: dimVal.score == null,
              evidence: [],
              count: dimVal.score != null ? 1 : 0,
              observed: dimVal.observed || null,
              inferred: dimVal.inferred || null,
              ai_evidence: dimVal.evidence,
              growth: dimVal.growth,
            };
          }
        });
      }
    });
  }

  // Interview questions: merge AI's with gap-generated ones (gaps fill first if AI didn't cover them)
  const aiQuestions = ai.interview_questions || [];
  const gapQuestions = interviewQuestionsFromGaps({ targetSkills, softSkillsDetail: soft_skills_detail, job });
  const coveredCompetencies = new Set(aiQuestions.map((q) => q.competency?.split(' → ')[0]));
  const missingGaps = gapQuestions.filter((q) => !coveredCompetencies.has(q.competency));
  const interview_questions = [...aiQuestions, ...missingGaps].slice(0, 8);

  return {
    profile_summary: ai.profile_summary || '',
    summary: ai.summary || 'Relatório gerado a partir das notas individuais de cada situação.',
    soft_skills_narrative: ai.soft_skills_narrative || '',
    soft_skills_detail,
    skill_scores,
    score_confidence,
    skill_graph: skill_scores,
    demonstrated_levels,
    behavioral_observations,
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
    company_analysis: ai.company_analysis || null,
    evidence_categories: ai.evidence_categories || null,
    interview_questions,
    overall_score,
    overall_confidence: ai.overall_confidence || 'medium',
    assessment_confidence: ai.assessment_confidence || { level: 'low', reasoning: 'Relatório gerado sem a análise completa da IA.', evidence_count: responses.length },
    recommendation: getRecommendation(overall_score).label,
  };
}