// POSPage - Punto de Venta principal
// Controla la vista y usa el hook usePOS para la lógica
import { useState, useEffect } from 'react'
import { HeaderPOS } from './components/HeaderPOS'
import { SelectorCliente } from './components/SelectorCliente'
import { GridProductos } from './components/GridProductos'
import { ClientePicker } from './components/ClientePicker'
import { CarritoFlotante } from './components/CarritoFlotante'
import { ConfirmarPedido } from './components/ConfirmarPedido'
import { ToastVentaRegistrada } from './components/ToastVentaRegistrada'
import { usePOS } from './hooks/usePOS'

export function POSPage() {
  const {
    cargando,
    vista,
    busqueda,
    categoriaActiva,
    clienteSeleccionado,
    clientes,
    showClientePicker,
    items,
    subtotal,
    totalItems,
    errorStock,
    productosFiltrados,
    stockInfo,
    setBusqueda,
    setCategoriaActiva,
    setShowClientePicker,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    handleConfirmar,
    handleCancelar,
    handleSeleccionarCliente,
    setVista,
    getPrecio,
    getCantidadEnCarrito,
    comprobanteGenerado,
    limpiarComprobanteGenerado,
  } = usePOS()

  // Mostrar error de stock como alerta flotante
  const [mostrarErrorStock, setMostrarErrorStock] = useState(false)

  useEffect(() => {
    if (errorStock) {
      setMostrarErrorStock(true)
      const timer = setTimeout(() => setMostrarErrorStock(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [errorStock])

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (vista === 'confirmar') {
    const clientePublico = {
      id: 'publico',
      nombre: 'Público General',
      tipo: 'minorista' as const,
      telefono: undefined,
      direccion: undefined,
      dni_ruc: undefined,
      email: undefined,
      activo: true,
      created_at: new Date(),
    }
    const clienteActual = clienteSeleccionado || clientePublico
    
    return (
      <>
        <ConfirmarPedido
          key={items.length + '-' + items.reduce((acc, i) => acc + i.cantidad, 0)}
          items={items}
          cliente={clienteActual}
          clientes={clientes}
          stockInfo={stockInfo}
          igvActivo={false}
          showClientePicker={showClientePicker}
          onVolver={() => setVista('pos')}
          onConfirmar={handleConfirmar}
          onActualizarCantidad={actualizarCantidad}
          onEliminarItem={eliminarItem}
          onCambiarCliente={handleSeleccionarCliente}
          onAbrirClientePicker={() => setShowClientePicker(true)}
          onCerrarClientePicker={() => setShowClientePicker(false)}
        />
        {comprobanteGenerado && (
          <ToastVentaRegistrada
            comprobanteId={comprobanteGenerado.id}
            ticketNumero={comprobanteGenerado.ticketNumero}
            tipo={comprobanteGenerado.tipo}
            onCerrar={limpiarComprobanteGenerado}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
        <HeaderPOS busqueda={busqueda} onBusquedaChange={setBusqueda} />
        
        <SelectorCliente 
          cliente={clienteSeleccionado} 
          onClick={() => setShowClientePicker(true)} 
        />
        
        {/* Alerta de error de stock */}
        {mostrarErrorStock && errorStock && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium">
            {errorStock}
          </div>
        )}

        <GridProductos
          productos={productosFiltrados}
          stockInfo={stockInfo}
          busqueda={busqueda}
          categoriaActiva={categoriaActiva}
          onBusquedaChange={setBusqueda}
          onCategoriaChange={setCategoriaActiva}
          getPrecio={getPrecio}
          getCantidadEnCarrito={getCantidadEnCarrito}
          onAnadir={agregarProducto}
          onActualizar={actualizarCantidad}
          onEliminar={eliminarItem}
        />
        
        {showClientePicker && (
          <ClientePicker
            clientes={clientes}
            clienteSeleccionado={clienteSeleccionado}
            onSeleccionar={handleSeleccionarCliente}
            onCerrar={() => setShowClientePicker(false)}
          />
        )}
        
        {totalItems > 0 && (
          <CarritoFlotante
            totalItems={totalItems}
            subtotal={subtotal}
            onContinuar={() => setVista('confirmar')}
            onCancelar={handleCancelar}
          />
        )}

        {/* Toast de venta registrada (mostrado en vista principal) */}
        {comprobanteGenerado && (
          <ToastVentaRegistrada
            comprobanteId={comprobanteGenerado.id}
            ticketNumero={comprobanteGenerado.ticketNumero}
            tipo={comprobanteGenerado.tipo}
            onCerrar={limpiarComprobanteGenerado}
          />
        )}
      </div>
  )
}
