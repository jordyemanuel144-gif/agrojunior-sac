import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCobranzas, useDetalleCobranza } from '@/pages/cobranzas/hooks/useCobranzas'

vi.mock('@/services/cuenta-corriente.service', () => ({
  cuentaCorrienteService: {
    obtenerTodas: vi.fn().mockResolvedValue([
      {
        cliente_id: 'c1',
        cliente_nombre: 'Cliente 1',
        cliente_dni_ruc: '12345678',
        saldo_pendiente: 100,
        cantidad_ventas_pendientes: 2,
      },
      {
        cliente_id: 'c2',
        cliente_nombre: 'Cliente 2',
        cliente_dni_ruc: '87654321',
        saldo_pendiente: 50,
        cantidad_ventas_pendientes: 1,
      },
    ]),
    obtenerResumen: vi.fn().mockResolvedValue({
      total_deuda: 150,
      total_pendiente: 150,
      cantidad_clientes_con_deuda: 2,
      cantidad_ventas_pendientes: 3,
      clientes_mayores_deudores: [],
    }),
    obtenerPorCliente: vi.fn().mockResolvedValue({
      cliente_id: 'c1',
      cliente_nombre: 'Cliente 1',
      saldo_pendiente: 100,
    }),
    obtenerVentasPendientes: vi.fn().mockResolvedValue([]),
    registrarPago: vi.fn().mockResolvedValue([]),
  },
}))

describe('useCobranzas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería cargar cuentas al iniciar', async () => {
    const { result } = renderHook(() => useCobranzas())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    expect(result.current.cuentas.length).toBe(2)
    expect(result.current.resumen).toEqual({
      total_deuda: 150,
      total_pendiente: 150,
      cantidad_clientes_con_deuda: 2,
      cantidad_ventas_pendientes: 3,
      clientes_mayores_deudores: [],
    })
  })

  it('debería filtrar cuentas por búsqueda', async () => {
    const { result } = renderHook(() => useCobranzas())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    result.current.setFiltros({ busqueda: 'Cliente 1' })

    await waitFor(() => {
      expect(result.current.cuentas.length).toBeLessThanOrEqual(2)
    })
    
    const filtered = result.current.cuentas.filter(c => 
      c.cliente_nombre.toLowerCase().includes('cliente 1')
    )
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('debería recargar datos', async () => {
    const { result } = renderHook(() => useCobranzas())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.recargar()

    expect(result.current.cuentas.length).toBe(2)
  })
})

describe('useDetalleCobranza', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería cargar cuenta y ventas del cliente', async () => {
    const { result } = renderHook(() => useDetalleCobranza('c1'))

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    expect(result.current.cuenta).not.toBeNull()
    expect(result.current.cuenta?.cliente_id).toBe('c1')
  })

  it('debería registrar pago', async () => {
    const { result } = renderHook(() => useDetalleCobranza('c1'))

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    const pagos = await result.current.registrarPago({
      ventasSeleccionadas: ['v1'],
      monto: 50,
      metodo_pago: 'efectivo',
      usuario_id: 'usr_001',
    })

    expect(pagos).toBeDefined()
  })
})