// TalentOS — Biblioteca estruturada de Soft Skills
// Base de competências comportamentais avaliadas através de situações profissionais.
// A IA usa esta biblioteca para gerar situações que revelam evidências específicas
// e para analisar respostas em termos de sub-dimensões observáveis.

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
      { key: 'negociacao', label: 'Negociação', look_for: 'Busca acordos em que ambos ganham; cede quando faz sentido.' },
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
      { key: 'responsabilidade', label: 'Responsabilidade', look_for: 'Assume erro; não culpa outros.' },
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
    key: 'adaptabilidade',
    label: 'Adaptabilidade e resiliência',
    description: 'Como o candidato lida com mudança, ambiguidade e pressão.',
    dimensions: [
      { key: 'mudanca', label: 'Lida com mudança', look_for: 'Ajusta plano sem resistência excessiva.' },
      { key: 'ambiguidade', label: 'Tolera ambiguidade', look_for: 'Decide mesmo com informação incompleta.' },
      { key: 'resiliencia', label: 'Resiliência', look_for: 'Recupera-se de erro ou frustração sem desistir.' },
      { key: 'aprendizado', label: 'Aprendizado contínuo', look_for: 'Busca aprender com feedback e erros.' },
    ],
  },
  {
    key: 'pensamento_critico',
    label: 'Pensamento crítico',
    description: 'Como o candidato questiona, analisa e evita vieses.',
    dimensions: [
      { key: 'questionamento', label: 'Questionamento', look_for: 'Não aceita premissas sem validar.' },
      { key: 'analise_dados', label: 'Análise de dados', look_for: 'Usa dados e fatos, não só intuição.' },
      { key: 'vieses', label: 'Reconhece vieses', look_for: 'Identifica pressupostos e preconceitos.' },
      { key: 'sintese', label: 'Síntese', look_for: 'Conecta informações de fontes diferentes.' },
    ],
  },
  {
    key: 'inteligencia_emocional',
    label: 'Inteligência emocional',
    description: 'Como o candidato reconhece e gerencia emoções próprias e alheias.',
    dimensions: [
      { key: 'autoconsciencia', label: 'Autoconsciência', look_for: 'Reconhece o próprio estado emocional.' },
      { key: 'autorregulacao', label: 'Autorregulação', look_for: 'Controla reações impulsivas.' },
      { key: 'empatia', label: 'Empatia', look_for: 'Percebe o que o outro sente e ajusta a abordagem.' },
      { key: 'relacionamento', label: 'Gestão de relacionamento', look_for: 'Constrói e mantém vínculos profissionais.' },
    ],
  },
];

// Mapa rápido: key -> skill object
export const SKILL_BY_KEY = Object.fromEntries(SOFT_SKILLS.map((s) => [s.key, s]));

// Lista de labels para uso em prompts
export const SOFT_SKILL_LABELS = SOFT_SKILLS.map((s) => s.label);

// Retorna a lista de soft skills que a vaga provavelmente exige, baseada nas competências declaradas.
export function inferSoftSkills(job) {
  const comps = (job?.competencies || []).map((c) => c.toLowerCase());
  const matched = SOFT_SKILLS.filter((s) =>
    comps.some((c) => c.includes(s.label.toLowerCase()) || s.label.toLowerCase().includes(c))
  );
  // Se não houver match direto, retorna as 4 principais
  return matched.length ? matched : SOFT_SKILLS.slice(0, 4);
}

// Formato para incluir no prompt da IA
export function softSkillsForPrompt(skills) {
  return (skills || SOFT_SKILLS.slice(0, 4))
    .map((s) => {
      const dims = s.dimensions.map((d) => `    - ${d.key}: ${d.label} (procurar: ${d.look_for})`).join('\n');
      return `${s.label} (${s.key}):\n${dims}`;
    })
    .join('\n\n');
}