// SkillOS — AI Engine v2
// Rigorous AI analysis for competency-based hiring simulations
// Questions generated according to company problems, not generic templates
import { base44 } from '@/api/base44Client';

// Generate simulation scenarios from a job definition — tailored to company problems
export async function generateSimulationScenarios(job) {
  const prompt = `Você é o SkillOS, uma IA que cria simulações de trabalho ULTRA-REALISTAS para contratação baseada em competências.

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

INSTRUÇÕES CRÍTICAS PARA GERAÇÃO:
1. Cada cenário deve ser ÚNICO e específico para ESTA empresa — nada genérico. Use o nome do produto, o tipo de cliente e os problemas reais.
2. As perguntas devem refletir os PROBLEMAS reais da empresa — se a empresa tem problema de churn, crie cenários de retenção; se tem problema de vendas, crie cenários de negociação difícil.
3. Cada cenário deve ter um personagem com nome, cargo e personalidade distintos — não repita personagens.
4. As 4 opções de múltipla escolha devem ser plausíveis mas distinguíveis por competência — uma pessoa experiente deve identificar a melhor, mas nenhuma deve ser óbvia demais para um novato.
5. A pergunta de follow-up aberta deve aprofundar o pensamento estratégico, não apenas pedir justificativa.
6. Varie o TIPO de situação: algumas urgentes, algumas de planejamento, algumas interpessoais, algumas técnicas.
7. Os critérios de avaliação devem ser específicos o suficiente para distinguir respostas genéricas de respostas com pensamento real.

Gere também um perfil da empresa virtual que contextualize a cultura, os desafios do mercado e o momento da empresa.

Retorne JSON com esta estrutura EXATA:
{
  "virtual_company_profile": "perfil da empresa virtual (cultura, desafios de mercado, momento) — 2-3 parágrafos ricos",
  "scenarios": [
    {
      "id": "scenario_1",
      "situation": "situação original adaptada",
      "scenario_type": "urgente|planejamento|interpessoal|tecnica|etica",
      "character": { "name": "nome", "role": "cargo", "tone": "tom de voz e personalidade" },
      "opening_message": "mensagem do personagem apresentando a situação como um chat real — inclua detalhes específicos do produto/cliente",
      "context": "contexto adicional que o candidato precisa saber",
      "multiple_choice": [
        { "id": "a", "text": "texto da opção", "level": "high|medium_high|medium_low|low", "competencies": ["competência demonstrada"] }
      ],
      "follow_up_question": "pergunta aberta de aprofundamento que exige pensamento estratégico real",
      "expected_competencies": ["competências avaliadas nesta situação"],
      "evaluation_criteria": "critérios detalhados e específicos de avaliação — o que distingue uma resposta excelente de uma genérica"
    }
  ]
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        virtual_company_profile: { type: "string" },
        scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              situation: { type: "string" },
              scenario_type: { type: "string" },
              character: { type: "object" },
              opening_message: { type: "string" },
              context: { type: "string" },
              multiple_choice: { type: "array" },
              follow_up_question: { type: "string" },
              expected_competencies: { type: "array" },
              evaluation_criteria: { type: "string" }
            }
          }
        }
      }
    }
  });
  return result;
}

// Analyze a single candidate response — RIGOROUS, detailed, with AI detection
export async function analyzeResponse(scenario, choiceId, openResponse, previousResponses) {
  const choice = scenario.multiple_choice?.find(c => c.id === choiceId);
  const prompt = `Você é o SkillOS, uma IA que analisa RIGOROSAMENTE respostas de candidatos em simulações de trabalho. Sua análise é a evidência que a empresa usa para contratar — seja crítico, justo e específico.

CENÁRIO:
- Situação: ${scenario.situation}
- Tipo: ${scenario.scenario_type || 'geral'}
- Personagem: ${scenario.character?.name} (${scenario.character?.role}) — tom: ${scenario.character?.tone}
- Mensagem recebida: ${scenario.opening_message}
- Pergunta de follow-up: ${scenario.follow_up_question}
- Competências esperadas: ${(scenario.expected_competencies || []).join(", ")}
- Critérios de avaliação: ${scenario.evaluation_criteria}

RESPOSTA DO CANDIDATO:
- Opção escolhida: ${choice?.text || "Nenhuma"} (nível avaliado: ${choice?.level || "N/A"})
- Resposta aberta: """${openResponse || "Sem resposta"}"""

RESPOSTAS ANTERIORES (para avaliar consistência e evolução):
${(previousResponses || []).map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

ANÁLISE MINUCIOSA — seja RIGOROSO:

1. COMPETÊNCIAS: Para CADA competência esperada:
   - Determine: demonstrada (✓), parcialmente demonstrada (~), ou não demonstrada (✗)
   - Cite um TRECHO EXATO da resposta como evidência
   - Pontue de 0-100 com justificativa detalhada
   - Diferencie: resposta que demonstra competência real vs resposta que apenas "soa bem"

2. DETECÇÃO DE IA — analise a resposta aberta minuciosamente:
   - Linguagem excessivamente formal ou templated ("é importante notar", "vale ressaltar", "em suma")
   - Estrutura perfeita demais (introdução, desenvolvimento, conclusão em resposta curta)
   - Vocabulário fora do esperado para o cargo/nível
   - Ausência de voz pessoal ou opinião própria
   - Hedging e generalidades sem especificidade
   - Resposta que poderia ser copiada de qualquer candidato (falta de contexto específico)
   - Consistência entre a escolha múltipla e a resposta aberta
   - Dê uma confiança de 0-100 e liste indicadores específicos

3. QUALIDADE DA RESPOSTA:
   - Especificidade: a resposta usa detalhes do cenário ou é genérica?
   - Profundidade: demonstra pensamento estratégico ou apenas reativo?
   - Autenticidade: soa como uma pessoa real ou como um template?

Seja CRÍTICO. Uma resposta genérica deve pontuar BAIXO em especificidade, mesmo se "soa bem". Não inflacione notas.

Retorne JSON:
{
  "competency_scores": {
    "nome_da_competencia": {
      "score": 0-100,
      "evidence": "✓|~|✗",
      "justification": "justificativa detalhada e específica",
      "evidence_quote": "trecho exato citado da resposta"
    }
  },
  "ai_detection": {
    "is_ai_generated": true|false,
    "confidence": 0-100,
    "indicators": ["indicador específico 1", "indicador específico 2"],
    "analysis": "análise detalhada explicando o raciocínio"
  },
  "response_quality": {
    "specificity": 0-100,
    "depth": 0-100,
    "authenticity": 0-100,
    "notes": "observações sobre a qualidade"
  },
  "response_score": 0-100,
  "detailed_feedback": "feedback abrangente, específico e construtivo — diga o que foi bem, o que faltou, e como melhorar"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        competency_scores: { type: "object" },
        ai_detection: { type: "object" },
        response_quality: { type: "object" },
        response_score: { type: "number" },
        detailed_feedback: { type: "string" }
      }
    }
  });
  return result;
}

// Generate comprehensive final assessment
export async function generateFinalAssessment(candidateName, job, allResponses) {
  const prompt = `Você é o SkillOS, gerando uma avaliação final COMPLETA e RIGOROSA de competências.

CANDIDATO: ${candidateName}
VAGA: ${job.title} (${job.role})
SETOR: ${job.sector}
PROBLEMAS DA EMPRESA: ${job.company_problems || 'Não especificados'}
COMPETÊNCIAS AVALIADAS: ${(job.competencies || []).join(", ")}

RESPOSTAS E ANÁLISES DE CADA CENÁRIO (todas as evidências):
${JSON.stringify(allResponses, null, 2)}

Gere uma avaliação final rigorosa e completa:

1. SCORES FINAIS: Para cada competência, aggregate os scores de todos os cenários. Pondere consistência — uma competência demonstrada em todos os cenários deve pontuar mais alto que uma demonstrada em apenas um.

2. SKILL DNA: 
   - Top 3 fortalezas com evidência específica de qual cenário
   - Top 3 áreas de desenvolvimento com evidência específica

3. SKILL SCORE GERAL (0-100): média ponderada considerando consistência

4. SKILL GRAPH: score final de cada competência

5. RECOMENDAÇÃO: Contratação Forte / Contratar / Talvez / Não Recomendado / Não Contratar

6. RESUMO EXECUTIVO: 3-5 parágrafos detalhados cobrindo:
   - Como o candidato se saiu nos cenários mais desafiadores
   - Padrões de comportamento observados
   - Riscos e alertas (incluindo detecções de IA)
   - Potencial de crescimento
   - Recomendação final justificada

7. Se houve múltiplas detecções de IA, reduza a confiança na avaliação e mencione explicitamente.

Retorne JSON:
{
  "skill_scores": { "competencia": 0-100 },
  "skill_dna": {
    "strengths": [{ "competency": "nome", "score": 0-100, "evidence": "evidência específica com referência ao cenário" }],
    "growth_areas": [{ "competency": "nome", "score": 0-100, "evidence": "evidência específica com referência ao cenário" }]
  },
  "overall_score": 0-100,
  "recommendation": "Contratação Forte|Contratar|Talvez|Não Recomendado|Não Contratar",
  "summary": "resumo executivo detalhado em 3-5 parágrafos",
  "skill_graph": { "competencia": 0-100 }
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        skill_scores: { type: "object" },
        skill_dna: { type: "object" },
        overall_score: { type: "number" },
        recommendation: { type: "string" },
        summary: { type: "string" },
        skill_graph: { type: "object" }
      }
    }
  });
  return result;
}