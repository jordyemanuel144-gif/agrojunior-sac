/**
 * Servicio de Gemini API para el chatbot con IA.
 *
 * Usa la REST API directamente (sin SDK) para no agregar dependencias.
 * Se llama SOLO cuando el motor de reglas no reconoce la intención.
 *
 * API: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
 * Docs: https://ai.google.dev/gemini-api/docs/text-generation
 */

import { BUSINESS_SYSTEM_PROMPT } from '@/lib/businessInfo'

const API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_INSTRUCTION = BUSINESS_SYSTEM_PROMPT

export interface GeminiMessage {
  role: 'user' | 'model'
  text: string
}

/** Verifica si la API key de Gemini está configurada */
export function hasGeminiKey(): boolean {
  try {
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    return !!key && key.length > 0 && key !== 'tu_api_key_aqui'
  } catch {
    return false
  }
}

export const GEMINI_RATE_LIMITED = '__RATE_LIMITED__'

// Minimum milliseconds between Gemini calls — keeps us well under 15 RPM
const MIN_INTERVAL_MS = 5000
let lastCallTimestamp = 0

/**
 * Envía una consulta a Gemini con historial de conversación y devuelve la respuesta.
 * Retorna GEMINI_RATE_LIMITED si la API devuelve 429, null para otros errores.
 */
export async function askGemini(
  userMessage: string,
  history: GeminiMessage[] = [],
): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  // Client-side rate guard: max 1 call every 5s → safely under 15 RPM.
  // Skipped under test to keep the suite fast and deterministic.
  if (import.meta.env.MODE !== 'test') {
    const elapsed = Date.now() - lastCallTimestamp
    if (elapsed < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed))
    }
    lastCallTimestamp = Date.now()
  }

  // Build the raw turn list (history + current message), then sanitize it
  // to satisfy Gemini's strict requirements:
  //   1. The conversation MUST start with a 'user' turn.
  //   2. Roles MUST alternate (user → model → user → model …).
  // The welcome message and any rule-based bot replies can violate this,
  // which causes a 400 Bad Request. sanitizeTurns() fixes it.
  const rawTurns: GeminiMessage[] = [
    ...history,
    { role: 'user', text: userMessage },
  ]
  const contents = sanitizeTurns(rawTurns).map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }))

  try {
    const response = await fetch(`${API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[gemini] Rate limit hit (429) — free tier: 15 req/min')
        return GEMINI_RATE_LIMITED
      }
      // Read the error body so we can see the actual cause (invalid key,
      // malformed contents, bad model name, etc.) instead of just a status.
      const errorBody = await response.text().catch(() => '')
      console.error('[gemini] HTTP error:', response.status, response.statusText, errorBody)
      return null
    }

    const data = await response.json()

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('[gemini] Empty response:', JSON.stringify(data))
      return null
    }

    return text.trim()
  } catch (err) {
    console.error('[gemini] Error calling API:', err)
    return null
  }
}

function getApiKey(): string | null {
  try {
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    if (key && key.length > 0 && key !== 'tu_api_key_aqui') return key
    return null
  } catch {
    return null
  }
}

/**
 * Sanitizes a list of conversation turns to satisfy Gemini's API rules:
 *   1. The conversation MUST start with a 'user' turn → drop leading 'model' turns.
 *   2. Roles MUST strictly alternate → when two consecutive turns share a role,
 *      keep the latest one (most relevant to the current context).
 *   3. The final turn MUST be 'user' (it's the current question).
 *
 * Exported for unit testing.
 */
export function sanitizeTurns(turns: GeminiMessage[]): GeminiMessage[] {
  // 1. Drop leading 'model' turns (e.g. the welcome message)
  let start = 0
  while (start < turns.length && turns[start].role === 'model') start++
  const trimmed = turns.slice(start)

  // 2. Enforce strict alternation: collapse consecutive same-role turns,
  //    keeping the last of each run.
  const alternated: GeminiMessage[] = []
  for (const turn of trimmed) {
    const prev = alternated[alternated.length - 1]
    if (prev && prev.role === turn.role) {
      alternated[alternated.length - 1] = turn // replace with the newer turn
    } else {
      alternated.push(turn)
    }
  }

  return alternated
}
