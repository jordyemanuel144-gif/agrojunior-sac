import { DollarSign } from 'lucide-react'

interface HeaderCobranzasProps {}

export function HeaderCobranzas(_props: HeaderCobranzasProps) {
  return (
    <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cobranzas</h1>
          <p className="text-xs text-gray-500">Gestión de cuentas por cobrar</p>
        </div>
      </div>
    </div>
  )
}
