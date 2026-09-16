// TalentOS — AI Engine v3
// Phase-based simulation: choice phases and write phases, each with 2-3 questions
import { base44 } from '@/api/base44Client';

// Generate simulation phases from a job definition — tailored to company problems
export async function generateSimulationPhases(job) {
  const prompt = `Você é o TalentOS, uma IA que cria simulações de trabalho ULTRA-REALISTAS para contratação baseada em competências.

DADOS DA VAGA:
- Setor: ${job.sector}
- Área (descrição livre): ${job.area_description || 'Não especificada'}
- Cargo: ${job.role} (nível: ${job.difficulty || 'mid'})
- Contexto da empresa: ${job.company_context}
- Produto/Serviço: ${job.product}
- Cliente típico: ${job.client}
- PROBLEMAS E DESAFIOS DA EMPRESA: ${job.company_problems || 'Não especificados explicitamente'}
- Competências a avaliar: ${(job.competencies || []).join(", ")}

SITUAÇÕES REAIS FORNECIDAS PELA EMPRESA:
${(job.situations || []).map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

INSTRUÇÕES CRÍTICAS:
1. Gere EXATAMENTE 4 fases, alternando entre tipo "choice" (múltipla escolha) e "write" (escrita livre):
   - Fase 1: tipo "choice" com 2 perguntas
   - Fase 2: tipo "write" com 2 perguntas
   - Fase 3: tipo "choice" com 1 pergunta
   - Fase 4: tipo "write" com 2 perguntas
   TOTAL: 3 perguntas de múltipla escolha + 4 perguntas de escrita = 7 perguntas.
2. Cada pergunta deve ser ÚNICA e específica para ESTA empresa — use o nome do produto, o tipo de cliente e os problemas reais. NUNCA reuse a mesma situação entre perguntas.
3. As perguntas devem refletir os PROBLEMAS reais da empresa — se tem problema de churn, crie perguntas de retenção; se tem problema de vendas, crie perguntas de negociação. Cada pergunta deve abordar uma SITUAÇÃO DIFERENTE.
4. Para perguntas "choice": 4 opções plausíveis mas distinguíveis por competência — uma pessoa experiente deve identificar a melhor.
5. Para perguntas "write": o campo "prompt" DEVE conter a situação/pergunta completa e detalhada que o candidato precisa responder. O campo "write_guidance" DEVE conter instruções claras sobre o que o candidato deve escrever (ex: "Descreva como você abordaria a conversa com o cliente, quais perguntas faria, e que solução proporia"). A pergunta deve exigir pensamento estratégico real, não apenas justificativa.
6. Varie o tipo de situação: algumas urgentes, algumas de planejamento, algumas interpessoais, algumas técnicas. Cada pergunta = uma situação totalmente diferente.
7. Cada pergunta pode ter um personagem (nome, cargo, tom) que apresenta a situação.
8. O campo "prompt" é OBRIGATÓRIO e nunca pode ser vazio — é o que o candidato vê na tela.

Gere também um perfil da empresa virtual que contextualize a cultura, os desafios do mercado e o momento da empresa.

Retorne JSON com esta estrutura EXATA:
{
  "virtual_company_profile": "perfil da empresa virtual (cultura, desafios de mercado, momento) — 2-3 parágrafos ricos",
  "phases": [
    {
      "id": "phase_1",
      "type": "choice",
      "title": "título curto da fase",
      "subtitle": "descrição breve do que será testado",
      "questions": [
        {
          "id": "q1",
          "prompt": "a pergunta ou situação completa e detalhada apresentada ao candidato (OBRIGATÓRIO, nunca vazio)",
          "context": "contexto adicional que o candidato precisa saber (pode ser vazio)",
          "write_guidance": "para perguntas write: instruções claras sobre o que escrever (vazio para choice)",
          "character": { "name": "nome do personagem", "role": "cargo", "tone": "tom de voz" },
          "multiple_choice": [
            { "id": "a", "text": "texto da opção", "level": "high|medium_high|medium_low|low", "competencies": ["competência demonstrada"] }
          ],
          "expected_competencies": ["competências avaliadas nesta pergunta"],
          "evaluation_criteria": "critérios detalhados de avaliação"
        }
      ]
    }
  ]
}

Para perguntas "write", o campo "multiple_choice" deve ser um array vazio [].`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash',
  });

  // Parse JSON from string response (no rigid schema — AI has freedom to generate full structure)
  let parsed;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
  } catch (e) {
    console.error('Failed to parse simulation JSON, using fallback:', e);
    parsed = null;
  }

  // Validate and fix: ensure every phase has questions
  if (parsed?.phases?.length) {
    parsed.phases = parsed.phases.map((ph, pi) => {
      if (!ph.questions || ph.questions.length === 0) {
        // Fallback: generate questions from job situations/problems
        ph.questions = generateFallbackQuestions(ph.type, job, pi);
      }
      // Ensure each question has required fields
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
    // Total fallback: generate all phases from scratch
    parsed = generateFallbackPhases(job);
  }

  return parsed;
}

// Fallback: generate questions from job situations and problems when AI returns empty
function generateFallbackQuestions(type, job, phaseIdx) {
  const situations = job.situations || [];
  const problems = job.company_problems || '';
  const competencies = job.competencies || ['Comunicação', 'Resolução de Problemas'];
  const productName = job.product || 'o produto';
  const clientName = job.client || 'o cliente';

  const baseSituation = situations[phaseIdx % situations.length] ||
    `A empresa enfrenta um desafio com ${productName} envolvendo ${clientName}. ${problems ? 'Contexto: ' + problems : ''}`;

  if (type === 'choice') {
    return [{
      id: `q_${phaseIdx}_0`,
      prompt: `Situação: ${baseSituation}\n\nQual seria a melhor abordagem para resolver esta situação?`,
      context: '',
      character: null,
      multiple_choice: [
        { id: 'a', text: 'Abordar diretamente o problema com o cliente, buscando uma solução imediata.', level: 'high', competencies: [competencies[0]] },
        { id: 'b', text: 'Encaminhar para a equipe responsável e acompanhar o caso.', level: 'medium_high', competencies: [competencies[0]] },
        { id: 'c', text: 'Documentar o caso e aguardar orientação da liderança.', level: 'medium_low', competencies: [competencies[0]] },
        { id: 'd', text: 'Responder com uma solução genérica padronizada.', level: 'low', competencies: [competencies[0]] },
      ],
      expected_competencies: competencies,
      evaluation_criteria: 'Capacidade de identificar a melhor abordagem para a situação.',
    }];
  }

  return [{
    id: `q_${phaseIdx}_0`,
    prompt: `Situação: ${baseSituation}\n\nComo você lidaria com esta situação? Explique seu raciocínio passo a passo.`,
    context: '',
    write_guidance: `Descreva detalhadamente: 1) Como você analisaria a situação, 2) Que perguntas faria, 3) Que solução proporia, 4) Como mediria o sucesso da sua abordagem.`,
    character: null,
    multiple_choice: [],
    expected_competencies: competencies,
    evaluation_criteria: 'Profundidade do raciocínio, especificidade da resposta e alinhamento com as competências esperadas.',
  }];
}

// Total fallback: generate all 4 phases from scratch
function generateFallbackPhases(job) {
  const situations = job.situations || [];
  const problems = job.company_problems || '';
  const competencies = job.competencies || ['Comunicação', 'Resolução de Problemas'];
  const productName = job.product || 'o produto';
  const clientName = job.client || 'o cliente';

  // Build 7 different situations from job data
  const allSituations = [];
  if (situations.length > 0) {
    situations.forEach(s => allSituations.push(s));
  }
  // Add problem-based situations
  if (problems) {
    allSituations.push(`A empresa enfrenta: ${problems}. Como você abordaria esse desafio no seu primeiro mês?`);
    allSituations.push(`Um cliente relatou insatisfação relacionada a: ${problems}. Como você resolveria?`);
  }
  // Fill remaining with generic but specific situations
  while (allSituations.length < 7) {
    allSituations.push(`Cenário ${allSituations.length + 1}: Uma situação inesperada surge com ${clientName} sobre ${productName}. Como você age?`);
  }

  return {
    virtual_company_profile: `${job.company_name || 'A empresa'} atua no setor de ${job.sector || 'tecnologia'} oferecendo ${productName} para ${clientName}. ${problems ? 'Enfrenta desafios como: ' + problems + '.' : ''} A cultura valoriza proatividade e resultados.`,
    phases: [
      {
        id: 'phase_1', type: 'choice', title: 'Decisões Rápidas', subtitle: 'Avalia tomada de decisão',
        questions: [
          {
            id: 'q1_0', prompt: `Situação: ${allSituations[0]}\n\nQual a melhor abordagem?`,
            context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Agir imediatamente, assumindo responsabilidade.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Consultar a equipe antes de decidir.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Esperar mais informações antes de agir.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Seguir o processo padrão sem adaptação.', level: 'low', competencies: [competencies[0]] },
            ],
            expected_competencies: competencies, evaluation_criteria: 'Tomada de decisão adequada ao contexto.',
          },
          {
            id: 'q1_1', prompt: `Situação: ${allSituations[1]}\n\nQual opção escolheria?`,
            context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Priorizar a relação com o cliente acima de tudo.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Equilibrar relação e processo.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Seguir o processo rigidamente.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Evitar o conflito.', level: 'low', competencies: [competencies[0]] },
            ],
            expected_competencies: competencies, evaluation_criteria: 'Equilíbrio entre empatia e processo.',
          },
        ],
      },
      {
        id: 'phase_2', type: 'write', title: 'Resposta Estratégica', subtitle: 'Avalia raciocínio estratégico',
        questions: [
          {
            id: 'q2_0', prompt: `Situação: ${allSituations[2]}\n\nComo você lidaria com esta situação?`,
            context: '', write_guidance: 'Descreva: 1) Sua análise da situação, 2) As ações que tomaria, 3) Como mediria o resultado.',
            character: null, multiple_choice: [],
            expected_competencies: competencies, evaluation_criteria: 'Profundidade do raciocínio.',
          },
          {
            id: 'q2_1', prompt: `Situação: ${allSituations[3]}\n\nExplique sua abordagem detalhadamente.`,
            context: '', write_guidance: 'Detalhe seu plano de ação passo a passo, incluindo como envolveria a equipe.',
            character: null, multiple_choice: [],
            expected_competencies: competencies, evaluation_criteria: 'Clareza e especificidade.',
          },
        ],
      },
      {
        id: 'phase_3', type: 'choice', title: 'Cenário Crítico', subtitle: 'Avalia priorização',
        questions: [
          {
            id: 'q3_0', prompt: `Situação: ${allSituations[4]}\n\nQual a melhor decisão?`,
            context: '', character: null,
            multiple_choice: [
              { id: 'a', text: 'Resolver a causa raiz do problema.', level: 'high', competencies: [competencies[0]] },
              { id: 'b', text: 'Conter o problema e depois investigar.', level: 'medium_high', competencies: [competencies[0]] },
              { id: 'c', text: 'Escalar imediatamente para a liderança.', level: 'medium_low', competencies: [competencies[0]] },
              { id: 'd', text: 'Esperar o problema se resolver sozinho.', level: 'low', competencies: [competencies[0]] },
            ],
            expected_competencies: competencies, evaluation_criteria: 'Priorização adequada.',
          },
        ],
      },
      {
        id: 'phase_4', type: 'write', title: 'Plano de Ação', subtitle: 'Avalia planejamento',
        questions: [
          {
            id: 'q4_0', prompt: `Situação: ${allSituations[5]}\n\nDescreva como você resolveria.`,
            context: '', write_guidance: 'Apresente um plano completo: diagnóstico, ações, prazos e métricas de sucesso.',
            character: null, multiple_choice: [],
            expected_competencies: competencies, evaluation_criteria: 'Capacidade de planejamento.',
          },
          {
            id: 'q4_1', prompt: `Situação: ${allSituations[6]}\n\nComo você abordaria este desafio?`,
            context: '', write_guidance: 'Explique sua estratégia, como comunicaria aos stakeholders e que resultados esperaria.',
            character: null, multiple_choice: [],
            expected_competencies: competencies, evaluation_criteria: 'Visão estratégica.',
          },
        ],
      },
    ],
  };
}

// Analyze a single candidate response — RIGOROUS, detailed, with AI detection
export async function analyzeQuestionResponse(question, answer, isChoice, previousResponses) {
  const choiceObj = isChoice ? (question.multiple_choice || []).find(c => c.id === answer) : null;
  const choiceText = choiceObj?.text || '';

  const prompt = `Você é o TalentOS, uma IA que analisa RIGOROSAMENTE respostas de candidatos em simulações de trabalho. Sua análise é a evidência que a empresa usa para contratar — seja crítico, justo e específico.

PERGUNTA:
- Enunciado: ${question.prompt}
${question.context ? `- Contexto: ${question.context}` : ''}
${question.character?.name ? `- Personagem: ${question.character.name} (${question.character.role})` : ''}
- Competências esperadas: ${(question.expected_competencies || []).join(", ")}
- Critérios de avaliação: ${question.evaluation_criteria || 'Não especificados'}

RESPOSTA DO CANDIDATO:
${isChoice ? `- Opção escolhida: ${choiceText} (nível: ${choiceObj?.level || "N/A"})` : `- Resposta escrita: """${answer || "Sem resposta"}"""`}

RESPOSTAS ANTERIORES (para avaliar consistência):
${(previousResponses || []).map((r, i) => `  ${i + 1}. ${r}`).join("\n") || "Nenhuma"}

ANÁLISE MINUCIOSA — seja RIGOROSO:

1. COMPETÊNCIAS: Para CADA competência esperada, determine se foi demonstrada (✓), parcialmente (~), ou não (✗). Pontue 0-100 com justificativa e cite um trecho exato da resposta.

2. DETECÇÃO DE IA (apenas para respostas escritas): Analise se a resposta parece gerada por IA:
   - Linguagem excessivamente formal ou templated
   - Estrutura perfeita demais para uma resposta curta
   - Vocabulário fora do esperado para o cargo/nível
   - Ausência de voz pessoal
   - Generalidades sem especificidade
   - Dê confiança 0-100 e liste indicadores

3. QUALIDADE: Especificidade (0-100), Profundidade (0-100), Autenticidade (0-100).

Seja CRÍTICO. Uma resposta genérica deve pontuar BAIXO, mesmo se "soa bem".

Retorne JSON:
{
  "competency_scores": {
    "nome_da_competencia": {
      "score": 0-100,
      "evidence": "✓|~|✗",
      "justification": "justificativa detalhada",
      "evidence_quote": "trecho exato citado da resposta"
    }
  },
  "ai_detection": {
    "is_ai_generated": true|false,
    "confidence": 0-100,
    "indicators": ["indicador 1", "indicador 2"],
    "analysis": "análise detalhada"
  },
  "response_quality": {
    "specificity": 0-100,
    "depth": 0-100,
    "authenticity": 0-100,
    "notes": "observações"
  },
  "response_score": 0-100,
  "detailed_feedback": "feedback construtivo — o que foi bem, o que faltou, como melhorar"
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
      return {
        competency_scores: {},
        ai_detection: { is_ai_generated: false, confidence: 0, indicators: [], analysis: 'Análise indisponível.' },
        response_quality: { specificity: 0, depth: 0, authenticity: 0, notes: 'Análise indisponível.' },
        response_score: 0,
        detailed_feedback: 'Análise indisponível para esta resposta.',
      };
    }
  }
  return result;
}

// Generate comprehensive final assessment with personality analysis
export async function generateFinalAssessment(candidateName, job, allResponses, discResults) {
  const discInfo = discResults
    ? `PERFIL COMPORTAMENTAL DISC:
- Perfil dominante: ${discResults.dominant} (${discResults.scores[discResults.dominant]}%)
- Perfil secundário: ${discResults.secondary} (${discResults.scores[discResults.secondary]}%)
- Scores: D=${discResults.scores.D}%, I=${discResults.scores.I}%, S=${discResults.scores.S}%, C=${discResults.scores.C}%
- Código do perfil: ${discResults.profile_code}`
    : 'Perfil DISC não disponível.';

  const prompt = `Você é o TalentOS, gerando uma avaliação final COMPLETA, RIGOROSA e DETALHADA de competências e personalidade.

CANDIDATO: ${candidateName}
VAGA: ${job.title} (${job.role})
SETOR: ${job.sector}
PROBLEMAS DA EMPRESA: ${job.company_problems || 'Não especificados'}
COMPETÊNCIAS AVALIADAS: ${(job.competencies || []).join(", ")}

${discInfo}

RESPOSTAS E ANÁLISES DE CADA PERGUNTA (todas as evidências):
${JSON.stringify(allResponses, null, 2)}

Gere uma avaliação final RIGOROSA, COMPLETA e DETALHADA:

1. SCORES FINAIS: Para cada competência, agregue os scores de todas as perguntas. Pondere consistência.

2. SKILL DNA: Top 3 fortalezas e Top 3 áreas de desenvolvimento, com evidência específica citada das respostas.

3. SKILL SCORE GERAL (0-100): média ponderada considerando consistência.

4. SKILL GRAPH: score final de cada competência.

5. RECOMENDAÇÃO: Contratação Forte / Contratar / Talvez / Não Recomendado / Não Contratar.

6. RESUMO EXECUTIVO: 3-5 parágrafos detalhados sobre a performance do candidato.

7. ANÁLISE DE PERSONALIDADE (2-3 parágrafos): Descreva detalhadamente as características da pessoa, seu estilo de trabalho, como se comunica, como lida com pressão, como trabalha em equipe. Use o perfil DISC como base, mas enriqueça com evidências das respostas. Seja específico sobre quem é essa pessoa profissionalmente.

8. PONTOS FORTES DETALHADOS (1-2 parágrafos): Liste e explique os pontos fortes do candidato com exemplos concretos das respostas.

9. PONTOS FRACOS DETALHADOS (1-2 parágrafos): Liste e explique os pontos fracos e áreas de melhoria, com sugestões construtivas.

10. ESTILO DE TRABALHO (1 parágrafo): Como essa pessoa trabalha no dia a dia, que ambiente prefere, como se relaciona com colegas e líderes.

11. Se houve detecções de IA, reduza a confiança e mencione explicitamente.

Retorne JSON:
{
  "skill_scores": { "competencia": 0-100 },
  "skill_dna": {
    "strengths": [{ "competency": "nome", "score": 0-100, "evidence": "evidência específica" }],
    "growth_areas": [{ "competency": "nome", "score": 0-100, "evidence": "evidência específica" }]
  },
  "overall_score": 0-100,
  "recommendation": "Contratação Forte|Contratar|Talvez|Não Recomendado|Não Contratar",
  "summary": "resumo executivo detalhado em 3-5 parágrafos",
  "skill_graph": { "competencia": 0-100 },
  "personality_analysis": "análise detalhada de personalidade em 2-3 parágrafos",
  "work_style": "estilo de trabalho em 1 parágrafo",
  "strengths_detail": "pontos fortes detalhados em 1-2 parágrafos",
  "weaknesses_detail": "pontos fracos detalhados em 1-2 parágrafos"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash',
  });

  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
      return {
        skill_scores: parsed.skill_scores || {},
        skill_dna: parsed.skill_dna || { strengths: [], growth_areas: [] },
        overall_score: parsed.overall_score || 0,
        recommendation: parsed.recommendation || 'Talvez',
        summary: parsed.summary || '',
        skill_graph: parsed.skill_graph || parsed.skill_scores || {},
        personality_analysis: parsed.personality_analysis || '',
        work_style: parsed.work_style || '',
        strengths_detail: parsed.strengths_detail || '',
        weaknesses_detail: parsed.weaknesses_detail || '',
      };
    } catch (e) {
      console.error('Failed to parse final assessment JSON:', e);
      return {
        skill_scores: {},
        skill_dna: { strengths: [], growth_areas: [] },
        overall_score: 0,
        recommendation: 'Talvez',
        summary: 'Avaliação indisponível.',
        skill_graph: {},
        personality_analysis: '',
        work_style: '',
        strengths_detail: '',
        weaknesses_detail: '',
      };
    }
  }
  return result;
}