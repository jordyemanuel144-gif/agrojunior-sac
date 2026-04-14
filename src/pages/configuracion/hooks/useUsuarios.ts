import { useEffect, useState } from 'react'
import { usuariosService } from '@/services/usuarios.service'
import type { User, NuevoUsuario } from '@/types/usuario.types'

interface UseUsuariosReturn {
  usuarios: User[]
  cargando: boolean
  error: string | null
  crearUsuario: (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  actualizarUsuario: (id: string, datos: Partial<User>) => Promise<void>
  toggleActivo: (id: string) => Promise<void>
  eliminarUsuario: (id: string) => Promise<void>
  recargar: () => void
}

export function useUsuarios(): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = () => {
    setCargando(true)
    setError(null)
    usuariosService.obtenerTodos()
      .then(data => {
        setUsuarios(data)
        setCargando(false)
      })
      .catch(() => {
        setError('Error al cargar usuarios')
        setCargando(false)
      })
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const crearUsuario = async (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await usuariosService.crear(datos)
      fetchUsuarios()
    } catch {
      setError('Error al crear usuario')
    }
  }

  const actualizarUsuario = async (id: string, datos: Partial<User>) => {
    try {
      await usuariosService.actualizar(id, datos)
      fetchUsuarios()
    } catch {
      setError('Error al actualizar usuario')
    }
  }

  const toggleActivo = async (id: string) => {
    try {
      await usuariosService.toggleActivo(id)
      fetchUsuarios()
    } catch {
      setError('Error al cambiar estado del usuario')
    }
  }

  const eliminarUsuario = async (id: string) => {
    try {
      await usuariosService.eliminar(id)
      fetchUsuarios()
    } catch {
      setError('Error al eliminar usuario')
    }
  }

  return {
    usuarios,
    cargando,
    error,
    crearUsuario,
    actualizarUsuario,
    toggleActivo,
    eliminarUsuario,
    recargar: fetchUsuarios,
  }
}
