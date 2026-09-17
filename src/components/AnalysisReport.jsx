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
      {profileSummary && (
        <Card icon={Brain} title="Resumo do Perfil" accent="cyan">
          <p className="text-sm text-foreground/80 leading-relaxed">{profileSummary}</p>
        </Card>
      )}

      {(hardSkills.length > 0 || softSkills.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {hardSkills.length > 0 && (
            <Card icon={Wrench} title="Hard Skills" accent="cyan">
              <div className="space-y-3">
                {hardSkills.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">{s.evidence}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
          {softSkills.length > 0 && (
            <Card icon={Heart} title="Soft Skills" accent="violet">
              <div className="space-y-3">
                {softSkills.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-violet/5 border border-brand-violet/15">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-violet" />
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                    </div>
                    {s.evidence && <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">{s.evidence}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

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

      {consistency && (
        <Card icon={Scale} title="Análise de Consistência" accent="violet">
          <p className="text-sm text-foreground/80 leading-relaxed">{consistency}</p>
        </Card>
      )}

      {interviewQuestions.length > 0 && (
        <Card icon={MessageCircleQuestion} title="Perguntas Recomendadas para Entrevista" accent="cyan">
          <div className="space-y-3">
            {interviewQuestions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted border border-border transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-mono font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium leading-relaxed mb-2">{q.question}</p>
                    {q.rationale && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                        <span className="text-muted-foreground/70 font-medium">Por que perguntar: </span>
                        {q.rationale}
                      </p>
                    )}
                    {q.competency && (
                      <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-accent text-[10px] font-mono text-muted-foreground">
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
  const accentColor = accent === 'cyan' ? 'text-primary' : 'text-brand-violet';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CompatSection({ title, icon: Icon, color, items }) {
  const colors = {
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-500' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
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
              <span className="text-sm font-medium text-foreground/90">{item.label}</span>
            </div>
            {item.note && <p className="text-xs text-muted-foreground/70 leading-relaxed pl-3.5">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}