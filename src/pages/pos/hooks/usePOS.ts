// Hook para gestión del POS
// Maneja carga de datos, filtrado y lógica de venta

import { useState, useEffect, useMemo, useCallback } from 'react'
import { productosService } from '@/services/productos.service'
import { clientesService } from '@/services/clientes.service'
import { ventasService } from '@/services/ventas.service'
import { useCarrito } from './useCarrito'
import type { Producto } from '@/types/producto.types'
import type { Cliente } from '@/types/cliente.types'
import type { MetodoPago } from '@/types/venta.types'

type Vista = 'pos' | 'confirmar' | 'ticket'

interface VentaConfirmada {
  ticketNumero: string
  metodo: MetodoPago
  descuento: number
  igv: number
  total: number
}

export function usePOS() {
  // Estado de datos
  const [productos, setProductos] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado UI
  const [vista, setVista] = useState<Vista>('pos')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('all')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [ventaConfirmada, setVentaConfirmada] = useState<VentaConfirmada | null>(null)
  const [showClientePicker, setShowClientePicker] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      productosService.obtenerTodos(),
      clientesService.obtenerTodos(),
    ])
      .then(([productosData, clientesData]) => {
        setProductos(productosData)
        setClientes(clientesData)
        if (clientesData.length > 0) {
          setClienteSeleccionado(clientesData[0])
        }
      })
      .finally(() => setCargando(false))
  }, [])

  // Crear mapa de stock por producto
  const stockInfo = productos.reduce((acc, p) => {
    acc[p.id] = p.stock_actual
    return acc
  }, {} as { [key: string]: number })

  // Hook del carrito (solo si hay cliente seleccionado)
  const { 
    items, 
    subtotal, 
    totalItems, 
    errorStock,
    agregarProducto, 
    limpiarCarrito, 
    getPrecio, 
    actualizarCantidad, 
    eliminarItem,
    getStockDisponible,
    getCantidadEnCarrito,
  } = useCarrito(clienteSeleccionado!, stockInfo)

  // Productos filtrados
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchCat = categoriaActiva === 'all' || p.categoria_id === categoriaActiva
      const matchBusq =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
      return matchCat && matchBusq && p.activo
    })
  }, [productos, categoriaActiva, busqueda])

  // Confirmar venta
  const handleConfirmar = useCallback(async (metodo: MetodoPago, descuento: number, igv: number, total: number) => {
    console.log('handleConfirmar iniciado', { metodo, descuento, igv, total })
    
    if (!clienteSeleccionado) {
      console.error('No hay cliente seleccionado')
      return
    }

    try {
      console.log('Creando venta...')
      const nuevaVenta = await ventasService.crear({
        ticket_numero: '',
        cliente_id: clienteSeleccionado.id,
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
        })),
        metodo_pago: metodo,
        subtotal,
        descuento,
        igv,
        total,
      })
      console.log('Venta creada:', nuevaVenta)

      // Descontar stock
      console.log('Descontando stock...')
      for (const item of items) {
        const productoActual = productos.find(p => p.id === item.producto.id)
        if (productoActual) {
          const nuevoStock = Math.max(0, productoActual.stock_actual - item.cantidad)
          console.log(`Stock producto ${item.producto.id}: ${productoActual.stock_actual} -> ${nuevoStock}`)
          await productosService.actualizar(item.producto.id, {
            stock_actual: nuevoStock,
          })
        }
      }

      const ticket: VentaConfirmada = {
        ticketNumero: nuevaVenta.ticket_numero,
        metodo,
        descuento,
        igv,
        total,
      }
      console.log('Seteando ticket:', ticket)
      setVentaConfirmada(ticket)
      console.log('Cambiando vista a ticket')
      setVista('ticket')
      console.log('handleConfirmar completado')
    } catch (error) {
      console.error('Error al registrar venta:', error)
    }
  }, [clienteSeleccionado, items, subtotal, productos])

  // Nueva venta
  const handleNuevaVenta = useCallback(() => {
    // Recargar productos actualizados
    productosService.obtenerTodos().then(setProductos)
    limpiarCarrito()
    setVentaConfirmada(null)
    setVista('pos')
  }, [limpiarCarrito])

  // Cancelar venta
  const handleCancelar = useCallback(() => {
    if (confirm('¿Cancelar la venta actual?')) {
      limpiarCarrito()
    }
  }, [limpiarCarrito])

  // Seleccionar cliente
  const handleSeleccionarCliente = useCallback((cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setShowClientePicker(false)
  }, [])

  return {
    // Datos
    productos,
    clientes,
    cargando,
    clienteSeleccionado,
    stockInfo,
    
    // Estado UI
    vista,
    busqueda,
    categoriaActiva,
    ventaConfirmada,
    showClientePicker,
    
    // Carrito
    items,
    subtotal,
    totalItems,
    errorStock,
    productosFiltrados,
    
    // Actions
    setVista,
    setBusqueda,
    setCategoriaActiva,
    setShowClientePicker,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    handleConfirmar,
    handleNuevaVenta,
    handleCancelar,
    handleSeleccionarCliente,
    getPrecio,
    getStockDisponible,
    getCantidadEnCarrito,
  }
}
