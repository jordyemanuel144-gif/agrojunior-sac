import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { User, NuevoUsuario, RolUsuario } from '@/types/usuario.types'

interface FormularioUsuarioProps {
  usuario?: User | null
  onCerrar: () => void
  onGuardar: (datos: Omit<NuevoUsuario, 'id' | 'created_at' | 'updated_at'>) => void
}

export function FormularioUsuario({ usuario, onCerrar, onGuardar }: FormularioUsuarioProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RolUsuario>('vendedor')
  const [active, setActive] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (usuario) {
      setName(usuario.name)
      setEmail(usuario.email)
      if (usuario.role === 'cliente') {
        setRole('vendedor')
      } else {
        setRole(usuario.role)
      }
      setActive(usuario.active)
    }
  }, [usuario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar({
      name,
      email,
      role,
      active,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={usuario ? 'Dejar vacío para mantener' : 'samjose123'}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Contraseña por defecto: samjose123</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'vendedor')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Usuario activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-neutral-900 rounded-xl hover:bg-primary-hover transition"
            >
              {usuario ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
