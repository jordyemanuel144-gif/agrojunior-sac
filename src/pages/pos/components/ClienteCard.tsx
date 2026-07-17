// ClienteCard - Tarjeta de información del cliente en ConfirmarPedido
import { UserCircle, Edit3 } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'

interface Props {
  cliente: Cliente
  onCambiar: () => void
}

export function ClienteCard({ cliente, onCambiar }: Props) {
  return (
    <button 
      onClick={onCambiar}
      className={`relative w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 text-left hover:border-primary transition-colors ${cliente.tipo !== 'minorista' ? 'pr-14' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cliente.tipo === 'mayorista' ? 'bg-green-100' : cliente.tipo === 'especial' ? 'bg-purple-100' : 'bg-primary-light'}`}>
        <UserCircle size={20} className={`${cliente.tipo === 'mayorista' ? 'text-green-600' : cliente.tipo === 'especial' ? 'text-purple-600' : 'text-primary'}`} />
      </div>
      <div className={`flex-1 min-w-0 ${cliente.tipo !== 'minorista' ? '' : 'pr-3'}`}>
        <p className={`text-[11px] font-semibold ${cliente.tipo === 'mayorista' ? 'text-green-600' : cliente.tipo === 'especial' ? 'text-purple-600' : 'text-gray-400'}`}>
          {cliente.tipo === 'mayorista' ? 'CLIENTE MAYORISTA' : cliente.tipo === 'especial' ? 'CLIENTE ESPECIAL' : 'Cliente'}
        </p>
        <p className={`text-sm font-bold truncate ${cliente.tipo === 'mayorista' ? 'text-green-900' : cliente.tipo === 'especial' ? 'text-purple-900' : 'text-gray-900'}`}>{cliente.nombre}</p>
        <div className={`flex items-center gap-2 mt-0.5 ${cliente.tipo !== 'minorista' ? 'text-gray-500' : ''}`}>
          {cliente.dni_ruc && <p className={`text-xs ${cliente.tipo !== 'minorista' ? 'text-green-600' : 'text-gray-400'}`}>{cliente.dni_ruc}</p>}
          {cliente.dni_ruc && cliente.telefono && <span className={`${cliente.tipo !== 'minorista' ? 'text-green-300' : 'text-gray-300'}`}>•</span>}
          {cliente.telefono && <p className={`text-xs ${cliente.tipo !== 'minorista' ? 'text-green-600' : 'text-gray-400'}`}>{cliente.telefono}</p>}
        </div>
      </div>
      {cliente.tipo !== 'minorista' && (
        <span className={`absolute right-10 text-[10px] font-bold px-2.5 py-1 rounded-full ${
          cliente.tipo === 'mayorista' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {cliente.tipo === 'mayorista' ? 'Mayorista' : 'Especial'}
        </span>
      )}
      <div className={`absolute right-3 w-9 h-9 rounded-full flex items-center justify-center ${cliente.tipo === 'mayorista' ? 'bg-green-50' : cliente.tipo === 'especial' ? 'bg-purple-50' : 'bg-gray-100'}`}>
        <Edit3 size={14} className={`${cliente.tipo === 'mayorista' ? 'text-green-500' : cliente.tipo === 'especial' ? 'text-purple-500' : 'text-gray-500'}`} />
      </div>
    </button>
  )
}