// TalentOS — AI Engine v4
// Deep per-response analysis + comprehensive final assessment report
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
5. Para perguntas "write": o campo "prompt" DEVE conter a situação/pergunta completa e detalhada que o candidato precisa responder. O campo "write_guidance" DEVE conter instruções claras sobre o que o candidato deve escrever. A pergunta deve exigir pensamento estratégico real, não apenas justificativa.
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

function generateFallbackPhases(job) {
  const situations = job.situations || [];
  const problems = job.company_problems || '';
  const competencies = job.competencies || ['Comunicação', 'Resolução de Problemas'];
  const productName = job.product || 'o produto';
  const clientName = job.client || 'o cliente';

  const allSituations = [];
  if (situations.length > 0) {
    situations.forEach(s => allSituations.push(s));
  }
  if (problems) {
    allSituations.push(`A empresa enfrenta: ${problems}. Como você abordaria esse desafio no seu primeiro mês?`);
    allSituations.push(`Um cliente relatou insatisfação relacionada a: ${problems}. Como você resolveria?`);
  }
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

// ============================================================================
// DEEP PER-RESPONSE ANALYSIS
// Analyzes each written response with full evidence-based rigor
// ============================================================================
export async function analyzeQuestionResponse(question, answer, isChoice, previousResponses) {
  const choiceObj = isChoice ? (question.multiple_choice || []).find(c => c.id === answer) : null;
  const choiceText = choiceObj?.text || '';

  const prompt = `Você é o TalentOS, uma IA de avaliação de candidatos que faz análise RIGOROSA, EVIDÊNCIADA e TRANSPARENTE de respostas em simulações de trabalho. Sua análise é usada por recrutadores para decisões de contratação.

PERGUNTA AVALIADA:
- Enunciado: ${question.prompt}
${question.context ? `- Contexto: ${question.context}` : ''}
${question.character?.name ? `- Personagem: ${question.character.name} (${question.character.role})` : ''}
- Competências esperadas: ${(question.expected_competencies || []).join(", ")}
- Critérios de avaliação: ${question.evaluation_criteria || 'Não especificados'}

RESPOSTA DO CANDIDATO:
${isChoice ? `- Opção escolhida: ${choiceText} (nível: ${choiceObj?.level || "N/A"})` : `- Resposta escrita: """${answer || "Sem resposta"}"""`}

RESPOSTAS ANTERIORES (para avaliar consistência):
${(previousResponses || []).map((r, i) => `  ${i + 1}. ${r}`).join("\n") || "Nenhuma"}

INSTRUÇÕES DE ANÁLISE — seja RIGOROSA, ESPECÍFICA e EVIDÊNCIADA:

1. COMPETÊNCIAS (competency_scores): Para CADA competência esperada, avalie se foi demonstrada. Pontue 0-100. Use evidence: "✓" (demonstrada), "~" (parcial), "✗" (não demonstrada). Cite um trecho EXATO da resposta como evidence_quote. A justification deve explicar o raciocínio.

2. HABILIDADES IDENTIFICADAS (skills_identified): Extraia habilidades REAIS da resposta — não as invente.
   - hard_skills: conhecimentos técnicos, ferramentas, tecnologias, métodos específicos. Para cada uma, cite o trecho da resposta que evidencia a habilidade.
   - soft_skills: comunicação, liderança, trabalho em equipe, organização, adaptabilidade, pensamento crítico, etc. Para cada uma, cite o trecho que evidencia.
   NÃO atribua uma habilidade apenas porque o candidato usou a palavra — procure COMPORTAMENTOS ou SITUAÇÕES que demonstrem a habilidade.

3. CADEIA DE EVIDÊNCIAS (evidence_chain): Para cada habilidade identificada, mostre: Habilidade → Evidência (trecho exato) → Interpretação. Isso torna a análise transparente.

4. PROFUNDIDADE DA RESPOSTA (response_depth): Classifique em um dos níveis:
   - "superficial": resposta genérica, sem detalhes
   - "explanation": apresenta alguma explicação
   - "examples": inclui exemplos concretos
   - "context_results": traz contexto e resultados
   - "practical_experience": demonstra experiência prática real
   Explique o motivo da classificação no campo "reasoning".

5. MÉTRICAS DE QUALIDADE (quality_metrics): Avalie 0-100:
   - clarity: clareza da comunicação
   - communication: capacidade de expressar ideias
   - reasoning: capacidade de raciocínio lógico
   - problem_solving: capacidade de resolução de problemas
   - coherence: coerência entre pergunta e resposta (0-100)
   - has_concrete_examples: true|false

6. PONTOS POSITIVOS (positive_points): Liste 2-4 aspectos positivos específicos da resposta.

7. PONTOS A INVESTIGAR (points_to_investigate): Liste 2-4 aspectos que precisam de mais esclarecimento na entrevista.

8. DETECÇÃO DE IA (ai_detection): Analise se a resposta parece gerada por IA externa:
   - Linguagem excessivamente formal ou templated
   - Estrutura perfeita demais
   - Vocabulário fora do esperado para o cargo/nível
   - Ausência de voz pessoal
   - Generalidades sem especificidade
   Dê confiança 0-100 e liste indicadores.

Seja CRÍTICO. Uma resposta genérica deve pontuar BAIXO. Diferencie claramente: fato observado vs interpretação da IA vs informação não comprovada.

Retorne JSON:
{
  "competency_scores": {
    "nome_da_competencia": {
      "score": 0,
      "evidence": "✓|~|✗",
      "justification": "justificativa detalhada",
      "evidence_quote": "trecho exato citado da resposta"
    }
  },
  "skills_identified": {
    "hard_skills": [{ "name": "nome da habilidade", "evidence": "trecho que evidencia" }],
    "soft_skills": [{ "name": "nome da habilidade", "evidence": "trecho que evidencia" }]
  },
  "evidence_chain": [{ "skill": "habilidade", "evidence_quote": "trecho", "interpretation": "interpretação" }],
  "response_depth": { "level": "superficial|explanation|examples|context_results|practical_experience", "reasoning": "motivo da classificação" },
  "quality_metrics": { "clarity": 0, "communication": 0, "reasoning": 0, "problem_solving": 0, "coherence": 0, "has_concrete_examples": true },
  "positive_points": ["ponto positivo 1", "ponto positivo 2"],
  "points_to_investigate": ["ponto a investigar 1", "ponto a investigar 2"],
  "ai_detection": { "is_ai_generated": false, "confidence": 0, "indicators": [], "analysis": "análise detalhada" },
  "response_quality": { "specificity": 0, "depth": 0, "authenticity": 0, "notes": "observações" },
  "response_score": 0,
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
// Aggregates all responses into a professional intelligence report
// ============================================================================
export async function generateFinalAssessment(candidateName, job, allResponses, discResults) {
  const discInfo = discResults
    ? `PERFIL COMPORTAMENTAL DISC:
- Perfil dominante: ${discResults.dominant} (${discResults.scores[discResults.dominant]}%)
- Perfil secundário: ${discResults.secondary} (${discResults.scores[discResults.secondary]}%)
- Scores: D=${discResults.scores.D}%, I=${discResults.scores.I}%, S=${discResults.scores.S}%, C=${discResults.scores.C}%
- Código do perfil: ${discResults.profile_code}`
    : 'Perfil DISC não disponível.';

  const prompt = `Você é o TalentOS, gerando um RELATÓRIO COMPLETO de inteligência de recrutamento. Este relatório é usado por recrutadores para decidir contratações — seja RIGOROSO, EVIDÊNCIADO, TRANSPARENTE e ESPECÍFICO.

CANDIDATO: ${candidateName}
VAGA: ${job.title} (${job.role})
SETOR: ${job.sector}
PROBLEMAS DA EMPRESA: ${job.company_problems || 'Não especificados'}
COMPETÊNCIAS EXIGIDAS: ${(job.competencies || []).join(", ")}

${discInfo}

RESPOSTAS E ANÁLISES INDIVIDUAIS DE CADA PERGUNTA (todas as evidências):
${JSON.stringify(allResponses, null, 2)}

Gere um RELATÓRIO COMPLETO estruturado:

1. RESUMO DO PERFIL (profile_summary): Síntese objetiva, 2-3 parágrafos, do que as respostas demonstram sobre o candidato.

2. HABILIDADES IDENTIFICADAS:
   - hard_skills: Extraia TODAS as hard skills demonstradas nas respostas. Para cada uma: { name, evidence (trecho da resposta que evidencia) }. NÃO invente habilidades — só inclua as que têm evidência real.
   - soft_skills: Extraia TODAS as soft skills demonstradas. Para cada uma: { name, evidence }. Baseie-se em comportamentos, não em palavras-chave.

3. SCORES FINAIS (skill_scores): Para cada competência exigida pela vaga, agregue os scores de todas as perguntas. Pondere consistência e profundidade.

4. SKILL DNA (skill_dna): Top 3 fortalezas e Top 3 áreas de desenvolvimento, cada uma com evidence específica citada das respostas.

5. SKILL SCORE GERAL (overall_score): 0-100, média ponderada considerando consistência.

6. SKILL GRAPH (skill_graph): Score final de cada competência.

7. RECOMENDAÇÃO (recommendation): "Contratação Forte" | "Contratar" | "Talvez" | "Não Recomendado" | "Não Contratar".

8. RESUMO EXECUTIVO (summary): 3-5 parágrafos detalhados sobre a performance.

9. ANÁLISE DE PERSONALIDADE (personality_analysis): 2-3 parágrafos detalhados. Descreva quem é essa pessoa profissionalmente: características, estilo de comunicação, como lida com pressão, como trabalha em equipe. Use o DISC como base, enriqueça com evidências das respostas.

10. PONTOS FORTES DETALHADOS (strengths_detail): 1-2 parágrafos. Liste e explique os pontos fortes com exemplos concretos das respostas.

11. PONTOS A INVESTIGAR (weaknesses_detail): 1-2 parágrafos. Liste áreas de melhoria e pontos que precisam de investigação, com sugestões construtivas.

12. ESTILO DE TRABALHO (work_style): 1 parágrafo. Como essa pessoa trabalha no dia a dia, que ambiente prefere.

13. COMPATIBILIDADE COM A VAGA (job_compatibility): Compare as evidências com os requisitos da vaga:
   - demonstrated: competências demonstradas com evidência [{ competency, evidence }]
   - partial: competências parcialmente demonstradas [{ competency, evidence }]
   - not_evidenced: competências não evidenciadas [{ competency, note }]
   - needs_investigation: requisitos que precisam investigação na entrevista [{ competency, reason }]
   NÃO invente competências que não aparecem nas respostas.

14. ANÁLISE DE CONSISTÊNCIA (consistency_analysis): Compare as diferentes respostas. Identifique: informações que se complementam, possíveis contradições, evolução de raciocínio, padrões de comportamento, habilidades que aparecem repetidamente. Se não houver evidência suficiente, indique claramente.

15. PERGUNTAS INTELIGENTES PARA ENTREVISTA (interview_questions): Gere 5-8 perguntas personalizadas para o recrutador. Cada pergunta deve investigar: pontos pouco esclarecidos, habilidades não comprovadas, experiências sem detalhes, possíveis contradições, competências essenciais. Para cada: { question, rationale (por que perguntar isso), competency (competência investigada) }. Seja específico para este candidato — não perguntas genéricas.

TRANSPARÊNCIA: Diferencie claramente fato observado vs interpretação vs informação não comprovada. Evite julgamentos baseados em características pessoais (aparência, idade, gênero, etc.). Concentre-se exclusivamente em competências profissionais.

Se houve detecções de IA, reduza a confiança e mencione explicitamente no resumo.

Retorne JSON:
{
  "profile_summary": "síntese objetiva em 2-3 parágrafos",
  "hard_skills": [{ "name": "nome", "evidence": "evidência" }],
  "soft_skills": [{ "name": "nome", "evidence": "evidência" }],
  "skill_scores": { "competencia": 0 },
  "skill_dna": {
    "strengths": [{ "competency": "nome", "score": 0, "evidence": "evidência" }],
    "growth_areas": [{ "competency": "nome", "score": 0, "evidence": "evidência" }]
  },
  "overall_score": 0,
  "recommendation": "Contratação Forte|Contratar|Talvez|Não Recomendado|Não Contratar",
  "summary": "resumo executivo em 3-5 parágrafos",
  "skill_graph": { "competencia": 0 },
  "personality_analysis": "análise de personalidade em 2-3 parágrafos",
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
  "interview_questions": [{ "question": "pergunta", "rationale": "justificativa", "competency": "competência" }]
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
        profile_summary: parsed.profile_summary || '',
        hard_skills: parsed.hard_skills || [],
        soft_skills: parsed.soft_skills || [],
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
        job_compatibility: parsed.job_compatibility || { demonstrated: [], partial: [], not_evidenced: [], needs_investigation: [] },
        consistency_analysis: parsed.consistency_analysis || '',
        interview_questions: parsed.interview_questions || [],
      };
    } catch (e) {
      console.error('Failed to parse final assessment JSON:', e);
      return getFallbackAssessment();
    }
  }
  return result;
}

function getFallbackAssessment() {
  return {
    profile_summary: 'Avaliação indisponível.',
    hard_skills: [],
    soft_skills: [],
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
    job_compatibility: { demonstrated: [], partial: [], not_evidenced: [], needs_investigation: [] },
    consistency_analysis: '',
    interview_questions: [],
  };
}