import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Receipt, Package, DollarSign } from 'lucide-react'
import { RUTAS } from '@/config/rutas'

const MOBILE_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', route: RUTAS.ADMIN.DASHBOARD, id: 'dashboard' },
  { icon: ShoppingCart, label: 'POS', route: RUTAS.ADMIN.POS, id: 'pos' },
  { icon: Receipt, label: 'Ventas', route: RUTAS.ADMIN.VENTAS, id: 'ventas' },
  { icon: DollarSign, label: 'Cobranzas', route: RUTAS.ADMIN.COBRANZAS, id: 'cobranzas' },
  { icon: Package, label: 'Productos', route: RUTAS.ADMIN.PRODUCTOS, id: 'productos' },
]

export function NavMovil() {
  const location = useLocation()
  const isActive = (route: string) => location.pathname.startsWith(route)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {MOBILE_NAV_ITEMS.map(item => (
          <Link
            key={item.id}
            to={item.route}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl min-w-[60px] ${
              isActive(item.route)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
