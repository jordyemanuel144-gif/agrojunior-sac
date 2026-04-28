import { Receipt } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { formatMoneda } from '@/lib/utils'
import { DetalleVentaCollapse } from './DetalleVentaCollapse'

interface ListaVentasPendientesProps {
  ventas: Venta[]
}

export function ListaVentasPendientes({ ventas }: ListaVentasPendientesProps) {
  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">Ventas Pendientes</h2>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-600 font-medium">¡Cliente al día!</p>
          <p className="text-gray-500 text-sm mt-1">No tiene ventas pendientes</p>
        </div>
      </div>
    )
  }

  const totalPendiente = ventas.reduce((sum, v) => sum + (v.total - v.monto_pagado), 0)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Ventas Pendientes</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total pendiente</p>
          <p className="text-lg font-bold text-red-600">{formatMoneda(totalPendiente)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {ventas.map((venta) => (
          <DetalleVentaCollapse
            key={venta.id}
            venta={venta}
            modo="vista"
          />
        ))}
      </div>
    </div>
  )
}