import { Wallet, Receipt } from 'lucide-react'
import type { MovimientoCuentaCorriente } from '@/types/cuenta-corriente.types'
import { formatMoneda, formatFecha } from '@/lib/utils'

interface HistorialPagosProps {
  movimientos: MovimientoCuentaCorriente[]
}

export function HistorialPagos({ movimientos }: HistorialPagosProps) {
  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">Historial de Pagos</h2>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay pagos registrados</p>
        </div>
      </div>
    )
  }

  const totalPagado = movimientos.reduce((sum, m) => sum + m.monto, 0)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Historial de Pagos</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total pagado</p>
          <p className="text-lg font-bold text-green-600">{formatMoneda(totalPagado)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {movimientos.map((mov) => (
          <div
            key={mov.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatMoneda(mov.monto)}</p>
                <p className="text-xs text-gray-500">
                  {mov.metodo_pago ? mov.metodo_pago.charAt(0).toUpperCase() + mov.metodo_pago.slice(1) : 'Pago'} • {formatFecha(mov.fecha)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{mov.documento_numero}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}