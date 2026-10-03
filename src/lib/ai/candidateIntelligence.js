// TalentIA — Candidate Intelligence engine
// Computes aggregate metrics across a company's candidates and generates
// an AI report (behavioral analysis, insights, gaps, alerts, open-response themes).
// NEVER invents statistics — every number derives from real records, and sample
// sizes are always reported so the UI can show them.

import { base44 } from '@/api/base44Client';

const FINAL_STAGES = ['convocacao_entrevista', 'entrevista_agendada', 'aprovado'];
const DEMONSTRATED_THRESHOLD = 50; // score >= 50 counts as "demonstrated/partial"
const STRONG_THRESHOLD = 75;

export function applyFilters(sims, filters = {}) {
  let out = [...sims];
  if (filters.jobId && filters.jobId !== 'all') {
    out = out.filter((s) => s.job_id === filters.jobId);
  }
  if (filters.period && filters.period !== 'all') {
    const cutoff = Date.now() - Number(filters.period) * 86400000;
    out = out.filter((s) => new Date(s.created_date || s.started_at).getTime() >= cutoff);
  }
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'evaluated') out = out.filter((s) => s.status === 'completed');
    if (filters.status === 'not_evaluated') out = out.filter((s) => s.status !== 'completed');
    if (filters.status === 'advanced') out = out.filter((s) => FINAL_STAGES.includes(s.hiring_status));
    if (filters.status === 'not_advanced') out = out.filter((s) => !FINAL_STAGES.includes(s.hiring_status));
    if (filters.status === 'final_stages') out = out.filter((s) => FINAL_STAGES.includes(s.hiring_status));
  }
  return out;
}

function competencyFrequency(evaluatedSims, requiredCompetencies) {
  const counts = {};
  const scoreLists = {};
  evaluatedSims.forEach((s) => {
    const scores = s.skill_scores || {};
    Object.entries(scores).forEach(([name, score]) => {
      if (score == null) return;
      counts[name] = (counts[name] || 0) + 1;
      scoreLists[name] = scoreLists[name] || [];
      scoreLists[name].push(score);
    });
  });
  // Include required competencies even if no candidate demonstrated them (gap signal)
  const names = new Set([...Object.keys(counts), ...requiredCompetencies]);
  const rows = [...names].map((name) => {
    const list = scoreLists[name] || [];
    const avg = list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
    const demonstrated = list.filter((v) => v >= DEMONSTRATED_THRESHOLD).length;
    const strong = list.filter((v) => v >= STRONG_THRESHOLD).length;
    return { name, count: list.length, avg, demonstrated, strong, required: requiredCompetencies.includes(name) };
  });
  return rows;
}

export function computeLocalMetrics(jobs, allSims, filters = {}) {
  const sims = applyFilters(allSims, filters);
  const filteredJobs = filters.jobId && filters.jobId !== 'all' ? jobs.filter((j) => j.id === filters.jobId) : jobs;

  const total = sims.length;
  const evaluated = sims.filter((s) => s.status === 'completed');
  const notEvaluated = sims.filter((s) => s.status !== 'completed');
  const withScores = evaluated.filter((s) => s.skill_scores && Object.keys(s.skill_scores).length > 0);
  const insufficientData = evaluated.filter((s) => !s.skill_scores || Object.keys(s.skill_scores).length === 0);
  const finalStages = sims.filter((s) => FINAL_STAGES.includes(s.hiring_status));
  const advanced = sims.filter((s) => s.hiring_status !== 'em_analise' && s.hiring_status !== 'reprovado');
  const notAdvanced = sims.filter((s) => s.hiring_status === 'reprovado');

  const publishedJobs = filteredJobs.filter((j) => j.status !== 'draft');
  const avgPerJob = filteredJobs.length ? (total / filteredJobs.length) : 0;
  const avgPerProcess = publishedJobs.length ? (total / publishedJobs.length) : 0;

  // Required competencies across filtered jobs
  const requiredSet = new Set();
  filteredJobs.forEach((j) => {
    (j.competencies || []).forEach((c) => requiredSet.add(c));
    (j.competency_requirements || []).forEach((c) => c && c.name && requiredSet.add(c.name));
  });
  const requiredCompetencies = [...requiredSet];

  const compRows = competencyFrequency(withScores, requiredCompetencies);
  const mostFound = [...compRows].filter((r) => r.count > 0).sort((a, b) => b.demonstrated - a.demonstrated || (b.avg || 0) - (a.avg || 0)).slice(0, 8);
  // Gaps: required competencies with few/low demonstrations among evaluated candidates
  const leastFound = [...compRows]
    .filter((r) => r.required)
    .sort((a, b) => (a.strong || 0) - (b.strong || 0) || (a.avg || 0) - (b.avg || 0))
    .slice(0, 8);

  // Quality indicators
  const withResume = sims.filter((s) => s.candidate_resume_url).length;
  const withOpenResponses = evaluated.filter((s) => (s.responses || []).some((r) => r.justification || r.open_response || r.comment)).length;
  const needingValidation = evaluated.filter((s) => s.overall_confidence === 'low').length;
  const sufficientAdherence = evaluated.filter((s) => (s.overall_score || 0) >= 55).length;

  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const pctEval = (n) => (evaluated.length ? Math.round((n / evaluated.length) * 100) : 0);

  const quality = {
    withResume, withResumePct: pct(withResume),
    completedPct: pct(evaluated.length),
    withOpenResponses, openResponsesPct: pctEval(withOpenResponses),
    needingValidation, needingValidationPct: pctEval(needingValidation),
    sufficientAdherence, sufficientAdherencePct: pctEval(sufficientAdherence),
    insufficientDataPct: pctEval(insufficientData.length),
  };

  // Per-job summary
  const perJob = filteredJobs.map((j) => {
    const jsims = sims.filter((s) => s.job_id === j.id);
    const jeval = jsims.filter((s) => s.status === 'completed');
    const jscores = jeval.filter((s) => s.skill_scores && Object.keys(s.skill_scores).length);
    const avgScore = jeval.length ? Math.round(jeval.reduce((a, s) => a + (s.overall_score || 0), 0) / jeval.length) : 0;
    // top competency by avg among this job's evaluated candidates
    const jcomp = competencyFrequency(jscores, (j.competencies || []).concat((j.competency_requirements || []).map((c) => c.name)));
    const topComp = [...jcomp].filter((r) => r.count > 0).sort((a, b) => (b.avg || 0) - (a.avg || 0))[0];
    const gapComp = [...jcomp].filter((r) => r.required).sort((a, b) => (a.strong || 0) - (b.strong || 0) || (a.avg || 0) - (b.avg || 0))[0];
    const jAdvanced = jsims.filter((s) => FINAL_STAGES.includes(s.hiring_status)).length;
    return {
      job: j, total: jsims.length, evaluated: jeval.length, avgScore,
      topCompetency: topComp ? `${topComp.name} (${topComp.avg}/100)` : '—',
      gapCompetency: gapComp ? `${gapComp.name}` : '—',
      advanced: jAdvanced,
    };
  });

  // Open responses (anonymized excerpts for AI)
  const openResponses = [];
  evaluated.forEach((s) => {
    (s.responses || []).forEach((r) => {
      const text = r.justification || r.open_response || r.comment;
      if (text && text.trim().length > 15) openResponses.push(text.trim().slice(0, 240));
    });
  });

  // DISC distribution (internal only — used for contextual analysis, never shown as raw %)
  const discCounts = {};
  evaluated.forEach((s) => { if (s.disc_profile) discCounts[s.disc_profile] = (discCounts[s.disc_profile] || 0) + 1; });

  return {
    sample: { total, evaluated: evaluated.length, withScores: withScores.length, insufficientData: insufficientData.length, openResponses: openResponses.length },
    total, evaluated, notEvaluated: notEvaluated.length, withScores: withScores.length,
    insufficientData: insufficientData.length, finalStages: finalStages.length, advanced: advanced.length, notAdvanced: notAdvanced.length,
    avgPerJob, avgPerProcess, jobsCount: filteredJobs.length, publishedJobs: publishedJobs.length,
    competencyRows: compRows, mostFound, leastFound,
    quality, perJob, openResponses: openResponses.slice(0, 60), discCounts,
    hasEnoughData: evaluated.length >= 3,
  };
}

export async function generateIntelligenceReport(metrics, companyProfile) {
  if (!metrics.hasEnoughData) return null;

  const ctx = {
    empresa: companyProfile ? {
      nome: companyProfile.company_name,
      setor: companyProfile.sector,
      ritmo: companyProfile.work_rhythm,
      proposito: companyProfile.purpose,
    } : null,
    amostra: metrics.sample,
    candidaturas_total: metrics.total,
    avaliados: metrics.evaluated.length,
    vagas: metrics.jobsCount,
    media_por_vaga: Number(metrics.avgPerJob.toFixed(1)),
    competencias_mais_encontradas: metrics.mostFound.slice(0, 6).map((c) => ({ nome: c.name, candidatos_demonstraram: c.demonstrated, score_medio: c.avg })),
    competencias_menos_encontradas: metrics.leastFound.slice(0, 6).map((c) => ({ nome: c.name, candidatos_com_evidencia_forte: c.strong || 0, score_medio: c.avg })),
    indicadores_qualidade: metrics.quality,
    distribuicao_disc: metrics.discCounts,
    resumo_por_vaga: metrics.perJob.map((p) => ({ vaga: p.job.title, candidatos: p.total, avaliados: p.evaluated, score_medio: p.avgScore, maior_aderencia: p.topCompetency, principal_lacuna: p.gapCompetency, avancaram: p.advanced })),
    respostas_abertas: metrics.openResponses,
  };

  const prompt = `Você é um analista de talentos sênior e rigoroso. Analise EXCLUSIVAMENTE os dados abaixo de uma base de candidatos de uma empresa. Sua função é descrever PADRÕES, não julgar pessoas.

PRINCÍPIOS OBRIGATÓRIOS:
- Baseie-se SOMENTE nos dados fornecidos. NUNCA invente estatísticas ou números que não estejam no contexto.
- Sempre informe o tamanho da amostra utilizada em cada conclusão.
- A análise comportamental deve ser CONTEXTUAL às vagas, nunca afirme que um perfil é universalmente melhor.
- Não apresente a distribuição DISC como "60% são D". Descreva comportamentos no contexto das vagas.
- Lacunas = menor disponibilidade de evidências, NUNCA "candidatos são ruins".
- Toda conclusão deve ter evidência quantitativa ou qualitativa.
- Não considere ausência de currículo ou comentário como característica negativa da pessoa.

DADOS:
${JSON.stringify(ctx, null, 0)}

Gere um relatório em português com a seguinte estrutura JSON.`;

  const schema = {
    type: 'object',
    properties: {
      resumo_executivo: {
        type: 'object',
        properties: {
          principal_forca: { type: 'string', description: 'competência/comportamento mais frequente com evidência' },
          principal_gap: { type: 'string', description: 'maior lacuna encontrada' },
          principal_insight: { type: 'string', description: 'descoberta mais relevante' },
        },
      },
      analise_comportamental: { type: 'string', description: 'análise contextual dos comportamentos observados, relacionando às vagas' },
      perfil_geral: { type: 'string', description: 'padrões agregados: competências, experiências, pontos fortes e lacunas' },
      competencias_mais_encontradas: { type: 'array', items: { type: 'object', properties: { nome: { type: 'string' }, evidencia: { type: 'string' } } } },
      competencias_menos_encontradas: { type: 'array', items: { type: 'object', properties: { nome: { type: 'string' }, evidencia: { type: 'string' } } } },
      principais_lacunas: { type: 'array', items: { type: 'object', properties: { lacuna: { type: 'string' }, evidencia: { type: 'string' } } } },
      respostas_abertas: { type: 'object', properties: { temas_recorrentes: { type: 'array', items: { type: 'string' } }, padroes_decisao: { type: 'array', items: { type: 'string' } }, amostra_utilizada: { type: 'string' } } },
      insights: { type: 'array', items: { type: 'object', properties: { insight: { type: 'string' }, evidencia: { type: 'string' } } }, description: '3 a 7 insights' },
      pontos_atencao: { type: 'array', items: { type: 'object', properties: { ponto: { type: 'string' }, possivel_explicacao: { type: 'string', description: 'apenas se houver dados; caso contrário vazio' } } } },
      comparacao_entre_vagas: { type: 'array', items: { type: 'object', properties: { vaga: { type: 'string' }, observacao: { type: 'string' } } } },
      sugestoes_vaga: { type: 'array', items: { type: 'string' }, description: 'sugestões para a empresa avaliar requisitos/descrição da vaga, sem alterar automaticamente' },
    },
  };

  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      model: 'claude-sonnet-5',
    });
    return res;
  } catch (e) {
    return null;
  }
}