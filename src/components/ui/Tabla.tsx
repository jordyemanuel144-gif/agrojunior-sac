import { type ReactNode } from 'react'

interface Columna<T> {
  clave: keyof T | string
  titulo: string
  render?: (fila: T) => ReactNode
  className?: string
}

interface Props<T> {
  columnas: Columna<T>[]
  datos: T[]
  keyExtractor: (fila: T) => string
  className?: string
  vacio?: ReactNode
}

export function Tabla<T>({ columnas, datos, keyExtractor, className = '', vacio }: Props<T>) {
  if (datos.length === 0) {
    return vacio || <div className="p-4 text-center text-gray-500">No hay datos</div>
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columnas.map(col => (
              <th 
                key={String(col.clave)} 
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {datos.map(fila => (
            <tr key={keyExtractor(fila)} className="hover:bg-gray-50">
              {columnas.map(col => (
                <td key={String(col.clave)} className={`px-4 py-3 text-sm text-gray-900 ${col.className || ''}`}>
                  {col.render 
                    ? col.render(fila) 
                    : String(fila[col.clave as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}