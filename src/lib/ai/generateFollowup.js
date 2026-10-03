import { askJSON } from '@/lib/ai/llm';

// Gera uma situação de follow-up adaptativa com base na resposta do candidato.
// Retorna um objeto situation (write-only) ou null quando nenhum follow-up é necessário.
export async function generateFollowup(job, situation, response) {
  const prompt = `Você é um entrevistador especialista em soft skills. O candidato respondeu a uma situação de simulação de trabalho. Decida se uma pergunta de follow-up curta adicionaria evidência valiosa sobre as competências dele.

Se a resposta já foi completa, clara e demonstrou reflexão, NÃO gere follow-up (needs_followup: false).
Se a resposta foi curta, superficial, evasiva, ou se há oportunidade de aprofundar o raciocínio, gere UMA pergunta de follow-up (write-only, sem múltipla escolha) que explore o porquê por trás da decisão.

Cargo: ${job?.title || ''} — ${job?.role || ''}
Situação: ${situation?.title || ''}
Pergunta original: ${situation?.question || ''}
Escolha do candidato: ${response?.choice_text || '(sem opções)'}
Justificativa do candidato: ${response?.justification || ''}

Retorne JSON:
{
  "needs_followup": boolean,
  "followup": {
    "title": "Aprofundamento",
    "context": "Contexto curto (1-2 frases) conectando com a resposta anterior",
    "question": "Uma pergunta de follow-up que aprofunda o raciocínio",
    "justification_prompt": "Instrução curta para o candidato",
    "competencies": ["competência 1", "competência 2"]
  }
}`;

  const res = await askJSON(prompt, { models: ['gemini_3_flash'] });
  if (!res || !res.needs_followup || !res.followup?.question) return null;

  return {
    id: `followup_${situation.id}_${Date.now()}`,
    title: res.followup.title || 'Aprofundamento',
    context: res.followup.context || '',
    question: res.followup.question,
    justification_prompt: res.followup.justification_prompt || 'Explique seu raciocínio em poucas frases.',
    competencies: res.followup.competencies || situation.competencies || [],
    character: null,
    options: [],
    is_followup: true,
    parent_situation_id: situation.id,
  };
}