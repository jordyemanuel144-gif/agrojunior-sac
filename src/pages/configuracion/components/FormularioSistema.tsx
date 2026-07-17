import { useState } from 'react'
import { AlertTriangle, Save } from 'lucide-react'
import type { ConfigSistema } from '@/types/configuracion.types'

interface Props {
  config: ConfigSistema
  onGuardar: (datos: Partial<ConfigSistema>) => void
  guardando: boolean
}

export function FormularioSistema({ config, onGuardar, guardando }: Props) {
  const [form, setForm] = useState(config)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="text-orange-600" size={20} />
        </div>
        <h3 className="font-semibold text-gray-900">Configuración del Sistema</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Stock Mínimo de Alerta</label>
          <input
            type="number"
            value={form.stock_minimo_alerta}
            onChange={e => setForm({ ...form, stock_minimo_alerta: Number(e.target.value) })}
            min={0}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <p className="text-xs text-gray-400 mt-1">Productos con stock menor mostrarán alerta</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Terminal POS</label>
          <input
            type="text"
            value={form.terminal}
            onChange={e => setForm({ ...form, terminal: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Caja Principal</label>
          <input
            type="text"
            value={form.caja_principal}
            onChange={e => setForm({ ...form, caja_principal: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-neutral-900 rounded-xl hover:bg-primary-hover transition font-medium disabled:opacity-50">
        <Save size={16} />
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
