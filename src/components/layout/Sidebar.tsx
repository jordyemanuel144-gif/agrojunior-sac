import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { NAVEGACION } from '@/config/navegacion'
import { useAuthContext } from '@/context/AuthContext'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user, isAdmin } = useAuthContext()
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

  const itemsFiltrados = NAVEGACION.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-gray-100">
            <Link to={RUTAS.ADMIN.POS} onClick={onClose} className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <p className="text-base font-bold text-gray-900">{nombre}</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-0.5">
              {itemsFiltrados.map(item => (
                <Link
                  key={item.ruta}
                  to={item.ruta}
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.ruta)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <item.icono size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
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
      </div>

      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 z-40 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-gray-100">
            <Link to={RUTAS.ADMIN.POS} className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <p className="text-base font-bold text-gray-900">{nombre}</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="space-y-0.5">
              {itemsFiltrados.map(item => (
                <Link
                  key={item.ruta}
                  to={item.ruta}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.ruta)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <item.icono size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
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
      </aside>
    </>
  )
}