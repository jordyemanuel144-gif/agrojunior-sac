import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import { POSPage } from '@/pages/pos/POSPage'
import Dashboard from '@/pages/dashboard/Dashboard'
import ListaVentas from '@/pages/ventas/HistorialVentas'
import DetalleVenta from '@/pages/ventas/DetalleVenta'
import ListaProductos from '@/pages/productos/ListaProductos'
import DetalleProducto from '@/pages/productos/DetalleProducto'
import ListaCompras from '@/pages/compras/ListaCompras'
import NuevaCompra from '@/pages/compras/NuevaCompra'
import DetalleCompra from '@/pages/compras/DetalleCompra'
import ListaProveedores from '@/pages/proveedores/ListaProveedores'
import DetalleProveedor from '@/pages/proveedores/DetalleProveedor'
import ListaClientes from '@/pages/clientes/ListaClientes'
import DetalleCliente from '@/pages/clientes/DetalleCliente'
import StockActual from '@/pages/inventario/StockActual'
import Reportes from '@/pages/reportes/Reportes'
import Configuracion from '@/pages/configuracion/Configuracion'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RUTAS.DASHBOARD} element={<Dashboard />} />
        <Route path={RUTAS.POS} element={<POSPage />} />
        <Route path={RUTAS.VENTAS} element={<ListaVentas />} />
        <Route path={`${RUTAS.VENTAS}/:id`} element={<DetalleVenta />} />
        <Route path={RUTAS.PRODUCTOS} element={<ListaProductos />} />
        <Route path={`${RUTAS.PRODUCTOS}/:id`} element={<DetalleProducto />} />
        <Route path={RUTAS.COMPRAS} element={<ListaCompras />} />
        <Route path={`${RUTAS.COMPRAS}/nueva`} element={<NuevaCompra />} />
        <Route path={`${RUTAS.COMPRAS}/:id`} element={<DetalleCompra />} />
        <Route path={RUTAS.PROVEEDORES} element={<ListaProveedores />} />
        <Route path={`${RUTAS.PROVEEDORES}/:id`} element={<DetalleProveedor />} />
        <Route path={RUTAS.CLIENTES} element={<ListaClientes />} />
        <Route path={`${RUTAS.CLIENTES}/:id`} element={<DetalleCliente />} />
        <Route path={RUTAS.INVENTARIO} element={<StockActual />} />
        <Route path={RUTAS.REPORTES} element={<Reportes />} />
        <Route path={RUTAS.CONFIGURACION} element={<Configuracion />} />
        <Route path="*" element={<Navigate to={RUTAS.POS} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
