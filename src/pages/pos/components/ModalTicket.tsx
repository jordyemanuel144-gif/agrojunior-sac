import { Printer, Share2, CheckCircle2 } from 'lucide-react'
import type { CartItem, MetodoPago } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { NOMBRE_NEGOCIO, RUC_NEGOCIO, DIRECCION_NEGOCIO } from '@/config/constantes'

interface Props {
  items: CartItem[]
  cliente: Cliente
  venta: {
    ticketNumero: string
    metodo: MetodoPago
    descuento: number
    igv: number
    total: number
  }
  onNuevaVenta: () => void
}

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape/Plin',
  transferencia: 'Transferencia',
}

export function ModalTicket({ items, cliente, venta, onNuevaVenta }: Props) {
  const subtotal = items.reduce((a, i) => a + i.subtotal, 0)
  const ahora = new Date()

  const handleImprimir = () => window.print()

  const handleWhatsapp = () => {
    const lineas = items.map(i =>
      `• ${i.producto.nombre} x${i.cantidad}${i.producto.tipo_medida === 'kg' ? 'kg' : ''} = S/ ${i.subtotal.toFixed(2)}`
    ).join('\n')
    const msg = encodeURIComponent(
      `*${NOMBRE_NEGOCIO}*\nTicket: ${venta.ticketNumero}\nFecha: ${ahora.toLocaleDateString('es-PE')}\n\n${lineas}\n\n*Total: S/ ${venta.total.toFixed(2)}*\n¡Gracias por su compra!`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-8 pb-6 flex flex-col items-center border-b border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">¡Venta completada!</h1>
        <p className="text-gray-400 text-sm mt-1">{venta.ticketNumero}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none">
          <div className="bg-blue-600 text-white text-center py-5 px-4">
            <p className="text-lg font-bold tracking-wide">SAM JOSÉ AVÍCOLA</p>
            <p className="text-blue-200 text-xs mt-0.5">RUC: {RUC_NEGOCIO}</p>
            <p className="text-blue-200 text-xs">{DIRECCION_NEGOCIO}</p>
          </div>
          <div className="px-4 py-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>{ahora.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span>{ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Cliente: <span className="text-gray-900 font-medium">{cliente.nombre}</span></span>
              <span>Pago: <span className="text-gray-900 font-medium">{METODO_LABEL[venta.metodo]}</span></span>
            </div>
            <div className="border-t border-dashed border-gray-200" />
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.producto.id} className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                    <p className="text-xs text-gray-400">{item.cantidad}{item.producto.tipo_medida === 'kg' ? ' kg' : ' u'} × S/ {item.precio_unitario.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">S/ {item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
              {venta.descuento > 0 && <div className="flex justify-between text-green-600"><span>Descuento</span><span>-S/ {venta.descuento.toFixed(2)}</span></div>}
              {venta.igv > 0 && <div className="flex justify-between text-gray-500"><span>IGV (18%)</span><span>S/ {venta.igv.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
                <span>TOTAL</span>
                <span className="text-blue-600 text-lg">S/ {venta.total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 pt-2">¡Gracias por su compra!</p>
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-4 border-t border-gray-100 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleImprimir} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm">
            <Printer size={18} />Ticket
          </button>
          <button onClick={handleWhatsapp} className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-2xl font-bold text-sm">
            <Share2 size={18} />WhatsApp
          </button>
        </div>
        <button onClick={onNuevaVenta} className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-sm">Nueva venta</button>
      </div>
    </div>
  )
}
