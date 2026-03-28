// PasoProductos - Lista de productos con cantidad y precio editable
// Paso 2 del formulario de nueva compra

import { useState, useMemo } from 'react'
import { Search, Package } from 'lucide-react'
import type { Producto } from '@/types/producto.types'
import { MONEDA } from '@/config/constantes'
import type { ItemTemporal } from '../hooks/useCompra'

interface Props {
  productos: Producto[]
  items: Map<string, ItemTemporal>
  onActualizarItem: (productoId: string, cantidad: number, precioUnitario: number) => void
  puedeAvanzar: boolean
  totalCompra?: number
}

export function PasoProductos({
  productos = [],
  items = new Map(),
  onActualizarItem,
  puedeAvanzar,
  totalCompra,
}: Props) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return productos.slice(0, 20)
    const busq = busqueda.toLowerCase()
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(busq) ||
      p.codigo.toLowerCase().includes(busq)
    ).slice(0, 20)
  }, [productos, busqueda])

  const productosSeleccionados = useMemo(() => {
    let count = 0
    items.forEach(item => {
      if (item.cantidad > 0) count++
    })
    return count
  }, [items])

  const handleCantidadChange = (producto: Producto, valor: string) => {
    const cantidad = Number(valor) || 0
    const item = items.get(producto.id)
    const precio = item?.precioUnitario ?? producto.precio_costo
    if (!items.has(producto.id) && cantidad > 0) {
      onActualizarItem(producto.id, cantidad, producto.precio_costo)
    } else {
      onActualizarItem(producto.id, cantidad, precio)
    }
  }

  const handlePrecioChange = (productoId: string, valor: string, precioDefault: number) => {
    const precio = Number(valor) || 0
    const item = items.get(productoId)
    const cantidad = item?.cantidad ?? 0
    if (cantidad > 0) {
      onActualizarItem(productoId, cantidad, precio)
    } else {
      onActualizarItem(productoId, cantidad, precio > 0 ? precio : precioDefault)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header fijo con buscador y total */}
      <div className="sticky top-0 z-10 px-2 py-1.5 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${puedeAvanzar ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">
              {productosSeleccionados ?? 0}
            </span>
          </div>
          <div className="text-right min-w-[80px]">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold text-blue-600">
              {MONEDA} {(totalCompra ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
        {!puedeAvanzar && (
          <p className="text-xs text-amber-600 text-center mt-1">
            Agrega al menos un producto
          </p>
        )}
      </div>

      {/* Headers de columnas */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase">
        <div className="min-w-[50px] text-center">Código</div>
        <div className="flex-1">Producto</div>
        <div className="w-[100px] text-center">Cant / Precio</div>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No hay productos{busqueda && ` para "${busqueda}"`}</p>
          </div>
        ) : (
          filtrados.map(producto => {
            const item = items.get(producto.id)
            const cantidad = item?.cantidad ?? 0
            const precioUnitario = item?.precioUnitario ?? producto.precio_costo
            const estaSeleccionado = cantidad > 0

            return (
              <div
                key={producto.id}
                className={`bg-white rounded-lg px-2 py-1.5 border transition-all ${
                  estaSeleccionado
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Código y Stock */}
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] font-mono text-gray-400">{producto.codigo}</span>
                    <span className={`text-[10px] font-semibold ${
                      producto.stock_actual <= producto.stock_minimo 
                        ? 'text-red-500' 
                        : 'text-green-600'
                    }`}>
                      {producto.stock_actual.toFixed(1)}{producto.tipo_medida}
                    </span>
                  </div>

                  {/* Nombre y precio costo */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm leading-tight">{producto.nombre}</p>
                    <p className="text-[10px] text-gray-500">Costo: {MONEDA} {producto.precio_costo.toFixed(2)}</p>
                  </div>

                  {/* Campos de entrada */}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cantidad > 0 ? cantidad : ''}
                      onChange={e => handleCantidadChange(producto, e.target.value)}
                      className="w-12 px-1 py-1 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="0"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={precioUnitario || ''}
                      onChange={e => handlePrecioChange(producto.id, e.target.value, producto.precio_costo)}
                      className="w-14 px-1 py-1 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="0"
                    />
                    {estaSeleccionado && (
                      <span className="text-xs font-bold text-blue-600 whitespace-nowrap min-w-[50px] text-right">
                        {MONEDA} {(cantidad * precioUnitario).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
