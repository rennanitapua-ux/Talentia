import { base44 } from '@/api/base44Client';

export function parseJSON(raw) {
  if (raw && typeof raw === 'object') return raw;
  const text = String(raw || '').replace(/```json/gi, '').replace(/```/g, '');
  const match = text.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(match ? match[0] : text);
  } catch {
    return null;
  }
}

// Calls the LLM and returns parsed JSON, or null when every attempt fails.
// Never throws — callers always have a local fallback so the app keeps working.
export async function askJSON(prompt, { models = ['gemini_3_flash'], validate } = {}) {
  for (const model of models) {
    try {
      const raw = await base44.integrations.Core.InvokeLLM({ prompt, model });
      const parsed = parseJSON(raw);
      if (parsed && (!validate || validate(parsed))) return parsed;
    } catch (e) {
      console.warn('LLM call failed', model, e?.message);
    }
  }
  return null;
}

export const clamp = (n, min = 0, max = 100) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : min;
};

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}