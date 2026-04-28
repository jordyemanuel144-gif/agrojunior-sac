/**
 * Cliente Supabase para la base de datos.
 * Todos los services importan de aquí — nunca crean su propio client.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper para lanzar error si una operación de Supabase falla.
 * Nunca silencia errores — los propaga hacia arriba.
 */
export function handleError(error: { message: string } | null, contexto?: string): void {
  if (error) {
    const mensaje = contexto ? `${contexto}: ${error.message}` : error.message
    throw new Error(mensaje)
  }
}
