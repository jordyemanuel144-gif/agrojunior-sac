import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Cliente, NuevoCliente, TipoCliente } from '@/types/cliente.types'

interface Props {
  cliente?: Cliente | null
  onCerrar: () => void
  onGuardar: (datos: NuevoCliente) => Promise<void>
}

export function FormularioCliente({ cliente, onCerrar, onGuardar }: Props) {
  const [form, setForm] = useState<NuevoCliente>({
    nombre: '',
    dni_ruc: '',
    telefono: '',
    tipo: 'minorista',
  })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        dni_ruc: cliente.dni_ruc ?? '',
        telefono: cliente.telefono ?? '',
        tipo: cliente.tipo,
      })
    }
  }, [cliente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return

    setGuardando(true)
    try {
      await onGuardar(form)
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre completo o razón social"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cliente *</label>
            <select
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value as TipoCliente })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="minorista">Minorista - Precio al público</option>
              <option value="mayorista">Mayorista - Descuento por volumen</option>
              <option value="especial">Especial - Precio preferencial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.tipo === 'minorista' ? 'DNI' : 'RUC'}
            </label>
            <input
              type="text"
              value={form.dni_ruc}
              onChange={e => setForm({ ...form, dni_ruc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={form.tipo === 'minorista' ? '12345678' : '20XXXXXXXXX'}
              maxLength={form.tipo === 'minorista' ? 8 : 11}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="999123456"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
