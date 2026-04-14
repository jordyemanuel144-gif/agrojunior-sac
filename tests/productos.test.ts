import { describe, it, expect, beforeEach } from 'vitest'
import { productosService } from '@/services/productos.service'

describe('productosService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería obtener todos los productos activos', async () => {
    const productos = await productosService.obtenerTodos()
    expect(productos.length).toBeGreaterThan(0)
    expect(productos.every(p => p.activo)).toBe(true)
  })

  it('debería obtener productos incluyendo inactivos', async () => {
    const productos = await productosService.obtenerTodosIncluyendoInactivos()
    expect(productos.length).toBeGreaterThan(0)
  })

  it('debería buscar producto por id', async () => {
    const productos = await productosService.obtenerTodos()
    const producto = await productosService.obtenerPorId(productos[0].id)
    expect(producto).not.toBeNull()
  })

  it('debería retornar null para id inexistente', async () => {
    const producto = await productosService.obtenerPorId('no-existe')
    expect(producto).toBeNull()
  })

  it('debería crear un nuevo producto', async () => {
    const nuevo = await productosService.crear({
      nombre: 'Nuevo Producto',
      codigo: 'TEST001',
      tipo_medida: 'kg',
      precio_costo: 80,
      precio_minorista: 100,
      precio_mayorista: 90,
      precio_especial: 85,
      stock_actual: 50,
      stock_minimo: 10,
      categoria_id: 'huevos',
      activo: true,
      destacado: false,
    })
    expect(nuevo.nombre).toBe('Nuevo Producto')
  })

  it('debería actualizar un producto', async () => {
    const productos = await productosService.obtenerTodos()
    const actualizado = await productosService.actualizar(productos[0].id, {
      nombre: 'Producto Actualizado',
    })
    expect(actualizado.nombre).toBe('Producto Actualizado')
  })

  it('debería eliminar (desactivar) un producto', async () => {
    const productos = await productosService.obtenerTodos()
    const initialCount = productos.length
    await productosService.eliminar(productos[0].id)
    const restantes = await productosService.obtenerTodos()
    expect(restantes.length).toBe(initialCount - 1)
  })

  it('debería obtener nombre del producto', async () => {
    const productos = await productosService.obtenerTodos()
    const nombre = productosService.getProducto(productos[0].id)
    expect(nombre).toBe(productos[0].nombre)
  })

  it('debería obtener categorías', async () => {
    const categorias = await productosService.obtenerCategorias()
    expect(categorias.length).toBeGreaterThan(0)
  })

  it('debería obtener productos destacados', async () => {
    const destacados = await productosService.obtenerDestacados()
    expect(destacados.every(p => p.destacado)).toBe(true)
  })
})