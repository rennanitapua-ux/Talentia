// Assento por vaga: conta quantas vagas já foram preenchidas (candidatos aprovados)
export const filledSeats = (sims = []) =>
  sims.filter((s) => s.hiring_status === 'aprovado' && s.status === 'completed').length;

export const seatStatus = (job, sims = []) => {
  const openings = job.openings || 1;
  const filled = filledSeats(sims);
  const available = Math.max(0, openings - filled);
  const full = filled >= openings;
  const pct = openings > 0 ? Math.min(100, Math.round((filled / openings) * 100)) : 0;
  return { openings, filled, available, full, pct };
};