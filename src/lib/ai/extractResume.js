import { base44 } from '@/api/base44Client';
import { parseJSON } from '@/lib/ai/llm';

// Extrai dados estruturados de um currículo (PDF/DOC/imagem) via IA.
// Preenche apenas campos vazios — nunca sobrescreve dados já informados.
export async function extractResume(file_url) {
  const prompt = `Você é um assistente de RH. Analise o currículo/documento enviado e extraia os dados estruturados do candidato.
Retorne APENAS JSON válido com os campos abaixo. Se um campo não estiver presente, use string vazia.
- full_name: nome completo
- phone: telefone/whatsapp
- linkedin: URL do LinkedIn
- city: cidade
- state: estado (sigla UF, 2 letras)
- bio: resumo profissional em 2-3 frases
Não invente dados. Seja fiel ao documento.`;

  try {
    const raw = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          phone: { type: 'string' },
          linkedin: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          bio: { type: 'string' },
        },
      },
    });
    return parseJSON(raw) || raw;
  } catch (e) {
    console.warn('Resume extraction failed', e?.message);
    return null;
  }
}

// Mescla dados extraídos no formulário, preservando campos já preenchidos.
export function mergeExtracted(form, extracted = {}) {
  const out = { ...form };
  for (const key of ['full_name', 'phone', 'linkedin', 'city', 'state', 'bio']) {
    const val = (extracted[key] || '').trim();
    if (val && !(form[key] || '').trim()) out[key] = val;
  }
  return out;
}