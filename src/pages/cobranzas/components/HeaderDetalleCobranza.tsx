import { ArrowLeft, User, Phone } from 'lucide-react'
import type { Cliente, TipoCliente } from '@/types/cliente.types'

interface HeaderDetalleCobranzaProps {
  cliente: Cliente | null
  onVolver: () => void
}

const TIPO_CONFIG: Record<TipoCliente, { label: string; bg: string; text: string }> = {
  minorista: { label: 'Minorista', bg: 'bg-blue-100', text: 'text-blue-700' },
  mayorista: { label: 'Mayorista', bg: 'bg-green-100', text: 'text-green-700' },
  especial: { label: 'Especial', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export function HeaderDetalleCobranza({ cliente, onVolver }: HeaderDetalleCobranzaProps) {
  if (!cliente) {
    return (
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={onVolver}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tipo = TIPO_CONFIG[cliente.tipo]

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onVolver}
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

        {cliente.telefono && (
          <div className="flex items-center gap-2 px-4 pb-4">
            <Phone size={16} className="text-gray-400" />
            <a href={`tel:${cliente.telefono}`} className="text-sm text-blue-600 hover:underline">
              {cliente.telefono}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}