import type { Comprobante, ComprobanteVenta, ComprobantePago } from '@/types/comprobante.types'
import type { Venta } from '@/types/venta.types'
import { formatMoneda, formatFecha } from '@/lib/utils'

interface BadgeTipoCliente {
  bg: string
  text: string
  label: string
}

function getTipoClienteBadge(tipo?: string): BadgeTipoCliente | null {
  if (!tipo) return null
  const config: Record<string, BadgeTipoCliente> = {
    minorista: { bg: 'bg-primary-light', text: 'text-primary-hover', label: 'Minorista' },
    mayorista: { bg: 'bg-green-100', text: 'text-green-700', label: 'Mayorista' },
    especial: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Especial' },
  }
  return config[tipo] ?? null
}

interface ComprobanteContenidoProps {
  comprobante: Comprobante
  ventaInfo?: Venta | null
}

export function ComprobanteContenido({ comprobante, ventaInfo }: ComprobanteContenidoProps) {
  const esVenta = comprobante.tipo === 'venta'
  const venta = esVenta ? (comprobante as ComprobanteVenta) : null
  const pago = !esVenta ? (comprobante as ComprobantePago) : null
  const badge = getTipoClienteBadge(comprobante.cliente_tipo)

  return (
    <div id="comprobante-detalle-content" className="print:shadow-none">
      <div className="bg-primary text-white text-center py-6 px-4">
        <p className="text-lg font-bold">{(comprobante.negocio_nombre || 'MI NEGOCIO').toUpperCase()}</p>
        <p className="text-primary-light text-sm">RUC: {comprobante.negocio_ruc || '-'}</p>
        <p className="text-primary-light text-sm">{comprobante.negocio_direccion || '-'}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Cliente</h3>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{comprobante.cliente_nombre || 'Cliente'}</p>
                {badge && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              {comprobante.cliente_documento && (
                <p className="text-sm text-gray-500">Documento: {comprobante.cliente_documento}</p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Fecha</h3>
              <p className="font-medium text-gray-900">{formatFecha(comprobante.fecha)}</p>
              {comprobante.hora && (
                <p className="text-xs text-gray-400">{comprobante.hora}</p>
              )}
            </div>
          </div>
        </div>

        {esVenta && venta && (
          <ContenidoVenta venta={venta} ventaInfo={ventaInfo} />
        )}

        {!esVenta && pago && (
          <ContenidoPago pago={pago} />
        )}

        <p className="text-center text-gray-400 text-sm">✦ GRACIAS ✦</p>
      </div>
    </div>
  )
}

function ContenidoVenta({ venta, ventaInfo }: { venta: ComprobanteVenta; ventaInfo?: Venta | null }) {
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Productos</h3>
        <div className="space-y-2">
          {(venta.items || []).map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <p className="text-gray-900">{item.nombre}</p>
                <p className="text-xs text-gray-400">{item.cantidad} × {formatMoneda(item.precio_unitario)}</p>
              </div>
              <p className="font-medium">{formatMoneda(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatMoneda(venta.subtotal)}</span>
        </div>
        {venta.descuento > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <span>Descuento aplicado</span>
              <span>-{formatMoneda(venta.descuento)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-700">
              <span>Total c/Descuento</span>
              <span>{formatMoneda(venta.subtotal - venta.descuento)}</span>
            </div>
          </>
        )}
        {venta.igv > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>IGV (18%)</span>
            <span>{formatMoneda(venta.igv)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span className="text-primary">{formatMoneda(venta.total)}</span>
        </div>
        {ventaInfo && (
          <>
            <div className="flex justify-between text-green-600">
              <span>Lo que se ha pagado</span>
              <span>{formatMoneda(ventaInfo.monto_pagado)}</span>
            </div>
            <div className={`flex justify-between font-medium ${
              ventaInfo.total - ventaInfo.monto_pagado > 0 ? 'text-amber-600' : 'text-green-600'
            }`}>
              <span>{ventaInfo.total - ventaInfo.monto_pagado > 0 ? 'Pendiente' : 'Cancelado'}</span>
              <span>{formatMoneda(ventaInfo.total - ventaInfo.monto_pagado)}</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm">
        <p><span className="text-gray-500">Método:</span> <span className="capitalize">{venta.metodo_pago}</span></p>
        <p><span className="text-gray-500">Vendedor:</span> {venta.vendedor_nombre}</p>
      </div>
    </>
  )
}

function ContenidoPago({ pago }: { pago: ComprobantePago }) {
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Resumen de Deuda</h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between font-medium">
            <span className="text-gray-700">Total sin descuentos</span>
            <span className="font-bold">{formatMoneda(pago.total_ventas_sin_descuento || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total de todas las ventas</span>
            <span>{formatMoneda(pago.deuda_total_original)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total descuentos</span>
            <span className="text-green-600">-{formatMoneda((pago.ventas || []).reduce((sum, v) => sum + v.descuento, 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lo que se había pagado antes</span>
            <span>{formatMoneda(pago.total_pagado_anterior)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Deuda actual (sin pagar)</span>
            <span className="text-amber-600">{formatMoneda(pago.deuda_actual)}</span>
          </div>
        </div>
      </div>

      <div className="bg-primary-light rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-neutral-900">Pago realizado ahora</span>
          <span className="font-bold text-primary text-lg">{formatMoneda(pago.monto_pagado)}</span>
        </div>
        <div className="flex justify-between border-t border-primary-light pt-2">
          <span className="text-primary-hover font-medium">Nueva deuda</span>
          <span className="font-bold text-primary-hover">{formatMoneda(pago.nueva_deuda)}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Detalle de Ventas ({pago.ventas_pagadas_count} pagadas, {pago.ventas_parciales_count} parciales)
        </h3>
        <div className="space-y-4">
          {(pago.ventas || []).map((v, idx) => (
            <div key={idx} className={`rounded-xl p-4 ${v.estado === 'pagado' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-gray-900">{v.ticket}</span>
                  <p className="text-xs text-gray-500">{formatFecha(v.fecha)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  v.estado === 'pagado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {v.estado === 'pagado' ? 'Pagado' : 'Parcial'}
                </span>
              </div>

              <div className="border-t border-b border-black/10 py-3 mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Productos:</p>
                <div className="space-y-1">
                  {(v.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1">{item.nombre} x{item.cantidad}</span>
                      <span className="font-medium ml-3">{formatMoneda(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total de la venta (sin descuento):</span>
                  <span className="font-medium">{formatMoneda(v.subtotal)}</span>
                </div>
                {v.descuento > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Descuento aplicado:</span>
                      <span>-{formatMoneda(v.descuento)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-700">
                      <span>Total c/Descuento:</span>
                      <span>{formatMoneda(v.total)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Lo que se había pagado:</span>
                  <span className="text-green-600">{formatMoneda(v.monto_pagado_anterior)}</span>
                </div>
                <div className="flex justify-between font-bold bg-primary-light -mx-4 px-4 py-2">
                  <span className="text-primary-dark">Pago realizado ahora:</span>
                  <span className="text-primary-dark">{formatMoneda(v.monto_pagado_ahora)}</span>
                </div>
                {v.estado === 'parcial' && (
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                    <span className="text-amber-700">Nueva deuda:</span>
                    <span className="text-amber-700">{formatMoneda(v.nuevo_saldo)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm">
        <p><span className="text-gray-500">Método de pago:</span> <span className="capitalize">{pago.metodo_pago}</span></p>
        {pago.observaciones && <p><span className="text-gray-500">Observaciones:</span> {pago.observaciones}</p>}
        <p><span className="text-gray-500">Atendido por:</span> {pago.usuario_nombre}</p>
      </div>
    </>
  )
}