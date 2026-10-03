import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, Lightbulb, MessageSquareText, TrendingUp, TrendingDown, GitCompare, FileQuestion } from 'lucide-react';

function Card({ icon: Icon, title, accent, children }) {
  const c = accent === 'violet' ? 'text-brand-violet' : accent === 'amber' ? 'text-amber-400' : accent === 'emerald' ? 'text-emerald-400' : 'text-primary';
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${c}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function List({ items, render }) {
  if (!items || !items.length) return <p className="text-sm text-muted-foreground/60">Sem dados suficientes.</p>;
  return <ul className="space-y-2.5">{items.map((it, i) => <li key={i} className="text-sm text-foreground/80 leading-relaxed">{render ? render(it, i) : it}</li>)}</ul>;
}

export default function AIAnalysisPanel({ report, loading, sample }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Analisando a base de candidatos com IA…</p>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <Brain className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">São necessários pelo menos 3 candidatos avaliados para gerar a análise de inteligência.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Avaliados até agora: {sample?.evaluated || 0}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card icon={Brain} title="Análise comportamental agregada" accent="cyan">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{report.analise_comportamental || '—'}</p>
        </Card>
        <Card icon={Sparkles} title="Perfil geral dos candidatos" accent="violet">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{report.perfil_geral || '—'}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card icon={TrendingUp} title="Competências mais encontradas" accent="emerald">
          <List items={report.competencias_mais_encontradas} render={(c) => <><span className="font-medium text-foreground">{c.nome}</span> — <span className="text-muted-foreground">{c.evidencia}</span></>} />
        </Card>
        <Card icon={TrendingDown} title="Competências menos encontradas" accent="amber">
          <List items={report.competencias_menos_encontradas} render={(c) => <><span className="font-medium text-foreground">{c.nome}</span> — <span className="text-muted-foreground">{c.evidencia}</span></>} />
        </Card>
      </div>

      <Card icon={TrendingDown} title="Principais lacunas encontradas" accent="amber">
        <List items={report.principais_lacunas} render={(g) => <><span className="text-foreground">{g.lacuna}</span> — <span className="text-muted-foreground">{g.evidencia}</span></>} />
      </Card>

      <Card icon={MessageSquareText} title="Análise das respostas abertas" accent="violet">
        {report.respostas_abertas?.amostra_utilizada && <p className="text-[11px] text-muted-foreground/70 mb-3">{report.respostas_abertas.amostra_utilizada}</p>}
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Temas recorrentes</div>
          <List items={report.respostas_abertas?.temas_recorrentes} />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Padrões de decisão</div>
          <List items={report.respostas_abertas?.padroes_decisao} />
        </div>
      </Card>

      <Card icon={Lightbulb} title="Principais insights" accent="cyan">
        <List items={report.insights} render={(it, i) => <><span className="font-mono text-primary mr-1.5">{i + 1}.</span> <span className="text-foreground">{it.insight}</span> <span className="block text-muted-foreground text-xs mt-0.5">Evidência: {it.evidencia}</span></>} />
      </Card>

      <Card icon={AlertTriangle} title="Pontos de atenção" accent="amber">
        <List items={report.pontos_atencao} render={(p) => <><span className="text-foreground">{p.ponto}</span>{p.possivel_explicacao && <span className="block text-muted-foreground text-xs mt-0.5">Possível explicação: {p.possivel_explicacao}</span>}</>} />
      </Card>

      {report.comparacao_entre_vagas?.length > 0 && (
        <Card icon={GitCompare} title="Comparação entre vagas" accent="violet">
          <List items={report.comparacao_entre_vagas} render={(c) => <><span className="font-medium text-foreground">{c.vaga}:</span> <span className="text-muted-foreground">{c.observacao}</span></>} />
        </Card>
      )}

      {report.sugestoes_vaga?.length > 0 && (
        <Card icon={FileQuestion} title="Sugestões sobre as vagas" accent="emerald">
          <List items={report.sugestoes_vaga} />
          <p className="text-[11px] text-muted-foreground/60 mt-3">A IA apenas recomenda que a empresa avalie — nenhuma vaga é alterada automaticamente.</p>
        </Card>
      )}
    </motion.div>
  );
}