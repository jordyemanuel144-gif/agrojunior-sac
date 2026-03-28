import { ShoppingCart } from 'lucide-react'
import type { Compra } from '@/types/compra.types'
import { FilaCompra } from './FilaCompra'

interface Props {
  compras: Compra[]
}

export function ListaComprasWrapper({ compras }: Props) {
  if (compras.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <ShoppingCart size={48} className="mb-3 opacity-50" />
          <p className="text-base font-medium">No hay compras</p>
          <p className="text-sm mt-1">Prueba con otros filtros</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {compras.map(compra => (
          <FilaCompra key={compra.id} compra={compra} />
        ))}
      </div>
    </div>
  )
}
