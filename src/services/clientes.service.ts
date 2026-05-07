/**
 * Service de gestión de clientes.
 * SUPABASE: CRUD sobre tabla clientes.
 * Los clientes pueden tener cuenta web (auth_user_id → auth.users).
 * Login/password se manejan con Supabase Auth, no con password_hash.
 */
import { supabase, handleError } from '@/lib/supabase'
import type { Cliente, NuevoCliente } from '@/types/cliente.types'

let cacheClientes: Cliente[] = []
let cacheCargado = false

export const clientesService = {
  obtenerTodos: async (): Promise<Cliente[]> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre')

    handleError(error, 'Error al obtener clientes')
    cacheClientes = data ?? []
    cacheCargado = true
    return cacheClientes
  },

  obtenerPorId: async (id: string): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    handleError(error, 'Error al obtener cliente')
    return data
  },

  crear: async (datos: NuevoCliente): Promise<Cliente> => {
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre: datos.nombre,
        dni_ruc: datos.dni_ruc,
        telefono: datos.telefono,
        email: datos.email,
        tipo: datos.tipo ?? 'minorista',
        pendiente_aprobacion: true,
        activo: true,
      })
      .select()
      .single()

    handleError(error, 'Error al crear cliente')
    return data!
  },

  obtenerPendientes: async (): Promise<Cliente[]> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('pendiente_aprobacion', true)
      .order('created_at', { ascending: false })

    handleError(error, 'Error al obtener clientes pendientes')
    return data ?? []
  },

  aprobarCliente: async (id: string, tipo: Cliente['tipo']): Promise<Cliente> => {
    const { data, error } = await supabase
      .from('clientes')
      .update({ tipo, pendiente_aprobacion: false })
      .eq('id', id)
      .select()
      .single()

    handleError(error, 'Error al aprobar cliente')
    return data!
  },

  actualizar: async (id: string, datos: Partial<Cliente>): Promise<Cliente> => {
    const { id: _, created_at: __, updated_at: ___, ...datosLimpios } = datos as Cliente

    const { data, error } = await supabase
      .from('clientes')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single()

    handleError(error, 'Error al actualizar cliente')
    return data!
  },

  eliminar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', id)

    handleError(error, 'Error al desactivar cliente')
  },

  actualizarTelefono: async (id: string, telefono: string): Promise<Cliente> => {
    return clientesService.actualizar(id, { telefono })
  },

  getCliente: async (id: string): Promise<string> => {
    const cliente = await clientesService.obtenerPorId(id)
    return cliente?.nombre ?? 'Cliente no encontrado'
  },

  obtenerClienteSync: (_id: string): Cliente | undefined => {
    return cacheClientes.find(c => c.id === _id)
  },

  obtenerClienteActivoSync: (_id: string): Cliente | undefined => {
    return cacheClientes.find(c => c.id === _id && c.activo)
  },

  obtenerClienteDelCache: (_id: string): Cliente | undefined => {
    return cacheClientes.find(c => c.id === _id)
  },

  login: async (email: string, password: string): Promise<Cliente | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) return null

    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', data.user.email)
      .single()

    return cliente
  },

  obtenerPorEmail: async (email: string): Promise<Cliente | null> => {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .single()

    return data
  },

  cambiarPassword: async (id: string, passwordActual: string, passwordNueva: string): Promise<{ success: boolean; message: string }> => {
    if (passwordNueva.length < 6) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' }
    }

    // En Supabase Auth, el cambio de contraseña se hace directamente
    const { error } = await supabase.auth.updateUser({ password: passwordNueva })

    if (error) {
      return { success: false, message: error.message }
    }
    return { success: true, message: 'Contraseña actualizada correctamente' }
  },
}
