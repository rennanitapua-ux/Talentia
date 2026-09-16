// DISC Behavioral Test — TalentOS
// D = Dominance, I = Influence, S = Steadiness, C = Conscientiousness

export const DISC_QUESTIONS = [
  {
    id: 1,
    question: 'Em uma situação de pressão no trabalho, eu tendo a:',
    options: [
      { letter: 'D', text: 'Assumir o controle e decidir rapidamente' },
      { letter: 'I', text: 'Conversar com colegas para encontrar uma solução juntos' },
      { letter: 'S', text: 'Manter a calma e seguir um processo estruturado' },
      { letter: 'C', text: 'Analisar todos os dados antes de decidir' },
    ],
  },
  {
    id: 2,
    question: 'Quando trabalho em equipe, eu:',
    options: [
      { letter: 'D', text: 'Lidero e defino a direção do grupo' },
      { letter: 'I', text: 'Motivo o grupo e mantenho o clima positivo' },
      { letter: 'S', text: 'Apoio os colegas e garanto que todos se sintam incluídos' },
      { letter: 'C', text: 'Garanto que os detalhes e a qualidade estejam corretos' },
    ],
  },
  {
    id: 3,
    question: 'Diante de uma mudança inesperada, eu:',
    options: [
      { letter: 'D', text: 'Vejo como uma oportunidade de agir rapidamente' },
      { letter: 'I', text: 'Fico animado com a novidade e compartilho com todos' },
      { letter: 'S', text: 'Prefiro a estabilidade, mas me adapto gradualmente' },
      { letter: 'C', text: 'Analiso os impactos e riscos antes de aceitar' },
    ],
  },
  {
    id: 4,
    question: 'Em conflitos com colegas, eu:',
    options: [
      { letter: 'D', text: 'Enfrento diretamente e busco resolver na hora' },
      { letter: 'I', text: 'Uso humor e diplomacia para suavizar a situação' },
      { letter: 'S', text: 'Busco harmonia e evito o confronto direto' },
      { letter: 'C', text: 'Baseio minha posição em fatos e dados concretos' },
    ],
  },
  {
    id: 5,
    question: 'Quando preciso comunicar uma ideia importante, eu:',
    options: [
      { letter: 'D', text: 'Vou direto ao ponto, sem rodeios' },
      { letter: 'I', text: 'Faço de forma entusiasmada e envolvente' },
      { letter: 'S', text: 'Comunico de forma calma, paciente e clara' },
      { letter: 'C', text: 'Apresento dados, evidências e detalhes técnicos' },
    ],
  },
  {
    id: 6,
    question: 'Meu maior medo no ambiente profissional é:',
    options: [
      { letter: 'D', text: 'Perder o controle ou ser dominado por outros' },
      { letter: 'I', text: 'Ser rejeitado ou não ser ouvido pelo grupo' },
      { letter: 'S', text: 'Mudanças bruscas que quebrem a estabilidade' },
      { letter: 'C', text: 'Cometer erros e ser criticado pela qualidade' },
    ],
  },
  {
    id: 7,
    question: 'Quando tomo decisões importantes, eu:',
    options: [
      { letter: 'D', text: 'Decido rápido e com confiança, depois ajusto se preciso' },
      { letter: 'I', text: 'Decido com base em intuição e no impacto nas pessoas' },
      { letter: 'S', text: 'Decido com cuidado, consultando pessoas de confiança' },
      { letter: 'C', text: 'Decido com base em análise detalhada e dados' },
    ],
  },
  {
    id: 8,
    question: 'Em reuniões de trabalho, eu costumo:',
    options: [
      { letter: 'D', text: 'Liderar a discussão e pautar os próximos passos' },
      { letter: 'I', text: 'Participar ativamente e animar o grupo' },
      { letter: 'S', text: 'Ouvir mais e falar quando necessário' },
      { letter: 'C', text: 'Tomar notas e questionar detalhes importantes' },
    ],
  },
  {
    id: 9,
    question: 'Quando recebo uma tarefa nova e complexa, eu:',
    options: [
      { letter: 'D', text: 'Quero autonomia e foco em resultados rápidos' },
      { letter: 'I', text: 'Quero trabalhar com pessoas e ter liberdade criativa' },
      { letter: 'S', text: 'Quero instruções claras e um ambiente estável' },
      { letter: 'C', text: 'Quero entender os requisitos e padrões de qualidade' },
    ],
  },
  {
    id: 10,
    question: 'Meu estilo de liderança natural é:',
    options: [
      { letter: 'D', text: 'Direto, exigente e orientado a resultados' },
      { letter: 'I', text: 'Inspirador, motivador e carismático' },
      { letter: 'S', text: 'Apoiador, paciente e democrático' },
      { letter: 'C', text: 'Preciso, organizado e orientado a processos' },
    ],
  },
  {
    id: 11,
    question: 'Em situações sociais do trabalho, eu:',
    options: [
      { letter: 'D', text: 'Gosto de estar no centro da ação e das decisões' },
      { letter: 'I', text: 'Converso com todos e faço amigos facilmente' },
      { letter: 'S', text: 'Prefiro grupos menores e pessoas já conhecidas' },
      { letter: 'C', text: 'Observo e analiso antes de participar' },
    ],
  },
  {
    id: 12,
    question: 'O que mais valorizo em um colega de trabalho:',
    options: [
      { letter: 'D', text: 'Competência, autonomia e foco em resultados' },
      { letter: 'I', text: 'Entusiasmo, espírito de equipe e energia positiva' },
      { letter: 'S', text: 'Lealdade, estabilidade e apoio mútuo' },
      { letter: 'C', text: 'Precisão, qualidade e organização' },
    ],
  },
];

export const DISC_PROFILES = {
  D: {
    name: 'Dominância',
    color: '#ef4444',
    icon: '🔥',
    traits: ['Direto', 'Decisivo', 'Orientado a resultados', 'Líder natural'],
    strengths: ['Liderança e iniciativa', 'Coragem para decidir', 'Foco em resultados', 'Capacidade de assumir riscos', 'Determinação e persistência'],
    weaknesses: ['Pode ser impaciente', 'Tende a ser insensível com emoções', 'Teimosia', 'Dificuldade em delegar', 'Pode intimidar outros'],
    work_style: 'Prefere autonomia, desafios e objetivos claros. Trabalha melhor com liberdade para decidir e ambientes de alto desempenho.',
    communication: 'Direto e objetivo. Vai ao ponto sem rodeios. Valoriza eficiência na comunicação.',
    ideal_environment: 'Ambientes competitivos, empreendedores ou de liderança. Projetos com metas ambiciosas.',
  },
  I: {
    name: 'Influência',
    color: '#f59e0b',
    icon: '⚡',
    traits: ['Comunicativo', 'Entusiasta', 'Persuasivo', 'Otimista'],
    strengths: ['Networking e relacionamentos', 'Capacidade de motivação', 'Criatividade e ideias', 'Comunicação expressiva', 'Carisma e influência'],
    weaknesses: ['Pode ser desorganizado', 'Impulsividade nas decisões', 'Superficialidade em análises', 'Dificuldade com detalhes técnicos', 'Distração fácil'],
    work_style: 'Prefere trabalho em equipe, reconhecimento e ambiente social. Trabalha melhor com pessoas e liberdade criativa.',
    communication: 'Expressivo e envolvente. Usa histórias, emoções e entusiasmo para convencer. Gosta de público.',
    ideal_environment: 'Ambientes colaborativos, criativos ou de vendas. Projetos com interação social e reconhecimento.',
  },
  S: {
    name: 'Estabilidade',
    color: '#10b981',
    icon: '🛡️',
    traits: ['Paciente', 'Estável', 'Confiável', 'Acolhedor'],
    strengths: ['Consistência e confiabilidade', 'Lealdade e comprometimento', 'Capacidade de apoio', 'Paciência e calma', 'Trabalho em equipe harmonioso'],
    weaknesses: ['Resistência a mudanças', 'Passividade em conflitos', 'Indecisão sob pressão', 'Dificuldade em dizer não', 'Lentidão para adaptar'],
    work_style: 'Prefere ambiente estável, instruções claras e trabalho colaborativo. Trabalha melhor com rotina e processos definidos.',
    communication: 'Calmo e paciente. Ouve antes de falar. Comunica de forma acolhedora e empática.',
    ideal_environment: 'Ambientes estáveis, colaborativos ou de suporte. Projetos com processos claros e equipe unida.',
  },
  C: {
    name: 'Conformidade',
    color: '#3b82f6',
    icon: '🎯',
    traits: ['Analítico', 'Preciso', 'Sistemático', 'Reservado'],
    strengths: ['Qualidade e precisão', 'Planejamento detalhado', 'Análise crítica', 'Organização e método', 'Padrões altos de qualidade'],
    weaknesses: ['Perfeccionismo excessivo', 'Rigidez e inflexibilidade', 'Lentidão por excesso de análise', 'Dificuldade com ambiguidade', 'Reserva social excessiva'],
    work_style: 'Prefere estrutura, padrões claros e trabalho autônomo. Trabalha melhor com processos definidos e requisitos precisos.',
    communication: 'Preciso e detalhado. Baseia-se em dados e fatos. Comunica de forma estruturada e técnica.',
    ideal_environment: 'Ambientes analíticos, técnicos ou de qualidade. Projetos com requisitos claros e padrões definidos.',
  },
};

export function calculateDiscResults(answers) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  answers.forEach(a => {
    if (counts[a.letter] !== undefined) counts[a.letter]++;
  });
  const total = answers.length || 1;
  const percentages = {};
  Object.keys(counts).forEach(k => {
    percentages[k] = Math.round((counts[k] / total) * 100);
  });
  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  return {
    scores: percentages,
    dominant: sorted[0][0],
    secondary: sorted[1][0],
    profile_code: sorted[0][0] + sorted[1][0],
  };
}