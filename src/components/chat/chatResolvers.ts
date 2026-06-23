/**
 * Resolvers de intents — la capa que produce la respuesta final.
 *
 * Cada intent tiene UN resolver (función async pura, sin React). El registro
 * `intentResolvers` mapea intent → resolver, reemplazando el switch gigante.
 * Los intents estáticos delegan en getResponse(); los que necesitan datos en
 * vivo llaman a los services. Es 100% testeable sin montar el hook.
 */
import type { ChatMode, ChatResponse, IntentType } from './chatTypes'
import { getResponse } from './chatEngine'
import { inventarioService } from '@/services/inventario.service'
import { ventasService } from '@/services/ventas.service'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import { clientesService } from '@/services/clientes.service'
import { productosService } from '@/services/productos.service'
import { formatMoneda, esHoy } from '@/lib/utils'
import { generarLinkWhatsApp, generarMensajeDeuda } from '@/lib/whatsapp'
import { BUSINESS_INFO } from '@/lib/businessInfo'

export interface ResolveContext {
  text: string
  mode: ChatMode
}

export type IntentResolver = (ctx: ResolveContext) => Promise<ChatResponse> | ChatResponse

// ── Quick-action shortcuts reused across responses ──────────────────────────
const QA = {
  stock: { label: '📦 Stock', intent: 'stock' },
  stockCompleto: { label: '📦 Ver stock completo', intent: 'stock' },
  stockBajo: { label: '⚠️ Stock bajo', intent: 'stock-bajo' },
  ventas: { label: '📊 Ventas hoy', intent: 'ventas-hoy' },
  deuda: { label: '💰 Deuda cliente', intent: 'deuda-cliente' },
  cobranzas: { label: '💰 Cobranzas', intent: 'deuda-cliente' },
  enviarDeuda: { label: '📤 Enviar deuda', intent: 'enviar-deuda' },
  deudores: { label: '📋 Listar deudores', intent: 'listar-deudores' },
  clientes: { label: '👥 Clientes', intent: 'consultar-cliente' },
}

const CATEGORIA_MENU = [
  { label: '🐔 Pollo', intent: 'precios-pollo' },
  { label: '🐷 Cerdo', intent: 'precios-cerdo' },
  { label: '🦃 Pavo', intent: 'precios-pavo' },
  { label: '🥩 Embutidos', intent: 'precios-embutidos' },
  { label: '🥚 Huevos', intent: 'precios-huevos' },
]

// ===========================================================================
// PRECIOS — datos reales desde la base de datos
// ===========================================================================

type PrecioTier = 'minorista' | 'mayorista' | 'especial'

const CATEGORIA_KEYWORDS: Record<string, string[]> = {
  pollo: ['pollo'],
  cerdo: ['cerdo', 'chancho'],
  pavo: ['pavo'],
  embutido: ['embutido', 'salchicha', 'jamón', 'jamon', 'chorizo'],
  huevo: ['huevo'],
}

const INTENT_A_CATEGORIA: Record<string, string> = {
  'precios-pollo': 'pollo',
  'precios-cerdo': 'cerdo',
  'precios-pavo': 'pavo',
  'precios-embutidos': 'embutido',
  'precios-huevos': 'huevo',
}

/** Detecta la categoría de producto que el usuario menciona, o null. */
function detectarCategoria(text: string): string | null {
  const n = text.toLowerCase()
  for (const [cat, synonyms] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (synonyms.some((s) => n.includes(s))) return cat
  }
  return null
}

/** Detecta el tipo de precio solicitado (minorista/mayorista/especial), o null. */
function detectarTier(text: string): PrecioTier | null {
  const n = text.toLowerCase()
  if (n.includes('mayor')) return 'mayorista'
  if (n.includes('especial')) return 'especial'
  if (n.includes('menor') || n.includes('minorista')) return 'minorista'
  return null
}

async function resolverPrecios(intent: IntentType, text: string, mode: ChatMode): Promise<ChatResponse> {
  const categoria = INTENT_A_CATEGORIA[intent] ?? detectarCategoria(text)

  // Sin categoría concreta → menú de categorías (sin tocar la BD).
  if (!categoria) return getResponse('precios', mode)

  const [productos, categorias] = await Promise.all([
    productosService.obtenerTodos(),
    productosService.obtenerCategorias?.() ?? Promise.resolve([]),
  ])
  const catNameById = new Map(categorias.map((c) => [c.id, c.nombre.toLowerCase()]))

  const synonyms = CATEGORIA_KEYWORDS[categoria] ?? [categoria]
  const matched = productos.filter((p) => {
    const catName = catNameById.get(p.categoria_id) ?? ''
    const productName = p.nombre.toLowerCase()
    return synonyms.some((s) => catName.includes(s) || productName.includes(s))
  })

  if (matched.length === 0) {
    return {
      text: `Por ahora no tengo productos de **${categoria}** cargados en el sistema. 📱 Consultá al ${BUSINESS_INFO.telefono} para precios actualizados.`,
      quickActions: CATEGORIA_MENU,
    }
  }

  const tier = detectarTier(text)
  const lineas = matched
    .map((p) => {
      if (tier) {
        const precio =
          tier === 'mayorista' ? p.precio_mayorista : tier === 'especial' ? p.precio_especial : p.precio_minorista
        return `• ${p.nombre} — **${formatMoneda(precio)}** (${tier})`
      }
      return `• ${p.nombre}\n   Minorista: ${formatMoneda(p.precio_minorista)} · Mayorista: ${formatMoneda(p.precio_mayorista)}`
    })
    .join('\n')

  const tierLabel = tier ? ` (precio ${tier})` : ''
  return {
    text: `📋 **Precios de ${categoria}${tierLabel}:**\n\n${lineas}\n\n📱 Para pedidos: ${BUSINESS_INFO.telefono}`,
    quickActions: CATEGORIA_MENU,
  }
}

// ===========================================================================
// ADMIN — datos en vivo desde los services
// ===========================================================================

async function resolverStock(): Promise<ChatResponse> {
  const items = await inventarioService.obtenerStock()
  if (items.length === 0) return { text: '📦 No hay productos registrados en el inventario.' }
  const lineas = items.map((i) => `• ${i.nombre} — ${i.stock_actual} ${i.tipo_medida}`).join('\n')
  return { text: `📦 **Stock actual:**\n\n${lineas}`, quickActions: [QA.stockBajo, QA.ventas] }
}

async function resolverStockBajo(): Promise<ChatResponse> {
  const items = await inventarioService.obtenerStock()
  const bajos = items.filter((i) => i.stock_actual <= i.stock_minimo)
  if (bajos.length === 0) return { text: '✅ Todos los productos tienen stock suficiente.' }
  const lineas = bajos
    .map((i) => `• ${i.nombre} — ${i.stock_actual} ${i.tipo_medida} (mín: ${i.stock_minimo})`)
    .join('\n')
  return { text: `⚠️ **Productos con stock bajo:**\n\n${lineas}`, quickActions: [QA.stockCompleto, QA.ventas] }
}

async function resolverVentasHoy(): Promise<ChatResponse> {
  const ventas = await ventasService.obtenerTodos()
  const hoy = ventas.filter((v) => esHoy(v.fecha))
  if (hoy.length === 0) return { text: '📊 No hay ventas registradas hoy.' }
  const total = hoy.reduce((s, v) => s + v.total, 0)
  return {
    text: `📊 **Ventas de hoy:** ${hoy.length} ventas\n💰 **Total:** ${formatMoneda(total)}`,
    quickActions: [QA.stock, QA.cobranzas],
  }
}

async function resolverDeudaCliente(text: string): Promise<ChatResponse> {
  const cuentas = await cuentaCorrienteService.obtenerTodas()
  const nombre = extractClientName(text)
  const cliente = nombre ? cuentas.find((c) => matchNombre(c.cliente_nombre, nombre)) : null

  if (cliente) {
    return {
      text: `💰 **${cliente.cliente_nombre}**\n• Saldo pendiente: ${formatMoneda(cliente.saldo_pendiente)}\n• Ventas pendientes: ${cliente.cantidad_ventas_pendientes}`,
      quickActions: [QA.enviarDeuda, QA.deudores],
    }
  }

  if (cuentas.length > 0) {
    const lineas = cuentas.map((c) => `• ${c.cliente_nombre} — ${formatMoneda(c.saldo_pendiente)}`).join('\n')
    return { text: `💰 Deudores registrados:\n\n${lineas}`, quickActions: [QA.enviarDeuda, QA.deudores] }
  }
  return { text: '💰 No hay clientes con deuda pendiente.' }
}

async function resolverEnviarDeuda(text: string): Promise<ChatResponse> {
  const cuentas = await cuentaCorrienteService.obtenerTodas()
  const nombre = extractClientName(text)
  const cliente = nombre ? cuentas.find((c) => matchNombre(c.cliente_nombre, nombre)) : cuentas[0]

  if (!cliente) return { text: '📤 No hay clientes con deuda para enviar.' }
  if (!cliente.cliente_telefono) return { text: `📤 ${cliente.cliente_nombre} no tiene teléfono registrado.` }

  const ventasPendientes = await cuentaCorrienteService.obtenerVentasPendientes(cliente.cliente_id)
  const mensaje = generarMensajeDeuda(cliente.cliente_nombre, cliente.saldo_pendiente, ventasPendientes)
  const link = generarLinkWhatsApp(cliente.cliente_telefono, mensaje)

  return {
    text: `📤 **Enlace generado para ${cliente.cliente_nombre}**\nDeuda: ${formatMoneda(cliente.saldo_pendiente)}\n\n${link}`,
    action: 'whatsapp',
    quickActions: [QA.deuda, QA.deudores],
  }
}

async function resolverListarDeudores(): Promise<ChatResponse> {
  const resumen = await cuentaCorrienteService.obtenerResumen()
  const list = resumen.clientes_mayores_deudores ?? []
  if (list.length === 0) return { text: '📋 No hay clientes con deuda pendiente.' }
  const lineas = list.map((d, i) => `${i + 1}. ${d.cliente_nombre} — ${formatMoneda(d.saldo)}`).join('\n')
  return {
    text: `📋 **Clientes con deuda:**\n\n${lineas}\n\n💰 Total: ${formatMoneda(resumen.total_pendiente)}`,
    quickActions: [QA.deuda, QA.enviarDeuda],
  }
}

async function resolverConsultarCliente(text: string): Promise<ChatResponse> {
  const clientes = await clientesService.obtenerTodos()
  const nombre = extractClientName(text)
  const encontrado = nombre ? clientes.find((c) => matchNombre(c.nombre, nombre)) : null

  if (encontrado) {
    return {
      text: `👤 **${encontrado.nombre}**\n• Teléfono: ${encontrado.telefono ?? '—'}\n• Tipo: ${encontrado.tipo}\n• DNI/RUC: ${encontrado.dni_ruc ?? '—'}`,
      quickActions: [QA.deuda, QA.deudores],
    }
  }

  if (clientes.length > 0) {
    const lista = clientes.slice(0, 10).map((c) => `• ${c.nombre} — ${c.telefono ?? '—'}`).join('\n')
    return { text: `👤 Clientes registrados:\n\n${lista}\n\nDecime el nombre exacto para más detalles.` }
  }
  return { text: '👤 No hay clientes registrados.' }
}

function resolverNavegar(text: string): ChatResponse {
  const route = extractRoute(text)
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard', inventario: 'Inventario', cobranzas: 'Cobranzas',
    clientes: 'Clientes', reportes: 'Reportes', pos: 'POS', ventas: 'Ventas',
    compras: 'Compras', proveedores: 'Proveedores', configuracion: 'Configuración', perfil: 'Perfil',
  }
  const label = routeLabels[route] ?? route
  return { text: `🧭 Abriendo **${label}**…`, action: 'navegar', data: { ruta: route } }
}

// ===========================================================================
// REGISTRO — intent → resolver
// ===========================================================================

const staticResolver = (intent: IntentType): IntentResolver => (ctx) => getResponse(intent, ctx.mode)

export const intentResolvers: Record<IntentType, IntentResolver> = {
  // Estáticos (info del negocio)
  saludar: staticResolver('saludar'),
  horarios: staticResolver('horarios'),
  direccion: staticResolver('direccion'),
  yape: staticResolver('yape'),
  telefono: staticResolver('telefono'),
  ayuda: staticResolver('ayuda'),
  desconocido: staticResolver('desconocido'),

  // Precios (BD real)
  precios: (c) => resolverPrecios('precios', c.text, c.mode),
  'precios-pollo': (c) => resolverPrecios('precios-pollo', c.text, c.mode),
  'precios-cerdo': (c) => resolverPrecios('precios-cerdo', c.text, c.mode),
  'precios-pavo': (c) => resolverPrecios('precios-pavo', c.text, c.mode),
  'precios-embutidos': (c) => resolverPrecios('precios-embutidos', c.text, c.mode),
  'precios-huevos': (c) => resolverPrecios('precios-huevos', c.text, c.mode),

  // Admin (services en vivo)
  stock: () => resolverStock(),
  'stock-bajo': () => resolverStockBajo(),
  'ventas-hoy': () => resolverVentasHoy(),
  'deuda-cliente': (c) => resolverDeudaCliente(c.text),
  'enviar-deuda': (c) => resolverEnviarDeuda(c.text),
  'listar-deudores': () => resolverListarDeudores(),
  'consultar-cliente': (c) => resolverConsultarCliente(c.text),
  navegar: (c) => resolverNavegar(c.text),
}

/** Resuelve un intent usando el registro. Si no existe, cae en 'desconocido'. */
export function resolveIntent(intent: IntentType, ctx: ResolveContext): Promise<ChatResponse> | ChatResponse {
  const resolver = intentResolvers[intent] ?? intentResolvers.desconocido
  return resolver(ctx)
}

// ===========================================================================
// Helpers de extracción
// ===========================================================================

function matchNombre(nombreCompleto: string, buscado: string): boolean {
  const a = nombreCompleto.toLowerCase()
  const b = buscado.toLowerCase()
  return a.includes(b) || b.includes(a)
}

/** Extrae un posible nombre de cliente del texto ("deuda de Juan" → "Juan"). */
export function extractClientName(text: string): string {
  const patterns = [
    /(?:deuda\s+(?:de\s+)?|debe\s+)(.+)/i,
    /(?:enviar\s+(?:deuda\s+)?(?:a\s+)?)(.+)/i,
    /(?:consultar\s+cliente\s+)(.+)/i,
    /(?:cliente\s+)(.+)/i,
    /(?:de\s+)(.+)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (['de', 'a', 'el', 'la', 'los', 'las', 'un', 'una'].includes(name.toLowerCase())) continue
      return name
    }
  }
  return ''
}

/** Extrae una ruta de navegación del texto. */
export function extractRoute(text: string): string {
  const lower = text.toLowerCase()
  const routeMap: Record<string, string> = {
    dashboard: 'dashboard', inventario: 'inventario', cobranzas: 'cobranzas',
    clientes: 'clientes', reportes: 'reportes', pos: 'pos', ventas: 'ventas',
    compras: 'compras', proveedores: 'proveedores', configuracion: 'configuracion', perfil: 'perfil',
  }
  for (const [keyword, route] of Object.entries(routeMap)) {
    if (lower.includes(keyword)) return route
  }
  const words = lower.split(/\s+/)
  const last = words[words.length - 1]
  return routeMap[last] || last
}
