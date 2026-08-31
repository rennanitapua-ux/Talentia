// SkillOS — AI Engine
// Rigorous AI analysis for competency-based hiring simulations
import { base44 } from '@/api/base44Client';

// Generate simulation scenarios from a job definition
export async function generateSimulationScenarios(job) {
  const prompt = `Você é o SkillOS, uma IA que cria simulações de trabalho realistas para contratação baseada em competências.

DADOS DA VAGA:
- Setor: ${job.sector}
- Cargo: ${job.role}
- Contexto da empresa: ${job.company_context}
- Produto/Serviço: ${job.product}
- Cliente típico: ${job.client}
- Competências a avaliar: ${(job.competencies || []).join(", ")}
- Situações reais fornecidas pela empresa:
${(job.situations || []).map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

Para CADA situação, crie um cenário de simulação detalhado e realista que:
1. Apresente a situação como uma mensagem real de um personagem (colega, cliente, gestor) — com nome, cargo e tom de voz apropriado
2. Forneça 4 opções de múltipla escolha, cada uma demonstrando um nível diferente de competência (alta, média-alta, média-baixa, baixa)
3. Inclua uma pergunta de follow-up aberta que aprofunda a situação
4. Defina quais competências cada opção demonstra e em que nível
5. Defina critérios de avaliação claros para a resposta aberta

Seja RIGOROSO: as opções devem ser plausíveis mas distinguíveis — uma pessoa competente deve conseguir identificar a melhor resposta, mas nenhuma deve ser óbvia demais. As situações devem ser desafiadoras e realistas.

Retorne JSON com esta estrutura EXATA:
{
  "virtual_company_profile": "perfil da empresa virtual gerada (cultura, desafios, mercado) — 2-3 parágrafos",
  "scenarios": [
    {
      "id": "scenario_1",
      "situation": "situação original",
      "character": { "name": "nome", "role": "cargo", "tone": "tom" },
      "opening_message": "mensagem do personagem apresentando a situação (como um chat real)",
      "context": "contexto adicional para o candidato",
      "multiple_choice": [
        { "id": "a", "text": "texto da opção", "level": "high|medium_high|medium_low|low", "competencies": ["competência demonstrada"] }
      ],
      "follow_up_question": "pergunta aberta de aprofundamento",
      "expected_competencies": ["competências avaliadas nesta situação"],
      "evaluation_criteria": "critérios detalhados de avaliação"
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

// Analyze a single candidate response — RIGOROUS and detailed
export async function analyzeResponse(scenario, choiceId, openResponse, previousResponses) {
  const choice = scenario.multiple_choice?.find(c => c.id === choiceId);
  const prompt = `Você é o SkillOS, uma IA que analisa RIGOROSAMENTE respostas de candidatos em simulações de trabalho.

CENÁRIO:
- Situação: ${scenario.situation}
- Personagem: ${scenario.character?.name} (${scenario.character?.role})
- Mensagem recebida: ${scenario.opening_message}
- Pergunta de follow-up: ${scenario.follow_up_question}
- Competências esperadas: ${(scenario.expected_competencies || []).join(", ")}
- Critérios de avaliação: ${scenario.evaluation_criteria}

RESPOSTA DO CANDIDATO:
- Opção escolhida: ${choice?.text || "Nenhuma"} (nível: ${choice?.level || "N/A"})
- Resposta aberta: "${openResponse || "Sem resposta"}"

RESPOSTAS ANTERIORES (para contexto de consistência):
${(previousResponses || []).map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

ANALISE MINUCIOSAMENTE:
1. Para CADA competência esperada, determine se foi demonstrada (✓), parcialmente demonstrada (~) ou não demonstrada (✗)
2. Forneça evidência ESPECÍFICA da resposta (cite trechos exatos) para cada julgamento
3. Pontue cada competência de 0 a 100 com justificativa detalhada
4. DETECTE se a resposta aberta parece gerada por IA — procure por: linguagem excessivamente formal, frases genéricas/templated, falta de voz pessoal, estrutura perfeita demais, hedging ("é importante notar", "vale ressaltar"), ausência de especificidade, vocabulário fora do esperado para o cargo
5. Forneça feedback detalhado e construtivo

Seja CRÍTICO e JUSTO. Não inflacione notas. Uma resposta genérica deve pontuar baixo em especificidade.

Retorne JSON:
{
  "competency_scores": {
    "nome_da_competencia": {
      "score": 0-100,
      "evidence": "✓|~|✗",
      "justification": "justificativa detalhada",
      "evidence_quote": "trecho citado da resposta"
    }
  },
  "ai_detection": {
    "is_ai_generated": true|false,
    "confidence": 0-100,
    "indicators": ["indicador 1", "indicador 2"],
    "analysis": "análise detalhada da detecção"
  },
  "response_score": 0-100,
  "detailed_feedback": "feedback abrangente e específico"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        competency_scores: { type: "object" },
        ai_detection: { type: "object" },
        response_score: { type: "number" },
        detailed_feedback: { type: "string" }
      }
    }
  });
  return result;
}

// Generate comprehensive final assessment
export async function generateFinalAssessment(candidateName, job, allResponses) {
  const prompt = `Você é o SkillOS, gerando uma avaliação final COMPLETA de competências.

CANDIDATO: ${candidateName}
VAGA: ${job.title} (${job.role})
COMPETÊNCIAS AVALIADAS: ${(job.competencies || []).join(", ")}

RESPOSTAS E ANÁLISES DE CADA CENÁRIO:
${JSON.stringify(allResponses, null, 2)}

Gere uma avaliação final rigorosa:
1. Score final de cada competência (agregado, 0-100) — pondere consistência entre cenários
2. Skill DNA: top 3 fortalezas e top 3 áreas de desenvolvimento, cada uma com evidência
3. Skill Score geral (0-100)
4. Skill Graph: score de cada competência para visualização
5. Recomendação de contratação
6. Resumo executivo detalhado (3-5 parágrafos)
7. Considere as detecções de IA — se houve múltiplas flags, reduza a confiança na avaliação

Retorne JSON:
{
  "skill_scores": { "competencia": 0-100 },
  "skill_dna": {
    "strengths": [{ "competency": "nome", "score": 0-100, "evidence": "evidência" }],
    "growth_areas": [{ "competency": "nome", "score": 0-100, "evidence": "evidência" }]
  },
  "overall_score": 0-100,
  "recommendation": "Contratação Forte|Contratar|Talvez|Não Recomendado|Não Contratar",
  "summary": "resumo executivo detalhado",
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