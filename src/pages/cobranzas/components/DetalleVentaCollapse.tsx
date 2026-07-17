import { useState } from 'react'
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { formatMoneda, formatFecha } from '@/lib/utils'

interface DetalleVentaCollapseProps {
  venta: Venta
  seleccionado?: boolean
  onToggle?: (checked: boolean) => void
  modo?: 'seleccion' | 'vista'
}

export function DetalleVentaCollapse({ venta, seleccionado, onToggle, modo = 'vista' }: DetalleVentaCollapseProps) {
  const [expandido, setExpandido] = useState(false)
  const saldo = venta.total - venta.monto_pagado

  return (
    <div className={`rounded-xl border transition-colors ${
      seleccionado
        ? 'border-primary bg-primary-light'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        {modo === 'seleccion' && (
          <div onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={seleccionado}
              onChange={e => onToggle?.(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{venta.ticket_numero}</span>
            </div>
            <span className="text-sm font-bold text-primary">{formatMoneda(saldo)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">{formatFecha(venta.fecha)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              venta.estado_pago === 'parcial' 
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {venta.estado_pago === 'parcial' ? 'Parcial' : 'Pendiente'}
            </span>
          </div>
        </div>

        <div className="w-6 h-6 flex items-center justify-center text-gray-400">
          {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expandido && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>Producto</span>
              <div className="flex gap-4">
                <span className="w-12 text-right">Cant.</span>
                <span className="w-20 text-right">P.Unit</span>
                <span className="w-20 text-right">Total</span>
              </div>
            </div>
            
            {venta.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">{item.producto.nombre}</p>
                </div>
                <div className="flex gap-4 text-gray-600">
                  <span className="w-12 text-right">{item.cantidad}</span>
                  <span className="w-20 text-right">{formatMoneda(item.precio_unitario)}</span>
                  <span className="w-20 text-right font-medium">{formatMoneda(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Total venta</span>
            <span className="font-bold text-gray-900">{formatMoneda(venta.total)}</span>
          </div>
          
          {venta.monto_pagado > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Ya pagado</span>
              <span className="text-green-600">{formatMoneda(venta.monto_pagado)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
