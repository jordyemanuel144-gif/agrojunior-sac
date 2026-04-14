import { Save } from 'lucide-react'
import type { User } from '@/types/usuario.types'

interface FormularioEditarPerfilProps {
  usuario: User
  guardando: boolean
  onGuardar: (datos: { name: string; email: string }) => Promise<void>
  error?: string | null
  exito?: string | null
}

export function FormularioEditarPerfil({ usuario, guardando, onGuardar, error, exito }: FormularioEditarPerfilProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await onGuardar({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    })
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Save className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Información Personal</h3>
          <p className="text-sm text-gray-500">Actualiza tus datos personales</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
      {exito && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{exito}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            name="name"
            defaultValue={usuario.name}
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            name="email"
            defaultValue={usuario.email}
            type="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <input
            type="text"
            value={usuario.role === 'admin' ? 'Administrador' : 'Vendedor'}
            disabled
            className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
