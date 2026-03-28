// TarjetaProducto - Tarjeta individual de producto en el POS
import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import type { Producto } from '@/types/producto.types'

interface Props {
  producto: Producto
  precio: number
  stockDisponible: number
  cantidadEnCarrito: number
  onAnadir: (producto: Producto, cantidad: number) => { success: boolean; error?: string }
}

export function TarjetaProducto({ producto, precio, stockDisponible, cantidadEnCarrito, onAnadir }: Props) {
  const [cantidad, setCantidad] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const sinStock = stockDisponible <= 0
  const stockMaximo = stockDisponible - cantidadEnCarrito

  const handleAnadir = () => {
    if (producto.tipo_medida === 'kg') {
      setShowInput(true)
      return
    }
    
    if (stockMaximo < 1) {
      setError('Stock insuficiente')
      setTimeout(() => setError(null), 2000)
      return
    }
    
    const result = onAnadir(producto, 1)
    if (!result.success && result.error) {
      setError(result.error)
      setTimeout(() => setError(null), 2000)
    }
  }

  const handleConfirmarKg = () => {
    const val = parseFloat(cantidad)
    if (!val || val <= 0) return
    
    if (val > stockMaximo) {
      setError(`Máximo: ${stockMaximo.toFixed(1)} kg`)
      setTimeout(() => setError(null), 2000)
      return
    }
    
    const result = onAnadir(producto, val)
    if (!result.success && result.error) {
      setError(result.error)
      setTimeout(() => setError(null), 2000)
      return
    }
    
    setCantidad('')
    setShowInput(false)
  }

  const estaBajoStock = stockDisponible <= producto.stock_minimo

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col min-h-[240px] sm:min-h-[260px] ${sinStock ? 'opacity-70' : ''}`}>
      <div className="relative w-full h-32 sm:h-40 bg-gray-100 flex-shrink-0">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🐔</div>
        )}
        
        {producto.tag === 'oferta' && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Oferta
          </span>
        )}
        
        {sinStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Agotado</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{producto.nombre}</p>
        
        <div className="flex items-center justify-between">
          <p className="text-blue-600 font-bold text-base">
            S/ {precio.toFixed(2)}
            <span className="text-gray-400 font-normal text-xs ml-1">/ {producto.tipo_medida}</span>
          </p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            estaBajoStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {stockDisponible.toFixed(1)} {producto.tipo_medida}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-1 text-red-500 text-[10px]">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        
        {showInput && producto.tipo_medida === 'kg' ? (
          <div className="flex gap-1.5 mt-1 items-center">
            <input
              type="number"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmarKg()}
              placeholder={`max ${stockMaximo.toFixed(1)}`}
              className="w-14 sm:flex-1 border border-blue-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-center"
              autoFocus step="0.1" min="0.1"
            />
            <button onClick={handleConfirmarKg} className="bg-blue-600 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center flex-shrink-0">✓</button>
            <button onClick={() => { setShowInput(false); setCantidad('') }} className="bg-gray-100 text-gray-500 w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm flex items-center justify-center flex-shrink-0">✕</button>
          </div>
        ) : (
          <button
            onClick={handleAnadir}
            disabled={sinStock}
            className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all
              ${sinStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95'}`}>
            {!sinStock && <Plus size={14} />}
            {sinStock ? 'Sin Stock' : 'Añadir'}
          </button>
        )}
      </div>
    </div>
  )
}
