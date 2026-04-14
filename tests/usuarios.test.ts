import { describe, it, expect, beforeEach } from 'vitest'
import { usuariosService } from '@/services/usuarios.service'

describe('usuariosService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debería validar credenciales correctas', async () => {
    const usuario = await usuariosService.login('admin@samjose.com', 'samjose123')
    expect(usuario).not.toBeNull()
    expect(usuario?.email).toBe('admin@samjose.com')
  })

  it('debería fallar con credenciales incorrectas', async () => {
    const usuario = await usuariosService.login('admin@samjose.com', 'wrongpass')
    expect(usuario).toBeNull()
  })

  it('debería fallar con email inexistente', async () => {
    const usuario = await usuariosService.login('noexiste@test.com', 'samjose123')
    expect(usuario).toBeNull()
  })

  it('debería obtener todos los usuarios', async () => {
    const usuarios = await usuariosService.obtenerTodos()
    expect(usuarios.length).toBeGreaterThan(0)
  })

  it('debería obtener usuarios activos', async () => {
    const usuarios = await usuariosService.obtenerActivos()
    expect(usuarios.every(u => u.active)).toBe(true)
  })
})