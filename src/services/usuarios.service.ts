/**
 * Service de gestión de usuarios (staff: admin/vendedor).
 * SUPABASE: CRUD sobre tabla usuarios (vinculada a auth.users).
 */
import { supabase, handleError } from '@/lib/supabase'
import type { User, NuevoUsuario } from '@/types/usuario.types'

export const usuariosService = {
  obtenerTodos: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('name')

    handleError(error, 'Error al obtener usuarios')
    return data ?? []
  },

  obtenerActivos: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('active', true)
      .order('name')

    handleError(error, 'Error al obtener usuarios activos')
    return data ?? []
  },

  obtenerPorId: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener usuario')
    return data
  },

  crear: async (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    // Primero crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: datos.email,
      password: 'samjose123', // Contraseña temporal
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Error al crear usuario en Auth')
    }

    // Luego insertar en tabla usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: datos.email,
        name: datos.name,
        role: datos.role,
        active: datos.active,
      })
      .select()
      .single()

    handleError(error, 'Error al crear usuario')
    return data!
  },

  actualizar: async (id: string, datos: Partial<User>): Promise<User> => {
    // No permitir cambiar id, email, created_at, updated_at desde aquí
    const { id: _, email: __, created_at: ___, updated_at: ____, ...datosLimpios } = datos as User

    const { data, error } = await supabase
      .from('usuarios')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single()

    handleError(error, 'Error al actualizar usuario')
    return data!
  },

  toggleActivo: async (id: string): Promise<User> => {
    const usuario = await usuariosService.obtenerPorId(id)
    if (!usuario) throw new Error('Usuario no encontrado')

    return usuariosService.actualizar(id, { active: !usuario.active })
  },

  eliminar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    handleError(error, 'Error al eliminar usuario')
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) return null

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return usuario
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    return data
  },
}
