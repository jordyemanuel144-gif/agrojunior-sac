import { Link, useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useAuthContext } from '@/context/AuthContext'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(RUTAS.AUTH.LOGIN)
  }

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-3 md:hidden">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-xl -ml-1">
          <Menu size={22} className="text-gray-700" />
        </button>
        <Link to={RUTAS.ADMIN.POS} className="flex items-center gap-2 ml-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-sm">Sam José</span>
        </Link>
      </div>
      <button 
        onClick={handleLogout} 
        className="p-2 hover:bg-gray-100 rounded-xl"
        title="Cerrar sesión"
      >
        <LogOut size={20} className="text-gray-500" />
      </button>
    </header>
  )
}
