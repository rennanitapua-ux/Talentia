import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, CheckCircle2, AlertTriangle, Target,
  Wrench, Heart, Link2, FileSearch, MessageCircleQuestion, Scale, XCircle
} from 'lucide-react';

export default function AnalysisReport({ sim }) {
  const hardSkills = sim.hard_skills || [];
  const softSkills = sim.soft_skills || [];
  const jobCompat = sim.job_compatibility || {};
  const consistency = sim.consistency_analysis || '';
  const interviewQuestions = sim.interview_questions || [];
  const profileSummary = sim.profile_summary || '';

  if (!profileSummary && !hardSkills.length && !softSkills.length && !interviewQuestions.length) return null;

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      {profileSummary && (
        <Card icon={Brain} title="Resumo do Perfil" accent="cyan">
          <p className="text-sm text-slate-300 leading-relaxed">{profileSummary}</p>
        </Card>
      )}

      {/* Skills Identified */}
      {(hardSkills.length > 0 || softSkills.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {hardSkills.length > 0 && (
            <Card icon={Wrench} title="Hard Skills" accent="cyan">
              <div className="space-y-3">
                {hardSkills.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[hsl(190,85%,45%,0.04)] border border-[hsl(190,85%,45%,0.15)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(190,85%,50%)]" />
                      <span className="text-sm font-medium text-white">{s.name}</span>
                    </div>
                    {s.evidence && (
                      <p className="text-xs text-slate-400 leading-relaxed pl-3.5">{s.evidence}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
          {softSkills.length > 0 && (
            <Card icon={Heart} title="Soft Skills" accent="violet">
              <div className="space-y-3">
                {softSkills.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[hsl(280,65%,60%,0.04)] border border-[hsl(280,65%,60%,0.15)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(280,65%,60%)]" />
                      <span className="text-sm font-medium text-white">{s.name}</span>
                    </div>
                    {s.evidence && (
                      <p className="text-xs text-slate-400 leading-relaxed pl-3.5">{s.evidence}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Job Compatibility */}
      {(jobCompat.demonstrated?.length > 0 || jobCompat.partial?.length > 0 || jobCompat.not_evidenced?.length > 0 || jobCompat.needs_investigation?.length > 0) && (
        <Card icon={Target} title="Compatibilidade com a Vaga" accent="cyan">
          <div className="grid md:grid-cols-2 gap-4">
            {jobCompat.demonstrated?.length > 0 && (
              <CompatSection title="Demonstradas" icon={CheckCircle2} color="emerald" items={jobCompat.demonstrated.map(c => ({ label: c.competency, note: c.evidence }))} />
            )}
            {jobCompat.partial?.length > 0 && (
              <CompatSection title="Parcialmente" icon={AlertTriangle} color="amber" items={jobCompat.partial.map(c => ({ label: c.competency, note: c.evidence }))} />
            )}
            {jobCompat.not_evidenced?.length > 0 && (
              <CompatSection title="Não Evidenciadas" icon={XCircle} color="rose" items={jobCompat.not_evidenced.map(c => ({ label: c.competency, note: c.note }))} />
            )}
            {jobCompat.needs_investigation?.length > 0 && (
              <CompatSection title="A Investigar" icon={FileSearch} color="blue" items={jobCompat.needs_investigation.map(c => ({ label: c.competency, note: c.reason }))} />
            )}
          </div>
        </Card>
      )}

      {/* Consistency Analysis */}
      {consistency && (
        <Card icon={Scale} title="Análise de Consistência" accent="violet">
          <p className="text-sm text-slate-300 leading-relaxed">{consistency}</p>
        </Card>
      )}

      {/* Interview Questions */}
      {interviewQuestions.length > 0 && (
        <Card icon={MessageCircleQuestion} title="Perguntas Recomendadas para Entrevista" accent="cyan">
          <div className="space-y-3">
            {interviewQuestions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl bg-[hsl(240,10%,8%)] border border-[hsl(240,8%,14%)] hover:border-[hsl(240,8%,18%)] transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[hsl(190,85%,45%,0.1)] border border-[hsl(190,85%,45%,0.25)] flex items-center justify-center text-xs font-mono font-bold text-[hsl(190,85%,55%)]">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium leading-relaxed mb-2">{q.question}</p>
                    {q.rationale && (
                      <p className="text-xs text-slate-400 leading-relaxed mb-1.5">
                        <span className="text-slate-500 font-medium">Por que perguntar: </span>
                        {q.rationale}
                      </p>
                    )}
                    {q.competency && (
                      <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-[hsl(240,8%,12%)] text-[10px] font-mono text-slate-400">
                        <Link2 className="w-3 h-3" />
                        {q.competency}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, accent, children }) {
  const accentColor = accent === 'cyan' ? 'text-[hsl(190,85%,55%)]' : 'text-[hsl(280,65%,65%)]';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(240,12%,6%)] border border-[hsl(240,8%,14%)] rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CompatSection({ title, icon: Icon, color, items }) {
  const colors = {
    emerald: { bg: 'bg-[hsl(160,60%,45%,0.06)]', border: 'border-[hsl(160,60%,45%,0.2)]', text: 'text-[hsl(160,60%,55%)]', dot: 'bg-[hsl(160,60%,50%)]' },
    amber: { bg: 'bg-[hsl(30,80%,55%,0.06)]', border: 'border-[hsl(30,80%,55%,0.2)]', text: 'text-[hsl(30,80%,60%)]', dot: 'bg-[hsl(30,80%,50%)]' },
    rose: { bg: 'bg-[hsl(0,72%,51%,0.06)]', border: 'border-[hsl(0,72%,51%,0.2)]', text: 'text-[hsl(0,72%,60%)]', dot: 'bg-[hsl(0,72%,50%)]' },
    blue: { bg: 'bg-[hsl(220,70%,50%,0.06)]', border: 'border-[hsl(220,70%,50%,0.2)]', text: 'text-[hsl(220,70%,60%)]', dot: 'bg-[hsl(220,70%,50%)]' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`p-4 rounded-xl ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-3.5 h-3.5 ${c.text}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>{title}</span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              <span className="text-sm font-medium text-slate-200">{item.label}</span>
            </div>
            {item.note && <p className="text-xs text-slate-500 leading-relaxed pl-3.5">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}