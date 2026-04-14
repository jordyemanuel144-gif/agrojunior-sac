// useConfirmarPedido - Hook para la lógica de ConfirmarPedido
import { useState } from 'react'
import type { CartItem } from '@/types/venta.types'
import type { MetodoPago, EstadoPago } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { DESCUENTOS_MAYORISTA } from '@/datos-mock/descuentos.mock'

const MONTOS_RAPIDOS = [5, 10, 20, 50]

export function useConfirmarPedido({
  items, cliente, stockInfo, igvActivo, onConfirmar
}: {
  items: CartItem[]
  cliente: Cliente
  stockInfo: { [productoId: string]: number }
  igvActivo: boolean
  onConfirmar: (metodo: MetodoPago, descuento: number, igv: number, total: number, montoPagado: number, estadoPago: EstadoPago) => void
}) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState<Record<string, string>>({})
  const [errorStock, setErrorStock] = useState<string | null>(null)
  const [tipoPago, setTipoPago] = useState<'completo' | 'parcial' | 'cuenta'>('completo')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [mostrarResumenPago, setMostrarResumenPago] = useState(false)

  const esPublico = cliente.id === 'publico'

  const getDisplayCantidad = (productoId: string, cantidad: number) => editando[productoId] ?? cantidad

  const handleEditStart = (productoId: string, cantidad: number) => {
    setEditando(prev => ({ ...prev, [productoId]: String(cantidad) }))
  }

  const handleEditChange = (productoId: string, valor: string) => {
    if (valor === '' || /^\d+$/.test(valor)) setEditando(prev => ({ ...prev, [productoId]: valor }))
  }

  const handleIncrement = (productoId: string, currentCantidad: number) => {
    const stockDisponible = stockInfo[productoId] ?? 0
    if (currentCantidad >= stockDisponible) {
      setErrorStock(`Stock insuficiente. Máximo: ${stockDisponible}`)
      setTimeout(() => setErrorStock(null), 3000)
      return
    }
    const num = parseFloat(editando[productoId] ?? String(currentCantidad)) + 1
    setEditando(prev => ({ ...prev, [productoId]: String(num) }))
  }

  const handleEditConfirm = (productoId: string, cantidadOriginal: number, onActualizar: (id: string, qty: number) => void, onEliminar: (id: string) => void) => {
    const valorEditado = editando[productoId]
    if (valorEditado === undefined || valorEditado === '') {
      const { [productoId]: _, ...rest } = editando
      setEditando(rest)
      return
    }
    const num = parseFloat(valorEditado)
    const stockDisponible = stockInfo[productoId] ?? 0
    if (num > stockDisponible || num === cantidadOriginal) {
      const { [productoId]: _, ...rest } = editando
      setEditando(rest)
      return
    }
    num <= 0 ? onEliminar(productoId) : onActualizar(productoId, num)
    const { [productoId]: _, ...rest } = editando
    setEditando(rest)
  }

  const getSubtotalTemporal = (item: CartItem) => {
    const cantidadEditada = editando[item.producto.id]
    if (cantidadEditada !== undefined && cantidadEditada !== '') {
      const num = parseFloat(cantidadEditada)
      if (!isNaN(num) && num > 0) return num * item.precio_unitario
    }
    return item.subtotal
  }

  const pctDescuento = DESCUENTOS_MAYORISTA[cliente.tipo] ?? 0
  const subtotalCalculado = items.reduce((acc, item) => acc + getSubtotalTemporal(item), 0)
  const montoDescuento = subtotalCalculado * pctDescuento
  const baseIgv = subtotalCalculado - montoDescuento
  const igv = igvActivo ? baseIgv * 0.18 : 0
  const total = baseIgv + igv
  const montoRecibidoNum = parseFloat(montoRecibido) || 0
  const cambio = montoRecibidoNum > total ? montoRecibidoNum - total : 0
  const saldoPendiente = total - montoRecibidoNum

  const handleConfirmar = () => {
    if (cargando) return
    const montoPagado = tipoPago === 'completo' ? total : tipoPago === 'parcial' ? montoRecibidoNum : 0
    if (montoPagado > total || (montoPagado <= 0 && tipoPago === 'parcial')) return
    setMostrarResumenPago(true)
  }

  const confirmarPago = async () => {
    setCargando(true)
    await new Promise(r => setTimeout(r, 500))
    try {
      let montoPagado = 0
      let estadoPago: EstadoPago = 'pendiente'
      if (tipoPago === 'completo') {
        montoPagado = total
        estadoPago = 'pagado'
      } else if (tipoPago === 'parcial') {
        montoPagado = montoRecibidoNum
        estadoPago = montoPagado >= total ? 'pagado' : 'parcial'
      }
      await onConfirmar(metodo, montoDescuento, igv, total, montoPagado, estadoPago)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar: ' + String(error))
    }
    setCargando(false)
    setMostrarResumenPago(false)
  }

  return {
    metodo, setMetodo, tipoPago, setTipoPago,
    montoRecibido, setMontoRecibido,
    cargando, errorStock,
    mostrarResumenPago, setMostrarResumenPago,
    esPublico,
    getSubtotalTemporal, subtotalCalculado, montoDescuento, igv, total,
    montoRecibidoNum, cambio, saldoPendiente,
    handleConfirmar, confirmarPago,
    handleEditStart, handleEditChange, handleEditConfirm, handleIncrement,
    getDisplayCantidad, MONTOS_RAPIDOS
  }
}