import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LayoutCliente } from '@/components/layout/LayoutCliente'
import { POSPage } from '@/pages/pos/POSPage'
import { Cargando } from '@/components/ui/Cargando'

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const ListaVentas = lazy(() => import('@/pages/ventas/HistorialVentas'))
const DetalleVenta = lazy(() => import('@/pages/ventas/DetalleVenta'))
const ListaProductos = lazy(() => import('@/pages/productos/ListaProductos'))
const DetalleProducto = lazy(() => import('@/pages/productos/DetalleProducto'))
const ListaCompras = lazy(() => import('@/pages/compras/ListaCompras'))
const NuevaCompra = lazy(() => import('@/pages/compras/NuevaCompra'))
const DetalleCompra = lazy(() => import('@/pages/compras/DetalleCompra'))
const ListaProveedores = lazy(() => import('@/pages/proveedores/ListaProveedores'))
const DetalleProveedor = lazy(() => import('@/pages/proveedores/DetalleProveedor'))
const ListaClientes = lazy(() => import('@/pages/clientes/ListaClientes'))
const DetalleCliente = lazy(() => import('@/pages/clientes/DetalleCliente'))
const StockActual = lazy(() => import('@/pages/inventario/StockActual'))
const DetalleInventario = lazy(() => import('@/pages/inventario/DetalleInventario'))
const ConteoInventario = lazy(() => import('@/pages/inventario/ConteoInventario'))
const DetalleConteo = lazy(() => import('@/pages/inventario/DetalleConteo'))
const Reportes = lazy(() => import('@/pages/reportes/Reportes'))
const Configuracion = lazy(() => import('@/pages/configuracion/Configuracion'))
const PerfilPage = lazy(() => import('@/pages/perfil/PerfilPage'))
const CobranzasPage = lazy(() => import('@/pages/cobranzas/CobranzasPage'))
const DetalleCobranza = lazy(() => import('@/pages/cobranzas/DetalleCobranza'))
const ComprobantesPage = lazy(() => import('@/pages/comprobantes/ComprobantesPage'))
const DetalleComprobante = lazy(() => import('@/pages/comprobantes/DetalleComprobante'))
const Login = lazy(() => import('@/pages/Login'))
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const CatalogoPage = lazy(() => import('@/pages/catalogo/CatalogoPage'))
const RegistroPage = lazy(() => import('@/pages/registro/RegistroPage'))
const LoginCliente = lazy(() => import('@/pages/mi-cuenta/LoginCliente'))
const MiCuentaPage = lazy(() => import('@/pages/mi-cuenta/MiCuentaPage'))
const VentasClientePage = lazy(() => import('@/pages/mi-cuenta/VentasPage'))
const DetalleVentaCliente = lazy(() => import('@/pages/mi-cuenta/DetalleVenta'))
const ComprobantesClientePage = lazy(() => import('@/pages/mi-cuenta/ComprobantesPage'))
const DeudasPage = lazy(() => import('@/pages/mi-cuenta/DeudasPage'))
const DetalleComprobanteCliente = lazy(() => import('@/pages/mi-cuenta/DetalleComprobante'))
const EditarPerfilPage = lazy(() => import('@/pages/mi-cuenta/EditarPerfilPage'))
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'))

function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Cargando /></div>}>
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
            <Route path="/cobranzas/:id" element={<DetalleCobranza />} />
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
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}

function ClienteRoutes() {
  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <LayoutCliente>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Cargando /></div>}>
          <Routes>
            <Route path="/" element={<MiCuentaPage />} />
            <Route path="/ventas" element={<VentasClientePage />} />
            <Route path="/ventas/:id" element={<DetalleVentaCliente />} />
            <Route path="/comprobantes" element={<ComprobantesClientePage />} />
            <Route path="/comprobantes/:id" element={<DetalleComprobanteCliente />} />
            <Route path="/deudas" element={<DeudasPage />} />
            <Route path="/editar" element={<EditarPerfilPage />} />
            <Route path="*" element={<Navigate to="/mi-cuenta" replace />} />
          </Routes>
        </Suspense>
      </LayoutCliente>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Cargando /></div>}>
          <Routes>
            <Route path={RUTAS.PUBLICO.HOME} element={<LandingPage />} />
            <Route path={RUTAS.PUBLICO.CATALOGO} element={<CatalogoPage />} />
            <Route path={RUTAS.PUBLICO.REGISTRO} element={<RegistroPage />} />
            <Route path={RUTAS.AUTH.CALLBACK} element={<AuthCallback />} />
            
            <Route path={RUTAS.AUTH.LOGIN} element={<Login />} />
            <Route path={RUTAS.CLIENTE.LOGIN} element={<LoginCliente />} />
            
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/mi-cuenta/*" element={<ClienteRoutes />} />
            
            <Route path="*" element={<Navigate to={RUTAS.PUBLICO.HOME} replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}