import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientesService } from '@/services/clientes.service'
import { RUTAS } from '@/config/rutas'
import { WHATSAPP } from '@/config/constantes'

interface FormData {
  nombre: string
  telefono: string
  direccion: string
  mensaje: string
}

interface UseRegistroClienteReturn {
  formData: FormData
  enviando: boolean
  enviado: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useRegistroCliente(): UseRegistroClienteReturn {
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    direccion: '',
    mensaje: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      await clientesService.crear({
        nombre: formData.nombre,
        telefono: formData.telefono,
        tipo: 'minorista',
      })

      setEnviado(true)

      setTimeout(() => {
        const mensaje = `Hola,%20quiero%20registrarme%20como%20cliente:%20${encodeURIComponent(formData.nombre)}%20-%20Tel:%20${encodeURIComponent(formData.telefono)}%20-%20Dirección:%20${encodeURIComponent(formData.direccion || 'No especificada')}`
        window.open(`https://wa.me/${WHATSAPP}?text=${mensaje}`, '_blank')
        navigate(RUTAS.PUBLICO.HOME)
      }, 2000)
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
