import React from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, FileQuestion, Eye, Building2 } from 'lucide-react';

const CATEGORIES = [
  { key: 'fortes', label: 'Evidências fortes', desc: 'Evidências concretas e consistentes', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'suporte', label: 'Evidências de suporte', desc: 'Sinais positivos, menor profundidade', icon: Eye, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { key: 'validar', label: 'Pontos a validar', desc: 'Dúvidas que precisam de investigação', icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'insuficientes', label: 'Dados insuficientes', desc: 'Sem informação para concluir', icon: FileQuestion, color: 'text-muted-foreground', bg: 'bg-muted/40', border: 'border-border' },
  { key: 'atencao', label: 'Possíveis pontos de atenção', desc: 'Merecem investigação, não deficiência', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

export default function EvidenceCategories({ sim }) {
  const cats = sim.evidence_categories;
  const company = sim.company_analysis;
  if (!cats && !company) return null;

  return (
    <div className="space-y-6 mb-8">
      {company && <CompanyAnalysis company={company} />}

      {cats && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Categorização de evidências</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mb-5">Cada conclusão mostra o que foi identificado, qual evidência sustenta, de onde veio e o nível de confiança.</p>

          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((cat) => {
              const items = cats[cat.key] || [];
              if (!items.length) return null;
              const Icon = cat.icon;
              return (
                <div key={cat.key} className={`rounded-xl ${cat.bg} border ${cat.border} p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className={`text-sm font-semibold ${cat.color}`}>{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">{items.length}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mb-3">{cat.desc}</p>
                  <div className="space-y-2.5">
                    {items.map((item, i) => (
                      <div key={i} className="text-xs leading-relaxed">
                        <div className="text-foreground font-medium">{item.item || item.reason || item.note}</div>
                        {item.evidence && <div className="text-muted-foreground/80 mt-0.5">↳ {item.evidence}{item.source ? ` (fonte: ${item.source})` : ''}{item.confidence ? ` · confiança: ${item.confidence}` : ''}</div>}
                        {item.interview_question && <div className="text-primary mt-1 italic">Pergunta sugerida: {item.interview_question}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyAnalysis({ company }) {
  const sections = [
    { key: 'cultura_declarada', label: 'Cultura declarada', desc: 'O que a empresa afirma valorizar' },
    { key: 'cultura_observada', label: 'Cultura observada/inferida', desc: 'Padrões identificados (inferências marcadas)' },
    { key: 'contexto_operacao', label: 'Contexto da operação', desc: 'Condições reais do trabalho' },
    { key: 'comportamentos_necessarios', label: 'Comportamentos necessários', desc: 'Para a função neste contexto' },
    { key: 'evidencias', label: 'Evidências utilizadas', desc: 'Informações concretas que sustentam a análise' },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-violet" />
        <span className="text-sm font-semibold text-foreground">Análise contextual da empresa</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-5">Cultura declarada vs. observada, contexto da operação e comportamentos necessários para a função.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => {
          const items = company[s.key] || [];
          if (!items.length) return (
            <div key={s.key} className="rounded-xl bg-muted/30 border border-border p-4">
              <div className="text-sm font-medium text-foreground mb-1">{s.label}</div>
              <p className="text-xs text-muted-foreground/60 italic">Dados insuficientes</p>
            </div>
          );
          return (
            <div key={s.key} className="rounded-xl bg-muted/30 border border-border p-4">
              <div className="text-sm font-medium text-foreground mb-1">{s.label}</div>
              <p className="text-[11px] text-muted-foreground/60 mb-2">{s.desc}</p>
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="text-xs text-foreground/80 leading-relaxed flex gap-1.5">
                    <span className="text-primary mt-0.5">·</span>
                    <span>{typeof item === 'string' ? item : (item.item || item.note || JSON.stringify(item))}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}