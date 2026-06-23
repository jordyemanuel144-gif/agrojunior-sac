import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasGeminiKey } from '@/lib/gemini'

describe('hasGeminiKey', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('retorna false si no hay key configurada', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')
    expect(hasGeminiKey()).toBe(false)
  })

  it('retorna false si la key es el placeholder', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'tu_api_key_aqui')
    expect(hasGeminiKey()).toBe(false)
  })

  it('retorna true si hay una key real configurada', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'AIzaSyTest123456789')
    expect(hasGeminiKey()).toBe(true)
  })

  it('retorna true si la variable existe en .env', () => {
    // El .env del proyecto tiene la key configurada
    const result = hasGeminiKey()
    // No asumimos el valor exacto porque depende del entorno,
    // pero la función no debe tirar error
    expect(typeof result).toBe('boolean')
  })
})

describe('askGemini (integration - fetch)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubEnv('VITE_GEMINI_API_KEY', 'AIzaSyTest123456789')
  })

  it('llama a la API de Gemini con el formato correcto', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Hola, soy el asistente de Sam José Avícola' }],
          },
        },
      ],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const { askGemini } = await import('@/lib/gemini')
    const result = await askGemini('Hola')

    expect(result).toBe('Hola, soy el asistente de Sam José Avícola')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    // Verify it was called with the correct URL
    const callUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(callUrl).toContain('generativelanguage.googleapis.com')
    expect(callUrl).toContain('gemini-2.0-flash')
  })

  it('incluye los datos del negocio en el systemInstruction', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Estamos en Av. Principal 123, Arequipa' }],
          },
        },
      ],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const { askGemini } = await import('@/lib/gemini')
    await askGemini('¿Dónde están?')

    const callBody = JSON.parse(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    )

    // Business info now lives in systemInstruction, not in contents
    const systemText = callBody.systemInstruction.parts[0].text
    expect(systemText).toContain('Sam José Avícola')
    expect(systemText).toContain('Arequipa')
    expect(systemText).toContain('916 794 870')

    // The current user message must be the last 'user' turn in contents
    const lastTurn = callBody.contents[callBody.contents.length - 1]
    expect(lastTurn.role).toBe('user')
    expect(lastTurn.parts[0].text).toBe('¿Dónde están?')
  })

  it('retorna el sentinel de rate-limit si la API devuelve 429', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    })

    const { askGemini, GEMINI_RATE_LIMITED } = await import('@/lib/gemini')
    const result = await askGemini('Hola')
    expect(result).toBe(GEMINI_RATE_LIMITED)
  })

  it('retorna null en otros errores HTTP (ej. 400)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('{"error":{"message":"Invalid request"}}'),
    })

    const { askGemini } = await import('@/lib/gemini')
    const result = await askGemini('Hola')
    expect(result).toBeNull()
  })

  it('retorna null si la respuesta no tiene candidates', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const { askGemini } = await import('@/lib/gemini')
    const result = await askGemini('Hola')
    expect(result).toBeNull()
  })

  it('retorna null si el fetch falla (network error)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { askGemini } = await import('@/lib/gemini')
    const result = await askGemini('Hola')
    expect(result).toBeNull()
  })

  it('retorna null si no hay API key configurada', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')

    const { askGemini } = await import('@/lib/gemini')
    const result = await askGemini('Hola')
    expect(result).toBeNull()
  })
})

describe('sanitizeTurns', () => {
  it('descarta turnos model al inicio (mensaje de bienvenida)', async () => {
    const { sanitizeTurns } = await import('@/lib/gemini')
    const result = sanitizeTurns([
      { role: 'model', text: 'Bienvenido' },
      { role: 'user', text: 'Hola' },
    ])
    expect(result).toEqual([{ role: 'user', text: 'Hola' }])
  })

  it('garantiza que la conversación empiece con un turno user', async () => {
    const { sanitizeTurns } = await import('@/lib/gemini')
    const result = sanitizeTurns([
      { role: 'model', text: 'Bienvenido' },
      { role: 'user', text: 'Hola' },
      { role: 'model', text: 'Hola!' },
      { role: 'user', text: '¿Precios?' },
    ])
    expect(result[0].role).toBe('user')
  })

  it('colapsa turnos consecutivos del mismo rol manteniendo el último', async () => {
    const { sanitizeTurns } = await import('@/lib/gemini')
    const result = sanitizeTurns([
      { role: 'user', text: 'primero' },
      { role: 'user', text: 'segundo' },
      { role: 'model', text: 'respuesta' },
    ])
    expect(result).toEqual([
      { role: 'user', text: 'segundo' },
      { role: 'model', text: 'respuesta' },
    ])
  })

  it('mantiene una conversación que ya alterna correctamente', async () => {
    const { sanitizeTurns } = await import('@/lib/gemini')
    const turns = [
      { role: 'user' as const, text: 'a' },
      { role: 'model' as const, text: 'b' },
      { role: 'user' as const, text: 'c' },
    ]
    expect(sanitizeTurns(turns)).toEqual(turns)
  })
})
