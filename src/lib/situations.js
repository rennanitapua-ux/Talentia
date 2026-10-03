// Shared definitions for simulation situations (v2) + legacy phase conversion.

export const QUALITY_SCORE = { best: 100, good: 70, weak: 35, bad: 0 };

export const QUALITY_META = {
  best: { label: 'Melhor decisão', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
  good: { label: 'Aceitável', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/25' },
  weak: { label: 'Fraca', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
  bad: { label: 'Ruim', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
};

export const LEVELS = { entry: 'Júnior', mid: 'Pleno', senior: 'Sênior', lead: 'Liderança' };

const LEGACY_LEVEL = { high: 'best', medium_high: 'good', medium_low: 'weak', low: 'bad' };

// Returns the list of situations for a job, converting the old phase format when needed.
export function getSituations(job) {
  if (job?.assessment?.situations?.length) return job.assessment.situations;
  const out = [];
  (job?.simulation_scenarios || []).forEach((phase) => {
    (phase.questions || []).forEach((q) => {
      const options = (q.multiple_choice || []).map((o) => {
        const quality = LEGACY_LEVEL[o.level] || 'good';
        return { id: o.id, text: o.text, quality, score: QUALITY_SCORE[quality], behavior: '' };
      });
      out.push({
        id: q.id || `legacy_${out.length}`,
        title: phase.title || `Situação ${out.length + 1}`,
        character: q.character?.name ? q.character : null,
        context: q.context || '',
        question: q.prompt || 'Como você agiria nesta situação?',
        options,
        justification_prompt: q.write_guidance || 'Explique como você agiria e por quê.',
        competencies: q.expected_competencies || job?.competencies || [],
      });
    });
  });
  return out;
}

export const estimateMinutes = (count) => Math.max(5, Math.round(count * 1.5)) + 4;