// DISC Behavioral Test — TalentIA
// D = Dominance, I = Influence, S = Steadiness, C = Conscientiousness
// Internal letters stay D/I/S/C; display letters (A/B/C/D) are shuffled per question
// with CONTROLLED distribution — no dimension is fixed to a position, no detectable pattern.

export const DISC_QUESTIONS = [
  {
    id: 1,
    question: 'Uma prioridade muda de última hora e o prazo aperta. Qual reação mais se aproxima da sua?',
    options: [
      { letter: 'D', text: 'Reorganizo tudo rapidamente, assumo a frente e sigo executando' },
      { letter: 'I', text: 'Converso com a equipe para alinhar o novo rumo e manter o clima' },
      { letter: 'S', text: 'Mantenho a calma, sigo o processo e ajusto o ritmo com cuidado' },
      { letter: 'C', text: 'Paro para entender o impacto e os riscos antes de mudar o plano' },
    ],
  },
  {
    id: 2,
    question: 'Um colega discorda da sua abordagem em uma reunião. O que você costuma fazer?',
    options: [
      { letter: 'D', text: 'Defendo meu ponto com firmeza e sigo adiante se confio na ideia' },
      { letter: 'I', text: 'Busco entender o lado dele e encontrar um meio-termo bom para todos' },
      { letter: 'S', text: 'Oço com atenção e procuro manter a harmonia do grupo' },
      { letter: 'C', text: 'Peço dados e exemplos concretos para decidir quem tem razão' },
    ],
  },
  {
    id: 3,
    question: 'Você recebe uma tarefa nova e complexa sem instruções detalhadas. Como prefere agir?',
    options: [
      { letter: 'D', text: 'Pego a frente, defino o caminho e começo a executar logo' },
      { letter: 'I', text: 'Reúno pessoas que possam ajudar e construo a solução junto' },
      { letter: 'S', text: 'Peço orientação e prefiro um ambiente estável para começar' },
      { letter: 'C', text: 'Mapeio os requisitos e padrões antes de colocar a mão na massa' },
    ],
  },
  {
    id: 4,
    question: 'Um cliente está visivelmente irritado por um erro da equipe. Qual sua primeira reação?',
    options: [
      { letter: 'D', text: 'Assumo o controle da situação e decido o que fazer na hora' },
      { letter: 'I', text: 'Uso empatia e conversa para acalmar e reconstruir o clima' },
      { letter: 'S', text: 'Ouço com paciência e trabalho para estabilizar a situação' },
      { letter: 'C', text: 'Investigo o que causou o erro e apresento os fatos com clareza' },
    ],
  },
  {
    id: 5,
    question: 'Preciso comunicar uma decisão impopular para a equipe. Como faço?',
    options: [
      { letter: 'D', text: 'Vou direto ao ponto, com clareza e sem rodeios' },
      { letter: 'I', text: 'Busco engajar e mostrar o lado positivo para amenizar' },
      { letter: 'S', text: 'Comunico com calma e me disponho a ouvir as preocupações' },
      { letter: 'C', text: 'Apresento os critérios e dados que sustentam a decisão' },
    ],
  },
  {
    id: 6,
    question: 'Quando tudo está estável e sem urgência, como você se sente?',
    options: [
      { letter: 'D', text: 'Inquieto — procuro um novo desafio ou objetivo para atacar' },
      { letter: 'I', text: 'Aproveito para conectar pessoas e fortalecer relacionamentos' },
      { letter: 'S', text: 'Confortável — valorizo a previsibilidade e a rotina' },
      { letter: 'C', text: 'Aproveito para organizar processos e revisar detalhes' },
    ],
  },
  {
    id: 7,
    question: 'Você tem dados incompletos e precisa decidir agora. O que faz?',
    options: [
      { letter: 'D', text: 'Decido com confiança e ajusto depois se necessário' },
      { letter: 'I', text: 'Consulto pessoas de confiança e decido com o impacto em mente' },
      { letter: 'S', text: 'Sigo com cuidado, ouvindo quem já passou por algo parecido' },
      { letter: 'C', text: 'Reúno o máximo de informação possível antes de decidir' },
    ],
  },
  {
    id: 8,
    question: 'Em um projeto com várias áreas envolvidas, qual papel você costuma assumir?',
    options: [
      { letter: 'D', text: 'Lidero e defino a direção e os próximos passos' },
      { letter: 'I', text: 'Conecto as áreas e mantenho o grupo engajado' },
      { letter: 'S', text: 'Apoio a execução e garanto que ninguém fique para trás' },
      { letter: 'C', text: 'Cuido dos detalhes, prazos e padrões de qualidade' },
    ],
  },
  {
    id: 9,
    question: 'Você cometeu um erro que impactou o time. Como lida com isso?',
    options: [
      { letter: 'D', text: 'Assumo, corrijo rápido e sigo em frente sem me deter' },
      { letter: 'I', text: 'Falo abertamente com a equipe e busco resolver juntos' },
      { letter: 'S', text: 'Reconheço com calma e trabalho para reconstruir a confiança' },
      { letter: 'C', text: 'Analiso a causa raiz e crio um plano para não repetir' },
    ],
  },
  {
    id: 10,
    question: 'Quando precisa convencer alguém de uma ideia, sua estratégia é:',
    options: [
      { letter: 'D', text: 'Ir direto ao ponto e mostrar o resultado que vai gerar' },
      { letter: 'I', text: 'Usar entusiasmo e histórias para engajar a pessoa' },
      { letter: 'S', text: 'Conversar com paciência e construir confiança aos poucos' },
      { letter: 'C', text: 'Apresentar dados, evidências e uma lógica clara' },
    ],
  },
  {
    id: 11,
    question: 'Surge um conflito entre duas áreas da empresa. Qual sua tendência?',
    options: [
      { letter: 'D', text: 'Tomo a frente e decido para desbloquear a situação' },
      { letter: 'I', text: 'Faço a ponte entre as partes e busco um acordo bom para todos' },
      { letter: 'S', text: 'Procuro apaziguar e manter a paz entre as áreas' },
      { letter: 'C', text: 'Reúno os fatos de cada lado para encontrar a solução correta' },
    ],
  },
  {
    id: 12,
    question: 'O que mais te motiva no dia a dia de trabalho?',
    options: [
      { letter: 'D', text: 'Resultados claros, autonomia e desafios para superar' },
      { letter: 'I', text: 'Reconhecimento, pessoas e um ambiente animado' },
      { letter: 'S', text: 'Estabilidade, cooperação e um time que confia um no outro' },
      { letter: 'C', text: 'Qualidade, aprendizado e dominar o que faz com precisão' },
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

// Fisher-Yates shuffle — returns a new array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Valida a distribuição das dimensões DISC pelas posições de exibição (A/B/C/D).
// Regras: nenhuma dimensão pode aparecer numa mesma posição mais que o tolerável,
// e não pode haver duas questões consecutivas com a mesma dimensão na mesma posição.
function validateDistribution(questions) {
  const positions = ['A', 'B', 'C', 'D'];
  const maxPerPosition = Math.ceil(questions.length / 4) + 1;
  const counts = { A: {}, B: {}, C: {}, D: {} };
  let lastPosA = null;

  for (const q of questions) {
    q.options.forEach((opt, i) => {
      const pos = positions[i];
      counts[pos][opt.letter] = (counts[pos][opt.letter] || 0) + 1;
    });
    const posA = q.options[0]?.letter;
    if (lastPosA && posA === lastPosA) return false; // padrão consecutivo
    lastPosA = posA;
  }
  for (const pos of positions) {
    for (const dim of ['D', 'I', 'S', 'C']) {
      if (counts[pos][dim] > maxPerPosition) return false;
    }
  }
  return true;
}

// Randomização controlada: embaralha as alternativas de cada questão e valida a distribuição.
// Regenera até encontrar uma configuração sem padrão perceptível.
export function getShuffledQuestions() {
  const displayLabels = ['A', 'B', 'C', 'D'];
  let best = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const questions = DISC_QUESTIONS.map((q) => {
      const shuffledOptions = shuffle(q.options);
      const options = shuffledOptions.map((opt, i) => ({ ...opt, displayLabel: displayLabels[i] }));
      return { ...q, options };
    });
    if (validateDistribution(questions)) return questions;
    if (!best) best = questions;
  }
  // Fallback: última tentativa válida o suficiente (posição embaralhada, mesmo sem distribuição perfeita)
  return best || DISC_QUESTIONS.map((q) => ({
    ...q,
    options: shuffle(q.options).map((opt, i) => ({ ...opt, displayLabel: displayLabels[i] })),
  }));
}

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