// Fila clickeable de cliente
import { useNavigate } from 'react-router-dom'
import { User, ChevronRight, Phone, Clock } from 'lucide-react'
import type { Cliente, TipoCliente } from '@/types/cliente.types'
import { RUTAS } from '@/config/rutas'

interface Props {
  cliente: Cliente
}

const TIPO_CONFIG: Record<TipoCliente, { label: string; color: string; bg: string; text: string }> = {
  minorista: { label: 'Minorista', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700' },
  mayorista: { label: 'Mayorista', color: 'green', bg: 'bg-green-100', text: 'text-green-700' },
  especial: { label: 'Especial', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export function FilaCliente({ cliente }: Props) {
  const navigate = useNavigate()
  const tipo = TIPO_CONFIG[cliente.tipo]

  const handleClick = () => {
    navigate(`${RUTAS.ADMIN.CLIENTES}/${cliente.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 md:gap-4 p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0 ${
        cliente.pendiente_aprobacion ? 'bg-yellow-50/50' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        cliente.pendiente_aprobacion ? 'bg-yellow-100' : tipo.bg
      }`}>
        {cliente.pendiente_aprobacion ? (
          <Clock size={24} className="text-yellow-600" />
        ) : (
          <User size={24} className={tipo.text} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{cliente.nombre}</span>
          {cliente.pendiente_aprobacion && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-yellow-100 text-yellow-700">
              Pendiente
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tipo.bg} ${tipo.text}`}>
            {cliente.dni_ruc ? (cliente.tipo === 'minorista' ? 'DNI' : 'RUC') : ''} {cliente.dni_ruc}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          {cliente.telefono && (
            <p className="flex items-center gap-1">
              <Phone size={14} className="text-gray-400" />
              {cliente.telefono}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {!cliente.pendiente_aprobacion && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tipo.bg} ${tipo.text}`}>
            {tipo.label}
          </span>
        )}
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  )
}
