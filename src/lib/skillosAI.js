// SkillOS — AI Engine v3
// Phase-based simulation: choice phases and write phases, each with 2-3 questions
import { base44 } from '@/api/base44Client';

// Generate simulation phases from a job definition — tailored to company problems
export async function generateSimulationPhases(job) {
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
    response_json_schema: {
      type: "object",
      properties: {
        virtual_company_profile: { type: "string" },
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              subtitle: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    prompt: { type: "string" },
                    context: { type: "string" },
                    write_guidance: { type: "string" },
                    character: { type: "object" },
                    multiple_choice: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          text: { type: "string" },
                          level: { type: "string" },
                          competencies: { type: "array", items: { type: "string" } }
                        }
                      }
                    },
                    expected_competencies: { type: "array", items: { type: "string" } },
                    evaluation_criteria: { type: "string" }
                  },
                  required: ["id", "prompt"]
                }
              }
            }
          }
        }
      }
    }
  });
  return result;
}

// Analyze a single candidate response — RIGOROUS, detailed, with AI detection
export async function analyzeQuestionResponse(question, answer, isChoice, previousResponses) {
  const choiceObj = isChoice ? (question.multiple_choice || []).find(c => c.id === answer) : null;
  const choiceText = choiceObj?.text || '';

  const prompt = `Você é o SkillOS, uma IA que analisa RIGOROSAMENTE respostas de candidatos em simulações de trabalho. Sua análise é a evidência que a empresa usa para contratar — seja crítico, justo e específico.

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
    response_json_schema: {
      type: "object",
      properties: {
        competency_scores: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              score: { type: "number" },
              evidence: { type: "string" },
              justification: { type: "string" },
              evidence_quote: { type: "string" }
            }
          }
        },
        ai_detection: {
          type: "object",
          properties: {
            is_ai_generated: { type: "boolean" },
            confidence: { type: "number" },
            indicators: { type: "array", items: { type: "string" } },
            analysis: { type: "string" }
          }
        },
        response_quality: {
          type: "object",
          properties: {
            specificity: { type: "number" },
            depth: { type: "number" },
            authenticity: { type: "number" },
            notes: { type: "string" }
          }
        },
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

RESPOSTAS E ANÁLISES DE CADA PERGUNTA (todas as evidências):
${JSON.stringify(allResponses, null, 2)}

Gere uma avaliação final rigorosa e completa:

1. SCORES FINAIS: Para cada competência, agregue os scores de todas as perguntas. Pondere consistência — uma competência demonstrada em todas deve pontuar mais alto.

2. SKILL DNA: Top 3 fortalezas e Top 3 áreas de desenvolvimento, com evidência específica.

3. SKILL SCORE GERAL (0-100): média ponderada considerando consistência.

4. SKILL GRAPH: score final de cada competência.

5. RECOMENDAÇÃO: Contratação Forte / Contratar / Talvez / Não Recomendado / Não Contratar.

6. RESUMO EXECUTIVO: 3-5 parágrafos detalhados.

7. Se houve múltiplas detecções de IA, reduza a confiança e mencione explicitamente.

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
  "skill_graph": { "competencia": 0-100 }
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        skill_scores: { type: "object", additionalProperties: { type: "number" } },
        skill_dna: {
          type: "object",
          properties: {
            strengths: { type: "array" },
            growth_areas: { type: "array" }
          }
        },
        overall_score: { type: "number" },
        recommendation: { type: "string" },
        summary: { type: "string" },
        skill_graph: { type: "object", additionalProperties: { type: "number" } }
      }
    }
  });
  return result;
}