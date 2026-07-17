// Botones de acciones para la venta
import { Printer, Share2 } from 'lucide-react'

interface Props {
  onImprimir: () => void
  onWhatsapp: () => void
}

export function AccionesVentaDetalle({ onImprimir, onWhatsapp }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onImprimir}
        className="flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors"
      >
        <Printer size={18} />
        Imprimir
      </button>
      <button
        onClick={onWhatsapp}
        className="flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
      >
        <Share2 size={18} />
        WhatsApp
      </button>
    </div>
  )
}
