import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { RUTAS } from '@/config/rutas'
import { useConfigNegocio } from '@/hooks/useConfigNegocio'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const { login, loading, error, user } = useAuthContext()
  const navigate = useNavigate()
  const { nombre } = useConfigNegocio()

  useEffect(() => {
    if (user && !loading) {
      navigate(
        user.role === 'admin' ? RUTAS.ADMIN.DASHBOARD : RUTAS.ADMIN.POS,
        { replace: true }
      )
    }
  }, [user, loading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const success = await login(email, password)
    if (!success) {
      navigate(RUTAS.AUTH.LOGIN)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to={RUTAS.PUBLICO.HOME}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="text-center mb-8">
            <Link to={RUTAS.PUBLICO.HOME} className="inline-block">
              <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{nombre}</h1>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                {error === 'Invalid login credentials'
                  ? 'Credenciales incorrectas'
                  : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} {nombre}. Arequipa, Perú.
        </p>
      </div>
    </div>
  )
}
