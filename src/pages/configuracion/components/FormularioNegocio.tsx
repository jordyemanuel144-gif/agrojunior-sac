import { useState } from 'react'
import { Building2, Save } from 'lucide-react'
import type { ConfigNegocio } from '@/types/configuracion.types'

interface Props {
  config: ConfigNegocio
  onGuardar: (datos: Partial<ConfigNegocio>) => void
  guardando: boolean
}

export function FormularioNegocio({ config, onGuardar, guardando }: Props) {
  const [form, setForm] = useState(config)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 className="text-blue-600" size={20} />
        </div>
        <h3 className="font-semibold text-gray-900">Información del Negocio</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">RUC</label>
          <input
            type="text"
            value={form.ruc}
            onChange={e => setForm({ ...form, ruc: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Dirección</label>
          <input
            type="text"
            value={form.direccion}
            onChange={e => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Teléfono</label>
          <input
            type="text"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">WhatsApp</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Horario Laboral</label>
          <input
            type="text"
            value={form.horario.laboral}
            onChange={e => setForm({ ...form, horario: { ...form.horario, laboral: e.target.value } })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Horario Domingo</label>
          <input
            type="text"
            value={form.horario.domingo}
            onChange={e => setForm({ ...form, horario: { ...form.horario, domingo: e.target.value } })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-green-600" size={16} />
          </div>
          <h4 className="font-semibold text-gray-900">Datos de Pago</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Yape</label>
            <input
              type="text"
              value={form.yape}
              onChange={e => setForm({ ...form, yape: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="916794870"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Banco</label>
            <input
              type="text"
              value={form.banco_nombre}
              onChange={e => setForm({ ...form, banco_nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Banco de Crédito"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Titular</label>
            <input
              type="text"
              value={form.banco_titular}
              onChange={e => setForm({ ...form, banco_titular: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Nombre del titular"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Cuenta</label>
            <input
              type="text"
              value={form.banco_cuenta}
              onChange={e => setForm({ ...form, banco_cuenta: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Número de cuenta"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={guardando}
        className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50"
      >
        <Save size={16} />
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
