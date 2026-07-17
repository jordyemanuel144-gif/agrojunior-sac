// Información de la tarjeta del cliente y vendedor
import { User } from 'lucide-react'

interface Props {
  cliente: {
    nombre: string
    dni_ruc?: string
    tipo: string
  }
  vendedor?: {
    nombre: string
  }
}

export function InfoClienteVenta({ cliente, vendedor }: Props) {
  const tipoBadgeClass = {
    mayorista: 'bg-green-100 text-green-700',
    especial: 'bg-purple-100 text-purple-700',
    minorista: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
          <User size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
          <p className="font-semibold text-gray-900">{cliente.nombre}</p>
          {cliente.dni_ruc && (
            <p className="text-xs text-gray-500">{cliente.dni_ruc}</p>
          )}
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
          tipoBadgeClass[cliente.tipo as keyof typeof tipoBadgeClass]
        }`}>
          {cliente.tipo}
        </span>
      </div>
      
      {vendedor && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Vendido por</p>
          <p className="font-medium text-gray-700">{vendedor.nombre}</p>
        </div>
      )}
    </div>
  )
}
