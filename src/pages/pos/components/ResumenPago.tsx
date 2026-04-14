// ResumenPago - Pantalla de confirmación de pago detallada
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import type { MetodoPago } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'

interface ResumenPagoProps {
  tipoPago: 'completo' | 'parcial' | 'cuenta'
  metodo: MetodoPago
  subtotal: number
  descuento: number
  igv: number
  total: number
  montoRecibido: number
  cambio: number
  saldoPendiente: number
  cliente: Cliente
  igvActivo: boolean
  onVolver: () => void
  onConfirmar: () => void
  cargando: boolean
}

const tipoLabel: Record<string, string> = { minorista: 'Minorista', mayorista: 'Mayorista', especial: 'Especial' }

export function ResumenPago({
  tipoPago,
  metodo,
  subtotal,
  descuento,
  igv,
  total,
  montoRecibido,
  cambio,
  saldoPendiente,
  cliente,
  igvActivo,
  onVolver,
  onConfirmar,
  cargando,
}: ResumenPagoProps) {
  const getLabelTipoPago = () => {
    if (tipoPago === 'completo') return 'Pago Completo'
    if (tipoPago === 'parcial') return 'Pago Parcial'
    return 'A Cuenta'
  }

  const getDescripcionPago = () => {
    if (tipoPago === 'completo') return `El cliente paga el total de S/ ${total.toFixed(2)}`
    if (tipoPago === 'parcial') return `El cliente paga S/ ${montoRecibido.toFixed(2)}, pendiente S/ ${saldoPendiente.toFixed(2)}`
    return `El cliente ${cliente.nombre} deberá pagar después`
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Confirmar Pago</h1>
            <p className="text-xs text-gray-500">Revisa los detalles antes de confirmar</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-blue-600">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resumen de Venta</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">S/ {subtotal.toFixed(2)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Descuento</span>
                <span className="text-green-600 font-medium">-S/ {descuento.toFixed(2)}</span>
              </div>
            )}
            {igvActivo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IGV</span>
                <span className="font-medium text-gray-900">S/ {igv.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total Venta</span>
              <span className="font-bold text-xl text-blue-600">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pago del Cliente</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo de pago</span>
              <span className="font-medium text-gray-900">{getLabelTipoPago()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Método</span>
              <span className="font-medium text-gray-900 capitalize">{metodo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monto recibido</span>
              <span className="font-medium text-gray-900">
                S/ {tipoPago === 'completo' ? total.toFixed(2) : tipoPago === 'parcial' ? montoRecibido.toFixed(2) : '0.00'}
              </span>
            </div>
            {tipoPago === 'parcial' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saldo pendiente</span>
                <span className="font-medium text-yellow-600">S/ {saldoPendiente.toFixed(2)}</span>
              </div>
            )}
            {cambio > 0 && (
              <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg">
                <span className="text-green-700 font-medium">Cambio</span>
                <span className="text-green-700 font-bold">S/ {cambio.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado Final</p>
          <div className="flex items-center gap-2">
            {tipoPago === 'completo' ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <Clock size={20} className="text-yellow-600" />
            )}
            <span className={`font-semibold ${tipoPago === 'completo' ? 'text-green-700' : 'text-yellow-700'}`}>
              {tipoPago === 'completo' ? 'Venta pagada completamente' : `Pendiente de cobro: S/ ${tipoPago === 'parcial' ? saldoPendiente.toFixed(2) : total.toFixed(2)}`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{getDescripcionPago()}</p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Cliente</p>
          <p className="font-bold text-blue-900">{cliente.nombre}</p>
          {cliente.tipo !== 'minorista' && (
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cliente.tipo === 'mayorista' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {tipoLabel[cliente.tipo]}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-t border-gray-100 pb-safe space-y-3">
        <button 
          onClick={onConfirmar}
          disabled={cargando}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
        >
          {cargando ? <span className="animate-pulse">Procesando...</span> : <><CheckCircle2 size={20} /> CONFIRMAR PAGO</>}
        </button>
        <button onClick={onVolver} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl">
          Volver
        </button>
      </div>
    </div>
  )
}