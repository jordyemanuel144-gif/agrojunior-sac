// Hook para gestión del POS
// Maneja carga de datos, filtrado y lógica de venta

import { useState, useEffect, useMemo, useCallback } from 'react'
import { productosService } from '@/services/productos.service'
import { clientesService } from '@/services/clientes.service'
import { ventasService } from '@/services/ventas.service'
import { comprobantesService } from '@/services/comprobantes.service'
import { useCarrito } from './useCarrito'
import { useAuthContext } from '@/context/AuthContext'
import type { Producto } from '@/types/producto.types'
import type { Cliente } from '@/types/cliente.types'
import type { MetodoPago, EstadoPago, Venta } from '@/types/venta.types'

type Vista = 'pos' | 'confirmar' | 'ticket'

interface VentaConfirmada {
  ticketNumero: string
  metodo: MetodoPago
  descuento: number
  igv: number
  total: number
  clienteInfo?: {
    nombre: string
    tipo: string
  }
  items?: Array<{
    producto: { id: string; nombre: string; tipo_medida: string }
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
}

interface ResultadoConfirmacion {
  ventaConfirmada: VentaConfirmada | null
  comprobanteId?: string
}

export function usePOS() {
  // Estado de datos
  const [productos, setProductos] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const { user } = useAuthContext()

  // Estado UI
  const [vista, setVista] = useState<Vista>('pos')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('all')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [ventaConfirmada, setVentaConfirmada] = useState<VentaConfirmada | null>(null)
  const [comprobanteGenerado, setComprobanteGenerado] = useState<{ id: string; ticketNumero: string; tipo: 'venta' | 'cuenta' } | null>(null)
  const [showClientePicker, setShowClientePicker] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      productosService.obtenerTodos(),
      clientesService.obtenerTodos(),
    ])
      .then(([productosData, clientesData]) => {
        setProductos(productosData)
        // Filtrar solo clientes activos para el POS
        const clientesActivos = clientesData.filter(c => c.activo)
        setClientes(clientesActivos)
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
  const handleConfirmar = useCallback(async (metodo: MetodoPago, descuento: number, igv: number, total: number, montoPagado: number, estadoPago: EstadoPago): Promise<ResultadoConfirmacion> => {
    console.log('handleConfirmar iniciado', { metodo, descuento, igv, total, montoPagado, estadoPago })
    
    if (!clienteSeleccionado) {
      console.error('No hay cliente seleccionado')
      return { ventaConfirmada: null }
    }

    try {
      console.log('Creando venta...')
      const nuevaVenta = await ventasService.crear({
        ticket_numero: '',
        cliente_id: clienteSeleccionado.id,
        vendedor_id: user?.id || 'usr_001',
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
        monto_pagado: montoPagado,
        estado_pago: estadoPago,
      })
      console.log('Venta creada:', nuevaVenta)

      // El stock se descuenta automáticamente via trigger de Supabase (trg_venta_items_insert)
      // No es necesario actualizar manualmente

      const ticket: VentaConfirmada = {
        ticketNumero: nuevaVenta.ticket_numero,
        metodo,
        descuento,
        igv,
        total,
        clienteInfo: {
          nombre: clienteSeleccionado.nombre,
          tipo: clienteSeleccionado.tipo,
        },
        items: items.map(item => ({
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            tipo_medida: item.producto.tipo_medida,
          },
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
        })),
      }
      console.log('Seteando ticket:', ticket)

      let comprobanteId: string | undefined

      // Generar comprobante solo si hay pago (pagado o parcial)
      if (estadoPago === 'pagado' || estadoPago === 'parcial') {
        console.log('Generando comprobante de venta...')
        const ventaParaComprobante: Venta & { vendedor_nombre: string } = {
          ...nuevaVenta,
          vendedor_nombre: user?.name || 'Cajero',
        }
        const comprobante = await comprobantesService.crearVenta(ventaParaComprobante)
        comprobanteId = comprobante.id
        setComprobanteGenerado({ id: comprobante.id, ticketNumero: nuevaVenta.ticket_numero, tipo: 'venta' })
        console.log('Comprobante generado:', comprobante.id)
      } else {
        console.log('Pago a cuenta - no se genera comprobante')
        setComprobanteGenerado({ id: '', ticketNumero: nuevaVenta.ticket_numero, tipo: 'cuenta' })
      }

      // Limpiar cliente seleccionado (seudocliente)
      console.log('Limpiando cliente seleccionado...')
      setClienteSeleccionado(null)
      // Limpiar el carrito
      console.log('Limpiando carrito...')
      limpiarCarrito()

      // Siempre volver al POS (sin vista de ticket)
      console.log('Volviendo al POS')
      setVista('pos')
      setVentaConfirmada(ticket)
      console.log('handleConfirmar completado')

      return { ventaConfirmada: ticket, comprobanteId }
    } catch (error) {
      console.error('Error al registrar venta:', error)
      // Limpiar en caso de error también
      setClienteSeleccionado(null)
      limpiarCarrito()
      setVista('pos')
      // Lanzar error para que el componente pueda manejarlo
      throw error
    }
  }, [clienteSeleccionado, items, subtotal, user, limpiarCarrito])

  // Nueva venta
  const handleNuevaVenta = useCallback(() => {
    // Recargar productos actualizados
    productosService.obtenerTodos().then(setProductos)
    limpiarCarrito()
    setVentaConfirmada(null)
    setComprobanteGenerado(null)
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

  // Cambiar cliente sin salir de la vista de confirmar
  const cambiarCliente = useCallback((cliente: Cliente) => {
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
    comprobanteGenerado,
    limpiarComprobanteGenerado: () => setComprobanteGenerado(null),
    
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
    cambiarCliente,
    getPrecio,
    getStockDisponible,
    getCantidadEnCarrito,
  }
}
