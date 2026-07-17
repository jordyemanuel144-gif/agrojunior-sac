import type { User as UserType } from '@/types/usuario.types'

interface CardPerfilProps {
  usuario: UserType
}

export function CardPerfil({ usuario }: CardPerfilProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold text-primary">
            {usuario.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{usuario.name}</h2>
        <p className="text-gray-500 text-sm">{usuario.email}</p>
        <span className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${
          usuario.role === 'admin' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-primary-light text-primary-hover'
        }`}>
          {usuario.role === 'admin' ? 'Administrador' : 'Vendedor'}
        </span>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Estado:</span>
            <span className="text-green-600 font-medium">Activo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ID:</span>
            <span className="text-gray-700 font-mono text-xs">{usuario.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
