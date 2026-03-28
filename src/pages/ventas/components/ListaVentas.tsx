// Lista de ventas con cada fila
import { Receipt } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { FilaVenta } from './FilaVenta'

interface Props {
  ventas: Venta[]
}

export function ListaVentas({ ventas }: Props) {
  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Receipt size={48} className="mb-3 opacity-50" />
          <p className="text-base font-medium">No hay ventas</p>
          <p className="text-sm mt-1">Prueba con otros filtros</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {ventas.map(venta => (
          <FilaVenta key={venta.id} venta={venta} />
        ))}
      </div>
    </div>
  )
}
