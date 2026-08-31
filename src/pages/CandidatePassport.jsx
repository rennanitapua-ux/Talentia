import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, Building2, TrendingUp, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import SkillGraph from '@/components/SkillGraph';
import { getRecommendation } from '@/lib/skillScoring';

export default function CandidatePassport() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Simulation.filter(
        { candidate_name: u?.full_name || u?.email || '', status: 'completed' },
        '-completed_at', 50
      ).then(s => {
        setSimulations(s || []);
        if (s && s.length > 0) setSelected(s[0]);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  // Aggregate all skill scores across simulations
  const allScores = {};
  simulations.forEach(sim => {
    Object.entries(sim.skill_scores || {}).forEach(([comp, score]) => {
      if (!allScores[comp]) allScores[comp] = [];
      allScores[comp].push(score);
    });
  });
  const aggregatedScores = {};
  Object.entries(allScores).forEach(([comp, scores]) => {
    aggregatedScores[comp] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });
  const allCompetencies = Object.keys(aggregatedScores);
  const avgScore = simulations.length ? Math.round(simulations.reduce((a, s) => a + (s.overall_score || 0), 0) / simulations.length) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/candidate')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Skill Passport</div>
            <div className="text-[10px] text-slate-500 font-mono">Seu portfólio permanente de competências</div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : simulations.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-16 text-center">
            <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Seu Passport está vazio</h2>
            <p className="text-slate-400 text-sm mb-6">Complete simulações para construir seu portfólio de competências permanente.</p>
            <button onClick={() => navigate('/candidate')} className="px-6 py-2.5 rounded-lg bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400">
              Explorar Vagas
            </button>
          </div>
        ) : (
          <>
            {/* Passport header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-violet-900/30 to-slate-900/60 border border-violet-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-300">
                    {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{user?.full_name || user?.email || 'Candidato'}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Membro desde {new Date(user?.created_date || Date.now()).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <SkillScoreBadge score={avgScore} size="lg" />
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Score Médio</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-violet-400">{simulations.length}</div>
                  <div className="text-xs text-slate-500">Simulações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-cyan-400">{allCompetencies.length}</div>
                  <div className="text-xs text-slate-500">Competências</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {simulations.filter(s => (s.ai_flags || []).length === 0).length}
                  </div>
                  <div className="text-xs text-slate-500">Autênticas</div>
                </div>
              </div>
            </motion.div>

            {/* Aggregated Skill Graph */}
            {allCompetencies.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold">Skill Graph Consolidado</span>
                  <span className="text-xs text-slate-500">— média de todas as simulações</span>
                </div>
                <SkillGraph scores={aggregatedScores} competencies={allCompetencies} height={360} />
              </div>
            )}

            {/* Simulations history */}
            <h3 className="text-lg font-semibold mb-4">Histórico de Simulações</h3>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                {simulations.map((sim, i) => {
                  const rec = getRecommendation(sim.overall_score || 0);
                  return (
                    <button
                      key={sim.id}
                      onClick={() => setSelected(sim)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selected?.id === sim.id ? 'bg-violet-500/10 border-violet-500/40' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium truncate">{sim.job_title}</div>
                        <SkillScoreBadge score={sim.overall_score || 0} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3 h-3" />
                        {sim.company_name}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">{new Date(sim.completed_at).toLocaleDateString('pt-BR')}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected detail */}
              <div className="lg:col-span-2">
                {selected && (
                  <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{selected.job_title}</h4>
                        <div className="text-xs text-slate-500">{selected.company_name}</div>
                      </div>
                      <div className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#22d3ee15', color: '#22d3ee' }}>
                        {selected.recommendation}
                      </div>
                    </div>

                    {Object.keys(selected.skill_scores || {}).length > 0 && (
                      <div className="mb-4">
                        <SkillGraph scores={selected.skill_scores} competencies={Object.keys(selected.skill_scores)} height={240} />
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-mono text-emerald-400 uppercase">Fortalezas</div>
                      {(selected.skill_dna?.strengths || []).map((s, i) => (
                        <div key={i} className="text-xs p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <span className="font-medium">{s.competency}</span>: <span className="text-slate-400">{s.evidence}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono text-amber-400 uppercase">Áreas de Desenvolvimento</div>
                      {(selected.skill_dna?.growth_areas || []).map((s, i) => (
                        <div key={i} className="text-xs p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <span className="font-medium">{s.competency}</span>: <span className="text-slate-400">{s.evidence}</span>
                        </div>
                      ))}
                    </div>

                    {(selected.ai_flags || []).length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-xs text-rose-300">{selected.ai_flags.length} resposta(s) com padrão de IA detectado</span>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/candidate/results/${selected.id}`)}
                      className="mt-4 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300"
                    >
                      Ver Resultado Completo →
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}