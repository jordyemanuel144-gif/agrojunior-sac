import { useState } from 'react'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

interface FormularioCambiarPasswordProps {
  guardando: boolean
  onCambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<boolean>
  error?: string | null
}

export function FormularioCambiarPassword({ guardando, onCambiarPassword, error }: FormularioCambiarPasswordProps) {
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPasswords, setMostrarPasswords] = useState(false)
  const [errorMatch, setErrorMatch] = useState('')
  const [exito, setExito] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMatch('')
    setExito('')

    if (passwordNueva !== confirmarPassword) {
      setErrorMatch('Las contraseñas no coinciden')
      return
    }

    const success = await onCambiarPassword(passwordActual, passwordNueva)
    if (success) {
      setExito('Contraseña actualizada correctamente')
      setPasswordActual('')
      setPasswordNueva('')
      setConfirmarPassword('')
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Lock className="text-purple-600" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
          <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
      {errorMatch && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{errorMatch}</div>}
      {exito && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{exito}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <div className="relative">
            <input
              type={mostrarPasswords ? 'text' : 'password'}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
              required
            />
            <button type="button" onClick={() => setMostrarPasswords(!mostrarPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {mostrarPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <input
            type={mostrarPasswords ? 'text' : 'password'}
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input
            type={mostrarPasswords ? 'text' : 'password'}
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={guardando || !passwordActual || !passwordNueva || !confirmarPassword}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
        >
          {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <KeyRound size={18} />}
          {guardando ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
