import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react'
import type { ResumenCuentasPorCobrar } from '@/types/cuenta-corriente.types'
import { formatMoneda } from '@/lib/utils'

interface ResumenCobranzasProps {
  resumen: ResumenCuentasPorCobrar
}

export function ResumenCobranzas({ resumen }: ResumenCobranzasProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deuda</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatMoneda(resumen.total_deuda)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatMoneda(resumen.total_pendiente)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Clientes</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{resumen.cantidad_clientes_con_deuda}</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{resumen.cantidad_ventas_pendientes}</p>
      </div>
    </div>
  )
}
