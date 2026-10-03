// TalentIA — Biblioteca estruturada de Soft Skills
// Competências comportamentais avaliadas através de situações profissionais reais.
// A IA usa esta biblioteca para (1) gerar situações que miram sub-dimensões específicas
// e (2) analisar respostas extraindo EVIDÊNCIAS observáveis — nunca adjetivos vazios.
//
// Princípio: o score nasce da evidência. Sem evidência → "não foi possível avaliar".

export const SOFT_SKILLS = [
  {
    key: 'comunicacao',
    label: 'Comunicação',
    description: 'Como o candidato se expressa, ouve, adapta a mensagem e lida com conflitos de comunicação.',
    dimensions: [
      { key: 'clareza', label: 'Clareza e objetividade', look_for: 'Mensagens diretas, sem rodeios, fáceis de entender.' },
      { key: 'escuta', label: 'Escuta ativa', look_for: 'Considera o que o outro disse antes de responder; faz perguntas; parafraseia.' },
      { key: 'adaptacao', label: 'Adaptação ao interlocutor', look_for: 'Muda tom ou nível de detalhe conforme o público (cliente, técnico, gestor).' },
      { key: 'argumentacao', label: 'Argumentação', look_for: 'Defende ponto com lógica e dados, não só opinião.' },
      { key: 'sob_pressao', label: 'Comunicação sob pressão', look_for: 'Mantém tom profissional em conflito ou prazo apertado.' },
      { key: 'conflito_com', label: 'Lida com conflitos de comunicação', look_for: 'Despersonaliza, busca entender o outro, propõe resolução.' },
      { key: 'transmite_dificeis', label: 'Transmite informações difíceis', look_for: 'Comunica más notícias ou feedback negativo com clareza e empatia.' },
    ],
  },
  {
    key: 'trabalho_equipe',
    label: 'Trabalho em equipe',
    description: 'Como o candidato colabora, compartilha, negocia e lida com conflitos no coletivo.',
    dimensions: [
      { key: 'colaboracao', label: 'Colaboração', look_for: 'Busca trabalhar junto, não isolado; integra esforços.' },
      { key: 'compartilha', label: 'Compartilhamento de informações', look_for: 'Mantém outros informados; não retece conhecimento.' },
      { key: 'respeito_opinioes', label: 'Respeito a opiniões diferentes', look_for: 'Considera ideias contrárias sem descartar.' },
      { key: 'negociacao_equipe', label: 'Negociação', look_for: 'Busca acordos em que ambos ganham; cede quando faz sentido.' },
      { key: 'responsabilidade_coletiva', label: 'Responsabilidade coletiva', look_for: 'Assume o resultado do time, não só o próprio.' },
      { key: 'pede_ajuda', label: 'Capacidade de pedir ajuda', look_for: 'Reconhece limitação e busca suporte quando preciso.' },
      { key: 'oferece_ajuda', label: 'Capacidade de oferecer ajuda', look_for: 'Ajuda colegas sem ser solicitado.' },
      { key: 'conflito_equipe', label: 'Comportamento diante de conflitos', look_for: 'Media disputas; foca no problema, não na pessoa.' },
    ],
  },
  {
    key: 'lideranca',
    label: 'Liderança',
    description: 'Como o candidato decide, orienta, delega e assume responsabilidade — baseado em comportamento, não em cargo.',
    dimensions: [
      { key: 'tomada_decisao', label: 'Tomada de decisão', look_for: 'Decide com critério e assume a decisão.' },
      { key: 'orienta_pessoas', label: 'Orientação de outras pessoas', look_for: 'Dá direção clara; alinha expectativas.' },
      { key: 'delegacao', label: 'Delegação', look_for: 'Distribui tarefas conforme capacidade; não centraliza.' },
      { key: 'responsabilidade_lid', label: 'Responsabilidade', look_for: 'Assume erro; não culpa outros.' },
      { key: 'influencia', label: 'Influência', look_for: 'Convince sem imposição; gera adesão.' },
      { key: 'gestao_conflitos', label: 'Gestão de conflitos', look_for: 'Aborda conflito diretamente; busca resolução.' },
      { key: 'desenvolve_pessoas', label: 'Desenvolve outras pessoas', look_for: 'Ajuda colegas a crescer; dá feedback construtivo.' },
    ],
  },
  {
    key: 'resolucao_problemas',
    label: 'Resolução de problemas',
    description: 'Como o candidato identifica, analisa, prioriza e resolve problemas.',
    dimensions: [
      { key: 'identificacao', label: 'Identificação do problema', look_for: 'Vê o problema real, não o sintoma.' },
      { key: 'analise_causas', label: 'Análise de causas', look_for: 'Investiga root cause; não assume.' },
      { key: 'alternativas', label: 'Geração de alternativas', look_for: 'Considera mais de um caminho antes de decidir.' },
      { key: 'priorizacao', label: 'Priorização', look_for: 'Distingue urgente de importante.' },
      { key: 'avalia_consequencias', label: 'Avaliação de consequências', look_for: 'Pensa no impacto da decisão antes de agir.' },
      { key: 'execucao', label: 'Execução e acompanhamento', look_for: 'Implementa e verifica o resultado.' },
    ],
  },
  {
    key: 'pensamento_critico',
    label: 'Pensamento crítico',
    description: 'Como o candidato questiona premissas, analisa informações e muda de posição diante de novas evidências.',
    dimensions: [
      { key: 'questionamento', label: 'Questionamento de premissas', look_for: 'Não aceita premissas sem validar.' },
      { key: 'analise_dados', label: 'Análise de informações', look_for: 'Usa dados e fatos, não só intuição.' },
      { key: 'riscos', label: 'Identificação de riscos', look_for: 'Antecipa o que pode dar errado.' },
      { key: 'fato_opiniao', label: 'Distingue fato de opinião', look_for: 'Separa dado concreto de impressão.' },
      { key: 'muda_posicao', label: 'Muda de posição', look_for: 'Reconsidera diante de novas informações.' },
    ],
  },
  {
    key: 'adaptabilidade',
    label: 'Adaptabilidade',
    description: 'Como o candidato reage a mudanças, aprende e ajusta estratégia diante do novo.',
    dimensions: [
      { key: 'mudanca', label: 'Reação a mudanças', look_for: 'Ajusta plano sem resistência excessiva.' },
      { key: 'aprendizado', label: 'Aprendizado', look_for: 'Busca aprender com feedback e erros.' },
      { key: 'flexibilidade', label: 'Flexibilidade', look_for: 'Muda de estratégia quando faz sentido.' },
      { key: 'inesperado', label: 'Diante de situações inesperadas', look_for: 'Mantém calma e reorganiza rapidamente.' },
      { key: 'info_nova', label: 'Diante de informações novas', look_for: 'Integra nova informação sem ignorá-la.' },
    ],
  },
  {
    key: 'organizacao',
    label: 'Organização e priorização',
    description: 'Como o candidato organiza demandas, define prioridades e gerencia tempo.',
    dimensions: [
      { key: 'organizacao', label: 'Organização', look_for: 'Estrutura trabalho de forma clara.' },
      { key: 'prioridades', label: 'Definição de prioridades', look_for: 'Distingue o que importa do que é urgente.' },
      { key: 'gestao_tempo', label: 'Gestão de tempo', look_for: 'Estima e cumpre prazos realistas.' },
      { key: 'multiplas_demandas', label: 'Múltiplas demandas', look_for: 'Lida com várias frentes sem se perder.' },
      { key: 'planejamento', label: 'Planejamento e acompanhamento', look_for: 'Faz plano e verifica a execução.' },
    ],
  },
  {
    key: 'inteligencia_emocional',
    label: 'Inteligência emocional (contexto profissional)',
    description: 'Comportamentos observáveis: reação a críticas, conflitos, pressão. NUNCA diagnosticar saúde mental ou transtornos.',
    dimensions: [
      { key: 'reacao_criticas', label: 'Reação a críticas', look_for: 'Recebe feedback sem defensividade excessiva.' },
      { key: 'reacao_conflitos', label: 'Reação a conflitos', look_for: 'Mantém postura profissional diante de atrito.' },
      { key: 'controle_comunicacao', label: 'Controle da comunicação em situações difíceis', look_for: 'Não perde o tom profissional sob estresse.' },
      { key: 'reconhece_erros', label: 'Capacidade de reconhecer erros', look_for: 'Admite erro quando ocorre.' },
      { key: 'lidar_pressao', label: 'Capacidade de lidar com pressão', look_for: 'Mantém desempenho sob prazo/urgência.' },
    ],
  },
  {
    key: 'autonomia',
    label: 'Autonomia',
    description: 'Como o candidato age e decide sem supervisão constante, e reconhece quando pedir ajuda.',
    dimensions: [
      { key: 'age_sem_supervisao', label: 'Age sem supervisão constante', look_for: 'Toma iniciativa sem esperar ordem.' },
      { key: 'busca_informacoes', label: 'Busca informações', look_for: 'Procura dados antes de decidir.' },
      { key: 'iniciativa', label: 'Iniciativa', look_for: 'Antecipa problemas e age.' },
      { key: 'reconhece_pedir_ajuda', label: 'Reconhece quando pedir ajuda', look_for: 'Sabe diferenciar autonomia de isolamento.' },
    ],
  },
  {
    key: 'responsabilidade',
    label: 'Responsabilidade',
    description: 'Como o candidato cumpre compromissos, reconhece erros e assume consequências.',
    dimensions: [
      { key: 'cumprimento', label: 'Cumprimento de compromissos', look_for: 'Honra prazos e acordos.' },
      { key: 'reconhece_erros_resp', label: 'Reconhecimento de erros', look_for: 'Admite erro e corrige.' },
      { key: 'transparencia', label: 'Transparência', look_for: 'Comunica problemas antes que virem crise.' },
      { key: 'acompanhamento', label: 'Acompanhamento de tarefas', look_for: 'Dá retorno sobre o que assumiu.' },
      { key: 'consequencias', label: 'Responsabilidade por consequências', look_for: 'Assume o resultado, não transfere culpa.' },
    ],
  },
  {
    key: 'criatividade',
    label: 'Criatividade',
    description: 'Como o candidato gera alternativas e encontra novas abordagens.',
    dimensions: [
      { key: 'gera_alternativas', label: 'Geração de alternativas', look_for: 'Propõe mais de um caminho.' },
      { key: 'solucoes_diferentes', label: 'Soluções diferentes', look_for: 'Sai do óbvio quando o óbvio não resolve.' },
      { key: 'adapta_recursos', label: 'Adaptação de recursos', look_for: 'Reutiliza o que tem de forma nova.' },
    ],
  },
  {
    key: 'negociacao',
    label: 'Negociação',
    description: 'Como o candidato compreende interesses, argumenta e busca equilíbrio.',
    dimensions: [
      { key: 'interesses', label: 'Compreensão dos interesses', look_for: 'Identifica o que cada lado quer.' },
      { key: 'argumentacao_neg', label: 'Argumentação', look_for: 'Defende posição com lógica.' },
      { key: 'concessoes', label: 'Concessões', look_for: 'Cede no que não é essencial.' },
      { key: 'equilibrio', label: 'Equilíbrio entre interesses', look_for: 'Busca ganha-ganha, não esmagamento.' },
    ],
  },
  {
    key: 'gestao_conflitos',
    label: 'Gestão de conflitos',
    description: 'Como o candidato identifica causas, escuta e evita escalada desnecessária.',
    dimensions: [
      { key: 'identifica_causa', label: 'Identificação da causa', look_for: 'Vai além do sintoma do conflito.' },
      { key: 'escuta_conflito', label: 'Escuta', look_for: 'Ouve as partes antes de julgar.' },
      { key: 'busca_solucao', label: 'Busca de solução', look_for: 'Propõe caminho, não só aponta problema.' },
      { key: 'evita_escala', label: 'Evita escalada desnecessária', look_for: 'Não transforma atrito em guerra.' },
    ],
  },
];

export const SKILL_BY_KEY = Object.fromEntries(SOFT_SKILLS.map((s) => [s.key, s]));
export const SOFT_SKILL_LABELS = SOFT_SKILLS.map((s) => s.label);

// Retorna as soft skills que a vaga provavelmente exige, baseada nas competências declaradas.
export function inferSoftSkills(job) {
  const comps = (job?.competencies || []).map((c) => c.toLowerCase());
  const matched = SOFT_SKILLS.filter((s) =>
    comps.some((c) => c.includes(s.label.toLowerCase().split(' ')[0]) || s.label.toLowerCase().includes(c))
  );
  return matched.length ? matched : SOFT_SKILLS.slice(0, 5);
}

// Formato para incluir no prompt da IA
export function softSkillsForPrompt(skills) {
  return (skills || SOFT_SKILLS.slice(0, 5))
    .map((s) => {
      const dims = s.dimensions.map((d) => `    - ${d.key}: ${d.label} (procurar: ${d.look_for})`).join('\n');
      return `${s.label} (${s.key}):\n${dims}`;
    })
    .join('\n\n');
}