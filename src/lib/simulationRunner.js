import { base44 } from '@/api/base44Client';
import { analyzeSituationResponse } from '@/lib/ai/analyzeResponse';
import { generateFinalAssessment } from '@/lib/ai/finalAssessment';

export const emptyIntegrity = () => ({ tab_switches: 0, focus_losses: 0, fullscreen_exits: 0, paste_attempts: 0, ai_suspicions: 0 });

export const totalViolations = (i = {}) =>
  (i.tab_switches || 0) + (i.focus_losses || 0) + (i.fullscreen_exits || 0) + (i.paste_attempts || 0);

export function buildResponse({ situation, index, option, justification, typing, seconds }) {
  return {
    situation_id: situation.id,
    situation_index: index,
    phase_title: situation.title,
    question_prompt: [situation.context, situation.question].filter(Boolean).join('\n\n'),
    question_short: situation.question,
    character_name: situation.character?.name || null,
    character_role: situation.character?.role || null,
    competencies: situation.competencies || [],
    is_choice: !!option,
    choice_id: option?.id || null,
    choice_text: option?.text || null,
    choice_quality: option?.quality || null,
    choice_score: option?.score ?? null,
    choice_behavior: option?.behavior || null,
    justification,
    answer: option ? option.text : justification,
    time_spent_seconds: seconds,
    typing,
    analysis: null,
  };
}

export function analyzeResponse(job, situations, response) {
  const situation = situations.find((s) => s.id === response.situation_id) || situations[response.situation_index] || {
    title: response.phase_title, context: '', question: response.question_prompt, options: [], competencies: [],
  };
  const option = (situation.options || []).find((o) => o.id === response.choice_id) || null;
  return analyzeSituationResponse({
    job, situation, option,
    justification: response.justification || response.answer,
    typing: response.typing,
    seconds: response.time_spent_seconds,
  });
}

export async function finalizeSimulation({ sim, job, situations, responses, integrity, onStep }) {
  onStep?.(0);
  const analyzed = [...responses];
  await Promise.all(analyzed.map(async (r, i) => {
    if (!r.analysis) analyzed[i] = { ...r, analysis: await analyzeResponse(job, situations, r) };
  }));

  onStep?.(1);
  const ai_flags = analyzed
    .map((r, i) => (r.analysis?.ai_detection?.is_ai_generated
      ? { situation_index: i, situation_title: r.phase_title, confidence: r.analysis.ai_detection.confidence, analysis: r.analysis.ai_detection.analysis }
      : null))
    .filter(Boolean);
  const finalIntegrity = { ...integrity, ai_suspicions: ai_flags.length };

  onStep?.(2);
  const assessment = await generateFinalAssessment({
    candidateName: sim.candidate_name, job, responses: analyzed,
    disc: sim.disc_results, discAnswers: sim.disc_answers, integrity: finalIntegrity,
  });

  onStep?.(3);
  await base44.entities.Simulation.update(sim.id, {
    ...assessment,
    responses: analyzed,
    ai_flags,
    integrity: finalIntegrity,
    focus_violations: totalViolations(finalIntegrity),
    status: 'completed',
    completed_at: new Date().toISOString(),
    total_time_seconds: analyzed.reduce((s, r) => s + (r.time_spent_seconds || 0), 0),
  });
  onStep?.(4);
}