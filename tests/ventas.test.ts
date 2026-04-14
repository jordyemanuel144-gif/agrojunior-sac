import { describe, it, expect, beforeEach } from 'vitest'
import { ventasService } from '@/services/ventas.service'

describe('ventasService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener todas las ventas', async () => {
    const ventas = await ventasService.obtenerTodos()
    expect(ventas.length).toBeGreaterThan(0)
  })

  it('debería buscar venta por id', async () => {
    const ventas = await ventasService.obtenerTodos()
    const venta = await ventasService.obtenerPorId(ventas[0].id)
    expect(venta).not.toBeNull()
  })

  it('debería retornar null para id inexistente', async () => {
    const venta = await ventasService.obtenerPorId('no-existe')
    expect(venta).toBeNull()
  })

  it('debería obtener ventas por fecha', async () => {
    const hoy = new Date()
    const ventas = await ventasService.obtenerPorFecha(hoy)
    expect(Array.isArray(ventas)).toBe(true)
  })

  it('debería obtener ventas por vendedor', async () => {
    const ventas = await ventasService.obtenerTodos()
    if (ventas.length > 0) {
      const ventasVendedor = await ventasService.obtenerPorVendedor(ventas[0].vendedor_id)
      expect(ventasVendedor.every(v => v.vendedor_id === ventas[0].vendedor_id)).toBe(true)
    }
  })

  it('debería obtener ventas por cliente', async () => {
    const ventas = await ventasService.obtenerTodos()
    if (ventas.length > 0 && ventas[0].cliente_id) {
      const ventasCliente = await ventasService.obtenerPorCliente(ventas[0].cliente_id)
      expect(ventasCliente.every(v => v.cliente_id === ventas[0].cliente_id)).toBe(true)
    }
  })

  it('debería obtener nombre del cliente', async () => {
    const ventas = await ventasService.obtenerTodos()
    const nombre = ventasService.getCliente(ventas[0].cliente_id)
    expect(nombre).toBeDefined()
  })
})