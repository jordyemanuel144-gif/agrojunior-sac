// ListaProductos - Lista de productos en ConfirmarPedido
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types/venta.types'

interface Props {
  items: CartItem[]
  stockInfo: { [productoId: string]: number }
  getDisplayCantidad: (productoId: string, cantidad: number) => string
  onEditStart: (productoId: string, cantidad: number) => void
  onEditChange: (productoId: string, valor: string) => void
  onEditConfirm: (productoId: string, cantidadOriginal: number) => void
  onIncrement: (productoId: string, currentCantidad: number) => void
  getSubtotalTemporal: (item: CartItem) => number
  onActualizarCantidad: (productoId: string, cantidad: number) => void
  onEliminarItem: (productoId: string) => void
}

export function ListaProductos({
  items, stockInfo, getDisplayCantidad, onEditStart, onEditChange,
  onEditConfirm, onIncrement, getSubtotalTemporal, onActualizarCantidad, onEliminarItem
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Resumen de Venta</h2>
        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
        {items.map(item => {
          const stockDisponible = stockInfo[item.producto.id] ?? 0
          const bajoStock = stockDisponible <= (item.producto.stock_minimo ?? 0)
          const subtotalTemporal = getSubtotalTemporal(item)
          
          return (
            <div key={item.producto.id} className="flex items-center gap-2 px-4 py-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0">
                {item.producto.imagen_url 
                  ? <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-full h-full object-cover" /> 
                  : <div className="w-full h-full flex items-center justify-center text-xl">🐔</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.producto.nombre}</p>
                <p className="text-xs text-gray-400">S/ {item.precio_unitario.toFixed(2)} x {item.producto.tipo_medida}</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-0.5 py-0.5">
                <button 
                  onClick={() => item.cantidad > 1 ? onActualizarCantidad(item.producto.id, item.cantidad - 1) : onEliminarItem(item.producto.id)} 
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center"
                >
                  {item.cantidad > 1 ? <Minus size={12} className="text-gray-600" /> : <Trash2 size={12} className="text-red-500" />}
                </button>
                <input 
                  type="number" 
                  value={getDisplayCantidad(item.producto.id, item.cantidad)}
                  onFocus={() => onEditStart(item.producto.id, item.cantidad)}
                  onChange={(e) => onEditChange(item.producto.id, e.target.value)}
                  onBlur={() => onEditConfirm(item.producto.id, item.cantidad)}
                  onKeyDown={(e) => e.key === 'Enter' && onEditConfirm(item.producto.id, item.cantidad)}
                  className="w-10 text-center text-sm font-bold bg-transparent focus:outline-none" 
                />
                <button onClick={() => onIncrement(item.producto.id, item.cantidad)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <Plus size={12} className="text-gray-600" />
                </button>
              </div>
              <div className="w-20 text-right">
                <p className="text-blue-600 font-bold text-sm">S/ {subtotalTemporal.toFixed(2)}</p>
                <p className={`text-[10px] font-medium ${bajoStock ? 'text-yellow-600' : 'text-green-600'}`}>
                  Stock: {stockDisponible.toFixed(1)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}