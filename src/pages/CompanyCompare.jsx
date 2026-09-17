import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GitCompare, Users, Award, Bot, AlertTriangle, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import { getEvidenceMarker, getRecommendation } from '@/lib/skillScoring';

export default function CompanyCompare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Job.get(id),
      base44.entities.Simulation.filter({ job_id: id, status: 'completed' }, '-overall_score', 50),
    ]).then(([j, s]) => {
      setJob(j);
      setSimulations(s || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const toggleSelect = (simId) => {
    setSelected(prev =>
      prev.includes(simId)
        ? prev.filter(s => s !== simId)
        : prev.length < 4 ? [...prev, simId] : prev
    );
  };

  const selectedSims = simulations.filter(s => selected.includes(s.id));
  const allCompetencies = job?.competencies || [];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/company/jobs/${id}`)} className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-primary" />
              Comparar Candidatos
            </div>
            <div className="text-[10px] text-muted-foreground/70 font-mono">{job?.title} · {job?.company_name}</div>
          </div>
          <span className="text-xs text-muted-foreground/70">{selected.length}/4 selecionados</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Candidate selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground/70" />
            <span className="text-sm text-muted-foreground">Selecione até 4 candidatos para comparar</span>
          </div>
          {simulations.length === 0 ? (
            <div className="bg-card/40 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground/70 text-sm">
              Nenhum candidato avaliado ainda para esta vaga.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {simulations.map((sim, i) => {
                const isSelected = selected.includes(sim.id);
                return (
                  <button
                    key={sim.id}
                    onClick={() => toggleSelect(sim.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected ? 'bg-primary/10 border-cyan-500/50' : 'bg-card/60 border-border hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {sim.candidate_name?.charAt(0).toUpperCase()}
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-slate-950" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
                      )}
                    </div>
                    <div className="text-sm font-medium truncate">{sim.candidate_name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground/70">{sim.recommendation || '—'}</span>
                      <span className="text-lg font-bold font-mono text-primary">{sim.overall_score || 0}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comparison view */}
        {selectedSims.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score comparison header */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${selectedSims.length}, 1fr)` }}>
              {selectedSims.map((sim) => {
                const rec = getRecommendation(sim.overall_score || 0);
                return (
                  <div key={sim.id} className="bg-card/60 border border-border rounded-xl p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold mx-auto mb-3">
                      {sim.candidate_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-semibold mb-1">{sim.candidate_name}</div>
                    <div className="flex justify-center mb-3"><SkillScoreBadge score={sim.overall_score || 0} size="md" /></div>
                    <div className="text-xs px-2 py-1 rounded-lg inline-block" style={{ background: rec.color === 'emerald' ? '#10b98115' : rec.color === 'amber' ? '#f59e0b15' : '#f43f5e15', color: rec.color === 'emerald' ? '#10b981' : rec.color === 'amber' ? '#f59e0b' : '#f43f5e' }}>
                      {sim.recommendation || rec.label}
                    </div>
                    {(sim.ai_flags || []).length > 0 && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-rose-400">
                        <Bot className="w-3 h-3" />
                        {sim.ai_flags.length} flag(s) IA
                      </div>
                    )}
                    {sim.focus_violations > 0 && (
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {sim.focus_violations} violação(ões)
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/company/candidates/${sim.id}`)}
                      className="mt-3 text-xs text-primary hover:text-cyan-300"
                    >
                      Ver detalhes →
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Skill scores comparison table */}
            <div className="bg-card/60 border border-border rounded-2xl p-6 mb-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Comparação de Competências</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-mono text-muted-foreground/70 uppercase pb-3 pr-4">Competência</th>
                    {selectedSims.map(sim => (
                      <th key={sim.id} className="text-center text-xs font-medium pb-3 px-2">
                        {sim.candidate_name?.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCompetencies.map((comp) => (
                    <tr key={comp} className="border-b border-border/50">
                      <td className="text-sm text-foreground/80 py-3 pr-4">{comp}</td>
                      {selectedSims.map(sim => {
                        const score = sim.skill_scores?.[comp] ?? 0;
                        const marker = getEvidenceMarker(score);
                        const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
                        return (
                          <td key={sim.id} className="text-center py-3 px-2">
                            <div className={`font-mono font-bold ${color}`}>{score}</div>
                            <div className={`text-xs ${color}`}>{marker.symbol}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Skill graphs side by side */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${selectedSims.length}, 1fr)` }}>
              {selectedSims.map(sim => (
                <div key={sim.id} className="bg-card/60 border border-border rounded-2xl p-5">
                  <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-3 text-center">{sim.candidate_name}</div>
                  <SkillGraph
                    scores={sim.skill_scores}
                    competencies={Object.keys(sim.skill_scores || {})}
                    height={260}
                  />
                </div>
              ))}
            </div>

            {/* Summary comparison */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedSims.length}, 1fr)` }}>
              {selectedSims.map(sim => (
                <div key={sim.id} className="bg-card/60 border border-border rounded-2xl p-5">
                  <div className="text-xs font-mono text-muted-foreground/70 uppercase mb-2">Resumo</div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">{sim.summary || '—'}</p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs font-mono text-emerald-400 uppercase mb-1">Fortalezas</div>
                    {(sim.skill_dna?.strengths || []).slice(0, 2).map((s, i) => (
                      <div key={i} className="text-xs text-muted-foreground mb-1">• {s.competency} ({s.score})</div>
                    ))}
                    <div className="text-xs font-mono text-amber-400 uppercase mb-1 mt-2">Desenvolver</div>
                    {(sim.skill_dna?.growth_areas || []).slice(0, 2).map((s, i) => (
                      <div key={i} className="text-xs text-muted-foreground mb-1">• {s.competency} ({s.score})</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedSims.length === 1 && (
          <div className="text-center py-12 text-muted-foreground/70 text-sm">
            Selecione pelo menos 2 candidatos para comparar
          </div>
        )}
      </div>
    </div>
  );
}