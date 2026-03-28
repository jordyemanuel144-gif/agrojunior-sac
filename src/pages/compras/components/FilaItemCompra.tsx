// Fila de item en detalle de compra
import { useEffect, useState } from 'react'
import type { ItemCompra } from '@/types/compra.types'
import { comprasService } from '@/services/compras.service'

interface Props {
  item: ItemCompra
}

export function FilaItemCompra({ item }: Props) {
  const [producto, setProducto] = useState({ nombre: '...', unidad: '' })

  useEffect(() => {
    comprasService.getProductoInfo(item.producto_id).then(setProducto)
  }, [item.producto_id])

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-lg">📦</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{producto.nombre}</p>
        <p className="text-sm text-gray-500">
          {item.cantidad} × S/ {item.precio_unitario.toFixed(2)} ({producto.unidad})
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">S/ {item.total.toFixed(2)}</p>
      </div>
    </div>
  )
}
