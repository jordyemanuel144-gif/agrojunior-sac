import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Receipt, Package, Users } from 'lucide-react'
import { RUTAS } from '@/config/rutas'

const MOBILE_NAV_ITEMS = [
  { icon: ShoppingCart, label: 'POS', route: RUTAS.POS, id: 'pos' },
  { icon: Receipt, label: 'Ventas', route: RUTAS.VENTAS, id: 'ventas' },
  { icon: Package, label: 'Inventario', route: RUTAS.INVENTARIO, id: 'inventario' },
  { icon: Users, label: 'Clientes', route: RUTAS.CLIENTES, id: 'clientes' },
]

export function NavMovil() {
  const location = useLocation()

  const isActive = (route: string) => {
    if (route === RUTAS.VENTAS) {
      return location.pathname.startsWith(route)
    }
    return location.pathname === route
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV_ITEMS.map(item => (
          <Link
            key={item.id}
            to={item.route}
            className={`
              flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl min-w-[64px] transition-all duration-200
              ${isActive(item.route)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:bg-gray-50'
              }
            `}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-semibold">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
