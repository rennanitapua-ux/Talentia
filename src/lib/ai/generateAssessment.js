import { askJSON, shuffle } from '@/lib/ai/llm';
import { QUALITY_SCORE, LEVELS } from '@/lib/situations';

const LETTERS = ['a', 'b', 'c', 'd'];

function normalizeSituation(s, i, competencies) {
  const options = shuffle((s.options || []).filter((o) => o?.text).slice(0, 4)).map((o, k) => {
    const quality = QUALITY_SCORE[o.quality] !== undefined ? o.quality : 'weak';
    return { id: LETTERS[k], text: String(o.text).trim(), quality, score: QUALITY_SCORE[quality], behavior: o.behavior || '' };
  });
  return {
    id: `s${i + 1}`,
    title: s.title || `Situação ${i + 1}`,
    character: s.character?.name ? { name: s.character.name, role: s.character.role || '' } : null,
    context: s.context || '',
    question: s.question || 'O que você faz?',
    options,
    justification_prompt: s.justification_prompt || 'Por que você escolheu essa opção? Seja específico.',
    competencies: s.competencies?.length ? s.competencies : [competencies[i % competencies.length]].filter(Boolean),
    difficulty: s.difficulty || 'intermediario',
  };
}

const isValid = (s) => s?.context && s?.question && (s.options || []).length === 4;

export async function generateAssessment(job, count = 12) {
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas', 'Comunicação'];
  const prompt = `Você é o motor de simulações do TalentOS. Crie uma simulação de trabalho REAL para avaliar candidatos a esta vaga. Escreva em português do Brasil.

VAGA
- Empresa: ${job.company_name || 'Não informada'}
- Cargo: ${job.title}
- Área: ${job.sector || 'Não informada'}
- Senioridade: ${LEVELS[job.difficulty] || 'Pleno'}
- Problema real que a pessoa vai resolver: ${job.company_problems || 'Não informado'}
- Contexto: ${job.company_context || '—'} | Produto/serviço: ${job.product || '—'} | Cliente: ${job.client || '—'}
- Competências avaliadas: ${competencies.join(', ')}

SITUAÇÕES REAIS ESCRITAS PELA EMPRESA (base obrigatória):
${(job.situations || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || '— (use o problema real da empresa)'}

GERE EXATAMENTE ${count} SITUAÇÕES. Regras:
1. Parta das situações reais e do problema da empresa. Use primeiro as situações escritas pela empresa e depois crie desdobramentos novos (consequência de uma decisão, prazo apertado, cliente irritado, conflito com colega, erro próprio, dilema ético, priorização, dados incompletos). Nunca repita cenário.
2. "context": 2 a 4 frases concretas, com nomes, números e prazos. Direto ao ponto, sem enrolação.
3. "question": pergunta CURTA e DIRETA (no máximo 12 palavras). Ex.: "O que você faz primeiro?", "Como você responde ao cliente agora?".
4. "options": EXATAMENTE 4 alternativas com tamanho e tom parecidos — nenhuma pode parecer certa só pelo texto:
   - 1 com quality "best": a melhor decisão para o contexto;
   - 1 com quality "good": aceitável, porém incompleta;
   - 1 com quality "weak": fraca (passiva, lenta, desorganizada ou só parcialmente correta);
   - 1 com quality "bad": RUIM DE VERDADE — impulsiva, antiética, agressiva, que empurra o problema, promete o que não pode cumprir ou ignora o cliente. Deve ser tentadora para alguém despreparado.
   Cada alternativa tem "behavior": UM adjetivo do comportamento que ela revela (impulsivo, ponderado, calmo, ansioso, evasivo, assertivo, colaborativo, autoritário, analítico, intuitivo, proativo, passivo).
5. "justification_prompt": pedido curto para o candidato justificar a escolha.
6. "competencies": 1 ou 2 competências da lista que a situação mede. Distribua de forma equilibrada.
7. "character": quem traz a situação (nome brasileiro e cargo) ou null.
8. Progressão: comece direto e termine com as situações mais complexas.

Responda SOMENTE com JSON válido:
{"virtual_company_profile":"2 frases sobre a empresa e o momento dela","situations":[{"title":"título curto","character":{"name":"","role":""},"context":"","question":"","options":[{"text":"","quality":"best|good|weak|bad","behavior":""}],"justification_prompt":"","competencies":[""],"difficulty":"basico|intermediario|avancado"}]}`;

  const parsed = await askJSON(prompt, {
    models: ['gemini_3_flash', 'gemini_3_flash'],
    validate: (p) => (p.situations || []).filter(isValid).length >= Math.ceil(count * 0.6),
  });
  if (!parsed) return null;
  const situations = parsed.situations.filter(isValid).slice(0, count).map((s, i) => normalizeSituation(s, i, competencies));
  return { virtual_company_profile: parsed.virtual_company_profile || '', situations, source: 'ai' };
}

const TEMPLATES = [
  { q: 'O que você faz primeiro?', o: [
    ['best', 'Entendo o impacto, priorizo o mais urgente e aviso os envolvidos com um prazo realista.', 'ponderado'],
    ['good', 'Resolvo a parte mais simples agora e retomo o restante quando tiver mais informações.', 'proativo'],
    ['weak', 'Aguardo meu gestor se posicionar antes de fazer qualquer coisa.', 'passivo'],
    ['bad', 'Resolvo do meu jeito na hora, sem avisar ninguém, para não perder tempo.', 'impulsivo'],
  ] },
  { q: 'Como você responde agora?', o: [
    ['best', 'Ouço o ponto principal, reconheço o problema e proponho um próximo passo concreto.', 'assertivo'],
    ['good', 'Explico como funciona o processo e peço um pouco de paciência.', 'calmo'],
    ['weak', 'Digo que vou verificar e retorno quando for possível.', 'evasivo'],
    ['bad', 'Prometo resolver hoje mesmo, mesmo sem saber se é possível.', 'ansioso'],
  ] },
  { q: 'Qual decisão você toma?', o: [
    ['best', 'Levanto os dados disponíveis, comparo as opções e decido com um critério claro.', 'analítico'],
    ['good', 'Sigo o que funcionou da última vez e acompanho o resultado de perto.', 'intuitivo'],
    ['weak', 'Peço que outra área decida, já que não é exatamente minha responsabilidade.', 'passivo'],
    ['bad', 'Escolho a opção mais rápida e lido com as consequências depois.', 'impulsivo'],
  ] },
  { q: 'Como você conduz isso com a equipe?', o: [
    ['best', 'Alinho o objetivo com todos, divido responsabilidades e combino como vamos acompanhar.', 'colaborativo'],
    ['good', 'Defino as tarefas e peço atualizações ao longo do dia.', 'assertivo'],
    ['weak', 'Faço tudo sozinho para garantir que saia do meu jeito.', 'individualista'],
    ['bad', 'Cobro a equipe publicamente para ninguém mais errar.', 'autoritário'],
  ] },
];

const TWISTS = ['', ' Agora o prazo é até o fim do dia.', ' O cliente está visivelmente irritado.', ' Seu gestor está fora e não responde.', ' Um colega discorda da sua abordagem.'];

// Local generator used when the AI is unavailable — built from the company's own situations.
export function buildFallbackAssessment(job, count = 12) {
  const competencies = job.competencies?.length ? job.competencies : ['Resolução de problemas'];
  const sources = [...(job.situations || [])];
  if (job.company_problems) sources.push(job.company_problems);
  if (!sources.length) sources.push(`Um problema inesperado surge envolvendo ${job.client || 'um cliente'} e ${job.product || 'o serviço da empresa'}.`);
  const situations = Array.from({ length: count }, (_, i) => {
    const t = TEMPLATES[i % TEMPLATES.length];
    const twist = TWISTS[Math.floor(i / sources.length) % TWISTS.length];
    return normalizeSituation({
      title: `Situação ${i + 1}`,
      context: `${sources[i % sources.length]}${twist}`,
      question: t.q,
      options: t.o.map(([quality, text, behavior]) => ({ quality, text, behavior })),
    }, i, competencies);
  });
  return { virtual_company_profile: '', situations, source: 'fallback' };
}