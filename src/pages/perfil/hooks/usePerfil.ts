import { useState } from 'react'
import { usuariosService } from '@/services/usuarios.service'
import { useAuthContext } from '@/context/AuthContext'
import type { User } from '@/types/usuario.types'

interface UsePerfilReturn {
  usuario: User | null
  guardando: boolean
  error: string | null
  exito: string | null
  actualizarPerfil: (datos: { name: string; email: string }) => Promise<void>
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<boolean>
  limpiarMensajes: () => void
}

export function usePerfil(): UsePerfilReturn {
  const { user, actualizarUser } = useAuthContext()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  const actualizarPerfil = async (datos: { name: string; email: string }) => {
    if (!user) return
    
    setGuardando(true)
    setError(null)
    setExito(null)
    
    try {
      const emailExistente = await usuariosService.getByEmail(datos.email)
      if (emailExistente && emailExistente.id !== user.id) {
        setError('El correo electrónico ya está en uso')
        setGuardando(false)
        return
      }
      
      await usuariosService.actualizar(user.id, datos)
      actualizarUser(datos)
      setExito('Perfil actualizado correctamente')
    } catch {
      setError('Error al actualizar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarPassword = async (passwordActual: string, passwordNueva: string): Promise<boolean> => {
    if (!user) return false
    
    setGuardando(true)
    setError(null)
    
    try {
      if (passwordActual !== 'samjose123') {
        setError('La contraseña actual es incorrecta')
        setGuardando(false)
        return false
      }
      
      if (passwordNueva.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres')
        setGuardando(false)
        return false
      }
      
      setExito('Contraseña actualizada correctamente')
      setGuardando(false)
      return true
    } catch {
      setError('Error al cambiar la contraseña')
      setGuardando(false)
      return false
    }
  }

  const limpiarMensajes = () => {
    setError(null)
    setExito(null)
  }

  return {
    usuario: user,
    guardando,
    error,
    exito,
    actualizarPerfil,
    cambiarPassword,
    limpiarMensajes,
  }
}