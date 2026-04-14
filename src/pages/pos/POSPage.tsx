// POSPage - Punto de Venta principal
// Controla la vista y usa el hook usePOS para la lógica
import { useState, useEffect } from 'react'
import { HeaderPOS } from './components/HeaderPOS'
import { SelectorCliente } from './components/SelectorCliente'
import { GridProductos } from './components/GridProductos'
import { ClientePicker } from './components/ClientePicker'
import { CarritoFlotante } from './components/CarritoFlotante'
import { ConfirmarPedido } from './components/ConfirmarPedido'
import { ModalTicket } from './components/ModalTicket'
import { usePOS } from './hooks/usePOS'

export function POSPage() {
  const {
    cargando,
    vista,
    busqueda,
    categoriaActiva,
    clienteSeleccionado,
    clientes,
    ventaConfirmada,
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
    handleNuevaVenta,
    handleCancelar,
    handleSeleccionarCliente,
    setVista,
    getPrecio,
    getCantidadEnCarrito,
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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (vista === 'confirmar') {
    return (
      <ConfirmarPedido
        key={items.length + '-' + items.reduce((acc, i) => acc + i.cantidad, 0)}
        items={items}
        cliente={clienteSeleccionado!}
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
    )
  }

  if (vista === 'ticket' && ventaConfirmada) {
    return (
      <ModalTicket
        items={items}
        cliente={clienteSeleccionado!}
        venta={ventaConfirmada}
        onNuevaVenta={handleNuevaVenta}
      />
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
        <HeaderPOS busqueda={busqueda} onBusquedaChange={setBusqueda} />
        
        {clienteSeleccionado && (
          <SelectorCliente 
            cliente={clienteSeleccionado} 
            onClick={() => setShowClientePicker(true)} 
          />
        )}
        
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
      </div>
  )
}
