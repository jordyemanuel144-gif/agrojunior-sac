// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { classifyIntent, getResponse, getWelcomeMessage } from '@/components/chat/chatEngine'
import type { ChatMode, IntentType } from '@/components/chat/chatTypes'

// ===========================================================================
// classifyIntent
// ===========================================================================

describe('classifyIntent', () => {
  // ── Public intents ───────────────────────────────────────────────

  it('debería clasificar "precios" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['precios', 'precios'],
      ['cuánto cuesta el pollo', 'precios'],
      ['dame la lista de precios', 'precios'],
      ['qué costo tiene', 'precios'],
      ['cuánto vale', 'precios'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "horarios" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['horarios', 'horarios'],
      ['a qué hora abren', 'horarios'],
      ['cuándo cierran', 'horarios'],
      ['están abiertos', 'horarios'],
      ['horario de atención', 'horarios'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "direccion" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['dirección', 'direccion'],
      ['dónde están ubicados', 'direccion'],
      ['cuál es la dirección', 'direccion'],
      ['ubicación', 'direccion'],
      ['cómo llego al mapa', 'direccion'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "yape" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['yape', 'yape'],
      ['yapeo', 'yape'],
      ['plin', 'yape'],
      ['transferencia', 'yape'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "telefono" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['teléfono', 'telefono'],
      ['número de contacto', 'telefono'],
      ['whatsapp', 'telefono'],
      ['cómo los contacto', 'telefono'],
      ['quiero llamar', 'telefono'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "saludar" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['hola', 'saludar'],
      ['buenos días', 'saludar'],
      ['buenas tardes', 'saludar'],
      ['buenas noches', 'saludar'],
      ['buen día', 'saludar'],
      ['hey', 'saludar'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  it('debería clasificar "ayuda" desde varias frases', () => {
    const tests: [string, IntentType][] = [
      ['ayuda', 'ayuda'],
      ['necesito información', 'ayuda'],
      ['qué puedes hacer', 'ayuda'],
      ['funciones disponibles', 'ayuda'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'public')).toBe(esperado)
    }
  })

  // ── Admin intents ────────────────────────────────────────────────

  it('debería clasificar "stock" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['stock', 'stock'],
      ['cómo va el inventario', 'stock'],
      ['qué productos hay', 'stock'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "stock-bajo" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['stock bajo', 'stock-bajo'],
      ['productos agotados', 'stock-bajo'],
      ['qué falta en almacén', 'stock-bajo'],
      ['reabastecer productos', 'stock-bajo'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "ventas-hoy" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['ventas de hoy', 'ventas-hoy'],
      ['ganancias del día', 'ventas-hoy'],
      ['cuánto vendí hoy', 'ventas-hoy'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "consultar-cliente" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['consultar cliente', 'consultar-cliente'],
      ['buscar cliente', 'consultar-cliente'],
      ['datos del cliente', 'consultar-cliente'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "deuda-cliente" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['deuda', 'deuda-cliente'],
      ['cuánto debe el cliente', 'deuda-cliente'],
      ['saldo pendiente', 'deuda-cliente'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "enviar-deuda" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['cobrar', 'enviar-deuda'],
      ['enviar recordatorio', 'enviar-deuda'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "listar-deudores" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['listar deudores', 'listar-deudores'],
      ['clientes morosos', 'listar-deudores'],
      ['deudores', 'listar-deudores'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  it('debería clasificar "navegar" en modo admin', () => {
    const tests: [string, IntentType][] = [
      ['ir a dashboard', 'navegar'],
      ['abrir inventario', 'navegar'],
      ['navegar a clientes', 'navegar'],
      ['llévame a cobranzas', 'navegar'],
    ]
    for (const [input, esperado] of tests) {
      expect(classifyIntent(input, 'admin')).toBe(esperado)
    }
  })

  // ── Admin intents BLOCKED in public mode ─────────────────────────

  it('debería bloquear intents admin en modo public como desconocido', () => {
    const adminQueries = [
      'stock',
      'inventario',
      'ventas de hoy',
      'consultar cliente',
      'deuda',
      'cobrar',
      'navegar',
    ]
    for (const q of adminQueries) {
      expect(classifyIntent(q, 'public')).toBe('desconocido')
    }
  })

  it('debería retornar desconocido para entradas vacías o irrelevantes', () => {
    expect(classifyIntent('', 'public')).toBe('desconocido')
    expect(classifyIntent('   ', 'public')).toBe('desconocido')
    expect(classifyIntent('xyzzy', 'public')).toBe('desconocido')
    expect(classifyIntent('12345', 'admin')).toBe('desconocido')
  })
})

// ===========================================================================
// getResponse
// ===========================================================================

describe('getResponse', () => {
  const publicIntents: IntentType[] = [
    'precios', 'horarios', 'direccion', 'yape',
    'telefono', 'saludar', 'ayuda',
  ]
  const adminIntents: IntentType[] = [
    'stock', 'stock-bajo', 'ventas-hoy', 'consultar-cliente',
    'deuda-cliente', 'enviar-deuda', 'listar-deudores', 'navegar',
  ]
  const allIntents: IntentType[] = [...publicIntents, ...adminIntents, 'desconocido']

  for (const intent of allIntents) {
    it(`debería retornar respuesta para intent "${intent}"`, () => {
      const response = getResponse(intent, 'admin')
      expect(response.text).toBeTruthy()
      expect(response.text.length).toBeGreaterThan(0)
    })
  }

  it('debería incluir quickActions en la respuesta de desconocido', () => {
    const response = getResponse('desconocido', 'public')
    expect(response.quickActions).toBeDefined()
    expect(response.quickActions!.length).toBeGreaterThan(0)
  })

  it('debería incluir quickActions admin en desconocido para modo admin', () => {
    const response = getResponse('desconocido', 'admin')
    expect(response.quickActions).toBeDefined()
    expect(response.quickActions!.length).toBeGreaterThan(0)
  })
})

// ===========================================================================
// getWelcomeMessage
// ===========================================================================

describe('getWelcomeMessage', () => {
  it('debería retornar un mensaje de bienvenida para modo public', () => {
    const msg = getWelcomeMessage('public')
    expect(msg.text).toBeTruthy()
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('debería retornar un mensaje de bienvenida para modo admin', () => {
    const msg = getWelcomeMessage('admin')
    expect(msg.text).toBeTruthy()
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('debería incluir quickActions diferentes para public vs admin', () => {
    const pub = getWelcomeMessage('public')
    const adm = getWelcomeMessage('admin')
    expect(pub.quickActions).toBeDefined()
    expect(adm.quickActions).toBeDefined()
    expect(pub.quickActions!.length).toBeGreaterThan(0)
    expect(adm.quickActions!.length).toBeGreaterThan(0)
  })
})
