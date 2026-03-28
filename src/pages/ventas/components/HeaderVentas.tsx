// Header con título y estadísticas del día
import { Receipt } from 'lucide-react'
import type { Venta } from '@/types/venta.types'

interface Props {
  ventas: Venta[]
}

export function HeaderVentas({ ventas }: Props) {
  const ventasCompletadas = ventas.filter(v => v.estado === 'completada')
  const totalDia = ventasCompletadas.reduce((acc, v) => acc + v.total, 0)
  const cantidadCompletadas = ventasCompletadas.length
  const cantidadAnuladas = ventas.filter(v => v.estado === 'anulada').length

  return (
    <div className="mb-6 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Receipt size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total del día"
          value={`S/ ${totalDia.toFixed(2)}`}
          color="gray"
        />
        <StatCard
          label="Completadas"
          value={String(cantidadCompletadas)}
          color="green"
        />
        <StatCard
          label="Anuladas"
          value={String(cantidadAnuladas)}
          color="red"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: 'gray' | 'green' | 'red' }) {
  const colorClasses = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-500',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl md:text-2xl font-bold mt-1 ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}
