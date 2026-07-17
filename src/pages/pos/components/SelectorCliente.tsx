import { UserCircle, Edit3, Plus } from 'lucide-react'
import type { Cliente } from '@/types/cliente.types'

interface Props {
  cliente: Cliente | null
  onClick: () => void
}

export function SelectorCliente({ cliente, onClick }: Props) {
  const nombreCliente = cliente?.nombre || 'Seleccionar cliente'

  return (
    <>
      <div className="hidden md:block bg-primary-light border-b border-primary-light px-6 py-3">
        <button
          onClick={onClick}
          className="flex items-center gap-3 bg-white border border-primary-light rounded-xl px-4 py-2.5 w-fit"
        >
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle size={18} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Cliente</p>
            <p className="text-sm font-semibold text-gray-900">{nombreCliente}</p>
          </div>
          <Plus size={16} className="text-primary" />
        </button>
      </div>

      <div className="md:hidden bg-white px-3 pb-2">
        <button
          onClick={onClick}
          className="w-full flex items-center gap-2 bg-primary-light border border-primary-light rounded-xl px-2 py-1.5 mb-2"
        >
          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle size={12} className="text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[9px] font-semibold text-primary uppercase">Cliente</p>
            <p className="text-xs font-semibold text-gray-900 truncate">{nombreCliente}</p>
          </div>
          <Plus size={12} className="text-primary flex-shrink-0" />
        </button>
      </div>
    </>
  )
}
