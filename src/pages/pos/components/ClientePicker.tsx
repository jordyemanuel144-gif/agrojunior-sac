// ClientePicker - Modal para seleccionar cliente
import { UserCircle, X } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'

interface Props {
  clientes: Cliente[]
  clienteSeleccionado?: Cliente | null
  onSeleccionar: (cliente: Cliente) => void
  onCerrar: () => void
}

export function ClientePicker({ clientes, clienteSeleccionado, onSeleccionar, onCerrar }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="bg-white w-full md:w-96 md:rounded-3xl rounded-t-3xl p-4 max-h-[75%] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle size={16} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Seleccionar Cliente</h3>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
        <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
          {clientes.map(c => (
            <button
              key={c.id}
              onClick={() => onSeleccionar(c)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                clienteSeleccionado?.id === c.id
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.nombre}</p>
                {c.dni_ruc && <p className="text-xs text-gray-400">{c.dni_ruc}</p>}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  c.tipo === 'mayorista'
                    ? 'bg-green-100 text-green-700'
                    : c.tipo === 'especial'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {c.tipo}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
