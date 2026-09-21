import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Sparkles, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { generateSimulationPhases } from '@/lib/skillosAI';
import BootSequence from '@/components/BootSequence';
import SelectableChips from '@/components/SelectableChips';

const SECTORS = [
  'Tecnologia / Software', 'Vendas B2B', 'Vendas B2C', 'Financeiro', 'Marketing Digital', 'Marketing Tradicional',
  'Recursos Humanos', 'Atendimento ao Cliente', 'Logística', 'Saúde', 'Educação', 'Administrativo',
  'Engenharia', 'Jurídico', 'Compras', 'Operações', 'Produto', 'Design', 'Data & Analytics', 'Customer Success',
  'Finanças / Fintech', 'Agronegócio', 'Varejo', 'Imobiliário', 'Consultoria', 'Outra (escrever abaixo)',
];
const DIFFICULTIES = [
  { value: 'entry', label: 'Júnior / Entry' },
  { value: 'mid', label: 'Pleno / Mid' },
  { value: 'senior', label: 'Sênior / Senior' },
  { value: 'lead', label: 'Liderança / Lead' },
];

export default function CompanyJobCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: '', sector: '', area_description: '', role: '', company_context: '', product: '', client: '',
    company_problems: '', competencies: [], situations: [], difficulty: 'mid', company_name: '',
  });
  const [newCompetency, setNewCompetency] = useState('');
  const [newSituation, setNewSituation] = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addCompetency = () => {
    if (newCompetency.trim() && !form.competencies.includes(newCompetency.trim())) {
      update('competencies', [...form.competencies, newCompetency.trim()]);
      setNewCompetency('');
    }
  };
  const addSituation = () => {
    if (newSituation.trim()) {
      update('situations', [...form.situations, newSituation.trim()]);
      setNewSituation('');
    }
  };

  const canProceed = () => {
    if (step === 1) return form.title && form.sector && form.role && form.company_name;
    if (step === 2) return form.company_context && form.product && form.client;
    if (step === 3) return form.competencies.length >= 2;
    if (step === 4) return form.situations.length >= 2;
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateSimulationPhases(form);
      const job = await base44.entities.Job.create({
        ...form,
        status: 'published',
        virtual_company_profile: result.virtual_company_profile,
        simulation_scenarios: result.phases || [],
      });
      navigate(`/company/jobs/${job.id}`);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar simulação. Tente novamente.');
      setGenerating(false);
    }
  };

  if (generating) return <BootSequence onComplete={() => {}} label="Gerando simulação IA" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/company')} className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="text-sm font-semibold">Criar Nova Vaga</div>
            <div className="text-[10px] text-muted-foreground/70 font-mono">Passo {step} de 4</div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-1">Informações da vaga</h2>
              <p className="text-muted-foreground text-sm mb-6">Defina o cargo e o setor da posição.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome da empresa</label>
                  <input value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="Ex: TechNova Solutions"
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Título da vaga *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex: Executivo de Vendas B2B"
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectableChips
                    label="Setor *"
                    options={SECTORS}
                    value={form.sector}
                    onChange={v => update('sector', v)}
                    columns={2}
                    maxH="220px"
                  />
                  <SelectableChips
                    label="Cargo / Nível *"
                    options={DIFFICULTIES}
                    value={form.difficulty}
                    onChange={v => update('difficulty', v)}
                    columns={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome do cargo *</label>
                  <input value={form.role} onChange={e => update('role', e.target.value)} placeholder="Ex: Executivo de Vendas"
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                {form.sector === 'Outra (escrever abaixo)' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descreva a área <span className="text-primary">(a IA vai analisar)</span></label>
                    <textarea value={form.area_description} onChange={e => update('area_description', e.target.value)}
                      rows={2} placeholder="Ex: Setor de energia renovável, foco em vendas de painéis solares para residências..."
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Escreva livremente — a IA usa sua descrição para gerar perguntas específicas da área.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-1">Contexto da empresa</h2>
              <p className="text-muted-foreground text-sm mb-6">Quanto mais rico o contexto, mais realista a simulação gerada pela IA.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Contexto da empresa *</label>
                  <textarea value={form.company_context} onChange={e => update('company_context', e.target.value)}
                    rows={3} placeholder="Ex: Startup SaaS B2B de 80 pessoas, crescendo rápido, cultura data-driven..."
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Produto / Serviço principal *</label>
                    <input value={form.product} onChange={e => update('product', e.target.value)} placeholder="Ex: Plataforma de automação de marketing"
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Cliente típico *</label>
                    <input value={form.client} onChange={e => update('client', e.target.value)} placeholder="Ex: Diretores de marketing de médias empresas"
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Problemas e desafios reais da empresa <span className="text-primary">(a IA gera perguntas a partir disso)</span>
                  </label>
                  <textarea value={form.company_problems} onChange={e => update('company_problems', e.target.value)}
                    rows={3} placeholder="Ex: Alto churn de clientes nos primeiros 90 dias. Equipe de vendas tem dificuldade em fechar contratos anuais. Suporte sobrecarregado com tickets repetitivos..."
                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Descreva os problemas reais — a IA criará cenários específicos para testar como o candidato os resolve.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-1">Competências a avaliar</h2>
              <p className="text-muted-foreground text-sm mb-6">Mínimo 2 competências. A IA criará cenários para avaliar cada uma.</p>
              <div className="flex gap-2 mb-4">
                <input
                  value={newCompetency}
                  onChange={e => setNewCompetency(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCompetency()}
                  placeholder="Ex: Comunicação, Resiliência, Negociação..."
                  className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <button onClick={addCompetency} className="px-4 rounded-lg bg-muted hover:bg-accent text-foreground/80">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.competencies.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-primary">{c}</span>
                    <button onClick={() => update('competencies', form.competencies.filter((_, idx) => idx !== i))}>
                      <X className="w-3.5 h-3.5 text-primary/60 hover:text-primary" />
                    </button>
                  </div>
                ))}
                {form.competencies.length === 0 && (
                  <p className="text-muted-foreground/50 text-sm">Nenhuma competência adicionada ainda.</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-1">Situações reais do dia a dia</h2>
              <p className="text-muted-foreground text-sm mb-6">Descreva situações reais que o candidato vai enfrentar. Mínimo 2.</p>
              <div className="flex gap-2 mb-4">
                <textarea
                  value={newSituation}
                  onChange={e => setNewSituation(e.target.value)}
                  rows={2} placeholder="Ex: Um cliente insatisfeito ameaça cancelar o contrato após um bug crítico..."
                  className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
                />
                <button onClick={addSituation} className="px-4 rounded-lg bg-muted hover:bg-accent text-foreground/80 self-start">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {form.situations.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-card/60 border border-border rounded-lg p-3">
                    <span className="text-xs font-mono text-primary mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-sm text-foreground/80">{s}</span>
                    <button onClick={() => update('situations', form.situations.filter((_, idx) => idx !== i))}>
                      <X className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-rose-400" />
                    </button>
                  </div>
                ))}
                {form.situations.length === 0 && (
                  <p className="text-muted-foreground/50 text-sm">Nenhuma situação adicionada ainda.</p>
                )}
              </div>

              {canProceed() && form.situations.length >= 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Pronto para gerar</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">A IA vai criar o perfil da empresa virtual e transformar cada situação em um cenário de simulação com múltipla escolha e pergunta de aprofundamento.</p>
                  <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary">
                    <Sparkles className="w-4 h-4" />
                    Gerar Simulação com IA
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-end mt-8">
            <button
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}