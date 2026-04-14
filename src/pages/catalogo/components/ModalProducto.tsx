import { X } from 'lucide-react'
import type { Producto } from '@/types/producto.types'
import type { TipoCliente } from '@/types/cliente.types'
import { WHATSAPP } from '@/config/constantes'
import { formatMoneda } from '@/lib/utils'

interface ModalProductoProps {
  producto: Producto
  precio: number
  tipoCliente: TipoCliente
  onClose: () => void
}

export function ModalProducto({ producto, precio, tipoCliente, onClose }: ModalProductoProps) {
  const sinStock = producto.stock_actual <= 0
  const mensajeWhatsApp = `Hola,%20quiero%20comprar:%20${encodeURIComponent(producto.nombre)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="relative h-48 sm:h-56 bg-gray-100">
          {producto.imagen_url ? (
            <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🐔</div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {producto.destacado && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                Destacado
              </span>
            )}
            {producto.tag && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                {producto.tag === 'oferta' ? 'Oferta' : producto.tag === 'nuevo' ? 'Nuevo' : producto.tag}
              </span>
            )}
          </div>

          {sinStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-600 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">{producto.nombre}</h2>
          <p className="text-sm text-gray-500 mt-1">Por {producto.tipo_medida}</p>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-bold text-2xl">{formatMoneda(precio)}</p>
              <p className="text-xs text-gray-400">
                Precio {tipoCliente === 'mayorista' ? 'mayorista' : tipoCliente === 'especial' ? 'especial' : 'minorista'}
              </p>
            </div>
            <span
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                sinStock
                  ? 'bg-gray-100 text-gray-500'
                  : producto.stock_actual <= producto.stock_minimo
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {sinStock ? 'Sin stock' : `${producto.stock_actual.toFixed(1)} ${producto.tipo_medida} disponibles`}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Todos los precios</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Minorista</p>
                <p className="font-bold text-gray-900">{formatMoneda(producto.precio_minorista)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-green-600 uppercase">Mayorista</p>
                <p className="font-bold text-green-700">{formatMoneda(producto.precio_mayorista)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-purple-600 uppercase">Especial</p>
                <p className="font-bold text-purple-700">{formatMoneda(producto.precio_especial)}</p>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}?text=${mensajeWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold transition-all ${
              sinStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hacer Pedido por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
