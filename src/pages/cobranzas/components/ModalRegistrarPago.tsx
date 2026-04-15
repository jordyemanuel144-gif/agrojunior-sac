import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Check, DollarSign, Zap, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDetalleCobranza } from '../hooks/useCobranzas'
import { formatMoneda } from '@/lib/utils'
import type { MetodoPago } from '@/types/venta.types'
import type { Venta } from '@/types/venta.types'
import { DetalleVentaCollapse } from './DetalleVentaCollapse'
import { DistribucionPago } from './DistribucionPago'
import { comprobantesService } from '@/services/comprobantes.service'
import { RUTAS } from '@/config/rutas'

interface ModalRegistrarPagoProps {
  clienteId: string
  onCerrar: () => void
}

type ModoPago = 'rapido' | 'avanzado'

function aplicarFIFO(ventas: Venta[], monto: number): string[] {
  const ventasOrdenadas = [...ventas].sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  const seleccionadas: string[] = []
  let montoRestante = monto

  for (const venta of ventasOrdenadas) {
    if (montoRestante <= 0) break
    const saldoVenta = venta.total - venta.monto_pagado
    if (saldoVenta > 0) {
      seleccionadas.push(venta.id)
      montoRestante -= saldoVenta
    }
  }

  return seleccionadas
}

export function ModalRegistrarPago({ clienteId, onCerrar }: ModalRegistrarPagoProps) {
  const navigate = useNavigate()
  const { cuenta, ventas, recargar, registrarPago } = useDetalleCobranza(clienteId)
  const [monto, setMonto] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
  const [observaciones, setObservaciones] = useState('')
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [modoPago, setModoPago] = useState<ModoPago>('rapido')
  const [mostrarToast, setMostrarToast] = useState(false)
  const [comprobanteId, setComprobanteId] = useState<string | null>(null)

  useEffect(() => {
    recargar()
  }, [clienteId])

  useEffect(() => {
    if (ventas.length > 0) {
      setVentasSeleccionadas([])
    }
  }, [ventas])

  useEffect(() => {
    if (ventasSeleccionadas.length > 0 && modoPago === 'rapido') {
      const nuevoTotal = ventas
        .filter(v => ventasSeleccionadas.includes(v.id))
        .reduce((sum, v) => sum + (v.total - v.monto_pagado), 0)
      setMonto(nuevoTotal.toString())
    } else if (modoPago === 'rapido' && ventasSeleccionadas.length === 0) {
      setMonto('')
    }
  }, [ventasSeleccionadas, ventas, modoPago])

  const montoNum = useMemo(() => parseFloat(monto) || 0, [monto])

  const totalSeleccionado = useMemo(() => {
    return ventas
      .filter(v => ventasSeleccionadas.includes(v.id))
      .reduce((sum, v) => sum + (v.total - v.monto_pagado), 0)
  }, [ventas, ventasSeleccionadas])

  const puedePagar = montoNum > 0 && montoNum <= totalSeleccionado && ventasSeleccionadas.length > 0

  const handleToggleVenta = (ventaId: string, checked: boolean) => {
    if (modoPago === 'avanzado') return
    setVentasSeleccionadas(prev =>
      checked
        ? [...prev, ventaId]
        : prev.filter(id => id !== ventaId)
    )
  }

  const handleCambioMonto = useCallback((nuevoMonto: string) => {
    setMonto(nuevoMonto)
    if (modoPago === 'avanzado') {
      const montoVal = parseFloat(nuevoMonto) || 0
      if (montoVal > 0 && ventas.length > 0) {
        const seleccionadas = aplicarFIFO(ventas, montoVal)
        setVentasSeleccionadas(seleccionadas)
      } else if (montoVal === 0) {
        setVentasSeleccionadas([])
      }
    }
  }, [modoPago, ventas])

  const handlePagoRapido = () => {
    setModoPago('rapido')
    setVentasSeleccionadas(ventas.map(v => v.id))
    const nuevoTotal = ventas.reduce((sum, v) => sum + (v.total - v.monto_pagado), 0)
    setMonto(nuevoTotal.toString())
  }

  const handlePagoAvanzado = () => {
    setModoPago('avanzado')
    setVentasSeleccionadas([])
    setMonto('')
  }

  const handlePagar = async () => {
    if (!puedePagar || !cuenta) return

    setLoading(true)
    try {
      await registrarPago({
        ventasSeleccionadas,
        monto: montoNum,
        metodo_pago: metodoPago,
        observaciones: observaciones || undefined,
        usuario_id: 'usr_001',
      })

      const ventasSeleccionadasObj = ventas.filter(v => ventasSeleccionadas.includes(v.id))
      const comprobante = comprobantesService.crearPago(
        cuenta,
        ventasSeleccionadasObj,
        montoNum,
        metodoPago,
        observaciones || undefined,
        'Cajero'
      )
      
      setComprobanteId(comprobante.id)
      setMostrarToast(true)
      
      setTimeout(() => {
        onCerrar()
      }, 2500)
    } catch (error) {
      console.error('Error al registrar pago:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerComprobante = () => {
    setMostrarToast(false)
    onCerrar()
    if (comprobanteId) {
      navigate(`${RUTAS.ADMIN.COMPROBANTES}/${comprobanteId}`)
    }
  }

  const handleCerrarToast = () => {
    setMostrarToast(false)
    onCerrar()
  }

  if (!cuenta) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  const totalPendiente = ventas.reduce((sum, v) => sum + (v.total - v.monto_pagado), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Registrar Pago</h2>
          <button
            onClick={onCerrar}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-sm font-medium text-gray-900">{cuenta.cliente_nombre}</p>
            <p className="text-xs text-gray-500">Saldo pendiente: {formatMoneda(cuenta.saldo_pendiente)}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePagoRapido}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                modoPago === 'rapido'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              Pago Rápido
            </button>
            <button
              onClick={handlePagoAvanzado}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                modoPago === 'avanzado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Pago Avanzado
            </button>
          </div>

          {modoPago === 'avanzado' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Monto a pagar
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={monto}
                  onChange={e => handleCambioMonto(e.target.value)}
                  placeholder="Ingrese monto"
                  step="0.01"
                  min="0"
                  max={totalPendiente}
                  className="w-full pl-10 pr-4 py-3 text-base font-medium text-gray-900 outline-none bg-white border border-gray-200 rounded-xl focus:border-blue-300"
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">Deuda total: {formatMoneda(totalPendiente)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMonto(totalPendiente.toString())
                    const seleccionadas = aplicarFIFO(ventas, totalPendiente)
                    setVentasSeleccionadas(seleccionadas)
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Usar todo
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['efectivo', 'yape', 'transferencia'] as const).map(metodo => (
                <button
                  key={metodo}
                  onClick={() => setMetodoPago(metodo)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    metodoPago === metodo
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metodo === 'efectivo' && 'Efectivo'}
                  {metodo === 'yape' && 'Yape'}
                  {metodo === 'transferencia' && 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {modoPago === 'avanzado' ? 'Ventas a pagar (FIFO)' : 'Ventas pendientes'}
                </label>
                <div className="flex items-center gap-3">
                  {modoPago === 'rapido' && ventasSeleccionadas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setVentasSeleccionadas([])}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Deseleccionar todo
                    </button>
                  )}
                  {modoPago === 'rapido' && ventasSeleccionadas.length < ventas.length && ventas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setVentasSeleccionadas(ventas.map(v => v.id))}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Pagar todo
                    </button>
                  )}
                  <span className="text-xs text-gray-500">
                    {ventasSeleccionadas.length} de {ventas.length}
                  </span>
                </div>
              </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ventas.map(venta => {
                const seleccionado = ventasSeleccionadas.includes(venta.id)
                return (
                  <DetalleVentaCollapse
                    key={venta.id}
                    venta={venta}
                    seleccionado={seleccionado}
                    onToggle={checked => handleToggleVenta(venta.id, checked)}
                    modo={modoPago === 'avanzado' ? 'vista' : 'seleccion'}
                  />
                )
              })}
            </div>

            {ventas.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No hay ventas pendientes</p>
            )}
          </div>

          {modoPago === 'avanzado' && montoNum > 0 && ventasSeleccionadas.length > 0 && (
            <DistribucionPago
              ventas={ventas}
              ventasSeleccionadas={ventasSeleccionadas}
              monto={montoNum}
            />
          )}

          {modoPago === 'rapido' && montoNum > 0 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total a pagar:</span>
                <span className="text-lg font-bold text-blue-600">{formatMoneda(totalSeleccionado)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Agregar una nota..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-white border border-gray-200 rounded-xl focus:border-blue-300 resize-none"
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handlePagar}
            disabled={!puedePagar || loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
              puedePagar
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Registrar Pago de {formatMoneda(montoNum)}
              </>
            )}
          </button>
        </div>
      </div>

      {mostrarToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white rounded-xl shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">¡Pago registrado!</p>
              <p className="text-sm text-green-100">El comprobante se ha guardado</p>
            </div>
            <button onClick={handleCerrarToast} className="text-green-200 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleVerComprobante}
              className="flex-1 bg-white text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              Ver comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
