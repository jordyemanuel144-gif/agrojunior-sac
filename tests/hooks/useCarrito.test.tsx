import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCarrito } from '@/pages/pos/hooks/useCarrito'
import type { Cliente } from '@/types/cliente.types'
import type { Producto } from '@/types/producto.types'

const productoMock: Producto = {
  id: 'prod_1',
  codigo: 'HUE001',
  nombre: 'Huevos Frescos',
  categoria_id: 'huevos',
  tipo_medida: 'kg',
  precio_costo: 5,
  precio_minorista: 10,
  precio_mayorista: 8,
  precio_especial: 9,
  stock_actual: 100,
  stock_minimo: 10,
  activo: true,
  destacado: true,
}

const clienteMinorista: Cliente = {
  id: 'c1',
  nombre: 'Cliente Minorista',
  dni_ruc: '12345678',
  tipo: 'minorista',
  pendiente_aprobacion: false,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('useCarrito', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('debería inicializar con carrito vacío', () => {
    const { result } = renderHook(() => useCarrito({} as Cliente, {}))
    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.totalItems).toBe(0)
  })

  it('debería agregar producto al carrito', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      const response = result.current.agregarProducto(productoMock, 2)
      expect(response.success).toBe(true)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].cantidad).toBe(2)
    expect(result.current.items[0].subtotal).toBe(20) // precio minorista * 2
  })

  it('debería incrementar cantidad si el producto ya existe', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
      result.current.agregarProducto(productoMock, 3)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].cantidad).toBe(5)
  })

  it('debería fallar si no hay stock suficiente', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 1 }))
    
    let response: { success: boolean; error?: string } = { success: false }
    act(() => {
      response = result.current.agregarProducto(productoMock, 5)
    })

    expect(response.success).toBe(false)
    expect(response.error).toContain('Stock insuficiente')
  })

  it('debería actualizar cantidad de un item', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
    })

    act(() => {
      result.current.actualizarCantidad(productoMock.id, 5)
    })

    expect(result.current.items[0].cantidad).toBe(5)
  })

  it('debería eliminar item si cantidad es 0', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
    })

    act(() => {
      result.current.actualizarCantidad(productoMock.id, 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('debería eliminar un item del carrito', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
    })

    act(() => {
      result.current.eliminarItem(productoMock.id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('debería limpiar el carrito', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
      result.current.limpiarCarrito()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('debería obtener precio según tipo de cliente', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, {}))
    
    const precioMinorista = result.current.getPrecio(productoMock)
    expect(precioMinorista).toBe(10) // precio_minorista

    const clienteMayorista: Cliente = {
      id: 'c2',
      nombre: 'Cliente Mayorista',
      dni_ruc: '87654321',
      tipo: 'mayorista',
      pendiente_aprobacion: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
    const { result: result2 } = renderHook(() => useCarrito(clienteMayorista, {}))
    const precioMayorista = result2.current.getPrecio(productoMock)
    expect(precioMayorista).toBe(8) // precio_mayorista
  })

  it('debería obtener stock disponible', () => {
    const stockInfo = { [productoMock.id]: 50 }
    const { result } = renderHook(() => useCarrito({} as Cliente, stockInfo))
    
    expect(result.current.getStockDisponible(productoMock.id)).toBe(50)
  })

  it('debería retornar 0 para producto sin stock info', () => {
    const { result } = renderHook(() => useCarrito({} as Cliente, {}))
    
    expect(result.current.getStockDisponible(productoMock.id)).toBe(0)
  })

  it('debería obtener cantidad en carrito', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 5)
    })

    expect(result.current.getCantidadEnCarrito(productoMock.id)).toBe(5)
  })

  it('debería calcular subtotal correctamente', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 2)
    })

    expect(result.current.subtotal).toBe(20)
  })

  it('debería calcular totalItems correctamente', () => {
    const { result } = renderHook(() => useCarrito(clienteMinorista, { [productoMock.id]: 100 }))
    
    act(() => {
      result.current.agregarProducto(productoMock, 3)
    })

    expect(result.current.totalItems).toBe(3)
  })
})