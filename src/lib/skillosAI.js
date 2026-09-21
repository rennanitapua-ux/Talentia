// TalentOS — AI Engine v5
// Evidence-based analysis, varied simulation formats, score composition transparency
import { base44 } from '@/api/base44Client';

// ============================================================================
// SIMULATION GENERATION
// Varied formats: contextual choice, open response, prioritization, trade-offs
// ============================================================================
export async function generateSimulationPhases(job) {
  const prompt = `Você é o TalentOS, uma IA que cria simulações de trabalho realistas para contratação baseada em competências. Cada simulação deve parecer um dia de trabalho real, não um teste escolar.

DADOS DA VAGA:
- Setor: ${job.sector}
- Área: ${job.area_description || 'Não especificada'}
- Cargo: ${job.role} (nível: ${job.difficulty || 'mid'})
- Contexto da empresa: ${job.company_context}
- Produto/Serviço: ${job.product}
- Cliente típico: ${job.client}
- Problemas e desafios reais: ${job.company_problems || 'Não especificados'}
- Competências a avaliar: ${(job.competencies || []).join(', ')}

SITUAÇÕES REAIS FORNECIDAS PELA EMPRESA:
${(job.situations || []).map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

INSTRUÇÕES CRÍTICAS:

1. ESTRUTURA: Gere EXATAMENTE 6 fases com 15 perguntas no total:
   - Fase 1 (choice): 3 perguntas — decisões rápidas com contexto
   - Fase 2 (write): 3 perguntas — raciocínio estratégico escrito
   - Fase 3 (choice): 2 perguntas — priorização sob pressão
   - Fase 4 (write): 3 perguntas — plano de ação e comunicação
   - Fase 5 (choice): 2 perguntas — decisões com trade-offs
   - Fase 6 (write): 2 perguntas — desafio estratégico de alto nível

2. CENÁRIOS REAIS: Cada pergunta deve ser uma situação de trabalho específica e plausível para este cargo e setor. Use o nome do produto, tipo de cliente e problemas reais. NUNCA reutilize a mesma situação. Cada pergunta = um cenário completamente diferente.

3. PARA PERGUNTAS "choice" (múltipla escolha):
   - 4 opções plausíveis e distinguíveis por competência, não por obviedade
   - As opções devem ter comprimento e estrutura SIMILARES — a correta não deve ser identificável pelo tamanho ou linguagem
   - Cada opção representa um nível de competência real (high/medium_high/medium_low/low)
   - A opção "low" não deve ser obviamente ruim — deve ser uma tentação plausível para alguém inexperiente
   - Inclua contexto suficiente para que a decisão seja real, não adivinhação

4. PARA PERGUNTAS "write" (escrita livre):
   - O "prompt" DEVE conter a situação completa e detalhada — contexto, informações, o que se pede
   - O "write_guidance" deve orientar o que escrever sem dar a resposta
   - Exija pensamento estratégico real: análise, opções consideradas, decisão, justificativa
   - Não peça justificativas genéricas — peça decisões concretas com consequências

5. VARIEDADE DE CENÁRIOS: alterne entre situações urgentes, de planejamento, interpessoais, técnicas, de crise, de relacionamento com cliente, de gestão de equipe, de priorização, de análise de dados, de comunicação.

6. PROGRESSÃO: comece com situações mais diretas, avance para cenários complexos, termine com um desafio estratégico de alto nível.

7. Cada pergunta PODE ter um personagem (nome, cargo, tom) que apresenta a situação de forma natural.

8. O campo "prompt" é OBRIGATÓRIO e nunca vazio.

Gere também um perfil da empresa virtual que contextualize cultura, desafios de mercado e momento da empresa (2-3 parágrafos).

Retorne JSON com esta estrutura EXATA:
{
  "virtual_company_profile": "perfil da empresa virtual — 2-3 parágrafos ricos",
  "phases": [
    {
      "id": "phase_1",
      "type": "choice",
      "title": "título curto da fase",
      "subtitle": "descrição breve",
      "questions": [
        {
          "id": "q1",
          "prompt": "situação/pergunta completa e detalhada (OBRIGATÓRIO)",
          "context": "contexto adicional (pode ser vazio)",
          "write_guidance": "para write: orientação do que escrever (vazio para choice)",
          "character": { "name": "nome", "role": "cargo", "tone": "tom" },
          "multiple_choice": [
            { "id": "a", "text": "texto plausível", "level": "high|medium_high|medium_low|low", "competencies": ["competência"] }
          ],
          "expected_competencies": ["competências avaliadas"],
          "evaluation_criteria": "critérios detalhados"
        }
      ]
    }
  ]
}

Para perguntas "write", "multiple_choice" deve ser [].`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash',
  });

  let parsed;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
  } catch (e) {
    console.error('Failed to parse simulation JSON, using fallback:', e);
    parsed = null;
  }

  if (parsed?.phases?.length) {
    parsed.phases = parsed.phases.map((ph, pi) => {
      if (!ph.questions || ph.questions.length === 0) {
        ph.questions = generateFallbackQuestions(ph.type, job, pi);
      }
      ph.questions = ph.questions.map((q, qi) => ({
        id: q.id || `q${pi}_${qi}`,
        prompt: q.prompt || 'Descreva como você lidaria com esta situação no contexto da empresa.',
        context: q.context || '',
        write_guidance: q.write_guidance || (ph.type === 'write' ? 'Escreva sua resposta detalhada, explicando seu raciocínio e as ações que tomaria.' : ''),
        character: q.character || null,
        multiple_choice: q.multiple_choice || [],
        expected_competencies: q.expected_competencies || job.competencies || [],
        evaluation_criteria: q.evaluation_criteria || '',
      }));
      return ph;
    });
  } else {
    parsed = generateFallbackPhases(job);
  }

  return parsed;
}

function generateFallbackQuestions(type, job, phaseIdx) {
  const situations = job.situations || [];
  const problems = job.company_problems || '';
  const competencies = job.competencies || ['Comunicação', 'Resolução de Problemas'];
  const productName = job.product || 'o produto';
  const clientName = job.client || 'o cliente';

  const getSituation = (offset) => situations[(phaseIdx * 3 + offset) % Math.max(situations.length, 1)] ||
    `A empresa enfrenta um desafio com ${productName} envolvendo ${clientName}. ${problems ? 'Contexto: ' + problems : ''}`;

  if (type === 'choice') {
    const count = phaseIdx === 0 ? 3 : 2;
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q_${phaseIdx}_${i}`,
        prompt: `Situação: ${getSituation(i)}\n\nQual seria a melhor abordagem para resolver esta situação?`,
        context: '',
        character: null,
        multiple_choice: [
          { id: 'a', text: 'Abordar diretamente o problema com o cliente, buscando uma solução imediata e assumindo responsabilidade.', level: 'high', competencies: [competencies[0]] },
          { id: 'b', text: 'Encaminhar para a equipe responsável e acompanhar o caso até a resolução.', level: 'medium_high', competencies: [competencies[0]] },
          { id: 'c', text: 'Documentar o caso e aguardar orientação da liderança antes de prosseguir.', level: 'medium_low', competencies: [competencies[0]] },
          { id: 'd', text: 'Responder com uma solução padronizada já utilizada em situações similares.', level: 'low', competencies: [competencies[0]] },
        ],
        expected_competencies: competencies,
        evaluation_criteria: 'Capacidade de identificar a melhor abordagem para a situação.',
      });
    }
    return questions;
  }

  const count = phaseIdx === 0 ? 3 : 2;
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q_${phaseIdx}_${i}`,
      prompt: `Situação: ${getSituation(i)}\n\nComo você lidaria com esta situação? Explique seu raciocínio passo a passo.`,
      context: '',
      write_guidance: `Descreva detalhadamente: 1) Como você analisaria a situação, 2) Que perguntas faria, 3) Que solução proporia, 4) Como mediria o sucesso da sua abordagem.`,
      character: null,
      multiple_choice: [],
      expected_competencies: competencies,
      evaluation_criteria: 'Profundidade do raciocínio, especificidade da resposta e alinhamento com as competências esperadas.',
    });
  }
  return questions;
}

function generateFallbackPhases(job) {
  const situations = job.situations || [];
  const problems = job.company_problems || '';
  const competencies = job.competencies || ['Comunicação', 'Resolução de Problemas'];
  const productName = job.product || 'o produto';
  const clientName = job.client || 'o cliente';

  const allSituations = [];
  if (situations.length > 0) situations.forEach(s => allSituations.push(s));
  if (problems) {
    allSituations.push(`A empresa enfrenta: ${problems}. Como você abordaria esse desafio no seu primeiro mês?`);
    allSituations.push(`Um cliente relatou insatisfação relacionada a: ${problems}. Como você resolveria?`);
  }
  while (allSituations.length < 15) {
    allSituations.push(`Cenário ${allSituations.length + 1}: Uma situação inesperada surge com ${clientName} sobre ${productName}. Como você age?`);
  }

  return {
    virtual_company_profile: `${job.company_name || 'A empresa'} atua no setor de ${job.sector || 'tecnologia'} oferecendo ${productName} para ${clientName}. ${problems ? 'Enfrenta desafios como: ' + problems + '.' : ''} A cultura valoriza proatividade e resultados.`,
    phases: [
      { id: 'phase_1', type: 'choice', title: 'Decisões Rápidas', subtitle: 'Tomada de decisão com contexto',
        questions: [
          { id: 'q1_0', prompt: `Situação: ${allSituations[0]}\n\nQual a melhor abordagem?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Agir imediatamente, assumindo responsabilidade pela resolução.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Consultar a equipe antes de decidir e alinhar próximos passos.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Esperar mais informações antes de tomar qualquer decisão.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Seguir o processo padrão sem adaptação para garantir consistência.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Tomada de decisão adequada ao contexto.' },
          { id: 'q1_1', prompt: `Situação: ${allSituations[1]}\n\nQual opção escolheria?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Priorizar a relação com o cliente acima de tudo, buscando manter o contrato.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Equilibrar relação e processo, buscando uma solução de ganho mútuo.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Seguir o processo rigidamente, mesmo que insatisfaça o cliente.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Evitar o conflito e transferir a responsabilidade para outro setor.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Equilíbrio entre empatia e processo.' },
          { id: 'q1_2', prompt: `Situação: ${allSituations[2]}\n\nQual decisão tomaria primeiro?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Diagnosticar a causa raiz antes de agir, mesmo que demore mais.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Aplicar uma solução conhecida e monitorar os resultados de perto.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Pedir orientação a um superior antes de qualquer ação.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Adiar a decisão até ter mais dados disponíveis no sistema.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Capacidade de priorização e diagnóstico.' },
        ],
      },
      { id: 'phase_2', type: 'write', title: 'Raciocínio Estratégico', subtitle: 'Análise e estratégia escrita',
        questions: [
          { id: 'q2_0', prompt: `Situação: ${allSituations[3]}\n\nComo você lidaria com esta situação?`, context: '', write_guidance: 'Descreva: 1) Sua análise da situação, 2) As ações que tomaria, 3) Como mediria o resultado.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Profundidade do raciocínio.' },
          { id: 'q2_1', prompt: `Situação: ${allSituations[4]}\n\nExplique sua abordagem detalhadamente.`, context: '', write_guidance: 'Detalhe seu plano de ação passo a passo, incluindo como envolveria a equipe.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Clareza e especificidade.' },
          { id: 'q2_2', prompt: `Situação: ${allSituations[5]}\n\nQue estratégia adotaria?`, context: '', write_guidance: 'Apresente sua estratégia: contexto, opções consideradas, decisão e justificativa.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Pensamento estratégico e justificativa.' },
        ],
      },
      { id: 'phase_3', type: 'choice', title: 'Priorização Sob Pressão', subtitle: 'Decisões de prioridade',
        questions: [
          { id: 'q3_0', prompt: `Situação: ${allSituations[6]}\n\nQual a melhor decisão?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Resolver a causa raiz do problema para evitar recorrência.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Conter o problema imediatamente e investigar depois.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Escalar imediatamente para a liderança sem tentar resolver.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Aguardar o problema se resolver sozinho ou perder força.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Priorização adequada.' },
          { id: 'q3_1', prompt: `Situação: ${allSituations[7]}\n\nComo priorizaria?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Avaliar impacto e urgência de cada item antes de agir.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Resolver o mais rápido primeiro para ganhar tempo.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Seguir a ordem em que chegaram, sem reordenar.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Delegar tudo e apenas supervisionar o andamento.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Capacidade de priorização.' },
        ],
      },
      { id: 'phase_4', type: 'write', title: 'Plano de Ação', subtitle: 'Planejamento e execução',
        questions: [
          { id: 'q4_0', prompt: `Situação: ${allSituations[8]}\n\nDescreva como você resolveria.`, context: '', write_guidance: 'Apresente um plano completo: diagnóstico, ações, prazos e métricas de sucesso.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Capacidade de planejamento.' },
          { id: 'q4_1', prompt: `Situação: ${allSituations[9]}\n\nComo você abordaria este desafio?`, context: '', write_guidance: 'Explique sua estratégia, como comunicaria aos stakeholders e que resultados esperaria.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Visão estratégica.' },
          { id: 'q4_2', prompt: `Situação: ${allSituations[10]}\n\nDetalhe seu plano de ação.`, context: '', write_guidance: 'Inclua: análise de riscos, plano de contingência, marcos de acompanhamento e critérios de sucesso.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Planejamento detalhado e gestão de riscos.' },
        ],
      },
      { id: 'phase_5', type: 'choice', title: 'Decisões com Trade-offs', subtitle: 'Escolhas com consequências',
        questions: [
          { id: 'q5_0', prompt: `Situação: ${allSituations[11]}\n\nComo responderia?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Ouvir ativamente e buscar uma solução conjunta com o cliente.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Explicar o lado da empresa com empatia e buscar um meio-termo.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Encaminhar para o setor responsável sem envolvimento direto.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Manter posição firme sem ceder, priorizando a política da empresa.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Inteligência emocional e comunicação.' },
          { id: 'q5_1', prompt: `Situação: ${allSituations[12]}\n\nQual abordagem adotaria?`, context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Construir consenso ouvindo todas as partes antes de decidir.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Apresentar uma proposta e ajustar com feedback dos envolvidos.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Seguir a decisão da maioria, mesmo sem concordar totalmente.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Impor a decisão e seguir adiante sem consultar.', level: 'low', competencies: [competencies[0]] },
            ], expected_competencies: competencies, evaluation_criteria: 'Capacidade de construir consenso.' },
        ],
      },
      { id: 'phase_6', type: 'write', title: 'Desafio Estratégico', subtitle: 'Visão de alto nível',
        questions: [
          { id: 'q6_0', prompt: `Situação: ${allSituations[13]}\n\nComo você lideraria esta situação?`, context: '', write_guidance: 'Descreva sua visão estratégica, como alinharia a equipe, e que resultados de longo prazo buscaria.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Liderança e visão estratégica.' },
          { id: 'q6_1', prompt: `Situação: ${allSituations[14]}\n\nApresente sua proposta final.`, context: '', write_guidance: 'Consolide tudo: diagnóstico, estratégia, plano de execução, métricas e visão de futuro.', character: null, multiple_choice: [], expected_competencies: competencies, evaluation_criteria: 'Capacidade de síntese estratégica.' },
        ],
      },
    ],
  };
}

// ============================================================================
// DEEP PER-RESPONSE ANALYSIS
// Evidence-based, with confidence levels and observation vs inference separation
// ============================================================================
export async function analyzeQuestionResponse(question, answer, isChoice, previousResponses) {
  const choiceObj = isChoice ? (question.multiple_choice || []).find(c => c.id === answer) : null;
  const choiceText = choiceObj?.text || '';

  const prompt = `Você é o TalentOS, uma IA de avaliação de candidatos que faz análise RIGOROSA, EVIDÊNCIADA e TRANSPARENTE. Sua análise é usada por recrutadores para decisões de contratação reais.

PERGUNTA AVALIADA:
- Enunciado: ${question.prompt}
${question.context ? `- Contexto: ${question.context}` : ''}
${question.character?.name ? `- Personagem: ${question.character.name} (${question.character.role})` : ''}
- Competências esperadas: ${(question.expected_competencies || []).join(', ')}
- Critérios de avaliação: ${question.evaluation_criteria || 'Não especificados'}

RESPOSTA DO CANDIDATO:
${isChoice ? `- Opção escolhida: ${choiceText} (nível: ${choiceObj?.level || 'N/A'})` : `- Resposta escrita: """${answer || 'Sem resposta'}"""`}

RESPOSTAS ANTERIORES (para avaliar consistência):
${(previousResponses || []).map((r, i) => `  ${i + 1}. ${r}`).join('\n') || 'Nenhuma'}

INSTRUÇÕES DE ANÁLISE — seja RIGOROSA, ESPECÍFICA e EVIDÊNCIADA:

REGRAS FUNDAMENTAIS:
1. NUNCA invente fatos sobre o candidato. Se não há evidência, diga "sem evidência suficiente".
2. Diferencie claramente: OBSERVAÇÃO (o que está na resposta) vs INTERFERÊNCIA (sua interpretação) vs NÃO COMPROVADO.
3. Evite adjetivos vazios e frases típicas de IA: "demonstra grande potencial", "perfil excepcional", "excelente comunicação", "demonstra maturidade", etc. Seja específico e concreto.
4. Uma resposta genérica deve pontuar BAIXO. Respostas com exemplos concretos e raciocínio específico pontuam alto.
5. Para cada competência, indique o NÍVEL DE CONFIANÇA da sua análise (high/medium/low) baseado em quanta evidência existe.

Para cada competência esperada, avalie:
- score (0-100): pontuação baseada em evidência concreta
- evidence ("✓" demonstrada, "~" parcial, "✗" não demonstrada)
- justification: raciocínio específico, não genérico
- evidence_quote: trecho EXATO da resposta que evidencia a avaliação
- confidence: high/medium/low — quanta evidência sustenta esta avaliação
- level: nível estimado da competência (beginner/intermediate/advanced/expert) — apenas se houver evidência

Retorne JSON:
{
  "competency_scores": {
    "nome_da_competencia": {
      "score": 0,
      "evidence": "✓|~|✗",
      "justification": "justificativa específica baseada na resposta",
      "evidence_quote": "trecho exato citado da resposta",
      "confidence": "high|medium|low",
      "level": "beginner|intermediate|advanced|expert"
    }
  },
  "skills_identified": {
    "hard_skills": [{ "name": "nome", "evidence": "trecho que evidencia" }],
    "soft_skills": [{ "name": "nome", "evidence": "trecho que evidencia" }]
  },
  "evidence_chain": [{ "skill": "habilidade", "evidence_quote": "trecho", "interpretation": "interpretação (marcada como inferência)" }],
  "response_depth": { "level": "superficial|explanation|examples|context_results|practical_experience", "reasoning": "motivo específico" },
  "quality_metrics": { "clarity": 0, "communication": 0, "reasoning": 0, "problem_solving": 0, "coherence": 0, "has_concrete_examples": true },
  "positive_points": ["ponto positivo específico 1", "ponto positivo específico 2"],
  "points_to_investigate": ["ponto a investigar específico 1", "ponto a investigar específico 2"],
  "ai_detection": { "is_ai_generated": false, "confidence": 0, "indicators": [], "analysis": "análise específica" },
  "response_quality": { "specificity": 0, "depth": 0, "authenticity": 0, "notes": "observações específicas" },
  "response_score": 0,
  "detailed_feedback": "feedback concreto — o que foi bem (específico), o que faltou (específico), como aprofundar"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash',
  });

  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : result);
    } catch (e) {
      console.error('Failed to parse analysis JSON:', e);
      return getFallbackAnalysis();
    }
  }
  return result;
}

function getFallbackAnalysis() {
  return {
    competency_scores: {},
    skills_identified: { hard_skills: [], soft_skills: [] },
    evidence_chain: [],
    response_depth: { level: 'superficial', reasoning: 'Análise indisponível.' },
    quality_metrics: { clarity: 0, communication: 0, reasoning: 0, problem_solving: 0, coherence: 0, has_concrete_examples: false },
    positive_points: [],
    points_to_investigate: [],
    ai_detection: { is_ai_generated: false, confidence: 0, indicators: [], analysis: 'Análise indisponível.' },
    response_quality: { specificity: 0, depth: 0, authenticity: 0, notes: 'Análise indisponível.' },
    response_score: 0,
    detailed_feedback: 'Análise indisponível para esta resposta.',
  };
}

// ============================================================================
// COMPREHENSIVE FINAL ASSESSMENT REPORT
// Uses stronger model for higher quality. Score composition with transparency.
// ============================================================================
export async function generateFinalAssessment(candidateName, job, allResponses, discResults) {
  const discInfo = discResults
    ? `PERFIL COMPORTAMENTAL DISC (sinal complementar, NÃO diagnóstico psicológico):
- Perfil dominante: ${discResults.dominant} (${discResults.scores[discResults.dominant]}%)
- Perfil secundário: ${discResults.secondary} (${discResults.scores[discResults.secondary]}%)
- Scores: D=${discResults.scores.D}%, I=${discResults.scores.I}%, S=${discResults.scores.S}%, C=${discResults.scores.C}%
- Código do perfil: ${discResults.profile_code}
IMPORTANTE: O DISC é um sinal complementar de estilo de trabalho. NUNCA use o DISC sozinho para determinar contratação ou Skill Score. Ele apenas contextualiza o estilo de comunicação e trabalho.`
    : 'Perfil DISC não disponível.';

  const competencies = job.competencies || [];
  const competencyList = competencies.length > 0 ? competencies.join(', ') : 'Não especificadas';

  const prompt = `Você é o TalentOS, gerando um RELATÓRIO COMPLETO de inteligência de recrutamento. Este relatório é usado por recrutadores para decidir contratações — seja RIGOROSO, EVIDÊNCIADO, TRANSPARENTE e ESPECÍFICO.

CANDIDATO: ${candidateName}
VAGA: ${job.title} (${job.role})
SETOR: ${job.sector}
NÍVEL: ${job.difficulty || 'mid'}
PROBLEMAS DA EMPRESA: ${job.company_problems || 'Não especificados'}
COMPETÊNCIAS EXIGIDAS: ${competencyList}

${discInfo}

RESPOSTAS E ANÁLISES INDIVIDUAIS DE CADA PERGUNTA (todas as evidências):
${JSON.stringify(allResponses, null, 2)}

REGRAS FUNDAMENTAIS — OBRIGATÓRIAS:
1. NUNCA invente fatos sobre o candidato. Se não há evidência, diga "sem evidência suficiente".
2. Diferencie claramente: OBSERVAÇÃO (fato da resposta) vs INTERFERÊNCIA (sua interpretação) vs NÃO COMPROVADO.
3. EVITE FRASES TÍPICAS DE IA e adjetivos vazios: "demonstra grande potencial", "perfil excepcional", "excelente comunicação", "demonstra maturidade", "perfil promissor", "demonstra visão", etc. Use observações concretas e específicas.
4. O DISC NÃO determina contratação nem Skill Score. É apenas sinal complementar de estilo.
5. NÃO emita veredito automático de contratação. Apresente dados para apoiar a decisão humana.
6. Para cada competência, indique confiança (high/medium/low) baseada em quanta evidência existe.
7. Se houve detecções de IA, reduza a confiança geral e mencione explicitamente.

Gere um RELATÓRIO COMPLETO:

1. RESUMO DO PERFIL (profile_summary): Síntese objetiva, 2-3 parágrafos, do que as respostas demonstram. Baseie-se em evidências, não em impressões.

2. HABILIDADES IDENTIFICADAS:
   - hard_skills: Extraia TODAS as hard skills demonstradas. Para cada: { name, evidence (trecho da resposta) }. NÃO invente — só inclua as que têm evidência real.
   - soft_skills: Extraia TODAS as soft skills demonstradas. Para cada: { name, evidence }. Baseie-se em comportamentos, não em palavras-chave.

3. SCORES FINAIS (skill_scores): Para cada competência exigida pela vaga, agregue os scores de todas as perguntas que a avaliaram. Pondere por consistência e profundidade. Indique a confiança.

4. COMPOSIÇÃO DO SCORE (score_composition): Mostre como o score geral foi composto. Para cada competência: { competency, score, weight (peso), contribution (contribuição para o score geral) }. Pesos iguais por padrão (cada competência tem peso 1/N onde N é o total de competências).

5. SKILL DNA (skill_dna): Top 3 fortalezas e Top 3 áreas de desenvolvimento, cada uma com evidence específica citada das respostas.

6. SKILL SCORE GERAL (overall_score): 0-100, média ponderada das competências. Indique a confiança geral (overall_confidence: high/medium/low).

7. SKILL GRAPH (skill_graph): Score final de cada competência.

8. RECOMENDAÇÃO (recommendation): "Contratação Forte" | "Contratar" | "Talvez — Investigar" | "Não Recomendado" | "Não Contratar". NÃO é um veredito automático — é um sinal para o recrutador.

9. RESUMO EXECUTIVO (summary): 3-5 parágrafos detalhados sobre a performance. Baseado em evidências.

10. ANÁLISE DE PERSONALIDADE (personality_analysis): 2-3 parágrafos. Descreva quem é essa pessoa profissionalmente: características, estilo de comunicação, como lida com pressão, como trabalha em equipe. Use o DISC como base, enriqueça com evidências das respostas. Não faça diagnóstico psicológico.

11. PONTOS FORTES DETALHADOS (strengths_detail): 1-2 parágrafos. Liste e explique os pontos fortes com exemplos concretos das respostas.

12. PONTOS A INVESTIGAR (weaknesses_detail): 1-2 parágrafos. Liste áreas de melhoria e pontos que precisam de investigação, com sugestões construtivas.

13. ESTILO DE TRABALHO (work_style): 1 parágrafo. Como essa pessoa trabalha no dia a dia, que ambiente prefere.

14. COMPATIBILIDADE COM A VAGA (job_compatibility): Compare as evidências com os requisitos da vaga:
   - demonstrated: competências demonstradas com evidência [{ competency, evidence }]
   - partial: competências parcialmente demonstradas [{ competency, evidence }]
   - not_evidenced: competências não evidenciadas [{ competency, note }]
   - needs_investigation: requisitos que precisam investigação na entrevista [{ competency, reason }]
   NÃO invente competências que não aparecem nas respostas.

15. ANÁLISE DE CONSISTÊNCIA (consistency_analysis): Compare as diferentes respostas. Identifique: informações que se complementam, possíveis contradições, evolução de raciocínio, padrões de comportamento, habilidades que aparecem repetidamente. Se não houver evidência suficiente, indique claramente.

16. PERGUNTAS INTELIGENTES PARA ENTREVISTA (interview_questions): Gere 5-8 perguntas personalizadas. Cada pergunta deve investigar: pontos pouco esclarecidos, habilidades não comprovadas, experiências sem detalhes, possíveis contradições, competências essenciais. Para cada: { question, rationale (por que perguntar), competency (competência investigada) }. Seja específico para este candidato.

17. CONFIANÇA DA AVALIAÇÃO (assessment_confidence): { level: high/medium/low, reasoning: "por que este nível de confiança", evidence_count: número de respostas analisadas }

Retorne JSON:
{
  "profile_summary": "síntese objetiva em 2-3 parágrafos",
  "hard_skills": [{ "name": "nome", "evidence": "evidência" }],
  "soft_skills": [{ "name": "nome", "evidence": "evidência" }],
  "skill_scores": { "competencia": { "score": 0, "confidence": "high|medium|low" } },
  "score_composition": [{ "competency": "nome", "score": 0, "weight": 0.0, "contribution": 0 }],
  "skill_dna": {
    "strengths": [{ "competency": "nome", "score": 0, "evidence": "evidência" }],
    "growth_areas": [{ "competency": "nome", "score": 0, "evidence": "evidência" }]
  },
  "overall_score": 0,
  "overall_confidence": "high|medium|low",
  "recommendation": "Contratação Forte|Contratar|Talvez — Investigar|Não Recomendado|Não Contratar",
  "summary": "resumo executivo em 3-5 parágrafos",
  "skill_graph": { "competencia": 0 },
  "personality_analysis": "análise em 2-3 parágrafos",
  "work_style": "estilo de trabalho em 1 parágrafo",
  "strengths_detail": "pontos fortes em 1-2 parágrafos",
  "weaknesses_detail": "pontos a investigar em 1-2 parágrafos",
  "job_compatibility": {
    "demonstrated": [{ "competency": "nome", "evidence": "evidência" }],
    "partial": [{ "competency": "nome", "evidence": "evidência" }],
    "not_evidenced": [{ "competency": "nome", "note": "observação" }],
    "needs_investigation": [{ "competency": "nome", "reason": "motivo" }]
  },
  "consistency_analysis": "análise de consistência detalhada",
  "interview_questions": [{ "question": "pergunta", "rationale": "justificativa", "competency": "competência" }],
  "assessment_confidence": { "level": "high|medium|low", "reasoning": "motivo", "evidence_count": 0 }
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude-sonnet-5',
  });

  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
      return normalizeAssessment(parsed);
    } catch (e) {
      console.error('Failed to parse final assessment JSON:', e);
      return getFallbackAssessment();
    }
  }
  return normalizeAssessment(result);
}

// Normalize the assessment to ensure skill_scores is a flat { competency: score } map
// for compatibility with existing UI components, while preserving confidence in a separate field.
function normalizeAssessment(parsed) {
  // Normalize skill_scores: LLM may return { comp: { score, confidence } } or { comp: number }
  const rawScores = parsed.skill_scores || {};
  const flatScores = {};
  const scoreConfidence = {};
  Object.entries(rawScores).forEach(([comp, val]) => {
    if (typeof val === 'number') {
      flatScores[comp] = val;
    } else if (val && typeof val === 'object') {
      flatScores[comp] = val.score ?? 0;
      if (val.confidence) scoreConfidence[comp] = val.confidence;
    }
  });

  return {
    profile_summary: parsed.profile_summary || '',
    hard_skills: parsed.hard_skills || [],
    soft_skills: parsed.soft_skills || [],
    skill_scores: flatScores,
    score_confidence: scoreConfidence,
    score_composition: parsed.score_composition || [],
    skill_dna: parsed.skill_dna || { strengths: [], growth_areas: [] },
    overall_score: parsed.overall_score || 0,
    overall_confidence: parsed.overall_confidence || 'medium',
    recommendation: parsed.recommendation || 'Talvez — Investigar',
    summary: parsed.summary || '',
    skill_graph: parsed.skill_graph || flatScores,
    personality_analysis: parsed.personality_analysis || '',
    work_style: parsed.work_style || '',
    strengths_detail: parsed.strengths_detail || '',
    weaknesses_detail: parsed.weaknesses_detail || '',
    job_compatibility: parsed.job_compatibility || { demonstrated: [], partial: [], not_evidenced: [], needs_investigation: [] },
    consistency_analysis: parsed.consistency_analysis || '',
    interview_questions: parsed.interview_questions || [],
    assessment_confidence: parsed.assessment_confidence || { level: 'medium', reasoning: '', evidence_count: 0 },
  };
}

function getFallbackAssessment() {
  return {
    profile_summary: 'Avaliação indisponível.',
    hard_skills: [],
    soft_skills: [],
    skill_scores: {},
    score_confidence: {},
    score_composition: [],
    skill_dna: { strengths: [], growth_areas: [] },
    overall_score: 0,
    overall_confidence: 'low',
    recommendation: 'Talvez — Investigar',
    summary: 'Avaliação indisponível.',
    skill_graph: {},
    personality_analysis: '',
    work_style: '',
    strengths_detail: '',
    weaknesses_detail: '',
    job_compatibility: { demonstrated: [], partial: [], not_evidenced: [], needs_investigation: [] },
    consistency_analysis: '',
    interview_questions: [],
    assessment_confidence: { level: 'low', reasoning: 'Análise indisponível.', evidence_count: 0 },
  };
}