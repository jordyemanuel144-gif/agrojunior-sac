// TarjetaProducto - Tarjeta individual de producto en el POS
import { useState, useEffect } from 'react'
import { AlertCircle, ShoppingCart } from 'lucide-react'
import type { Producto } from '@/types/producto.types'

interface Props {
  producto: Producto
  precio: number
  stockDisponible: number
  cantidadEnCarrito: number
  onAnadir: (producto: Producto, cantidad: number) => { success: boolean; error?: string }
  onActualizar: (productoId: string, cantidad: number) => { success: boolean; error?: string }
  onEliminar: (productoId: string) => void
}

export function TarjetaProducto({ producto, precio, stockDisponible, cantidadEnCarrito, onAnadir, onActualizar, onEliminar }: Props) {
  const [cantidadInput, setCantidadInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const sinStock = stockDisponible <= 0
  const stockMaximo = stockDisponible

  useEffect(() => {
    if (!sinStock && cantidadEnCarrito > 0) {
      setCantidadInput(esKg ? cantidadEnCarrito.toFixed(1) : cantidadEnCarrito.toString())
    }
  }, [cantidadEnCarrito, sinStock])

  const mostrarError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(null), 2500)
  }

  const agregarCantidadRapida = (cantidad: number) => {
    if (stockMaximo < cantidad) {
      mostrarError(`Máx: ${stockMaximo.toFixed(1)} ${producto.tipo_medida}`)
      return
    }
    const result = onAnadir(producto, cantidad)
    if (!result.success && result.error) {
      mostrarError(result.error)
    }
  }

  const handleInputConfirmar = () => {
    const val = parseFloat(cantidadInput)
    if (!val || val <= 0) return
    
    if (val > stockMaximo) {
      mostrarError(`Máx: ${stockMaximo.toFixed(1)} ${producto.tipo_medida}`)
      return
    }

    let result: { success: boolean; error?: string }
    
    if (cantidadEnCarrito > 0) {
      result = onActualizar(producto.id, val)
    } else {
      result = onAnadir(producto, val)
    }
    
    if (result.success) {
      setCantidadInput('')
    } else if (result.error) {
      mostrarError(result.error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCantidadInput(value)
    }
  }

  const handleRestar = () => {
    if (cantidadEnCarrito <= 1) {
      onEliminar(producto.id)
      setCantidadInput('')
    } else {
      onActualizar(producto.id, cantidadEnCarrito - 1)
    }
  }

  const estaBajoStock = stockDisponible <= producto.stock_minimo
  const esKg = producto.tipo_medida === 'kg'

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${sinStock ? 'border-gray-200 opacity-60' : 'border-gray-200'} overflow-hidden flex flex-col`}>
      <div className="relative h-16 sm:h-20 bg-gray-50">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🐔</div>
        )}
        
        {producto.tag === 'oferta' && (
          <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            Oferta
          </span>
        )}

        {sinStock && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-white text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md uppercase">Agotado</span>
          </div>
        )}

        {cantidadEnCarrito > 0 && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            <ShoppingCart size={9} />
            {esKg ? cantidadEnCarrito.toFixed(1) : cantidadEnCarrito}
          </div>
        )}
      </div>
      
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{producto.nombre}</p>
        
        <div className="flex items-center justify-between">
          <p className="text-blue-600 font-bold text-base">
            {precio.toFixed(2)}
            <span className="text-gray-400 font-medium text-xs ml-0.5">/{producto.tipo_medida}</span>
          </p>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
            estaBajoStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {stockDisponible.toFixed(1)} {producto.tipo_medida}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-1 text-red-500 text-[9px] bg-red-50 px-1.5 py-1 rounded">
            <AlertCircle size={9} />
            <span>{error}</span>
          </div>
        )}

        {esKg ? (
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex gap-1">
              <button
                onClick={() => agregarCantidadRapida(0.5)}
                disabled={sinStock || stockMaximo < 0.5}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all
                  ${sinStock || stockMaximo < 0.5 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                +0.5
              </button>
              <button
                onClick={() => agregarCantidadRapida(1)}
                disabled={sinStock || stockMaximo < 1}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all
                  ${sinStock || stockMaximo < 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                +1 kg
              </button>
              <button
                onClick={handleRestar}
                disabled={sinStock || cantidadEnCarrito === 0}
                className={`w-7 flex items-center justify-center rounded-md text-[10px] font-bold transition-all
                  ${sinStock || cantidadEnCarrito === 0 ? 'bg-gray-100 text-gray-300' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
              >
                -1
              </button>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={cantidadInput}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === 'Enter' && handleInputConfirmar()}
                  placeholder={cantidadEnCarrito > 0 ? `${cantidadEnCarrito}` : 'otro'}
                  className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-400 text-center"
                  step="0.1" min="0.1"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">kg</span>
              </div>
              <button
                onClick={handleInputConfirmar}
                disabled={sinStock || !cantidadInput}
                className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all
                  ${sinStock || !cantidadInput ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                ✓
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex gap-1">
              <button
                onClick={() => agregarCantidadRapida(1)}
                disabled={sinStock}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all
                  ${sinStock ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                +1
              </button>
              <button
                onClick={handleRestar}
                disabled={sinStock || cantidadEnCarrito === 0}
                className={`w-7 flex items-center justify-center rounded-md text-[10px] font-bold transition-all
                  ${sinStock || cantidadEnCarrito === 0 ? 'bg-gray-100 text-gray-300' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
              >
                -1
              </button>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={cantidadInput}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === 'Enter' && handleInputConfirmar()}
                  placeholder={cantidadEnCarrito > 0 ? `${cantidadEnCarrito}` : 'otro'}
                  className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-400 text-center"
                  min="1"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">uds</span>
              </div>
              <button
                onClick={handleInputConfirmar}
                disabled={sinStock || !cantidadInput}
                className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all
                  ${sinStock || !cantidadInput ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}