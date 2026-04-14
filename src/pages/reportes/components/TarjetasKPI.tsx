import { formatMoneda } from '@/lib/utils'
import type { ResumenEstadisticas } from '@/types/reportes.types'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt } from 'lucide-react'

interface ResumenKPIProps {
  estadisticas: ResumenEstadisticas
}

function KPICard({ 
  titulo, 
  valor, 
  subtitulo, 
  icono, 
  color 
}: { 
  titulo: string
  valor: string
  subtitulo: string
  icono: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'gray'
}) {
  const colores = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-500 border-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colores[color]}`}>
        {icono}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{titulo}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{valor}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitulo}</p>
      </div>
    </div>
  )
}

export function ResumenKPI({ estadisticas }: ResumenKPIProps) {
  const { ventas, compras, gananciaNeta, margenGanancia } = estadisticas

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        titulo="Ventas"
        valor={ventas.totalVentas.toString()}
        subtitulo={`${formatMoneda(ventas.totalIngresos)} total`}
        icono={<Receipt size={20} />}
        color="blue"
      />
      <KPICard
        titulo="Compras"
        valor={compras.totalCompras.toString()}
        subtitulo={`${formatMoneda(compras.totalGastos)} total`}
        icono={<ShoppingCart size={20} />}
        color="gray"
      />
      <KPICard
        titulo="Ganancia Neta"
        valor={formatMoneda(gananciaNeta)}
        subtitulo={`${margenGanancia >= 0 ? '+' : ''}${margenGanancia.toFixed(1)}% margen`}
        icono={gananciaNeta >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        color={gananciaNeta >= 0 ? 'green' : 'red'}
      />
      <KPICard
        titulo="Promedio"
        valor={formatMoneda(ventas.promedioVenta)}
        subtitulo="por transacción"
        icono={<DollarSign size={20} />}
        color="blue"
      />
    </div>
  )
}
