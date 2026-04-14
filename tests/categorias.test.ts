import { describe, it, expect } from 'vitest'
import { categoriasService } from '@/services/categorias.service'

describe('categoriasService', () => {
  it('debería obtener todas las categorías', async () => {
    const categorias = await categoriasService.obtenerTodos()
    expect(categorias.length).toBeGreaterThan(0)
  })

  it('debería buscar categoría por id', async () => {
    const categorias = await categoriasService.obtenerTodos()
    const categoria = await categoriasService.obtenerPorId(categorias[0].id)
    expect(categoria).not.toBeNull()
    expect(categoria?.id).toBe(categorias[0].id)
  })

  it('debería retornar null para id inexistente', async () => {
    const categoria = await categoriasService.obtenerPorId('no-existe')
    expect(categoria).toBeNull()
  })
})