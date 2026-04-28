import { Save } from 'lucide-react'
import type { ClienteFormData } from '@/types/cliente.types'

export function FormularioDatos({ handleSubmit, formData, handleChange, guardando, mensaje }: {
  handleSubmit: (e: React.FormEvent) => void
  formData: ClienteFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  guardando: boolean
  mensaje: string
}) {
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Datos Personales</h3>
          <p className="text-xs text-gray-500">Actualiza tu información de contacto</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre / Razón Social</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Tu nombre o razón social" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">DNI / RUC</label>
          <input type="text" name="dni_ruc" value={formData.dni_ruc} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="DNI o RUC" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Número de teléfono" />
        </div>
      </div>
      {mensaje && <div className={`p-3 rounded-xl text-sm ${mensaje.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{mensaje}</div>}
      <button type="submit" disabled={guardando}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
        {guardando ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}