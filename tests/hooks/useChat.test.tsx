// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import type { ChatMessage } from '@/components/chat/chatTypes'

// ── Auth mock ──────────────────────────────────────────────────────────────
const mockUseAuthContext = vi.hoisted(() => vi.fn())

vi.mock('@/context/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}))

// ── Gemini mock (evitar llamadas reales a la API en tests) ──────────────────
vi.mock('@/lib/gemini', () => ({
  hasGeminiKey: () => false,
  askGemini: () => Promise.resolve(null),
}))

// ── Service mocks ──────────────────────────────────────────────────────────
const mockObtenerStock = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const mockObtenerTodasVentas = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const mockObtenerTodasCuentas = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const mockObtenerResumen = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    total_deuda: 0,
    total_pendiente: 0,
    cantidad_clientes_con_deuda: 0,
    cantidad_ventas_pendientes: 0,
    clientes_mayores_deudores: [],
  }),
)
const mockObtenerPorCliente = vi.hoisted(() => vi.fn().mockResolvedValue(null))
const mockObtenerVentasPendientes = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const mockObtenerTodosClientes = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const mockObtenerTodosProductos = vi.hoisted(() => vi.fn().mockResolvedValue([]))

vi.mock('@/services/inventario.service', () => ({
  inventarioService: { obtenerStock: mockObtenerStock },
}))
vi.mock('@/services/ventas.service', () => ({
  ventasService: { obtenerTodos: mockObtenerTodasVentas },
}))
vi.mock('@/services/cuenta-corriente.service', () => ({
  cuentaCorrienteService: {
    obtenerTodas: mockObtenerTodasCuentas,
    obtenerResumen: mockObtenerResumen,
    obtenerPorCliente: mockObtenerPorCliente,
    obtenerVentasPendientes: mockObtenerVentasPendientes,
  },
}))
vi.mock('@/services/clientes.service', () => ({
  clientesService: { obtenerTodos: mockObtenerTodosClientes },
}))
const mockObtenerCategorias = vi.hoisted(() => vi.fn().mockResolvedValue([]))
vi.mock('@/services/productos.service', () => ({
  productosService: {
    obtenerTodos: mockObtenerTodosProductos,
    obtenerCategorias: mockObtenerCategorias,
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

function setupPublicAuth() {
  mockUseAuthContext.mockReturnValue({
    user: null,
    isAdmin: false,
    isVendedor: false,
    isCliente: false,
    loading: false,
  })
}

function setupAdminAuth() {
  mockUseAuthContext.mockReturnValue({
    user: { id: '1', role: 'admin' },
    isAdmin: true,
    isVendedor: false,
    isCliente: false,
    loading: false,
  })
}

// ===========================================================================
// useChat
// ===========================================================================

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupPublicAuth()
  })

  // ── Initial state ────────────────────────────────────────────────────

  it('debería inicializar con mensaje de bienvenida en modo public', () => {
    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].sender).toBe('bot')
    expect(result.current.messages[0].text).toContain('Bienvenido')
    expect(result.current.isOpen).toBe(false)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.mode).toBe('public')
    expect(result.current.quickActions).toBeDefined()
    expect(result.current.quickActions.length).toBeGreaterThan(0)
  })

  it('debería tener quick actions públicas en modo public', () => {
    const { result } = renderHook(() => useChat())

    const intents = result.current.quickActions.map((a) => a.intent)
    expect(intents).toContain('precios')
    expect(intents).toContain('horarios')
    expect(intents).toContain('direccion')
    expect(intents).not.toContain('stock')
    expect(intents).not.toContain('ventas-hoy')
  })

  it('debería inicializar con modo admin cuando isAdmin es true', () => {
    setupAdminAuth()

    const { result } = renderHook(() => useChat())

    expect(result.current.mode).toBe('admin')
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].text).toContain('administración')
  })

  it('debería inicializar con modo admin cuando isVendedor es true', () => {
    mockUseAuthContext.mockReturnValue({
      user: { id: '2', role: 'vendedor' },
      isAdmin: false,
      isVendedor: true,
      isCliente: false,
      loading: false,
    })

    const { result } = renderHook(() => useChat())

    expect(result.current.mode).toBe('admin')
  })

  it('debería tener quick actions admin en modo admin', () => {
    setupAdminAuth()

    const { result } = renderHook(() => useChat())

    const intents = result.current.quickActions.map((a) => a.intent)
    expect(intents).toContain('stock')
    expect(intents).toContain('ventas-hoy')
    expect(intents).toContain('deuda-cliente')
    expect(intents).toContain('consultar-cliente')
  })

  // ── toggleChat ───────────────────────────────────────────────────────

  it('debería togglear isOpen al llamar toggleChat', () => {
    const { result } = renderHook(() => useChat())

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.toggleChat()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggleChat()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('debería resetear unreadCount al abrir el chat', () => {
    const { result } = renderHook(() => useChat())

    // Need to get a message first while open, then close, then open again
    act(() => {
      result.current.toggleChat()
    })
    expect(result.current.unreadCount).toBe(0)
  })

  it('debería cerrar el chat y mantener los mensajes', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.toggleChat() // open
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.closeChat()
    })
    expect(result.current.isOpen).toBe(false)

    // Messages should persist
    expect(result.current.messages).toHaveLength(1)
  })

  // ── sendMessage ──────────────────────────────────────────────────────

  it('debería agregar mensaje de usuario y procesar intent "hola"', async () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('hola')
    })

    // User message added immediately
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].sender).toBe('user')
    expect(result.current.messages[1].text).toBe('hola')
    expect(result.current.isProcessing).toBe(true)

    // Wait for bot response
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    // Bot response added
    expect(result.current.messages).toHaveLength(3)
    expect(result.current.messages[2].sender).toBe('bot')
    expect(result.current.messages[2].text).toContain('Bienvenido')
  })

  it('debería procesar intent "precios" y devolver info en modo public', async () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('precios')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('precios')
  })

  it('debería devolver fallback para intent desconocido', async () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('xyzzy_unknown_input_42')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('No entendí')
  })

  // ── unreadCount ──────────────────────────────────────────────────────

  it('debería incrementar unreadCount cuando llega mensaje con chat cerrado', async () => {
    const { result } = renderHook(() => useChat())

    // Send a message while chat is closed
    act(() => {
      result.current.sendMessage('hola')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    // After processing while closed, unreadCount should increase
    expect(result.current.unreadCount).toBeGreaterThan(0)

    // Open chat — unreadCount resets
    act(() => {
      result.current.toggleChat()
    })
    expect(result.current.unreadCount).toBe(0)
  })

  // ── handleQuickAction ─────────────────────────────────────────────────

  it('debería procesar quick action intent directamente', async () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.handleQuickAction('precios')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    // Should have welcome + bot response
    expect(result.current.messages.length).toBeGreaterThanOrEqual(2)
    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toBeTruthy()
  })

  // ── Admin intent with service data ────────────────────────────────────

  it('debería consultar stock y devolver datos formateados en modo admin', async () => {
    setupAdminAuth()

    const stockData = [
      { id: '1', nombre: 'Pollo Entero', stock_actual: 50, stock_minimo: 10, tipo_medida: 'kg', codigo: 'POLLO', categoria: 'Aves', estado: 'ok' },
      { id: '2', nombre: 'Huevos', stock_actual: 200, stock_minimo: 50, tipo_medida: 'unid', codigo: 'HUE', categoria: 'Huevos', estado: 'ok' },
    ]
    mockObtenerStock.mockResolvedValue(stockData)

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('stock')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('Pollo Entero')
    expect(last.text).toContain('50')
    expect(last.text).toContain('Huevos')
    expect(last.text).toContain('200')
    expect(mockObtenerStock).toHaveBeenCalled()
  })

  it('debería consultar stock-bajo y devolver solo productos filtrados', async () => {
    setupAdminAuth()

    const stockData = [
      { id: '1', nombre: 'Pollo Entero', stock_actual: 50, stock_minimo: 10, tipo_medida: 'kg', codigo: 'POLLO', categoria: 'Aves', estado: 'ok' },
      { id: '2', nombre: 'Pechuga', stock_actual: 3, stock_minimo: 10, tipo_medida: 'kg', codigo: 'PECH', categoria: 'Aves', estado: 'bajo' },
      { id: '3', nombre: 'Huevos', stock_actual: 200, stock_minimo: 50, tipo_medida: 'unid', codigo: 'HUE', categoria: 'Huevos', estado: 'ok' },
    ]
    mockObtenerStock.mockResolvedValue(stockData)

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('stock bajo')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    // Should mention Pechuga (stock_actual <= stock_minimo)
    expect(last.text).toContain('Pechuga')
    expect(last.text).toContain('3')
    // Should NOT mention Pollo Entero or Huevos
    expect(last.text).not.toContain('Pollo Entero')
    expect(last.text).not.toContain('Huevos')
    expect(mockObtenerStock).toHaveBeenCalled()
  })

  // ── Error handling ────────────────────────────────────────────────────

  it('debería manejar errores de servicio gracefulmente', async () => {
    setupAdminAuth()

    mockObtenerStock.mockRejectedValue(new Error('Supabase no conectado'))

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('stock')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('problema')
  })

  // ── handleNavigateTo ─────────────────────────────────────────────────

  it('debería tener función handleNavigateTo', () => {
    const { result } = renderHook(() => useChat())

    // Verify the function exists and is callable
    expect(typeof result.current.handleNavigateTo).toBe('function')
    // Function should not throw synchronously
    expect(result.current.handleNavigateTo.length).toBe(1) // takes one argument
  })

  // ── Edge cases ──────────────────────────────────────────────────────

  it('debería ignorar texto vacío en sendMessage', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('   ')
    })

    // Should NOT add a user message for whitespace-only input
    expect(result.current.messages).toHaveLength(1)
  })

  it('debería procesar quick action "stock" en modo admin con datos', async () => {
    setupAdminAuth()

    mockObtenerStock.mockResolvedValue([
      { id: '1', nombre: 'Pollo', stock_actual: 50, stock_minimo: 10, tipo_medida: 'kg', codigo: 'P', categoria: 'Aves', estado: 'ok' },
    ])

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.handleQuickAction('stock')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('Pollo')
    expect(mockObtenerStock).toHaveBeenCalled()
  })

  it('debería manejar ventas-hoy con ventas en el mismo día', async () => {
    setupAdminAuth()

    const hoy = new Date()
    mockObtenerTodasVentas.mockResolvedValue([
      {
        id: 'v1', ticket_numero: 'T001', total: 150, fecha: hoy.toISOString(),
        cliente_id: null, vendedor_id: 'u1', items: [], metodo_pago: 'efectivo',
        subtotal: 150, descuento: 0, igv: 0, monto_pagado: 150, estado_pago: 'pagado', estado: 'completada',
      },
      {
        id: 'v2', ticket_numero: 'T002', total: 250, fecha: hoy.toISOString(),
        cliente_id: null, vendedor_id: 'u1', items: [], metodo_pago: 'yape',
        subtotal: 250, descuento: 0, igv: 0, monto_pagado: 0, estado_pago: 'pendiente', estado: 'completada',
      },
    ])

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('ventas hoy')
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })

    const last = result.current.messages[result.current.messages.length - 1]
    expect(last.sender).toBe('bot')
    expect(last.text).toContain('2')
    expect(last.text).toContain('ventas')
    expect(mockObtenerTodasVentas).toHaveBeenCalled()
  })
})
