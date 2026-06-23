import type { ChatMode, ChatMessage, ChatResponse, IntentType, QuickAction } from './chatTypes'
import { generarId } from '@/lib/utils'
import { BUSINESS_INFO } from '@/lib/businessInfo'

// ===========================================================================
// CLASIFICACIÓN — data-driven con prioridades explícitas
//
// Cada regla declara: intent, scope (public/admin), priority y keywords.
// El clasificador ordena las reglas por (scope, priority) y devuelve el
// primer intent cuya keyword aparece en el texto. Las colisiones se resuelven
// con `priority` (menor = se evalúa antes = más específico), NO con el orden
// accidental de un montón de `if`. Agregar/ajustar un intent = editar una fila.
// ===========================================================================

interface ClassificationRule {
  intent: IntentType
  scope: 'public' | 'admin'
  /** Menor = mayor prioridad (se evalúa antes). */
  priority: number
  keywords: string[]
}

const RULES: ClassificationRule[] = [
  // ── Admin: navegación (comando explícito, máxima prioridad) ──────────
  {
    intent: 'navegar',
    scope: 'admin',
    priority: 5,
    keywords: ['ir a', 'navegar a', 'navegar', 'llévame a', 'llevame a', 'llévame', 'llevame', 'abrir', 'abre el', 'abre la', 'ábreme'],
  },
  // ── Admin: stock bajo (antes que stock genérico) ────────────────────
  {
    intent: 'stock-bajo',
    scope: 'admin',
    priority: 10,
    keywords: ['stock bajo', 'bajo stock', 'agotado', 'agotados', 'faltante', 'faltantes', 'reabastecer', 'reabastecimiento', 'reponer', 'falta', 'almacén', 'almacen'],
  },
  // ── Admin: stock ────────────────────────────────────────────────────
  {
    intent: 'stock',
    scope: 'admin',
    priority: 20,
    keywords: ['stock', 'inventario', 'productos', 'producto'],
  },
  // ── Admin: enviar deuda (antes que deuda y que cliente) ─────────────
  {
    intent: 'enviar-deuda',
    scope: 'admin',
    priority: 38,
    keywords: ['enviar deuda', 'enviar recordatorio', 'cobrar', 'recordatorio'],
  },
  // ── Admin: listar deudores (antes que cliente) ──────────────────────
  {
    intent: 'listar-deudores',
    scope: 'admin',
    priority: 40,
    keywords: ['listar deudores', 'clientes morosos', 'deudores', 'morosos'],
  },
  // ── Admin: deuda de cliente (antes que consultar-cliente) ───────────
  {
    intent: 'deuda-cliente',
    scope: 'admin',
    priority: 45,
    keywords: ['deuda del cliente', 'deuda cliente', 'saldo pendiente', 'debe', 'saldo', 'deuda'],
  },
  // ── Admin: ventas de hoy ────────────────────────────────────────────
  {
    intent: 'ventas-hoy',
    scope: 'admin',
    priority: 48,
    keywords: ['ventas hoy', 'ventas de hoy', 'ventas del día', 'ventas del dia', 'ganancias hoy', 'ganancias', 'cuánto vendí', 'cuanto vendi', 'vendí', 'vendi', 'vendió', 'vendio', 'ventas', 'venta', 'hoy'],
  },
  // ── Admin: consultar cliente ────────────────────────────────────────
  {
    intent: 'consultar-cliente',
    scope: 'admin',
    priority: 50,
    keywords: ['consultar cliente', 'buscar cliente', 'datos del cliente', 'datos cliente', 'cliente'],
  },

  // ── Público: precios / productos (antes que ayuda) ──────────────────
  {
    intent: 'precios',
    scope: 'public',
    priority: 60,
    keywords: ['precio', 'precios', 'cuesta', 'cuestan', 'costo', 'costos', 'vale', 'valen', 'lista', 'tarifa', 'tarifas', 'comprar', 'compro', 'llevar', 'pedir', 'pollo', 'cerdo', 'chancho', 'pavo', 'embutido', 'embutidos', 'salchicha', 'jamón', 'jamon', 'chorizo', 'huevo', 'huevos', 'gallina', 'kilo', 'kilos', 'docena', 'mayorista', 'minorista'],
  },
  // ── Público: horarios ───────────────────────────────────────────────
  {
    intent: 'horarios',
    scope: 'public',
    priority: 62,
    keywords: ['horario', 'horarios', 'hora', 'abren', 'cierran', 'atienden', 'atiende', 'abierto', 'abiertos', 'abierta', 'atención', 'cuándo', 'cuando'],
  },
  // ── Público: dirección ──────────────────────────────────────────────
  {
    intent: 'direccion',
    scope: 'public',
    priority: 64,
    keywords: ['dirección', 'direccion', 'ubicación', 'ubicacion', 'ubicados', 'ubicado', 'dónde', 'donde', 'mapa', 'queda', 'local'],
  },
  // ── Público: yape / pagos ───────────────────────────────────────────
  {
    intent: 'yape',
    scope: 'public',
    priority: 66,
    keywords: ['yape', 'yapeo', 'plin', 'transferencia', 'depósito', 'deposito', 'pago', 'pagar'],
  },
  // ── Público: teléfono / contacto ────────────────────────────────────
  {
    intent: 'telefono',
    scope: 'public',
    priority: 68,
    keywords: ['teléfono', 'telefono', 'whatsapp', 'contacto', 'contacta', 'llamar', 'número', 'numero', 'celular', 'móvil', 'movil'],
  },
  // ── Público: saludar ────────────────────────────────────────────────
  {
    intent: 'saludar',
    scope: 'public',
    priority: 70,
    keywords: ['hola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen día', 'buen dia', 'buenas', 'saludos', 'hey', 'hi', 'hello'],
  },
  // ── Público: ayuda (menor prioridad: catch-all amable) ──────────────
  {
    intent: 'ayuda',
    scope: 'public',
    priority: 90,
    keywords: ['ayuda', 'ayudar', 'ayúdame', 'ayudame', 'necesito', 'puedes', 'puede', 'funciones', 'opciones', 'información', 'informacion'],
  },
]

function normalize(input: string): string {
  return input.toLowerCase().trim()
}

/**
 * Clasifica el texto en un IntentType.
 *
 * En modo admin se evalúan primero las reglas admin (scope 'admin'), luego las
 * públicas; dentro de cada grupo manda `priority`. En modo public solo se
 * evalúan reglas públicas (los intents admin quedan bloqueados → desconocido).
 */
export function classifyIntent(input: string, mode: ChatMode): IntentType {
  const n = normalize(input)
  if (!n) return 'desconocido'

  const applicable = RULES.filter((r) => r.scope === 'public' || mode === 'admin')

  applicable.sort((a, b) => {
    // En modo admin, las reglas admin tienen prioridad sobre las públicas.
    if (mode === 'admin' && a.scope !== b.scope) {
      return a.scope === 'admin' ? -1 : 1
    }
    return a.priority - b.priority
  })

  for (const rule of applicable) {
    if (rule.keywords.some((kw) => n.includes(kw))) return rule.intent
  }

  return 'desconocido'
}

// ===========================================================================
// RESPUESTAS ESTÁTICAS — un registro, no un switch gigante
//
// Cada intent estático (sin datos en vivo) tiene UNA función que arma su
// ChatResponse. Las respuestas con datos reales (precios, stock, ventas…)
// viven en los resolvers del hook useChat, no acá.
// ===========================================================================

const ACTIONS = {
  precios: { label: '📋 Precios', intent: 'precios' },
  horarios: { label: '🕐 Horarios', intent: 'horarios' },
  direccion: { label: '📍 Dirección', intent: 'direccion' },
  yape: { label: '📱 Yape / Pagos', intent: 'yape' },
  telefono: { label: '📞 Contacto', intent: 'telefono' },
  pollo: { label: '🐔 Pollo', intent: 'precios-pollo' },
  cerdo: { label: '🐷 Cerdo', intent: 'precios-cerdo' },
  pavo: { label: '🦃 Pavo', intent: 'precios-pavo' },
  embutidos: { label: '🥩 Embutidos', intent: 'precios-embutidos' },
  huevos: { label: '🥚 Huevos', intent: 'precios-huevos' },
  stock: { label: '📦 Stock', intent: 'stock' },
  stockBajo: { label: '⚠️ Stock bajo', intent: 'stock-bajo' },
  ventas: { label: '📊 Ventas hoy', intent: 'ventas-hoy' },
  deuda: { label: '💰 Cobranzas', intent: 'deuda-cliente' },
  enviarDeuda: { label: '📤 Enviar deuda', intent: 'enviar-deuda' },
  deudores: { label: '📋 Listar deudores', intent: 'listar-deudores' },
  clientes: { label: '👥 Clientes', intent: 'consultar-cliente' },
} satisfies Record<string, QuickAction>

const PUBLIC_MENU: QuickAction[] = [ACTIONS.precios, ACTIONS.horarios, ACTIONS.direccion, ACTIONS.telefono]
const ADMIN_MENU: QuickAction[] = [ACTIONS.stock, ACTIONS.ventas, ACTIONS.deuda, ACTIONS.clientes]
const CATEGORIA_MENU: QuickAction[] = [ACTIONS.pollo, ACTIONS.cerdo, ACTIONS.pavo, ACTIONS.embutidos, ACTIONS.huevos]

type ResponseBuilder = (mode: ChatMode) => ChatResponse

const RESPONSES: Partial<Record<IntentType, ResponseBuilder>> = {
  precios: () => ({
    text: '📋 ¿De qué producto querés los precios? Elegí una categoría o escribime, por ejemplo: "precios del pollo al por mayor".',
    quickActions: CATEGORIA_MENU,
  }),

  horarios: () => ({
    text: `🕐 Nuestro horario de atención:\n\n• ${BUSINESS_INFO.horario.semana}\n• ${BUSINESS_INFO.horario.domingo}\n\n¡Te esperamos!`,
    quickActions: [ACTIONS.direccion, ACTIONS.telefono],
  }),

  direccion: () => ({
    text: `📍 Nos encontramos en:\n\n${BUSINESS_INFO.direccion}\n\n¡Ven a visitarnos!`,
    quickActions: [ACTIONS.horarios, ACTIONS.telefono],
  }),

  yape: () => ({
    text: `📱 Puedes pagar con:\n\n• Yape: ${BUSINESS_INFO.yape}\n• Plin: ${BUSINESS_INFO.plin}\n\n🏦 ${BUSINESS_INFO.banco.nombre}\nTitular: ${BUSINESS_INFO.banco.titular}\nCuenta: ${BUSINESS_INFO.banco.cuenta}`,
    quickActions: [ACTIONS.telefono, ACTIONS.direccion],
  }),

  telefono: () => ({
    text: `📞 Puedes contactarnos al:\n\n• Móvil / WhatsApp: ${BUSINESS_INFO.telefono}\n\n¡Escríbenos cualquier consulta!`,
    quickActions: [ACTIONS.direccion, ACTIONS.horarios],
  }),

  saludar: () => ({
    text: `¡Hola! 👋 Bienvenido a **${BUSINESS_INFO.nombre}**. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
    quickActions: [ACTIONS.precios, ACTIONS.horarios, ACTIONS.direccion, ACTIONS.yape, ACTIONS.telefono],
  }),

  ayuda: () => ({
    text: '🤖 Puedo ayudarte con:\n\n• **Precios** — Precios reales por producto\n• **Horarios** — Horario de atención\n• **Dirección** — Dónde estamos\n• **Yape / Pagos** — Métodos de pago\n• **Teléfono** — Datos de contacto\n\n¡También podés preguntarme en lenguaje natural!',
    quickActions: [ACTIONS.precios, ACTIONS.horarios, ACTIONS.direccion],
  }),

  // Respuestas admin "guía" (cuando no hay datos en vivo, ej. fallback).
  // Los resolvers del hook las sobreescriben con datos reales.
  stock: () => ({ text: '📦 Consultando el stock del inventario…', quickActions: [ACTIONS.stockBajo, ACTIONS.ventas] }),
  'stock-bajo': () => ({ text: '⚠️ Consultando productos con stock bajo…', quickActions: [ACTIONS.stock, ACTIONS.ventas] }),
  'ventas-hoy': () => ({ text: '📊 Consultando las ventas del día…', quickActions: [ACTIONS.stock, ACTIONS.clientes] }),
  'consultar-cliente': () => ({ text: '👤 Consultando datos del cliente…', quickActions: [ACTIONS.deuda, ACTIONS.deudores] }),
  'deuda-cliente': () => ({ text: '💰 Consultando la deuda del cliente…', quickActions: [ACTIONS.enviarDeuda, ACTIONS.deudores] }),
  'enviar-deuda': () => ({ text: '📤 Generando el enlace de WhatsApp…', quickActions: [ACTIONS.deuda, ACTIONS.deudores] }),
  'listar-deudores': () => ({ text: '📋 Listando los deudores…', quickActions: [ACTIONS.deuda, ACTIONS.enviarDeuda] }),
  navegar: () => ({
    text: '🧭 ¿A dónde querés ir?',
    quickActions: [
      { label: '📊 Dashboard', intent: 'navegar' },
      { label: '📦 Inventario', intent: 'navegar' },
      { label: '💰 Cobranzas', intent: 'navegar' },
      { label: '👥 Clientes', intent: 'navegar' },
    ],
  }),
}

/**
 * Devuelve la respuesta ESTÁTICA de un intent (sin datos en vivo).
 * Se usa para quick actions sin servicios y como fallback. Los intents con
 * datos reales (stock, ventas, precios concretos) se resuelven en useChat.
 */
export function getResponse(intent: IntentType, mode: ChatMode): ChatResponse {
  const builder = RESPONSES[intent]
  if (builder) return builder(mode)

  // Fallback: desconocido o intents sin respuesta estática propia.
  return {
    text: '🤔 No entendí tu consulta. Podés preguntarme en lenguaje natural o elegir una opción:',
    quickActions: mode === 'admin' ? ADMIN_MENU : PUBLIC_MENU,
  }
}

// ===========================================================================
// MENSAJE DE BIENVENIDA
// ===========================================================================

export function getWelcomeMessage(mode: ChatMode): ChatMessage {
  if (mode === 'admin') {
    return {
      id: generarId(),
      sender: 'bot',
      text: `👋 ¡Bienvenido al panel de administración de **${BUSINESS_INFO.nombre}**! Soy tu asistente. Podés preguntarme sobre stock, ventas, clientes, cobranzas o navegar a cualquier sección.`,
      timestamp: new Date(),
      quickActions: ADMIN_MENU,
    }
  }

  return {
    id: generarId(),
    sender: 'bot',
    text: `🐔 ¡Bienvenido a **${BUSINESS_INFO.nombre}**! Soy tu asistente. Preguntame lo que quieras sobre precios, horarios, pagos o cualquier consulta.`,
    timestamp: new Date(),
    quickActions: PUBLIC_MENU,
  }
}
