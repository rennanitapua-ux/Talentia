// SkillOS — Skill Scoring Engine
// Defines the Skill Score system: 0-100 per competency, evidence markers, labels, recommendations

export function getEvidenceMarker(score) {
  if (score >= 75) return { symbol: "✓", label: "Demonstrada", color: "emerald" };
  if (score >= 50) return { symbol: "~", label: "Parcial", color: "amber" };
  return { symbol: "✗", label: "Não demonstrada", color: "rose" };
}

export function getScoreLabel(score) {
  if (score >= 90) return { label: "Excepcional", tier: "S" };
  if (score >= 75) return { label: "Forte", tier: "A" };
  if (score >= 60) return { label: "Sólido", tier: "B" };
  if (score >= 45) return { label: "Moderado", tier: "C" };
  if (score >= 30) return { label: "Fraco", tier: "D" };
  return { label: "Crítico", tier: "E" };
}

export function getRecommendation(score) {
  if (score >= 85) return { label: "Contratação Forte", color: "emerald", icon: "TrendingUp" };
  if (score >= 70) return { label: "Contratar", color: "green", icon: "Check" };
  if (score >= 55) return { label: "Talvez", color: "amber", icon: "Minus" };
  if (score >= 40) return { label: "Não Recomendado", color: "orange", icon: "AlertTriangle" };
  return { label: "Não Contratar", color: "rose", icon: "X" };
}

export function calculateOverallScore(skillScores) {
  const values = Object.values(skillScores || {});
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function getScoreColor(score) {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#f43f5e";
}

export function getTierColor(tier) {
  const colors = {
    S: "#10b981", A: "#22c55e", B: "#84cc16", C: "#f59e0b", D: "#f97316", E: "#f43f5e"
  };
  return colors[tier] || "#64748b";
}