import { useState } from 'react'
import { Percent, Save } from 'lucide-react'
import type { ConfigImpuestos } from '@/types/configuracion.types'

interface Props {
  config: ConfigImpuestos
  onGuardar: (datos: Partial<ConfigImpuestos>) => void
  guardando: boolean
}

export function FormularioImpuestos({ config, onGuardar, guardando }: Props) {
  const [form, setForm] = useState(config)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Percent className="text-green-600" size={20} />
        </div>
        <h3 className="font-semibold text-gray-900">Impuestos (IGV)</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Aplicar IGV</p>
          <p className="text-sm text-gray-500">Incluir impuestos en los precios</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, igv_activo: !form.igv_activo })}
          className={`relative w-12 h-6 rounded-full transition ${form.igv_activo ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${form.igv_activo ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Porcentaje IGV (%)</label>
        <input
          type="number"
          value={form.igv_porcentaje}
          onChange={e => setForm({ ...form, igv_porcentaje: Number(e.target.value) })}
          min={0}
          max={100}
          step={0.5}
          className="w-full md:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
        <Save size={16} />
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
