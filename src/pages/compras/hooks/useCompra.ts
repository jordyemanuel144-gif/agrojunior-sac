// Hook para gestión del formulario de nueva compra.
// Maneja los 3 pasos: proveedor, productos, confirmar.

import { useState, useMemo } from 'react'
import type { Producto } from '@/types/producto.types'

export type Paso = 1 | 2 | 3

export interface ItemTemporal {
  cantidad: number
  precioUnitario: number
}

export function useCompra(productos: Producto[]) {
  const [paso, setPaso] = useState<Paso>(1)
  const [proveedorId, setProveedorId] = useState<string | null>(null)
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<Map<string, ItemTemporal>>(new Map())

  const puedeAvanzarPaso1 = useMemo(() => proveedorId !== null, [proveedorId])

  const productosSeleccionados = useMemo(() => {
    const seleccionados: Array<{
      producto: Producto
      cantidad: number
      precioUnitario: number
      subtotal: number
    }> = []
    items.forEach((item, productoId) => {
      if (item.cantidad > 0) {
        const producto = productos.find(p => p.id === productoId)
        if (producto) {
          seleccionados.push({
            producto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })
        }
      }
    })
    return seleccionados
  }, [items, productos])

  const puedeAvanzarPaso2 = productosSeleccionados.length > 0

  const totalCompra = useMemo(
    () => productosSeleccionados.reduce((sum, item) => sum + item.subtotal, 0),
    [productosSeleccionados]
  )

  const irASiguiente = () => {
    if (paso === 1 && puedeAvanzarPaso1) setPaso(2)
    else if (paso === 2 && puedeAvanzarPaso2) setPaso(3)
  }

  const irAAnterior = () => {
    if (paso === 2) setPaso(1)
    else if (paso === 3) setPaso(2)
  }

  const actualizarItem = (
    productoId: string,
    cantidad: number,
    precioUnitario: number
  ) => {
    setItems(prev => {
      const nuevo = new Map(prev)
      if (cantidad === 0 && precioUnitario === 0) {
        nuevo.delete(productoId)
      } else {
        nuevo.set(productoId, { cantidad, precioUnitario })
      }
      return nuevo
    })
  }

  const reset = () => {
    setPaso(1)
    setProveedorId(null)
    setFecha(new Date().toISOString().split('T')[0])
    setNotas('')
    setItems(new Map())
  }

  return {
    paso,
    proveedorId,
    setProveedorId,
    fecha,
    setFecha,
    notas,
    setNotas,
    items,
    productosSeleccionados,
    puedeAvanzarPaso1,
    puedeAvanzarPaso2,
    totalCompra,
    irASiguiente,
    irAAnterior,
    actualizarItem,
    reset,
  }
}
