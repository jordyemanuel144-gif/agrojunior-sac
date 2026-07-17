import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Proveedor, NuevoProveedor } from '@/types/proveedor.types'

interface Props {
  proveedor?: Proveedor | null
  onCerrar: () => void
  onGuardar: (datos: NuevoProveedor) => Promise<void>
}

export function FormularioProveedor({ proveedor, onCerrar, onGuardar }: Props) {
  const [form, setForm] = useState<NuevoProveedor>({
    nombre: '',
    ruc: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto: '',
    activo: true,
  })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (proveedor) {
      setForm({
        nombre: proveedor.nombre,
        ruc: proveedor.ruc,
        telefono: proveedor.telefono ?? '',
        email: proveedor.email ?? '',
        direccion: proveedor.direccion ?? '',
        contacto: proveedor.contacto ?? '',
        activo: proveedor.activo,
      })
    }
  }, [proveedor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.ruc.trim()) return

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
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nombre de la empresa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC *</label>
            <input
              type="text"
              value={form.ruc}
              onChange={e => setForm({ ...form, ruc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="12345678901"
              maxLength={11}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="999123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Av. Ejemplo 123, Ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Persona de contacto</label>
            <input
              type="text"
              value={form.contacto}
              onChange={e => setForm({ ...form, contacto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nombre del contacto"
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
              className="flex-1 px-4 py-2 bg-primary text-neutral-900 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
