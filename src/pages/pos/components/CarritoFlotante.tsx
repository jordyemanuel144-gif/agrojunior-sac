import { ChevronRight, X } from 'lucide-react'

interface Props {
  totalItems: number
  subtotal: number
  onContinuar: () => void
  onCancelar: () => void
}

export function CarritoFlotante({ totalItems, subtotal, onContinuar, onCancelar }: Props) {
  return (
    <>
      <div className="md:hidden fixed bottom-20 left-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={onCancelar}
          className="w-12 h-full min-h-[60px] bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
        <button
          onClick={onContinuar}
          className="flex-1 bg-blue-600 text-white rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-xl shadow-blue-600/50 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-sm font-bold">
              {totalItems}
            </div>
            <div className="text-left">
              <p className="text-xs text-blue-200">Ver pedido</p>
              <p className="text-base font-bold">Continuar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-blue-200">Total</p>
              <p className="text-base font-bold">S/ {subtotal.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ChevronRight size={18} className="text-white" />
            </div>
          </div>
        </button>
      </div>

      <div className="hidden md:flex fixed bottom-4 right-4 z-30 items-center gap-2">
        <button
          onClick={onCancelar}
          className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-200 transition-colors"
          title="Cancelar venta"
        >
          <X size={18} className="text-gray-600" />
        </button>
        <button
          onClick={onContinuar}
          className="bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-blue-600/30 active:scale-[.98] transition-all"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
            {totalItems}
          </div>
          <div className="text-left">
            <p className="text-[11px] text-blue-200">Ver pedido actual</p>
            <p className="text-base font-bold">Siguiente</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-blue-200">Total Estimado</p>
            <p className="text-base font-bold">S/ {subtotal.toFixed(2)}</p>
          </div>
          <ChevronRight size={20} className="text-blue-300 flex-shrink-0" />
        </button>
      </div>
    </>
  )
}
