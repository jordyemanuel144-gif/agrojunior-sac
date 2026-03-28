// Una fila de venta en la lista
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { RUTAS } from '@/config/rutas'
import { ventasService } from '@/services/ventas.service'
import { METODO_ICONS, METODO_LABELS } from './MetodoPago'

interface Props {
  venta: Venta
}

export function FilaVenta({ venta }: Props) {
  const navigate = useNavigate()
  const cliente = ventasService.getCliente(venta.cliente_id)
  const esCompletada = venta.estado === 'completada'

  const formatHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <button
      onClick={() => navigate(`${RUTAS.VENTAS}/${venta.id}`)}
      className="w-full flex items-center gap-3 md:gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        esCompletada ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {esCompletada
          ? <CheckCircle size={20} className="text-green-600" />
          : <XCircle size={20} className="text-red-500" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{venta.ticket_numero}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            esCompletada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {venta.estado}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{cliente.nombre}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold ${esCompletada ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
          S/ {venta.total.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">{formatHora(venta.fecha)}</p>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-gray-400 flex-shrink-0">
        <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-lg">
          {METODO_ICONS[venta.metodo_pago]}
          <span className="hidden md:inline">{METODO_LABELS[venta.metodo_pago]}</span>
        </span>
        <ChevronRight size={16} />
      </div>
    </button>
  )
}
