import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, MessageSquare, Briefcase, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Background from '@/components/Background';
import Logo from '@/components/Logo';

const HIRING_FLOW = [
  { key: 'em_analise', label: 'Em Análise', icon: Clock, color: '#64748b' },
  { key: 'convocacao_entrevista', label: 'Convocado para Entrevista', icon: MessageSquare, color: '#3b82f6' },
  { key: 'entrevista_agendada', label: 'Entrevista Agendada', icon: Briefcase, color: '#8b5cf6' },
  { key: 'aprovado', label: 'Aprovado', icon: CheckCircle2, color: '#10b981' },
];

export default function CandidateResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Simulation.get(id).then(s => {
      if (!cancelled) { setSim(s); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });

    // Atualiza quando a empresa muda o status do processo.
    const unsubscribe = base44.entities.Simulation.subscribe((event) => {
      if (event.id === id && event.type === 'update') {
        base44.entities.Simulation.get(id).then(s => { if (!cancelled) setSim(s); }).catch(() => {});
      }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-5">
        <Background />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">Resultado não encontrado</p>
        </div>
      </div>
    );
  }

  const currentStepIdx = HIRING_FLOW.findIndex(s => s.key === sim.hiring_status);
  const isApproved = sim.hiring_status === 'aprovado';
  const isRejected = sim.hiring_status === 'reprovado';

  return (
    <div className="min-h-screen relative">
      <Background />
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/candidate')} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Simulação Concluída</div>
            <div className="text-xs text-muted-foreground/70">{sim.job_title} · {sim.company_name}</div>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Completion confirmation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Simulação concluída!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Sua simulação foi finalizada com sucesso. A empresa responsável pela vaga irá analisar suas respostas e atualizar o status do seu processo abaixo.
          </p>
        </motion.div>

        {/* Hiring process tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Andamento do Processo</span>
          </div>

          {isRejected ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-rose-500">Processo encerrado</div>
                <div className="text-xs text-muted-foreground">A empresa decidiu não avançar com sua candidatura neste momento.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {HIRING_FLOW.map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isFuture = idx > currentStepIdx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {/* Connector line */}
                    {idx > 0 && (
                      <div className={`absolute left-[27px] -mt-3 w-0.5 h-6 ${isDone ? 'bg-emerald-500/40' : 'bg-border'}`} />
                    )}
                    <div
                      className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0 transition-colors ${
                        isDone ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                        : isCurrent ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-border text-muted-foreground/40'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className={`text-sm font-medium ${isFuture ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-primary mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Etapa atual
                        </div>
                      )}
                      {isFuture && (
                        <div className="text-xs text-muted-foreground/40 mt-0.5">Aguardando</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Info card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-subtle rounded-2xl p-5 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            A avaliação detalhada das suas respostas é gerada pela IA e fica disponível para a empresa recrutadora.
            Você será notificado por e-mail caso seja convocado para a próxima etapa.
            Mantenha seus dados de contato atualizados no seu perfil.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/candidate')}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            Ver minhas simulações
          </button>
          <button
            onClick={() => navigate('/candidate/profile')}
            className="flex-1 h-12 rounded-xl bg-card border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-accent transition-colors"
          >
            Meu perfil
          </button>
        </div>
      </div>
    </div>
  );
}