import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, CheckCircle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { ventasService } from '@/services/ventas.service'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import { RUTAS } from '@/config/rutas'
import { PageHeaderCliente } from '@/components/layout/PageHeaderCliente'
import { formatMoneda, formatFecha } from '@/lib/utils'
import type { Venta } from '@/types/venta.types'
import type { MovimientoCuentaCorriente } from '@/types/cuenta-corriente.types'

export default function DeudasPage() {
  const navigate = useNavigate()
  const { clienteData } = useAuthContext()
  const [ventasPendientes, setVentasPendientes] = useState<Venta[]>([])
  const [historialPagos, setHistorialPagos] = useState<MovimientoCuentaCorriente[]>([])
  const [deudaTotal, setDeudaTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      if (!clienteData) return

      const ventas = await ventasService.obtenerPorCliente(clienteData.id)
      const pendientes = ventas.filter(v => v.estado_pago !== 'pagado' && v.estado !== 'anulada')
      setVentasPendientes(pendientes)

      const movimientos = await cuentaCorrienteService.obtenerMovimientos(clienteData.id)
      const pagos = movimientos.filter(m => m.tipo === 'pago')
      setHistorialPagos(pagos)

      const cuenta = await cuentaCorrienteService.obtenerPorCliente(clienteData.id)
      setDeudaTotal(cuenta?.saldo_pendiente || 0)

      setLoading(false)
    }

    cargarDatos()
  }, [clienteData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeaderCliente titulo="Mis Deudas" icono={CreditCard} stats={[{ label: 'Pendiente', value: deudaTotal, color: 'red' }]} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total a pagar</p>
            <p className="text-3xl font-bold text-red-500">{formatMoneda(deudaTotal)}</p>
            <p className="text-sm text-gray-400">{ventasPendientes.length} ventas pendientes</p>
          </div>
        </div>
      </div>

      {ventasPendientes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Debo:</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {ventasPendientes.map(venta => {
                const pendiente = venta.total - (venta.monto_pagado || 0)
                return (
                  <button
                    key={venta.id}
                    onClick={() => navigate(`${RUTAS.CLIENTE.VENTAS}/${venta.id}`)}
                    className="w-full flex items-center gap-3 md:gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{venta.ticket_numero}</p>
                      <p className="text-xs text-gray-400">{formatFecha(venta.fecha)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{formatMoneda(pendiente)}</p>
                      {venta.estado_pago === 'parcial' ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          Parcial
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {historialPagos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Historial de pagos</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {historialPagos.map(pago => (
                <div key={pago.id} className="flex items-center gap-3 md:gap-4 p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{pago.documento_numero}</p>
                    <p className="text-xs text-gray-400">{formatFecha(pago.fecha)}</p>
                  </div>
                  <p className="font-bold text-green-600">{formatMoneda(pago.monto)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ventasPendientes.length === 0 && historialPagos.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CheckCircle size={48} className="mb-3 text-green-400" />
            <p className="text-base font-medium text-gray-900">¡No debes nada!</p>
            <p className="text-sm mt-1">No tienes ventas pendientes</p>
          </div>
        </div>
      )}
    </div>
  )
}