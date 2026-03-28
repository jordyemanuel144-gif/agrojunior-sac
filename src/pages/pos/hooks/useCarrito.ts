// Hook para gestión del carrito de compras del POS
import { useState, useCallback } from 'react'
import type { CartItem } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import type { Producto } from '@/types/producto.types'
import { PRECIO_POR_TIPO_CLIENTE } from '@/config/constantes'

interface StockInfo {
  [productoId: string]: number
}

export function useCarrito(cliente: Cliente, stockInfo: StockInfo = {}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [errorStock, setErrorStock] = useState<string | null>(null)

  const getPrecio = useCallback((producto: Producto): number => {
    if (!cliente) return producto.precio_minorista
    const key = PRECIO_POR_TIPO_CLIENTE[cliente.tipo]
    return producto[key] as number
  }, [cliente])

  const getStockDisponible = useCallback((productoId: string): number => {
    return stockInfo[productoId] ?? 0
  }, [stockInfo])

  const getCantidadEnCarrito = useCallback((productoId: string): number => {
    const item = items.find(i => i.producto.id === productoId)
    return item?.cantidad ?? 0
  }, [items])

  const agregarProducto = useCallback((producto: Producto, cantidad: number): { success: boolean; error?: string } => {
    const stockDisponible = getStockDisponible(producto.id)
    const cantidadEnCarrito = getCantidadEnCarrito(producto.id)
    const nuevaCantidad = cantidadEnCarrito + cantidad

    if (stockDisponible < nuevaCantidad) {
      const mensaje = `Stock insuficiente. Disponible: ${stockDisponible} ${producto.tipo_medida}`
      setErrorStock(mensaje)
      setTimeout(() => setErrorStock(null), 3000)
      return { success: false, error: mensaje }
    }

    const precio = getPrecio(producto)
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * i.precio_unitario }
            : i
        )
      }
      return [...prev, { producto, cantidad, precio_unitario: precio, subtotal: precio * cantidad }]
    })
    return { success: true }
  }, [getPrecio, getStockDisponible, getCantidadEnCarrito])

  const actualizarCantidad = useCallback((productoId: string, cantidad: number): { success: boolean; error?: string } => {
    const stockDisponible = getStockDisponible(productoId)

    if (cantidad > 0 && cantidad > stockDisponible) {
      const mensaje = `Stock insuficiente. Disponible: ${stockDisponible}`
      setErrorStock(mensaje)
      setTimeout(() => setErrorStock(null), 3000)
      return { success: false, error: mensaje }
    }

    if (cantidad <= 0) {
      setItems(prev => prev.filter(i => i.producto.id !== productoId))
      return { success: true }
    }

    setItems(prev => prev.map(i =>
      i.producto.id === productoId
        ? { ...i, cantidad, subtotal: cantidad * i.precio_unitario }
        : i
    ))
    return { success: true }
  }, [getStockDisponible])

  const eliminarItem = useCallback((productoId: string) => {
    setItems(prev => prev.filter(i => i.producto.id !== productoId))
  }, [])

  const limpiarCarrito = useCallback(() => setItems([]), [])

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0)
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  return { 
    items, 
    subtotal, 
    totalItems, 
    errorStock,
    agregarProducto, 
    actualizarCantidad, 
    eliminarItem, 
    limpiarCarrito, 
    getPrecio,
    getStockDisponible,
    getCantidadEnCarrito,
  }
}
