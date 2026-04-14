// ============================================================
// FilaCompra - Fila clickeable de compra en la lista
// Navega al detalle al hacer clic
// ============================================================
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Compra } from '@/types/compra.types'
import { comprasService } from '@/services/compras.service'
import { RUTAS } from '@/config/rutas'

// Props: recibe la compra a mostrar
interface Props {
  compra: Compra
}

export function FilaCompra({ compra }: Props) {
  const navigate = useNavigate()

  // Obtiene nombre del proveedor
  const proveedor = comprasService.getProveedor(compra.proveedor_id)
  const fecha = new Date(compra.fecha)

  // Configuración de estilos por estado
  const estadoConfig = {
    completada: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-600' },
    anulada: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-500' },
    pendiente: { icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
  }

  const estado = estadoConfig[compra.estado]
  const EstadoIcon = estado.icon
  const esCompletada = compra.estado === 'completada'

  // Navega al detalle de la compra
  const handleClick = () => {
    navigate(`${RUTAS.ADMIN.COMPRAS}/${compra.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 md:gap-4 p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
    >
      {/* Ícono de estado */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${estado.bg}`}>
        <EstadoIcon size={24} className={estado.text} />
      </div>

      {/* Info principal: número, estado, proveedor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{compra.numero}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${estado.bg} ${estado.text}`}>
            {compra.estado}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate mt-1">{proveedor}</p>
      </div>

      {/* Total y fecha */}
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-lg ${esCompletada ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
          S/ {compra.total.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">{fecha.toLocaleDateString('es-PE')}</p>
      </div>

      {/* Badge de items y chevron */}
      <div className="hidden sm:flex items-center gap-2 text-gray-400 flex-shrink-0">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{compra.items.length} ítems</span>
        <ChevronRight size={18} />
      </div>
    </button>
  )
}
