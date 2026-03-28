// ============================================================
// FilaInventario - Fila de item de inventario en la lista
// Muestra producto con stock actual, mínimo y estado visual
// ============================================================
import { AlertTriangle, Package } from 'lucide-react'
import type { ItemStock } from '@/types/inventario.types'

interface Props {
  item: ItemStock
}

export function FilaInventario({ item }: Props) {
  const estadoConfig = {
    ok: {
      color: 'green',
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: null,
      label: 'Normal',
    },
    bajo: {
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      icon: AlertTriangle,
      label: 'Bajo',
    },
    agotado: {
      color: 'red',
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: AlertTriangle,
      label: 'Agotado',
    },
  }

  const estado = estadoConfig[item.estado]
  const EstadoIcon = estado.icon

  return (
    <div className="flex items-center gap-3 md:gap-4 p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* Ícono de estado */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${estado.bg}`}>
        {EstadoIcon ? (
          <EstadoIcon size={24} className={estado.text} />
        ) : (
          <Package size={24} className="text-green-600" />
        )}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.nombre}</p>
        <p className="text-sm text-gray-500 truncate">{item.categoria}</p>
      </div>

      {/* Stock actual vs mínimo */}
      <div className="text-center flex-shrink-0">
        <p className={`text-xl font-bold ${estado.text}`}>
          {item.stock_actual.toFixed(item.stock_minimo > 1 ? 0 : 1)}
        </p>
        <p className="text-xs text-gray-400">mín: {item.stock_minimo}</p>
      </div>

      {/* Badge de estado */}
      <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${estado.bg} ${estado.text} flex-shrink-0`}>
        {EstadoIcon && <EstadoIcon size={14} />}
        <span className="text-xs font-bold">{estado.label}</span>
      </div>
    </div>
  )
}
