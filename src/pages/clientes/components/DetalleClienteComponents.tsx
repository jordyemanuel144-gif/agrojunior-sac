import { ArrowLeft, User, Phone, FileText, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import type { Cliente, TipoCliente } from '@/types/cliente.types'

interface Props {
  cliente: Cliente
}

const TIPO_CONFIG: Record<TipoCliente, { label: string; bg: string; text: string }> = {
  minorista: { label: 'Minorista', bg: 'bg-blue-100', text: 'text-blue-700' },
  mayorista: { label: 'Mayorista', bg: 'bg-green-100', text: 'text-green-700' },
  especial: { label: 'Especial', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export function HeaderDetalleCliente({ cliente }: Props) {
  const navigate = useNavigate()
  const tipo = TIPO_CONFIG[cliente.tipo]

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(RUTAS.ADMIN.CLIENTES)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex-1" />
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${tipo.bg} ${tipo.text}`}>
            {tipo.label}
          </span>
        </div>

        <div className="flex items-center gap-4 px-4 pb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${tipo.bg}`}>
            <User size={32} className={tipo.text} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{cliente.nombre}</h1>
            <p className="text-gray-500">
              {cliente.dni_ruc ? (cliente.tipo === 'minorista' ? 'DNI' : 'RUC') + ' ' + cliente.dni_ruc : 'Sin documento'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InfoClienteCards({ cliente }: Props) {
  const fechaRegistro = new Date(cliente.created_at)
  const fechaActualizacion = new Date(cliente.updated_at)
  const tipo = TIPO_CONFIG[cliente.tipo]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Información del cliente</h3>
        <div className="space-y-3">
          {cliente.dni_ruc && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{cliente.tipo === 'minorista' ? 'DNI' : 'RUC'}</p>
                <p className="text-sm font-medium text-gray-900">{cliente.dni_ruc}</p>
              </div>
            </div>
          )}
          {cliente.telefono && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{cliente.telefono}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tipo.bg}`}>
              <User size={16} className={tipo.text} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tipo de cliente</p>
              <p className="text-sm font-medium text-gray-900">{tipo.label}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Datos del registro</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de registro</p>
              <p className="text-sm font-medium text-gray-900">
                {fechaRegistro.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">
                {fechaActualizacion.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
