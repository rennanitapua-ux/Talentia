import { askJSON, shuffle } from '@/lib/ai/llm';
import { QUALITY_SCORE, LEVELS } from '@/lib/situations';
import { SENIORITY_LABELS } from '@/lib/jobOptions';
import { inferSoftSkills, softSkillsForPrompt } from '@/lib/softSkills';

const LETTERS = ['a', 'b', 'c', 'd'];

function normalizeSoftSkills(s, softSkillTags) {
  return (s.soft_skills || []).filter((ss) => ss.skill && ss.dimension).map((ss) => ({
    skill: ss.skill,
    dimension: ss.dimension,
  }));
}

function normalizeChoice(s, i, competencies, softSkillTags) {
  const options = shuffle((s.options || []).filter((o) => o?.text).slice(0, 4)).map((o, k) => {
    const quality = QUALITY_SCORE[o.quality] !== undefined ? o.quality : 'weak';
    return { id: LETTERS[k], text: String(o.text).trim(), quality, score: QUALITY_SCORE[quality], behavior: o.behavior || '' };
  });
  const softSkills = normalizeSoftSkills(s, softSkillTags);
  return {
    id: `s${i + 1}`,
    type: 'choice',
    title: s.title || `Situação ${i + 1}`,
    character: s.character?.name ? { name: s.character.name, role: s.character.role || '' } : null,
    context: s.context || '',
    question: s.question || 'O que você faz?',
    options,
    justification_prompt: s.justification_prompt || 'Quer explicar sua resposta? (opcional)',
    competencies: s.competencies?.length ? s.competencies : [competencies[i % competencies.length]].filter(Boolean),
    soft_skills: softSkills.length ? softSkills : softSkillTags,
    difficulty: s.difficulty || 'intermediario',
  };
}

function normalizeOpen(s, i, competencies, softSkillTags) {
  const softSkills = normalizeSoftSkills(s, softSkillTags);
  return {
    id: `o${i + 1}`,
    type: 'open',
    title: s.title || `Questão aberta ${i + 1}`,
    character: null,
    context: s.context || '',
    question: s.question || 'Conte sobre uma situação real que você viveu nessa área.',
    options: [],
    justification_prompt:
      s.justification_prompt ||
      'Conte sobre uma situação real: o que aconteceu, o que você fez, qual decisão tomou e qual foi o resultado. Escreva com suas próprias palavras.',
    competencies: s.competencies?.length ? s.competencies : [competencies[i % competencies.length]].filter(Boolean),
    soft_skills: softSkills.length ? softSkills : softSkillTags,
    difficulty: s.difficulty || 'intermediario',
  };
}

const isValidChoice = (s) => s?.context && s?.question && (s.options || []).length === 4;
const isValidOpen = (s) => s?.context && s?.question && s?.type === 'open';

// config: { choiceCount, openCount }
export async function generateAssessment(job, config = {}) {
  const choiceCount = Number(config.choiceCount) || 10;
  const openCount = Math.max(1, Number(config.openCount) || 1);
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas', 'Comunicação'];
  const targetSkills = inferSoftSkills(job);
  const skillsBlock = softSkillsForPrompt(targetSkills);

  const prompt = `Você é o motor de simulações do TalentIA. Crie uma avaliação de trabalho REAL para avaliar competências de candidatos a esta vaga. Escreva em português do Brasil.

VAGA
- Empresa: ${job.company_name || 'Não informada'}
- Cargo: ${job.title}
- Área: ${job.sector || 'Não informada'}
- Nível de domínio exigido: ${job.seniority_level != null ? `${job.seniority_level}/10 (${SENIORITY_LABELS[job.seniority_level] || 'Pleno'})` : (LEVELS[job.difficulty] || 'Pleno')}
- Problema real que a pessoa vai resolver: ${job.company_problems || 'Não informado'}
- Contexto: ${job.company_context || '—'} | Produto/serviço: ${job.product || '—'} | Cliente: ${job.client || '—'}
- Competências declaradas: ${competencies.join(', ')}

BIBLIOTECA DE SOFT SKILLS (base obrigatória — cada situação deve mirar sub-dimensões específicas):
${skillsBlock}

SITUAÇÕES REAIS ESCRITAS PELA EMPRESA (base obrigatória):
${(job.situations || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || '— (use o problema real da empresa)'}

GERE EXATAMENTE ${choiceCount} SITUAÇÕES DE MÚLTIPLA ESCOLHA (type:"choice") E ${openCount} QUESTÕES ABERTAS (type:"open"). NÃO inclua nenhuma situação extra além dessas contagens — o número de itens no array "situations" deve ser exatamente ${choiceCount + openCount}.

PARA AS SITUAÇÕES DE MÚLTIPLA ESCOLHA (type:"choice"):
1. Parta das situações reais e do problema da empresa. Use primeiro as situações escritas pela empresa e depois crie desdobramentos (consequência de uma decisão, prazo apertado, cliente irritado, conflito com colega, erro próprio, dilema ético, priorização, dados incompletos). Nunca repita cenário.
2. Cada situação deve mirar 1 ou 2 sub-dimensões específicas da biblioteca de soft skills. Distribua para cobrir o máximo de sub-dimensões possível.
3. "context": 2 a 4 frases concretas, com nomes, números e prazos. Direto ao ponto.
4. "question": pergunta CURTA e DIRETA (máximo 12 palavras). Ex.: "O que você faz primeiro?", "Como você responde ao cliente agora?".
5. "options": EXATAMENTE 4 alternativas com tamanho e tom parecidos — nenhuma pode parecer certa só pelo texto:
   - 1 com quality "best": a melhor decisão para o contexto;
   - 1 com quality "good": aceitável, porém incompleta;
   - 1 com quality "weak": fraca (passiva, lenta, desorganizada ou só parcialmente correta);
   - 1 com quality "bad": RUIM DE VERDADE — impulsiva, antiética, agressiva, que empurra o problema. Deve ser tentadora para alguém despreparado.
   Cada alternativa tem "behavior": UM adjetivo do comportamento que ela revela.
6. "soft_skills": array de objetos { "skill": "<key>", "dimension": "<key>" } que esta situação mira. Use os keys exatos da biblioteca.
7. "justification_prompt": pedido curto e OPCIONAL para o candidato justificar a escolha.
8. "competencies": 1 ou 2 competências da lista declarada que a situação mede.
9. "character": quem traz a situação (nome brasileiro e cargo) ou null.
10. Progressão: comece direto e termine com as situações mais complexas.

PARA AS QUESTÕES ABERTAS (type:"open"):
1. NÃO inclua o campo "options". A questão aberta deixa o candidato responder livremente.
2. A pergunta deve buscar EVIDÊNCIA de comportamento real, não opinião genérica. Peça uma situação vivida: o que aconteceu, o que fez, qual decisão tomou e o resultado.
3. Contextualize para a função e o problema real da empresa. NÃO use sempre a mesma pergunta genérica.
4. "context": 1 a 3 frases que situam o candidato (opcional, mas recomendado).
5. "question": a pergunta aberta em si, clara e específica para a vaga.
6. "justification_prompt": instruções de como responder (situação, ação, decisão, resultado).
7. "soft_skills" e "competencies": o que a resposta pode revelar.
8. Varie as questões abertas entre si — não repita o mesmo tema.

Responda SOMENTE com JSON válido:
{"virtual_company_profile":"2 frases sobre a empresa e o momento dela","situations":[{"type":"choice","title":"","character":{"name":"","role":""},"context":"","question":"","options":[{"text":"","quality":"best|good|weak|bad","behavior":""}],"soft_skills":[{"skill":"","dimension":""}],"justification_prompt":"","competencies":[""],"difficulty":"basico|intermediario|avancado"},{"type":"open","title":"","context":"","question":"","justification_prompt":"","soft_skills":[{"skill":"","dimension":""}],"competencies":[""],"difficulty":"basico|intermediario|avancado"}]}`;

  const parsed = await askJSON(prompt, {
    models: ['gemini_3_flash', 'gemini_3_flash'],
    validate: (p) => {
      const all = p.situations || [];
      const choices = all.filter(isValidChoice).length;
      const opens = all.filter(isValidOpen).length;
      // Exige pelo menos o mínimo — completaremos com fallback se faltar
      return choices >= Math.min(choiceCount, 3) && opens >= 1;
    },
  });
  if (!parsed) return null;
  const all = parsed.situations || [];
  let choices = all.filter(isValidChoice).slice(0, choiceCount).map((s, i) => normalizeChoice(s, i, competencies, []));
  let opens = all.filter(isValidOpen).slice(0, openCount).map((s, i) => normalizeOpen(s, i, competencies, []));

  // COMPLETAR quantidades faltantes com fallback — a empresa pediu X, entregamos X.
  if (choices.length < choiceCount) {
    const fallback = buildFallbackAssessment(job, { choiceCount: choiceCount - choices.length, openCount: 0 });
    choices = [...choices, ...fallback.situations.filter((s) => s.options?.length > 0).map((s, i) => ({ ...s, id: `s${choices.length + i + 1}` }))];
  }
  if (opens.length < openCount) {
    const fallback = buildFallbackAssessment(job, { choiceCount: 0, openCount: openCount - opens.length });
    opens = [...opens, ...fallback.situations.filter((s) => !s.options?.length).map((s, i) => ({ ...s, id: `o${opens.length + i + 1}` }))];
  }

  // Trunca para garantir EXATAMENTE a quantidade configurada (não mais)
  choices = choices.slice(0, choiceCount);
  opens = opens.slice(0, openCount);

  const situations = [...choices, ...opens];
  return { virtual_company_profile: parsed.virtual_company_profile || '', situations, source: 'ai' };
}

const TEMPLATES = [
  { q: 'O que você faz primeiro?', o: [
    ['best', 'Entendo o impacto, priorizo o mais urgente e aviso os envolvidos com um prazo realista.', 'ponderado'],
    ['good', 'Resolvo a parte mais simples agora e retomo o restante quando tiver mais informações.', 'proativo'],
    ['weak', 'Aguardo meu gestor se posicionar antes de fazer qualquer coisa.', 'passivo'],
    ['bad', 'Resolvo do meu jeito na hora, sem avisar ninguém, para não perder tempo.', 'impulsivo'],
  ], skills: [{ skill: 'resolucao_problemas', dimension: 'priorizacao' }, { skill: 'comunicacao', dimension: 'sob_pressao' }] },
  { q: 'Como você responde agora?', o: [
    ['best', 'Ouço o ponto principal, reconheço o problema e proponho um próximo passo concreto.', 'assertivo'],
    ['good', 'Explico como funciona o processo e peço um pouco de paciência.', 'calmo'],
    ['weak', 'Digo que vou verificar e retorno quando for possível.', 'evasivo'],
    ['bad', 'Prometo resolver hoje mesmo, mesmo sem saber se é possível.', 'ansioso'],
  ], skills: [{ skill: 'comunicacao', dimension: 'conflito_com' }, { skill: 'inteligencia_emocional', dimension: 'autorregulacao' }] },
  { q: 'Qual decisão você toma?', o: [
    ['best', 'Levanto os dados disponíveis, comparo as opções e decido com um critério claro.', 'analítico'],
    ['good', 'Sigo o que funcionou da última vez e acompanho o resultado de perto.', 'intuitivo'],
    ['weak', 'Peço que outra área decida, já que não é exatamente minha responsabilidade.', 'passivo'],
    ['bad', 'Escolho a opção mais rápida e lido com as consequências depois.', 'impulsivo'],
  ], skills: [{ skill: 'resolucao_problemas', dimension: 'alternativas' }, { skill: 'pensamento_critico', dimension: 'analise_dados' }] },
  { q: 'Como você conduz isso com a equipe?', o: [
    ['best', 'Alinho o objetivo com todos, divido responsabilidades e combino como vamos acompanhar.', 'colaborativo'],
    ['good', 'Defino as tarefas e peço atualizações ao longo do dia.', 'assertivo'],
    ['weak', 'Faço tudo sozinho para garantir que saia do meu jeito.', 'individualista'],
    ['bad', 'Cobro a equipe publicamente para ninguém mais errar.', 'autoritário'],
  ], skills: [{ skill: 'trabalho_equipe', dimension: 'colaboracao' }, { skill: 'lideranca', dimension: 'delegacao' }] },
];

const TWISTS = ['', ' Agora o prazo é até o fim do dia.', ' O cliente está visivelmente irritado.', ' Seu gestor está fora e não responde.', ' Um colega discorda da sua abordagem.'];

const OPEN_TEMPLATES = [
  (job) => `Conte sobre uma situação real em que você precisou resolver um problema relacionado a ${job.product || 'seu trabalho'}. O que aconteceu, o que você fez e qual foi o resultado?`,
  (job) => `Descreva uma vez em que você cometeu um erro ou enfrentou uma divergência no trabalho. Como você lidou com a situação e o que aprendeu?`,
  (job) => `Conte sobre uma situação em que precisou tomar uma decisão difícil envolvendo outras pessoas. Como você decidiu e qual foi o resultado?`,
];

// Local generator used when the AI is unavailable — built from the company's own situations.
export function buildFallbackAssessment(job, config = {}) {
  const choiceCount = Number(config.choiceCount) || 10;
  const openCount = Math.max(1, Number(config.openCount) || 1);
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas'];
  const sources = [...(job.situations || [])];
  if (job.company_problems) sources.push(job.company_problems);
  if (!sources.length) sources.push(`Um problema inesperado surge envolvendo ${job.client || 'um cliente'} e ${job.product || 'o serviço da empresa'}.`);

  const choices = Array.from({ length: choiceCount }, (_, i) => {
    const t = TEMPLATES[i % TEMPLATES.length];
    const twist = TWISTS[Math.floor(i / sources.length) % TWISTS.length];
    return normalizeChoice({
      title: `Situação ${i + 1}`,
      context: `${sources[i % sources.length]}${twist}`,
      question: t.q,
      options: t.o.map(([quality, text, behavior]) => ({ quality, text, behavior })),
      soft_skills: t.skills,
    }, i, competencies, t.skills);
  });

  const opens = Array.from({ length: openCount }, (_, i) =>
    normalizeOpen({
      title: `Questão aberta ${i + 1}`,
      context: sources[i % sources.length],
      question: OPEN_TEMPLATES[i % OPEN_TEMPLATES.length](job),
      soft_skills: [{ skill: 'resolucao_problemas', dimension: 'iniciativa' }],
    }, i, competencies, [{ skill: 'resolucao_problemas', dimension: 'iniciativa' }])
  );

  return { virtual_company_profile: '', situations: [...choices, ...opens], source: 'fallback' };
}