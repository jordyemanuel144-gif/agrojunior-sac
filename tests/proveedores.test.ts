import { describe, it, expect, beforeEach } from 'vitest'
import { proveedoresService } from '@/services/proveedores.service'

describe('proveedoresService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener todos los proveedores activos', async () => {
    const proveedores = await proveedoresService.obtenerTodos()
    expect(proveedores.length).toBeGreaterThan(0)
    expect(proveedores.every(p => p.activo)).toBe(true)
  })

  it('debería buscar proveedor por id', async () => {
    const proveedores = await proveedoresService.obtenerTodos()
    const proveedor = await proveedoresService.obtenerPorId(proveedores[0].id)
    expect(proveedor).not.toBeNull()
  })

  it('debería retornar null para id inexistente', async () => {
    const proveedor = await proveedoresService.obtenerPorId('no-existe')
    expect(proveedor).toBeNull()
  })

  it('debería crear un nuevo proveedor', async () => {
    const nuevo = await proveedoresService.crear({
      nombre: 'Proveedor Test',
      ruc: '12345678901',
      telefono: '123456789',
      email: 'test@proveedor.com',
      direccion: 'Test address',
      activo: true,
    })
    expect(nuevo.nombre).toBe('Proveedor Test')
    expect(nuevo.activo).toBe(true)
  })

  it('debería actualizar un proveedor', async () => {
    const proveedores = await proveedoresService.obtenerTodos()
    const actualizado = await proveedoresService.actualizar(proveedores[0].id, {
      telefono: '999999999',
    })
    expect(actualizado.telefono).toBe('999999999')
  })

  it('debería eliminar (desactivar) un proveedor', async () => {
    const proveedores = await proveedoresService.obtenerTodos()
    await proveedoresService.eliminar(proveedores[0].id)
    const proveedor = await proveedoresService.obtenerPorId(proveedores[0].id)
    expect(proveedor?.activo).toBe(false)
  })

  it('debería obtener proveedor sin async', async () => {
    const proveedores = await proveedoresService.obtenerTodos()
    const proveedor = proveedoresService.getProveedor(proveedores[0].id)
    expect(proveedor?.nombre).toBeDefined()
  })
})