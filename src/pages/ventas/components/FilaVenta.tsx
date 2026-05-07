// Una fila de venta en la lista
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Venta } from '@/types/venta.types'
import { clientesService } from '@/services/clientes.service'
import { RUTAS } from '@/config/rutas'
import { METODO_ICONS, METODO_LABELS } from './MetodoPago'
import { formatMoneda } from '@/lib/utils'

interface Props {
  venta: Venta
}

function BadgeEstadoPago({ estado, montoPagado, total }: { estado: Venta['estado_pago'], montoPagado: number, total: number }) {
  if (estado === 'pagado') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
        <CheckCircle size={10} />Pagado
      </span>
    )
  }
  if (estado === 'parcial') {
    const pendiente = total - montoPagado
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
        <Clock size={10} />Parcial {formatMoneda(pendiente)}
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
      <Clock size={10} />A cuenta
    </span>
  )
}

export function FilaVenta({ venta }: Props) {
  const navigate = useNavigate()
  const esCompletada = venta.estado === 'completada'
  
  const clienteNombre = clientesService.obtenerClienteDelCache(venta.cliente_id)?.nombre || 'Cliente no encontrado'

  const formatHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <button
      onClick={() => navigate(`${RUTAS.ADMIN.VENTAS}/${venta.id}`)}
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
          {esCompletada && (
            <BadgeEstadoPago estado={venta.estado_pago} montoPagado={venta.monto_pagado} total={venta.total} />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{clienteNombre}</p>
        <p className="text-xs text-gray-400">Vendedor: {venta.vendedor_nombre}</p>
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
