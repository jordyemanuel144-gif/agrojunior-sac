import { Link } from 'react-router-dom'
import { LayoutPublico } from '@/components/layout/LayoutPublico'
import { RUTAS } from '@/config/rutas'
import { useRegistroCliente } from './hooks/useRegistroCliente'
import { User, Phone, MapPin, MessageSquare, ShieldCheck } from 'lucide-react'

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
            Gracias por registrarte. Te contactaremos pronto para confirmar tu cuenta.
          </p>
          <Link
            to={RUTAS.PUBLICO.CATALOGO}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    </LayoutPublico>
  )
}

export default function RegistroPage() {
  const { formData, enviando, enviado, handleChange, handleSubmit } = useRegistroCliente()

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
            <p className="mt-2 text-gray-500">Completa tus datos y te contactaremos pronto</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Mensaje (opcional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    placeholder="Cuéntanos sobre ti o tu negocio..."
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
                  'Registrarse'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to={RUTAS.AUTH.LOGIN} className="text-blue-600 font-medium hover:underline">
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
