import { useState } from 'react'
import { Percent, Save } from 'lucide-react'
import type { ConfigDescuentos } from '@/types/configuracion.types'

interface Props {
  config: ConfigDescuentos
  onGuardar: (datos: Partial<ConfigDescuentos>) => void
  guardando: boolean
}

export function FormularioDescuentos({ config, onGuardar, guardando }: Props) {
  const [form, setForm] = useState(config)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Percent className="text-purple-600" size={20} />
        </div>
        <h3 className="font-semibold text-gray-900">Descuentos por Tipo de Cliente</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Descuento Mayorista (%)</label>
          <input
            type="number"
            value={form.mayorista}
            onChange={e => setForm({ ...form, mayorista: Number(e.target.value) })}
            min={0}
            max={100}
            step={0.5}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="text-xs text-gray-400 mt-1">Aplicado automáticamente a clientes mayoristas</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Descuento Especial (%)</label>
          <input
            type="number"
            value={form.especial}
            onChange={e => setForm({ ...form, especial: Number(e.target.value) })}
            min={0}
            max={100}
            step={0.5}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="text-xs text-gray-400 mt-1">Aplicado automáticamente a clientes especiales</p>
        </div>
      </div>

      <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
        <Save size={16} />
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
