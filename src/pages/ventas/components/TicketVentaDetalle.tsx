// Componente para reimpresión de ticket de venta
import type { Venta } from '@/types/venta.types'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'
import { METODO_LABELS } from './MetodoPago'

interface Props {
  venta: Venta
  cliente: { nombre: string }
  esAnulada: boolean
}

export function TicketVentaDetalle({ venta, cliente, esAnulada }: Props) {
  const { nombre, ruc, direccion } = useConfigNegocio()
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera del ticket */}
      <div className="bg-blue-600 text-white text-center py-6 px-4">
        <p className="text-lg font-bold tracking-wide">{nombre}</p>
        <p className="text-blue-200 text-xs mt-1">RUC: {ruc}</p>
        <p className="text-blue-200 text-xs">{direccion}</p>
      </div>

      {/* Cuerpo del ticket */}
      <div className="px-4 py-5 space-y-4">
        {/* Fecha y método de pago */}
        <div className="flex justify-between text-xs text-gray-500 pb-3 border-b border-dashed border-gray-200">
          <span>
            {venta.fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {venta.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-gray-700 font-medium">
            {METODO_LABELS[venta.metodo_pago]}
          </span>
        </div>

        {/* Cliente */}
        <div className="text-sm">
          <span className="text-gray-500">Cliente: </span>
          <span className="font-medium text-gray-900">{cliente.nombre}</span>
        </div>

        {/* Lista de productos */}
        <div className="space-y-3 py-3 border-t border-b border-dashed border-gray-200">
          {venta.items.map(item => (
            <div key={item.producto.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                <p className="text-xs text-gray-400">
                  {item.cantidad}{item.producto.tipo_medida === 'kg' ? ' kg' : ' u'}
                  {' × '}
                  S/ {item.precio_unitario.toFixed(2)}
                </p>
              </div>
              <p className={`font-semibold ${esAnulada ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                S/ {item.subtotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className={esAnulada ? 'line-through' : ''}>S/ {venta.subtotal.toFixed(2)}</span>
          </div>

          {venta.descuento > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento</span>
              <span className={esAnulada ? 'line-through' : ''}>-S/ {venta.descuento.toFixed(2)}</span>
            </div>
          )}

          {venta.igv > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>IGV (18%)</span>
              <span className={esAnulada ? 'line-through' : ''}>S/ {venta.igv.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="font-bold text-gray-900">TOTAL</span>
            <span className={`text-xl font-bold ${esAnulada ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
              S/ {venta.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Badge anulada */}
        {esAnulada && (
          <div className="bg-red-50 text-red-600 text-center py-3 rounded-lg">
            <p className="font-semibold">Venta anulada</p>
          </div>
        )}

        {/* Información de pago (para ventas a cuenta) */}
        {!esAnulada && venta.estado_pago !== 'pagado' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-2">Información de Pago</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de la venta:</span>
                <span className="font-medium">S/ {venta.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Monto pagado:</span>
                <span className="font-medium">S/ {(venta.monto_pagado || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600 border-t border-yellow-300 pt-1 mt-1">
                <span>Pendiente:</span>
                <span>S/ {(venta.total - (venta.monto_pagado || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-2">
          ¡Gracias por su compra!
        </p>
      </div>
    </div>
  )
}
