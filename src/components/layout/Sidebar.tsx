import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Receipt, Package, Users, BarChart3, Settings, Truck, ShoppingBag, ClipboardList, X, Menu } from 'lucide-react'
import { RUTAS } from '@/config/rutas'

const NAV_ITEMS = [
  { icon: ShoppingCart, label: 'Punto de Venta', route: RUTAS.POS, id: 'pos' },
  { icon: Receipt, label: 'Historial de Ventas', route: RUTAS.VENTAS, id: 'ventas' },
  { icon: ClipboardList, label: 'Productos', route: RUTAS.PRODUCTOS, id: 'productos' },
  { icon: Package, label: 'Inventario', route: RUTAS.INVENTARIO, id: 'inventario' },
  { icon: ShoppingBag, label: 'Compras', route: RUTAS.COMPRAS, id: 'compras' },
  { icon: Truck, label: 'Proveedores', route: RUTAS.PROVEEDORES, id: 'proveedores' },
  { icon: Users, label: 'Clientes', route: RUTAS.CLIENTES, id: 'clientes' },
  { icon: BarChart3, label: 'Reportes', route: RUTAS.REPORTES, id: 'reportes' },
  { icon: Settings, label: 'Configuración', route: RUTAS.CONFIGURACION, id: 'configuracion' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (route: string) => {
    if (route === RUTAS.VENTAS || route === RUTAS.COMPRAS || route === RUTAS.PROVEEDORES) {
      return location.pathname.startsWith(route)
    }
    return location.pathname === route
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link to={RUTAS.POS} onClick={onClose} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-xl">🐔</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Sam José</p>
              <p className="text-xs text-gray-500">Avícola</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto h-[calc(100%-140px)]">
          <div className="space-y-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                to={item.route}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                  ${isActive(item.route)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <item.icon size={20} className={isActive(item.route) ? 'text-white' : 'text-gray-500'} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50 h-[72px]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <Users size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Caja Principal</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                En línea
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 flex-col shadow-sm z-40">
        <div className="p-6 border-b border-gray-100">
          <Link to={RUTAS.POS} className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-2xl">🐔</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Sam José</p>
              <p className="text-xs text-gray-500">Avícola</p>
            </div>
          </Link>
          <p className="text-xs text-gray-400">Sistema de Ventas POS</p>
        </div>
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                to={item.route}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                  ${isActive(item.route)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <item.icon size={19} className={isActive(item.route) ? 'text-white' : 'text-gray-500'} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <Users size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Caja Principal</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                En línea
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center px-4 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
      >
        <Menu size={24} className="text-gray-700" />
      </button>
      <Link to={RUTAS.POS} className="flex items-center gap-2 ml-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-sm">🐔</span>
        </div>
        <span className="font-bold text-gray-900">Sam José</span>
      </Link>
    </header>
  )
}

export { NAV_ITEMS }
