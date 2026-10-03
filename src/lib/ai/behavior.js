// Behavioral axes shown to the company: 0 = left trait, 100 = right trait.
export const BEHAVIOR_AXES = [
  { key: 'impulsividade', left: 'Impulsivo', right: 'Ponderado' },
  { key: 'pressao', left: 'Ansioso sob pressão', right: 'Calmo sob pressão' },
  { key: 'iniciativa', left: 'Reativo', right: 'Proativo' },
  { key: 'colaboracao', left: 'Individualista', right: 'Colaborativo' },
  { key: 'decisao', left: 'Intuitivo', right: 'Analítico' },
  { key: 'comunicacao', left: 'Evasivo', right: 'Assertivo' },
];

const BEHAVIOR_TO_AXIS = {
  impulsivo: ['impulsividade', 0], ponderado: ['impulsividade', 100],
  ansioso: ['pressao', 0], calmo: ['pressao', 100],
  passivo: ['iniciativa', 0], reativo: ['iniciativa', 0], proativo: ['iniciativa', 100],
  individualista: ['colaboracao', 0], autoritário: ['colaboracao', 15], colaborativo: ['colaboracao', 100],
  intuitivo: ['decisao', 0], analítico: ['decisao', 100],
  evasivo: ['comunicacao', 0], assertivo: ['comunicacao', 100],
};

// Deterministic behavioral profile from the behaviors behind the chosen options.
export function localBehaviorProfile(responses) {
  const buckets = {};
  responses.forEach((r) => {
    const tag = String(r.choice_behavior || '').toLowerCase().trim();
    const hit = BEHAVIOR_TO_AXIS[tag];
    if (!hit) return;
    (buckets[hit[0]] = buckets[hit[0]] || []).push({ value: hit[1], where: r.phase_title });
  });
  const axes = {};
  BEHAVIOR_AXES.forEach((a) => {
    const list = buckets[a.key] || [];
    axes[a.key] = list.length
      ? {
          position: Math.round(list.reduce((s, x) => s + x.value, 0) / list.length),
          evidence: `Baseado em ${list.length} escolha(s): ${list.slice(0, 3).map((x) => x.where).join(', ')}.`,
        }
      : { position: 50, evidence: 'Sem evidência suficiente nas escolhas.' };
  });
  return { summary: 'Perfil calculado a partir dos comportamentos associados às alternativas escolhidas.', axes, dominant_traits: [], risks: [] };
}