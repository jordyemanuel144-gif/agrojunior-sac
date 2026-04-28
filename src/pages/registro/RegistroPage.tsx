import { Link } from 'react-router-dom'
import { LayoutPublico } from '@/components/layout/LayoutPublico'
import { RUTAS } from '@/config/rutas'
import { useRegistroCliente } from './hooks/useRegistroCliente'
import { useAuthContext } from '@/context/AuthContext'
import { User, Phone, MapPin, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

function RegistroExitoso() {
  return (
    <LayoutPublico>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Registro exitoso!</h2>
          <p className="mt-3 text-gray-500">
            Gracias por registrarte. Ya puedes iniciar sesión con tu email y contraseña.
          </p>
          <Link
            to={RUTAS.CLIENTE.LOGIN}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </LayoutPublico>
  )
}

export default function RegistroPage() {
  const { formData, enviando, enviado, handleChange, handleSubmit } = useRegistroCliente()
  const { loginWithGoogle } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e)
    setPasswordError('')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    if (formData.password && formData.password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    handleSubmit(e)
  }

  if (enviado) {
    return <RegistroExitoso />
  }

  return (
    <LayoutPublico>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Regístrate como Cliente</h1>
            <p className="mt-2 text-gray-500">Crea tu cuenta para acceder a tu historial y más</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Asignación de tipo de cliente</p>
                <p className="text-xs text-blue-700 mt-1">
                  Nuestro equipo revisará tu solicitud y asignará el tipo de cliente según tu perfil (minorista, mayorista o especial).
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Datos de cuenta</p>

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
                  <span className="px-4 bg-white text-gray-400">o regístrate con email</span>
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
                    onChange={handlePasswordChange}
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

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-12 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Datos personales</p>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Dirección (opcional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Av. Example 123"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to={RUTAS.CLIENTE.LOGIN} className="text-blue-600 font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Al registrarte, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </LayoutPublico>
  )
}
