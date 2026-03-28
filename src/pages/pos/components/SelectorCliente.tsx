import { UserCircle, Edit3 } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'

interface Props {
  cliente: Cliente
  onClick: () => void
}

export function SelectorCliente({ cliente, onClick }: Props) {
  return (
    <>
      <div className="hidden md:block bg-blue-50 border-b border-blue-100 px-6 py-3">
        <button
          onClick={onClick}
          className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-2.5 w-fit"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle size={18} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Asociar cliente</p>
            <p className="text-sm font-semibold text-gray-900">Cliente: {cliente.nombre}</p>
          </div>
          <Edit3 size={16} className="text-blue-400" />
        </button>
      </div>

      <div className="md:hidden bg-white px-3 pb-2">
        <button
          onClick={onClick}
          className="w-full flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-2 py-1.5 mb-2"
        >
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle size={12} className="text-blue-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[9px] font-semibold text-blue-400 uppercase">Cliente</p>
            <p className="text-xs font-semibold text-gray-900 truncate">{cliente.nombre}</p>
          </div>
          <Edit3 size={12} className="text-blue-400 flex-shrink-0" />
        </button>
      </div>
    </>
  )
}
