import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Receipt, Package, Users, BarChart3, Settings, Truck, ShoppingBag, ClipboardList, LogOut, User, Warehouse, DollarSign, FileText } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useAuthContext } from '@/context/AuthContext'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'

const NAV_ITEMS_ADMIN = [
  { icon: LayoutDashboard, label: 'Dashboard', route: RUTAS.ADMIN.DASHBOARD, id: 'dashboard' },
  { icon: ShoppingCart, label: 'Punto de Venta', route: RUTAS.ADMIN.POS, id: 'pos' },
  { icon: Receipt, label: 'Ventas', route: RUTAS.ADMIN.VENTAS, id: 'ventas' },
  { icon: DollarSign, label: 'Cobranzas', route: RUTAS.ADMIN.COBRANZAS, id: 'cobranzas' },
  { icon: FileText, label: 'Comprobantes', route: RUTAS.ADMIN.COMPROBANTES, id: 'comprobantes' },
  { icon: Package, label: 'Productos', route: RUTAS.ADMIN.PRODUCTOS, id: 'productos' },
  { icon: Warehouse, label: 'Inventario', route: RUTAS.ADMIN.INVENTARIO, id: 'inventario' },
  { icon: ClipboardList, label: 'Ajuste de Inventario', route: RUTAS.ADMIN.INVENTARIO_CONTEO, id: 'conteo' },
  { icon: ShoppingBag, label: 'Compras', route: RUTAS.ADMIN.COMPRAS, id: 'compras' },
  { icon: Truck, label: 'Proveedores', route: RUTAS.ADMIN.PROVEEDORES, id: 'proveedores' },
  { icon: Users, label: 'Clientes', route: RUTAS.ADMIN.CLIENTES, id: 'clientes' },
  { icon: BarChart3, label: 'Reportes', route: RUTAS.ADMIN.REPORTES, id: 'reportes' },
  { icon: Settings, label: 'Configuración', route: RUTAS.ADMIN.CONFIGURACION, id: 'configuracion' },
  { icon: User, label: 'Mi Perfil', route: RUTAS.ADMIN.PERFIL, id: 'perfil' },
]

const NAV_ITEMS_VENDEDOR = [
  { icon: ShoppingCart, label: 'Punto de Venta', route: RUTAS.ADMIN.POS, id: 'pos' },
  { icon: Receipt, label: 'Mis Ventas', route: RUTAS.ADMIN.VENTAS, id: 'ventas' },
  { icon: Users, label: 'Clientes', route: RUTAS.ADMIN.CLIENTES, id: 'clientes' },
  { icon: User, label: 'Mi Perfil', route: RUTAS.ADMIN.PERFIL, id: 'perfil' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthContext()
  const { nombre } = useConfigNegocio()
  const isActive = (route: string) => {
    if (route === RUTAS.ADMIN.INVENTARIO) {
      return location.pathname === route
    }
    return location.pathname.startsWith(route)
  }

  const handleLogout = async () => {
    await logout()
    navigate(RUTAS.AUTH.LOGIN)
  }

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? '' : 'flex flex-col h-full'}>
      <div className="p-5 border-b border-gray-100">
        <Link to={RUTAS.ADMIN.POS} onClick={mobile ? onClose : undefined} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🐔</span>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{nombre}</p>
          </div>
        </Link>
      </div>

      <nav className={`${mobile ? 'px-3 py-4' : 'flex-1 px-3 py-3'} overflow-y-auto`}>
        <div className="space-y-0.5">
          {(user?.role === 'admin' ? NAV_ITEMS_ADMIN : NAV_ITEMS_VENDEDOR).map(item => (
            <Link
              key={item.id}
              to={item.route}
              onClick={mobile ? onClose : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.route)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon size={mobile ? 20 : 18} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className={`${mobile ? 'p-4 border-t border-gray-100' : 'p-4 border-t border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-green-600">En línea</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
            <LogOut size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent mobile />
      </div>

      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 z-40 hidden md:block">
        <NavContent />
      </aside>
    </>
  )
}
