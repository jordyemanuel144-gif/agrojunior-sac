import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'

interface LayoutPublicoProps {
  children: ReactNode
}

export function LayoutPublico({ children }: LayoutPublicoProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { nombre, direccion, telefono, whatsapp } = useConfigNegocio()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to={RUTAS.PUBLICO.HOME} className="flex items-center gap-2 md:gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl object-cover" />
              <div>
                <h1 className="text-sm md:text-lg font-bold text-gray-900">{nombre}</h1>
                <p className="text-[10px] md:text-xs text-gray-400 hidden md:block">{direccion}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to={RUTAS.PUBLICO.CATALOGO} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Catálogo
              </Link>
              <Link to={RUTAS.PUBLICO.REGISTRO} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Registrarse
              </Link>
              <Link
                to={RUTAS.AUTH.LOGIN}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Panel Admin
              </Link>
              <Link
                to={RUTAS.AUTH.LOGIN_CLIENTE}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </nav>

            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              {menuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-3 py-4 space-y-3">
              <Link 
                to={RUTAS.PUBLICO.CATALOGO} 
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                Catálogo
              </Link>
              <Link 
                to={RUTAS.PUBLICO.REGISTRO} 
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                Registrarse
              </Link>
              <div className="pt-3 border-t border-gray-100">
                <Link
                  to={RUTAS.AUTH.LOGIN}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Panel Admin
                </Link>
                <Link
                  to={RUTAS.AUTH.LOGIN_CLIENTE}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-3 mt-2 text-center text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-white border-t border-gray-100 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs md:text-sm text-gray-500">© {new Date().getFullYear()} {nombre}.</p>
            <div className="flex items-center gap-4">
              <a href={`tel:${telefono}`} className="flex items-center gap-1 text-xs md:text-sm text-gray-500 hover:text-blue-600">
                <Phone size={14} />
                <span>Teléfono</span>
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-gray-500 hover:text-green-600">
                WhatsApp
              </a>
              <Link to={RUTAS.AUTH.LOGIN} className="text-xs md:text-sm text-gray-400 hover:text-gray-600">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
