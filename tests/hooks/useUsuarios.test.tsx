import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUsuarios } from '@/pages/configuracion/hooks/useUsuarios'
import { usuariosService } from '@/services/usuarios.service'

vi.mock('@/services/usuarios.service', () => ({
  usuariosService: {
    obtenerTodos: vi.fn().mockResolvedValue([
      { id: 'usr_001', name: 'Admin', email: 'admin@test.com', role: 'admin', active: true },
      { id: 'usr_002', name: 'Vendedor', email: 'vendedor@test.com', role: 'vendedor', active: true },
    ]),
    crear: vi.fn().mockResolvedValue({ id: 'usr_003', name: 'Nuevo' }),
    actualizar: vi.fn().mockResolvedValue({ id: 'usr_001', name: 'Actualizado' }),
    toggleActivo: vi.fn().mockResolvedValue({ id: 'usr_001', active: false }),
    eliminar: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('useUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería cargar usuarios al iniciar', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    expect(result.current.usuarios.length).toBe(2)
  })

  it('debería crear un nuevo usuario', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.crearUsuario({
      name: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      role: 'vendedor',
      active: true,
    })

    expect(usuariosService.crear).toHaveBeenCalled()
  })

  it('debería actualizar un usuario', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.actualizarUsuario('usr_001', { name: 'Actualizado' })

    expect(usuariosService.actualizar).toHaveBeenCalledWith('usr_001', { name: 'Actualizado' })
  })

  it('debería togglear activo de usuario', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.toggleActivo('usr_001')

    expect(usuariosService.toggleActivo).toHaveBeenCalledWith('usr_001')
  })

  it('debería eliminar un usuario', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.eliminarUsuario('usr_001')

    expect(usuariosService.eliminar).toHaveBeenCalledWith('usr_001')
  })

  it('debería recargar usuarios', async () => {
    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.cargando).toBe(false)
    })

    await result.current.recargar()

    expect(usuariosService.obtenerTodos).toHaveBeenCalledTimes(2)
  })
})