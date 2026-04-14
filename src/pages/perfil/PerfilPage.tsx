import { User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePerfil } from './hooks/usePerfil'
import { CardPerfil } from './components/CardPerfil'
import { FormularioEditarPerfil } from './components/FormularioEditarPerfil'
import { FormularioCambiarPassword } from './components/FormularioCambiarPassword'
import { useAuthContext } from '@/context/AuthContext'
import { RUTAS } from '@/config/rutas'

export default function PerfilPage() {
  const navigate = useNavigate()
  const { logout } = useAuthContext()
  const { usuario, guardando, error, exito, actualizarPerfil, cambiarPassword } = usePerfil()

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await logout()
      navigate(RUTAS.AUTH.LOGIN)
    }
  }

  if (!usuario) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500 text-sm hidden md:block">Gestiona tu información personal</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition">
          <LogOut size={18} />
          <span className="text-sm font-medium hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CardPerfil usuario={usuario} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <FormularioEditarPerfil
            usuario={usuario}
            guardando={guardando}
            onGuardar={actualizarPerfil}
            error={error}
            exito={exito}
          />
          <FormularioCambiarPassword
            guardando={guardando}
            onCambiarPassword={cambiarPassword}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
