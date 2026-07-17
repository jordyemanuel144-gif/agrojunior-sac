import { Link, useLocation } from 'react-router-dom'
import { NAVEGACION_MOVIL } from '@/config/navegacion'
import { useAuthContext } from '@/context/AuthContext'

export function NavMovil() {
  const location = useLocation()
  const { isAdmin } = useAuthContext()

  const itemsFiltrados = NAVEGACION_MOVIL.filter(item => !item.adminOnly || isAdmin)

  const isActive = (route: string) => location.pathname.startsWith(route)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {itemsFiltrados.map(item => (
          <Link
            key={item.ruta}
            to={item.ruta}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl min-w-[60px] ${
              isActive(item.ruta)
                ? 'text-primary bg-primary-light'
                : 'text-gray-500'
            }`}
          >
            <item.icono size={20} />
            <span className="text-[9px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}