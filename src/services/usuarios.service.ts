import type { User, NuevoUsuario } from '@/types/usuario.types'
import { USUARIOS_MOCK } from '@/datos-mock/usuarios.mock'
import { generarId } from '@/lib/utils'

let usuarios: User[] = [...USUARIOS_MOCK]

const STORAGE_KEY = 'samjose_usuarios'

const cargarDesdeStorage = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {}
  return usuarios
}

const guardarEnStorage = (data: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

usuarios = cargarDesdeStorage()

export const usuariosService = {
  obtenerTodos: async (): Promise<User[]> => {
    return usuarios
  },

  obtenerActivos: async (): Promise<User[]> => {
    return usuarios.filter(u => u.active)
  },

  obtenerPorId: async (id: string): Promise<User | null> => {
    return usuarios.find(u => u.id === id) ?? null
  },

  crear: async (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    const now = new Date().toISOString()
    const nuevo: User = {
      ...datos,
      id: generarId(),
      created_at: now,
      updated_at: now,
    }
    usuarios = [nuevo, ...usuarios]
    guardarEnStorage(usuarios)
    return nuevo
  },

  actualizar: async (id: string, datos: Partial<User>): Promise<User> => {
    usuarios = usuarios.map(u =>
      u.id === id ? { ...u, ...datos, updated_at: new Date().toISOString() } : u
    )
    guardarEnStorage(usuarios)
    return usuarios.find(u => u.id === id)!
  },

  toggleActivo: async (id: string): Promise<User> => {
    usuarios = usuarios.map(u =>
      u.id === id ? { ...u, active: !u.active, updated_at: new Date().toISOString() } : u
    )
    guardarEnStorage(usuarios)
    return usuarios.find(u => u.id === id)!
  },

  eliminar: async (id: string): Promise<void> => {
    usuarios = usuarios.filter(u => u.id !== id)
    guardarEnStorage(usuarios)
  },

  login: async (email: string, password: string): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 500))
    const usuario = usuarios.find(u => u.email === email && u.active)
    if (usuario && password === 'samjose123') {
      return usuario
    }
    return null
  },

  getByEmail: (email: string): User | undefined => {
    return usuarios.find(u => u.email === email)
  },
}
