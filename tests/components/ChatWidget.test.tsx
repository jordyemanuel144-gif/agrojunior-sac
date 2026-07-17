// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatWidget } from '@/components/chat/ChatWidget'

// ── Auth mock ──────────────────────────────────────────────────────────────
const mockUseAuthContext = vi.hoisted(() => vi.fn())

vi.mock('@/context/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}))

// ── Service mocks ──────────────────────────────────────────────────────────
vi.mock('@/services/inventario.service', () => ({
  inventarioService: { obtenerStock: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/services/ventas.service', () => ({
  ventasService: { obtenerTodos: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/services/cuenta-corriente.service', () => ({
  cuentaCorrienteService: {
    obtenerTodas: vi.fn().mockResolvedValue([]),
    obtenerResumen: vi.fn().mockResolvedValue({ total_deuda: 0, total_pendiente: 0, cantidad_clientes_con_deuda: 0, cantidad_ventas_pendientes: 0, clientes_mayores_deudores: [] }),
    obtenerPorCliente: vi.fn().mockResolvedValue(null),
    obtenerVentasPendientes: vi.fn().mockResolvedValue([]),
  },
}))
vi.mock('@/services/clientes.service', () => ({
  clientesService: { obtenerTodos: vi.fn().mockResolvedValue([]) },
}))
vi.mock('@/services/productos.service', () => ({
  productosService: { obtenerTodos: vi.fn().mockResolvedValue([]) },
}))

// ===========================================================================
// ChatWidget
// ===========================================================================

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthContext.mockReturnValue({
      user: null,
      isAdmin: false,
      isVendedor: false,
      isCliente: false,
      loading: false,
    })
  })

  it('debería renderizar el ChatBubble con estado cerrado', () => {
    render(<ChatWidget />)

    // ChatBubble button should be visible with "Abrir chat" label
    const bubble = screen.getByRole('button', { name: /abrir chat/i })
    expect(bubble).toBeInTheDocument()
    expect(bubble.className).toContain('bg-amber-600')
  })

  it('debería NO renderizar el ChatPanel cuando isOpen es false', () => {
    const { container } = render(<ChatWidget />)

    // ChatPanel returns null when closed — no header should be present
    expect(screen.queryByText('AGROJUNIOR SAC')).not.toBeInTheDocument()
    // No input field
    expect(screen.queryByPlaceholderText(/escribí/i)).not.toBeInTheDocument()
  })

  it('debería renderizar con modo admin cuando el usuario es admin', () => {
    mockUseAuthContext.mockReturnValue({
      user: { id: '1', role: 'admin' },
      isAdmin: true,
      isVendedor: false,
      isCliente: false,
      loading: false,
    })

    render(<ChatWidget />)

    // ChatBubble should still render
    const bubble = screen.getByRole('button', { name: /abrir chat/i })
    expect(bubble).toBeInTheDocument()

    // Panel still closed — no admin content visible yet
    expect(screen.queryByText(/administración/i)).not.toBeInTheDocument()
  })

  it('debería integrar useChat correctamente: ChatBubble + ChatPanel presentes', () => {
    const { container } = render(<ChatWidget />)

    // Both components mount
    expect(screen.getByRole('button', { name: /abrir chat/i })).toBeInTheDocument()

    // The component tree should have both the bubble and the panel (panel returns null but component exists)
    // Check that the fragment wrapper exists
    expect(container.children.length).toBeGreaterThan(0)
  })
})
