import { CheckCircle, Clock, CreditCard } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { formatMoneda, formatFecha } from '@/lib/utils'

interface DistribucionPagoProps {
  ventas: Venta[]
  ventasSeleccionadas: string[]
  monto: number
}

interface DistribucionItem {
  venta: Venta
  montoAplicar: number
  resultado: 'pagado' | 'parcial' | 'no_aplicado'
}

export function DistribucionPago({ ventas, ventasSeleccionadas, monto }: DistribucionPagoProps) {
  const montoNum = monto || 0
  
  const ventasOrdenadas = [...ventas]
    .filter(v => ventasSeleccionadas.includes(v.id))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

  let montoRestante = montoNum
  const distribucion: DistribucionItem[] = ventasOrdenadas.map(venta => {
    const saldoVenta = venta.total - venta.monto_pagado
    const montoAplicar = Math.min(montoRestante, saldoVenta)
    
    let resultado: DistribucionItem['resultado'] = 'no_aplicado'
    if (montoAplicar > 0) {
      const nuevoPagado = venta.monto_pagado + montoAplicar
      resultado = nuevoPagado >= venta.total ? 'pagado' : 'parcial'
    }
    
    montoRestante -= montoAplicar
    
    return { venta, montoAplicar, resultado }
  })

  const totalDistribuido = distribucion.reduce((sum, d) => sum + d.montoAplicar, 0)
  const totalPagado = distribucion.filter(d => d.resultado === 'pagado').length
  const totalParcial = distribucion.filter(d => d.resultado === 'parcial').length

  if (ventasSeleccionadas.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Selecciona ventas para ver la distribución</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Distribución del pago</h4>
        <span className="text-xs text-gray-500">{formatMoneda(montoNum)} a distribuir</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {distribucion.map(({ venta, montoAplicar, resultado }) => {
          const saldo = venta.total - venta.monto_pagado
          
          return (
            <div key={venta.id} className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {resultado === 'pagado' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : resultado === 'parcial' ? (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{venta.ticket_numero}</span>
                  <span className="text-xs text-gray-400">{formatFecha(venta.fecha)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  resultado === 'pagado' 
                    ? 'bg-green-100 text-green-700'
                    : resultado === 'parcial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {resultado === 'pagado' ? 'Pagado' : resultado === 'parcial' ? 'Parcial' : 'Sin aplicar'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Deuda actual</p>
                  <p className="font-medium text-gray-700">{formatMoneda(saldo)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Pagando</p>
                  <p className="font-medium text-primary">{formatMoneda(montoAplicar)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Deuda después</p>
                  <p className={`font-medium ${
                    resultado === 'pagado' ? 'text-green-600' : 
                    resultado === 'parcial' ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {resultado === 'no_aplicado' ? '-' : formatMoneda(venta.total - venta.monto_pagado - montoAplicar)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-500">{totalPagado} completas</span>
          <span className="text-gray-500">{totalParcial} parciales</span>
        </div>
        <span className="font-medium text-gray-700">
          Total: {formatMoneda(totalDistribuido)}
        </span>
      </div>
    </div>
  )
}
