import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { User } from '@/types/usuario.types'

interface FilaUsuarioProps {
  usuario: User
  onEditar: (usuario: User) => void
  onEliminar: (id: string) => void
  onToggleActivo: (id: string) => void
}

export function FilaUsuario({ usuario, onEditar, onEliminar, onToggleActivo }: FilaUsuarioProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold">
              {usuario.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{usuario.name}</p>
            <p className="text-xs text-gray-500">{usuario.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          usuario.role === 'admin' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-primary-light text-primary-hover'
        }`}>
          {usuario.role === 'admin' ? 'Administrador' : 'Vendedor'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          usuario.active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {usuario.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActivo(usuario.id)}
            className={`p-2 rounded-lg transition ${
              usuario.active 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={usuario.active ? 'Desactivar' : 'Activar'}
          >
            {usuario.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
          <button
            onClick={() => onEditar(usuario)}
            className="p-2 text-primary hover:bg-primary-light rounded-lg transition"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onEliminar(usuario.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
}
