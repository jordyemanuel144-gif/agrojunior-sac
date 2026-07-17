import { Printer, Share2, Loader2 } from 'lucide-react'
import type { Comprobante, ComprobanteVenta, ComprobantePago } from '@/types/comprobante.types'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { 
  descargarTexto, 
  descargarImagen, 
  descargarPdf,
  generarMensajeComprobanteVenta,
  generarMensajeComprobantePago
} from '@/lib/comprobante'

interface ComprobanteAccionesProps {
  comprobante: Comprobante
  enviandoImagen: boolean
  onEnviandoImagenChange: (value: boolean) => void
}

export function ComprobanteAcciones({ comprobante, enviandoImagen, onEnviandoImagenChange }: ComprobanteAccionesProps) {
  const getMensajeParaWhatsApp = (): string => {
    if (comprobante.tipo === 'venta') {
      const v = comprobante as ComprobanteVenta
      return generarMensajeComprobanteVenta(v)
    } else {
      const p = comprobante as ComprobantePago
      return generarMensajeComprobantePago(p)
    }
  }

  const handleWhatsappTexto = () => {
    const mensaje = getMensajeParaWhatsApp()
    const telefono = comprobante.cliente_telefono || '51970995140'
    const telLimpio = telefono.replace(/\D/g, '')
    const encoded = encodeURIComponent(mensaje)
    window.open(`https://wa.me/51${telLimpio}?text=${encoded}`, '_blank')
  }

  const handleWhatsappImagen = async () => {
    onEnviandoImagenChange(true)
    try {
      await descargarImagen(comprobante)
      const mensaje = getMensajeParaWhatsApp()
      const telefono = comprobante.cliente_telefono || '51970995140'
      const telLimpio = telefono.replace(/\D/g, '')
      const encoded = encodeURIComponent(mensaje)
      window.open(`https://wa.me/51${telLimpio}?text=${encoded}`, '_blank')
    } catch (error) {
      console.error('Error al generar imagen:', error)
      alert('Error al generar imagen')
    } finally {
      onEnviandoImagenChange(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => window.print()} 
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-neutral-900 rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors"
        >
          <Printer size={18} />
          <span className="hidden sm:inline">Imprimir</span>
        </button>

        <DropdownMenu
          align="left"
          trigger={
            <span className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors cursor-pointer">
              <Share2 size={18} />
              <span className="hidden sm:inline">WhatsApp</span>
            </span>
          }
          options={[
            { 
              label: 'Mensaje de texto', 
              icon: <span className="text-base">💬</span>,
              onClick: handleWhatsappTexto 
            },
            { 
              label: 'Imagen + mensaje', 
              icon: enviandoImagen ? <Loader2 size={16} className="animate-spin" /> : <span className="text-base">🖼️</span>,
              onClick: handleWhatsappImagen,
              disabled: enviandoImagen
            },
          ]}
        />

        <div className="col-span-2 md:col-span-1">
          <DropdownMenu
            align="left"
            trigger={
              <span className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors cursor-pointer">
                <span className="hidden sm:inline">Descargar</span>
                <span className="sm:hidden">Guardar</span>
              </span>
            }
            options={[
              { 
                label: 'Texto (.txt)', 
                icon: <span className="text-base">📝</span>,
                onClick: () => descargarTexto(comprobante) 
              },
              { 
                label: 'Imagen (.png)', 
                icon: <span className="text-base">🖼️</span>,
                onClick: () => descargarImagen(comprobante) 
              },
              { 
                label: 'PDF (.pdf)', 
                icon: <span className="text-base">📄</span>,
                onClick: () => descargarPdf(comprobante) 
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}