// ============================================================
// FilaProducto - Fila clickeable de producto en la lista
// Navega al detalle al hacer clic
// ============================================================
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Package } from 'lucide-react'
import type { Producto } from '@/types/producto.types'
import { productosService } from '@/services/productos.service'
import { RUTAS } from '@/config/rutas'

interface Props {
  producto: Producto
}

export function FilaProducto({ producto }: Props) {
  const navigate = useNavigate()

  const categoria = productosService.getCategoria(producto.categoria_id)
  const stockBajo = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo
  const stockAgotado = producto.stock_actual === 0

  const stockColor = stockAgotado ? 'text-red-500' : stockBajo ? 'text-amber-500' : 'text-green-600'
  const stockBg = stockAgotado ? 'bg-red-50' : stockBajo ? 'bg-amber-50' : 'bg-green-50'

  const handleClick = () => {
    navigate(`${RUTAS.ADMIN.PRODUCTOS}/${producto.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 md:gap-4 p-4 bg-white hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
    >
      {/* Imagen o ícono */}
      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <Package size={24} className="text-gray-400" />
        )}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{producto.nombre}</span>
          {producto.tag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-600">
              {producto.tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">Código: {producto.codigo}</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {categoria}
          </span>
        </div>
      </div>

      {/* Precios */}
      <div className="hidden lg:flex items-center gap-4 text-sm flex-shrink-0">
        <div className="text-right">
          <p className="text-gray-400 text-xs">Minorista</p>
          <p className="font-medium text-gray-900">S/ {producto.precio_minorista.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">Mayorista</p>
          <p className="font-medium text-gray-900">S/ {producto.precio_mayorista.toFixed(2)}</p>
        </div>
      </div>

      {/* Stock */}
      <div className={`px-3 py-1.5 rounded-lg text-center min-w-[70px] ${stockBg}`}>
        <p className={`text-lg font-bold ${stockColor}`}>
          {producto.stock_actual.toFixed(producto.tipo_medida === 'kg' ? 1 : 0)}
        </p>
        <p className="text-[10px] text-gray-500 uppercase">{producto.tipo_medida}</p>
      </div>

      {/* Badge estado y chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          producto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {producto.activo ? 'Activo' : 'Inactivo'}
        </span>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </button>
  )
}
