// ============================================================
// HeaderCompras - Header minimalista con estadísticas inline
// Muestra título con fecha y badges de resumen de compras
// ============================================================
import { ShoppingCart } from 'lucide-react'
import type { Compra } from '@/types/compra.types'

// Props: recibe lista de compras para calcular estadísticas
interface Props {
  compras: Compra[]
}

export function HeaderCompras({ compras }: Props) {
  // Calcula métricas para los badges
  const completadas = compras.filter(c => c.estado === 'completada')
  const totalMonto = completadas.reduce((acc, c) => acc + c.total, 0)
  const anuladas = compras.filter(c => c.estado === 'anulada').length
  const pendientes = compras.filter(c => c.estado === 'pendiente').length

  return (
    <div className="mb-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Título e ícono */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Historial de Compras</h1>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Badges de estadísticas */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge label="Total" value={`S/ ${totalMonto.toFixed(2)}`} />
          <Badge label="Completadas" value={completadas.length} color="green" />
          {pendientes > 0 && <Badge label="Pendientes" value={pendientes} color="amber" />}
          {anuladas > 0 && <Badge label="Anuladas" value={anuladas} color="red" />}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Badge - Componente reutilizable para mostrar estadísticas
// ============================================================
function Badge({ label, value, color = 'gray' }: { label: string; value: string | number; color?: 'gray' | 'green' | 'red' | 'amber' }) {
  const styles = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${styles[color]}`}>
      <span className="text-gray-500">{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
