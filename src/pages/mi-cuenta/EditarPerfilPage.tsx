import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useAuthContext } from '@/context/AuthContext'
import { clientesService } from '@/services/clientes.service'
import { PageHeaderCliente } from '@/components/layout/PageHeaderCliente'
import { FormularioDatos } from './components/FormularioDatos'
import { FormularioPassword } from './components/FormularioPassword'
import type { ClienteFormData, ClientePasswordData } from '@/types/cliente.types'

export default function EditarPerfilPage() {
  const navigate = useNavigate()
  const { clienteData, setClienteData } = useAuthContext()
  const [formData, setFormData] = useState<ClienteFormData>({ nombre: '', dni_ruc: '', telefono: '' })
  const [passwordData, setPasswordData] = useState<ClientePasswordData>({ actual: '', nueva: '', confirmar: '' })
  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajePassword, setMensajePassword] = useState('')
  const [errorPassword, setErrorPassword] = useState('')

  useEffect(() => {
    if (clienteData) {
      setFormData({ nombre: clienteData.nombre || '', dni_ruc: clienteData.dni_ruc || '', telefono: clienteData.telefono || '' })
    }
  }, [clienteData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setErrorPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteData) return
    setGuardando(true)
    setMensaje('')
    try {
      const actualizado = await clientesService.actualizar(clienteData.id, {
        nombre: formData.nombre,
        dni_ruc: formData.dni_ruc || undefined,
        telefono: formData.telefono || undefined,
      })
      setClienteData(actualizado)
      setMensaje('Datos actualizados correctamente')
      setTimeout(() => navigate(RUTAS.CLIENTE.MI_CUENTA), 1500)
    } catch {
      setMensaje('Error al guardar los datos')
    } finally {
      setGuardando(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteData) return
    if (passwordData.nueva.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (passwordData.nueva !== passwordData.confirmar) {
      setErrorPassword('Las contraseñas no coinciden')
      return
    }
    setGuardandoPassword(true)
    setErrorPassword('')
    setMensajePassword('')
    try {
      const result = await clientesService.cambiarPassword(clienteData.id, passwordData.actual, passwordData.nueva)
      if (result.success) {
        setMensajePassword(result.message)
        setPasswordData({ actual: '', nueva: '', confirmar: '' })
      } else {
        setErrorPassword(result.message)
      }
    } catch {
      setErrorPassword('Error al cambiar la contraseña')
    } finally {
      setGuardandoPassword(false)
    }
  }

  const getTipoLabel = (tipo?: string) => {
    switch (tipo) {
      case 'mayorista': return 'Mayorista'
      case 'especial': return 'Especial'
      default: return 'Minorista'
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <button onClick={() => navigate(RUTAS.CLIENTE.MI_CUENTA)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm">Volver</span>
      </button>

      <PageHeaderCliente titulo="Editar Perfil" icono={User} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{clienteData?.nombre || 'Cliente'}</h2>
            <p className="text-sm text-primary font-medium">Cliente {getTipoLabel(clienteData?.tipo)}</p>
            {clienteData?.email && <p className="text-xs text-gray-500 mt-0.5">{clienteData.email}</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <FormularioDatos handleSubmit={handleSubmit} formData={formData} handleChange={handleChange} guardando={guardando} mensaje={mensaje} />
        <FormularioPassword handleSubmit={handlePasswordSubmit} passwordData={passwordData} handleChange={handlePasswordChange}
          showActual={showActual} showNueva={showNueva} showConfirmar={showConfirmar} setShowActual={setShowActual} setShowNueva={setShowNueva}
          setShowConfirmar={setShowConfirmar} guardando={guardandoPassword} error={errorPassword} mensaje={mensajePassword} />
      </div>
    </div>
  )
}