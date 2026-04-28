import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutPublico } from '@/components/layout/LayoutPublico'
import { RUTAS } from '@/config/rutas'
import { useAuthContext } from '@/context/AuthContext'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

interface FormData {
  email: string
  password: string
}

export default function LoginCliente() {
  const navigate = useNavigate()
  const { loginCliente, loginWithGoogle, loading, error } = useAuthContext()
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrorLocal('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setErrorLocal('Completa todos los campos')
      return
    }
    const success = await loginCliente(formData.email, formData.password)
    if (success) {
      navigate(RUTAS.CLIENTE.MI_CUENTA)
    }
  }

  return (
    <LayoutPublico>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="mt-2 text-gray-500">Accede a tu cuenta de cliente</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {(error || errorLocal) && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error || errorLocal}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continuar con Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">o inicia sesión con email</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-12 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to={RUTAS.PUBLICO.REGISTRO} className="text-blue-600 font-medium hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 md:hidden">
            ¿Eres empleado?{' '}
            <Link to={RUTAS.AUTH.LOGIN} className="text-blue-600 font-medium">
              Iniciar sesión como empleado
            </Link>
          </p>
        </div>
      </div>
    </LayoutPublico>
  )
}