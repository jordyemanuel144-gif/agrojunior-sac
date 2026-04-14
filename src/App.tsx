import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
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
import DetalleInventario from '@/pages/inventario/DetalleInventario'
import ConteoInventario from '@/pages/inventario/ConteoInventario'
import DetalleConteo from '@/pages/inventario/DetalleConteo'
import Reportes from '@/pages/reportes/Reportes'
import Configuracion from '@/pages/configuracion/Configuracion'
import PerfilPage from '@/pages/perfil/PerfilPage'
import CobranzasPage from '@/pages/cobranzas/CobranzasPage'
import ComprobantesPage from '@/pages/comprobantes/ComprobantesPage'
import DetalleComprobante from '@/pages/comprobantes/DetalleComprobante'
import Login from '@/pages/Login'
import LandingPage from '@/pages/landing/LandingPage'
import CatalogoPage from '@/pages/catalogo/CatalogoPage'
import RegistroPage from '@/pages/registro/RegistroPage'

function AdminRoutes() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/ventas" element={<ListaVentas />} />
          <Route path="/ventas/:id" element={<DetalleVenta />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/productos/:id" element={<DetalleProducto />} />
          <Route path="/compras" element={<ListaCompras />} />
          <Route path="/compras/nueva" element={<NuevaCompra />} />
          <Route path="/compras/:id" element={<DetalleCompra />} />
          <Route path="/proveedores" element={<ListaProveedores />} />
          <Route path="/proveedores/:id" element={<DetalleProveedor />} />
          <Route path="/clientes" element={<ListaClientes />} />
          <Route path="/clientes/:id" element={<DetalleCliente />} />
          <Route path="/cobranzas" element={<CobranzasPage />} />
          <Route path="/inventario" element={<StockActual />} />
          <Route path="/inventario/conteo" element={<ConteoInventario />} />
          <Route path="/inventario/conteo/:id" element={<DetalleConteo />} />
          <Route path="/inventario/detalle/:id" element={<DetalleInventario />} />
          <Route path="/comprobantes" element={<ComprobantesPage />} />
          <Route path="/comprobantes/:id" element={<DetalleComprobante />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="*" element={<Navigate to="/admin/pos" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={RUTAS.PUBLICO.HOME} element={<LandingPage />} />
          <Route path={RUTAS.PUBLICO.CATALOGO} element={<CatalogoPage />} />
          <Route path={RUTAS.PUBLICO.REGISTRO} element={<RegistroPage />} />
          
          <Route path={RUTAS.AUTH.LOGIN} element={<Login />} />
          
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          <Route path="*" element={<Navigate to={RUTAS.PUBLICO.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
