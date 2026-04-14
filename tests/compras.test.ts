import { describe, it, expect, beforeEach } from 'vitest'
import { comprasService } from '@/services/compras.service'

describe('comprasService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener todas las compras', async () => {
    const compras = await comprasService.obtenerTodos()
    expect(compras.length).toBeGreaterThan(0)
  })

  it('debería buscar compra por id', async () => {
    const compras = await comprasService.obtenerTodos()
    const compra = await comprasService.obtenerPorId(compras[0].id)
    expect(compra).not.toBeNull()
  })

  it('debería retornar null para id inexistente', async () => {
    const compra = await comprasService.obtenerPorId('no-existe')
    expect(compra).toBeNull()
  })

  it('debería obtener compras por proveedor', async () => {
    const compras = await comprasService.obtenerTodos()
    if (compras.length > 0 && compras[0].proveedor_id) {
      const comprasProveedor = await comprasService.obtenerPorProveedor(compras[0].proveedor_id)
      expect(comprasProveedor.every(c => c.proveedor_id === compras[0].proveedor_id)).toBe(true)
    }
  })

  it('debería generar número correlativo', async () => {
    const numero = comprasService.generarNumero()
    expect(numero).toMatch(/^C-\d{5}$/)
  })

  it('debería obtener info de producto', async () => {
    const compras = await comprasService.obtenerTodos()
    if (compras.length > 0 && compras[0].items.length > 0) {
      const info = await comprasService.getProductoInfo(compras[0].items[0].producto_id)
      expect(info.nombre).toBeDefined()
    }
  })
})