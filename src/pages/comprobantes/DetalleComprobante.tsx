import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Share2, Image, FileDown, Loader2 } from 'lucide-react'
import { comprobantesService } from '@/services/comprobantes.service'
import type { Comprobante, ComprobanteVenta, ComprobantePago } from '@/types/comprobante.types'
import { formatMoneda, formatFecha } from '@/lib/utils'
import { generarImagenDesdeElemento, descargarImagen } from '@/lib/imagen'
import { Cargando } from '@/components/ui/Cargando'
import { EstadoVacio } from '@/components/ui/EstadoVacio'

export default function DetalleComprobante() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviandoImagen, setEnviandoImagen] = useState(false)

  useEffect(() => {
    if (!id) return
    const data = comprobantesService.obtenerPorId(id)
    setComprobante(data)
    setCargando(false)
  }, [id])

  const handleImprimir = () => window.print()

  const handleWhatsappTexto = () => {
    if (!comprobante) return
    
    if (comprobante.tipo === 'venta') {
      const venta = comprobante as ComprobanteVenta
      const lineas = venta.items.map(i =>
        `• ${i.nombre} x${i.cantidad} = ${formatMoneda(i.subtotal)}`
      ).join('\n')
      const msg = encodeURIComponent(
        `🧾 TICKET - ${venta.numero}\n` +
        `${formatFecha(venta.fecha)}\n\n` +
        `${lineas}\n\n` +
        `Total: ${formatMoneda(venta.total)}\n` +
        `Método: ${venta.metodo_pago}\n\n` +
        `Gracias por su compra!`
      )
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    } else {
      const pago = comprobante as ComprobantePago
      const msg = encodeURIComponent(
        `🧾 COMPROBANTE DE PAGO - ${pago.numero}\n` +
        `${formatFecha(pago.fecha)}\n\n` +
        `Cliente: ${pago.cliente_nombre}\n` +
        `Pago: ${formatMoneda(pago.monto_pagado)}\n` +
        `Nueva deuda: ${formatMoneda(pago.nueva_deuda)}\n\n` +
        `Gracias por su pago!`
      )
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }

  const handleWhatsappImagen = async () => {
    if (!comprobante) return
    console.log('Iniciando generación de imagen...')
    setEnviandoImagen(true)
    try {
      console.log('Llamando a generarImagenDesdeElemento...')
      const dataUrl = await generarImagenDesdeElemento('comprobante-detalle-content')
      console.log('Imagen generada, dataUrl length:', dataUrl?.length)
      
      if (!dataUrl) {
        alert('Error: No se pudo generar la imagen')
        return
      }
      
      let mensaje = ''
      if (comprobante.tipo === 'venta') {
        const venta = comprobante as ComprobanteVenta
        mensaje = `🧾 TICKET - ${venta.numero}\n${formatFecha(venta.fecha)}\n\nTotal: ${formatMoneda(venta.total)}\nGracias por su compra!`
      } else {
        const pago = comprobante as ComprobantePago
        mensaje = `🧾 COMPROBANTE DE PAGO - ${pago.numero}\n${formatFecha(pago.fecha)}\n\nPago: ${formatMoneda(pago.monto_pagado)}\nNueva deuda: ${formatMoneda(pago.nueva_deuda)}\n\nGracias por su pago!`
      }
      
      const mensajeEncoded = encodeURIComponent(mensaje)
      window.open(`https://wa.me/?text=${mensajeEncoded}`, '_blank')
      
      console.log('Abriendo WhatsApp, esperando para descargar...')
      setTimeout(() => {
        console.log('Descargando imagen...')
        descargarImagen(dataUrl, `comprobante-${comprobante.numero}.png`)
        console.log('Descarga iniciada')
      }, 1500)
    } catch (error) {
      console.error('Error al generar imagen:', error)
      alert('Error al generar imagen: ' + String(error))
    } finally {
      setEnviandoImagen(false)
    }
  }

  const handleDescargar = async () => {
    if (!comprobante) return
    console.log('Iniciando descarga...')
    try {
      const dataUrl = await generarImagenDesdeElemento('comprobante-detalle-content', { scale: 3 })
      console.log('Imagen para descargar, dataUrl length:', dataUrl?.length)
      
      if (!dataUrl) {
        alert('Error: No se pudo generar la imagen')
        return
      }
      
      descargarImagen(dataUrl, `comprobante-${comprobante.numero}.png`)
      alert('Descargando imagen...')
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar: ' + String(error))
    }
  }

  if (cargando) return <Cargando />
  if (!comprobante) return <EstadoVacio titulo="Comprobante no encontrado" mensaje="El comprobante no existe" />

  const esVenta = comprobante.tipo === 'venta'
  const venta = esVenta ? (comprobante as ComprobanteVenta) : null
  const pago = !esVenta ? (comprobante as ComprobantePago) : null

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/comprobantes')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{comprobante.numero}</h1>
          <p className="text-sm text-gray-500">{esVenta ? 'Venta' : 'Pago'} • {formatFecha(comprobante.fecha)}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 print:space-y-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div id="comprobante-detalle-content" className="print:shadow-none">
            <div className="bg-blue-600 text-white text-center py-6 px-4">
              <p className="text-lg font-bold">{comprobante.negocio_nombre.toUpperCase()}</p>
              <p className="text-blue-200 text-sm">RUC: {comprobante.negocio_ruc}</p>
              <p className="text-blue-200 text-sm">{comprobante.negocio_direccion}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                <p className="font-medium text-gray-900">{comprobante.cliente_nombre}</p>
                {comprobante.cliente_documento && (
                  <p className="text-sm text-gray-500">Documento: {comprobante.cliente_documento}</p>
                )}
              </div>

              {esVenta && venta && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Productos</h3>
                    <div className="space-y-2">
                      {venta.items.map((item, idx) => (
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
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-{formatMoneda(venta.descuento)}</span>
                      </div>
                    )}
                    {venta.igv > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>IGV (18%)</span>
                        <span>{formatMoneda(venta.igv)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-blue-600">{formatMoneda(venta.total)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 text-sm">
                    <p><span className="text-gray-500">Método:</span> <span className="capitalize">{venta.metodo_pago}</span></p>
                    <p><span className="text-gray-500">Vendedor:</span> {venta.vendedor_nombre}</p>
                  </div>
                </>
              )}

              {!esVenta && pago && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Resumen de Deuda</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deuda Total Original</span>
                        <span>{formatMoneda(pago.deuda_total_original)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pagado Anterior</span>
                        <span>{formatMoneda(pago.total_pagado_anterior)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Deuda Actual</span>
                        <span className="text-amber-600">{formatMoneda(pago.deuda_actual)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-blue-900">Monto Pagado</span>
                      <span className="font-bold text-blue-600 text-lg">{formatMoneda(pago.monto_pagado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Nueva Deuda</span>
                      <span className="font-bold text-blue-700">{formatMoneda(pago.nueva_deuda)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Ventas ({pago.ventas_pagadas_count} pagadas, {pago.ventas_parciales_count} parciales)
                    </h3>
                    <div className="space-y-3">
                      {pago.ventas.map((v, idx) => (
                        <div key={idx} className={`rounded-xl p-3 ${v.estado === 'pagado' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{v.ticket}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${v.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {v.estado === 'pagado' ? 'Pagado' : 'Parcial'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Pagado: {formatMoneda(v.monto_pagado_ahora)}</span>
                            {v.estado === 'parcial' && (
                              <span className="text-amber-600">Pendiente: {formatMoneda(v.nuevo_saldo)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 text-sm">
                    <p><span className="text-gray-500">Método:</span> <span className="capitalize">{pago.metodo_pago}</span></p>
                    {pago.observaciones && <p><span className="text-gray-500">Obs:</span> {pago.observaciones}</p>}
                    <p><span className="text-gray-500">Atendido por:</span> {pago.usuario_nombre}</p>
                  </div>
                </>
              )}

              <p className="text-center text-gray-400 text-sm">✦ GRACIAS ✦</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleImprimir} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold">
              <Printer size={18} />Imprimir
            </button>
            <button onClick={handleWhatsappTexto} className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-bold">
              <Share2 size={18} />WhatsApp
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleWhatsappImagen} 
              disabled={enviandoImagen}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {enviandoImagen ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
              Enviar Imagen
            </button>
            <button 
              onClick={handleDescargar} 
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl font-bold"
            >
              <FileDown size={18} />
              Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}