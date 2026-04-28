import { useState } from 'react'
import { clientesService } from '@/services/clientes.service'
import { supabase } from '@/lib/supabase'

interface FormData {
  nombre: string
  telefono: string
  direccion: string
  mensaje: string
  email: string
  password: string
  confirmPassword: string
}

interface UseRegistroClienteReturn {
  formData: FormData
  enviando: boolean
  enviado: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useRegistroCliente(): UseRegistroClienteReturn {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    direccion: '',
    mensaje: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear la cuenta')

      // 2. Crear cliente vinculado al usuario de Auth
      const nuevoCliente = await clientesService.crear({
        nombre: formData.nombre,
        telefono: formData.telefono,
        tipo: 'minorista',
        email: formData.email,
        auth_user_id: authData.user.id,
        activo: true,
      })

      // Si el cliente se creó sin auth_user_id (por el service), actualizarlo
      if (!nuevoCliente.auth_user_id) {
        await supabase
          .from('clientes')
          .update({ auth_user_id: authData.user.id })
          .eq('id', nuevoCliente.id)
      }

      setEnviado(true)
    } catch (error) {
      console.error('Error al registrar:', error)
    } finally {
      setEnviando(false)
    }
  }

  return {
    formData,
    enviando,
    enviado,
    handleChange,
    handleSubmit,
  }
}
