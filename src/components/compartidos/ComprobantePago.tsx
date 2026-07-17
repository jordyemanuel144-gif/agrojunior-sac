import { CheckCircle, Printer, Share2, Image, FileDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ComprobantePago } from '@/types/comprobante.types'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { generarImagenDesdeElemento, descargarImagen } from '@/lib/imagen'
import { RUTAS } from '@/config/rutas'

interface Props {
  comprobante: ComprobantePago
  onCerrar: () => void
}

export function ComprobantePago({ comprobante, onCerrar }: Props) {
  const navigate = useNavigate()
  const [enviandoImagen, setEnviandoImagen] = useState(false)

  const handleImprimir = () => window.print()

  const handleWhatsappTexto = () => {
    const ventasPagadas = comprobante.ventas.filter(v => v.estado === 'pagado').length
    const ventasParciales = comprobante.ventas.filter(v => v.estado === 'parcial').length
    
    const msg = encodeURIComponent(
      `🧾 COMPROBANTE DE PAGO - ${comprobante.numero}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 CLIENTE: ${comprobante.cliente_nombre}\n` +
      `📅 Fecha: ${formatFecha(comprobante.fecha)}\n\n` +
      `📊 RESUMEN DE DEUDA:\n` +
      `• Deuda Total: ${formatMoneda(comprobante.deuda_total_original)}\n` +
      `• Ya pagado: ${formatMoneda(comprobante.total_pagado_anterior)}\n` +
      `• Deuda actual: ${formatMoneda(comprobante.deuda_actual)}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 PAGO: ${formatMoneda(comprobante.monto_pagado)}\n` +
      `📉 NUEVA DEUDA: ${formatMoneda(comprobante.nueva_deuda)}\n\n` +
      `✅ VENTAS CANCELADAS: ${ventasPagadas}\n` +
      `▸ VENTAS PARCIALES: ${ventasParciales}\n\n` +
      `Gracias por su pago! 🙏\n` +
      `📍 AGROJUNIOR SAC`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const handleWhatsappImagen = async () => {
    setEnviandoImagen(true)
    try {
      const dataUrl = await generarImagenDesdeElemento('comprobante-pago-content')
      
      const mensaje = `🧾 COMPROBANTE DE PAGO - ${comprobante.numero}\n\n` +
        `Cliente: ${comprobante.cliente_nombre}\n` +
        `Fecha: ${formatFecha(comprobante.fecha)}\n\n` +
        `Pago: ${formatMoneda(comprobante.monto_pagado)}\n` +
        `Nueva deuda: ${formatMoneda(comprobante.nueva_deuda)}\n\n` +
        `Gracias por su pago!`
      
      const mensajeEncoded = encodeURIComponent(mensaje)
      window.open(`https://wa.me/?text=${mensajeEncoded}`, '_blank')
      
      setTimeout(() => {
        descargarImagen(dataUrl, `pago-${comprobante.numero}.png`)
      }, 1000)
    } catch (error) {
      console.error('Error al generar imagen:', error)
    } finally {
      setEnviandoImagen(false)
    }
  }

  const handleDescargar = async () => {
    try {
      const dataUrl = await generarImagenDesdeElemento('comprobante-pago-content', { scale: 3 })
      descargarImagen(dataUrl, `comprobante-pago-${comprobante.numero}.png`)
    } catch (error) {
      console.error('Error al descargar:', error)
    }
  }

  const handleVerComprobante = () => {
    onCerrar()
    navigate(`${RUTAS.ADMIN.COMPROBANTES}/${comprobante.id}`)
  }

  const porcentajePagado = Math.round(((comprobante.total_pagado_anterior + comprobante.monto_pagado) / comprobante.deuda_total_original) * 100)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 flex flex-col items-center border-b border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">¡Pago registrado!</h1>
        <p className="text-gray-400 text-sm mt-1">{comprobante.numero}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div id="comprobante-pago-content" className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none">
          <div className="bg-primary text-white text-center py-4 px-4">
            <p className="text-base font-bold">{comprobante.negocio_nombre.toUpperCase()}</p>
            <p className="text-primary-light text-xs mt-0.5">RUC: {comprobante.negocio_ruc}</p>
            <p className="text-primary-light text-xs">{comprobante.negocio_direccion}</p>
          </div>

          <div className="px-4 py-4 space-y-4 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>{formatFecha(comprobante.fecha)}</span>
              <span>{comprobante.hora}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Datos del Cliente</p>
              <div className="space-y-1 text-xs">
                <p><span className="text-gray-500">Cliente:</span> <span className="font-medium text-gray-900">{comprobante.cliente_nombre}</span></p>
                {comprobante.cliente_documento && <p><span className="text-gray-500">Documento:</span> <span className="font-medium text-gray-900">{comprobante.cliente_documento}</span></p>}
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4">
              <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-3">Resumen de Deuda</p>
              
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Deuda Total Original:</span>
                  <span className="font-medium">{formatMoneda(comprobante.deuda_total_original)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Pagado Anterior:</span>
                  <span className="font-medium">{formatMoneda(comprobante.total_pagado_anterior)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-medium">Deuda Actual (antes):</span>
                  <span className="font-bold text-amber-600">{formatMoneda(comprobante.deuda_actual)}</span>
                </div>
              </div>

              <div className="bg-primary-light rounded-xl p-3 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-neutral-900">MONTO PAGADO:</span>
                  <span className="text-xl font-bold text-primary">{formatMoneda(comprobante.monto_pagado)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-hover">Nueva Deuda:</span>
                  <span className="font-bold text-primary-hover">{formatMoneda(comprobante.nueva_deuda)}</span>
                </div>
                <div className="mt-2 h-2 bg-primary-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, porcentajePagado)}%` }}
                  />
                </div>
                <p className="text-xs text-primary mt-1 text-center">{porcentajePagado}% cancelado</p>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4">
              <p className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-3">
                Ventas Incluidas en Este Pago ({comprobante.ventas.length})
              </p>

              <div className="space-y-3">
                {comprobante.ventas.map((venta, idx) => (
                  <div key={idx} className={`rounded-xl p-3 ${venta.estado === 'pagado' ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{venta.ticket}</p>
                        <p className="text-xs text-gray-400">{formatFecha(venta.fecha)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${venta.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {venta.estado === 'pagado' ? '✓ PAGADO' : '▸ PARCIAL'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      {venta.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-gray-600">
                          <span>{item.nombre} x{item.cantidad}</span>
                          <span>{formatMoneda(item.subtotal)}</span>
                        </div>
                      ))}
                      {venta.items.length > 3 && (
                        <p className="text-gray-400 text-xs">+{venta.items.length - 3} más...</p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs">
                      <div>
                        <span className="text-gray-500">Pagado ahora:</span>
                        <span className="font-medium text-green-600 ml-1">{formatMoneda(venta.monto_pagado_ahora)}</span>
                      </div>
                      {venta.estado === 'parcial' && (
                        <div>
                          <span className="text-gray-500">Pendiente:</span>
                          <span className="font-medium text-amber-600 ml-1">{formatMoneda(venta.nuevo_saldo)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4">
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Método de Pago:</span>
                  <span className="font-medium capitalize">{comprobante.metodo_pago}</span>
                </div>
                {comprobante.observaciones && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Observaciones:</span>
                    <span className="font-medium">{comprobante.observaciones}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Atendido por:</span>
                  <span className="font-medium">{comprobante.usuario_nombre}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 pt-2">✦ GRACIAS POR SU PAGO ✦</p>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-t border-gray-100 space-y-3 print:hidden">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleImprimir} className="flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-bold text-sm">
            <Printer size={18} />Imprimir
          </button>
          <button onClick={handleWhatsappTexto} className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-2xl font-bold text-sm">
            <Share2 size={18} />WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <button 
            onClick={handleWhatsappImagen} 
            disabled={enviandoImagen}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-2xl font-bold text-sm disabled:opacity-50"
          >
            {enviandoImagen ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
            Enviar Imagen
          </button>
          <button 
            onClick={handleDescargar} 
            className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-2xl font-bold text-sm"
          >
            <FileDown size={18} />
            Descargar
          </button>
        </div>

        <button 
          onClick={handleVerComprobante}
          className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}