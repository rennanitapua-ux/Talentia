import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Bot, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillGraph from '@/components/SkillGraph';
import SkillScoreBadge from '@/components/SkillScoreBadge';
import { getRecommendation } from '@/lib/skillScoring';

export default function CandidateResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Simulation.get(id).then(s => {
      setSim(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!sim) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Resultado não encontrado</div>;

  const competencies = Object.keys(sim.skill_scores || {});
  const rec = getRecommendation(sim.overall_score || 0);
  const aiFlags = sim.ai_flags || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/candidate')} className="p-2 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Seu Resultado</div>
            <div className="text-[10px] text-slate-500 font-mono">{sim.job_title} · {sim.company_name}</div>
          </div>
          <button onClick={() => navigate('/candidate/passport')} className="text-xs text-violet-400 hover:text-violet-300">
            Ver Skill Passport →
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero result */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300 text-xs font-mono tracking-wider uppercase">Avaliação Completa</span>
          </div>
          <div className="flex justify-center mb-4">
            <SkillScoreBadge score={sim.overall_score || 0} size="xl" />
          </div>
          <div className="inline-block px-4 py-1.5 rounded-lg" style={{ background: rec.color === 'emerald' ? '#10b98115' : rec.color === 'amber' ? '#f59e0b15' : '#f43f5e15' }}>
            <span className="text-sm font-bold" style={{ color: rec.color === 'emerald' ? '#10b981' : rec.color === 'amber' ? '#f59e0b' : '#f43f5e' }}>
              {sim.recommendation || rec.label}
            </span>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Resumo da Avaliação</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{sim.summary || 'Avaliação em processamento.'}</p>
        </motion.div>

        {/* AI detection notice */}
        {aiFlags.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-300">Atenção: Padrões de IA Detectados</span>
            </div>
            <p className="text-xs text-slate-400">
              Detectamos {aiFlags.length} resposta(s) com possível uso de IA externa. Isso foi registrado e comunicado à empresa. Respostas autênticas demonstram seu potencial real.
            </p>
          </motion.div>
        )}

        {aiFlags.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Respostas Autênticas</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Nenhuma evidência de uso de IA externa foi detectada em suas respostas.</p>
          </motion.div>
        )}

        {/* Skill Graph + DNA */}
        {competencies.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Seu Skill Graph</span>
              </div>
              <SkillGraph scores={sim.skill_scores} competencies={competencies} />
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold">Seu Skill DNA</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase mb-2">Fortalezas</div>
                  {(sim.skill_dna?.strengths || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-sm font-mono text-emerald-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400">{s.evidence}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-400 uppercase mb-2">Áreas para Desenvolver</div>
                  {(sim.skill_dna?.growth_areas || []).map((s, i) => (
                    <div key={i} className="mb-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <span className="text-sm font-mono text-amber-400">{s.score}</span>
                      </div>
                      <div className="text-xs text-slate-400">{s.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/candidate/passport')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400">
            <Award className="w-4 h-4" />
            Ver no Skill Passport
          </button>
          <button onClick={() => navigate('/candidate')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700">
            <TrendingUp className="w-4 h-4" />
            Explorar Mais Vagas
          </button>
        </div>
      </div>
    </div>
  );
}