import { Lock, Eye, EyeOff } from 'lucide-react'
import type { ClientePasswordData } from '@/types/cliente.types'

export function FormularioPassword({ handleSubmit, passwordData, handleChange, showActual, showNueva, showConfirmar, setShowActual, setShowNueva, setShowConfirmar, guardando, error, mensaje }: {
  handleSubmit: (e: React.FormEvent) => void
  passwordData: ClientePasswordData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  showActual: boolean
  showNueva: boolean
  showConfirmar: boolean
  setShowActual: (v: boolean) => void
  setShowNueva: (v: boolean) => void
  setShowConfirmar: (v: boolean) => void
  guardando: boolean
  error: string
  mensaje: string
}) {
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Seguridad</h3>
          <p className="text-xs text-gray-500">Cambia tu contraseña</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña actual</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type={showActual ? 'text' : 'password'} name="actual" value={passwordData.actual} onChange={handleChange}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="••••••••" />
            <button type="button" onClick={() => setShowActual(!showActual)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              {showActual ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type={showNueva ? 'text' : 'password'} name="nueva" value={passwordData.nueva} onChange={handleChange}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Mínimo 6 caracteres" />
            <button type="button" onClick={() => setShowNueva(!showNueva)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              {showNueva ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type={showConfirmar ? 'text' : 'password'} name="confirmar" value={passwordData.confirmar} onChange={handleChange}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Repite la nueva contraseña" />
            <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              {showConfirmar ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
      </div>
      {(error || mensaje) && <div className={`p-3 rounded-xl text-sm ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{error || mensaje}</div>}
      <button type="submit" disabled={guardando || !passwordData.actual || !passwordData.nueva || !passwordData.confirmar}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={18} />}
        {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
      </button>
    </form>
  )
}