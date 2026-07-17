import { productosService } from '@/services/productos.service'
import { useEffect, useState } from 'react'
import type { Categoria } from '@/types/producto.types'

interface FiltroCategoriasProps {
  categoriaSeleccionada: string
  onCambiar: (categoria: string) => void
}

export function FiltroCategorias({ categoriaSeleccionada, onCambiar }: FiltroCategoriasProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    productosService.obtenerCategorias().then(setCategorias)
  }, [])

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          onClick={() => onCambiar(categoria.id)}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex-shrink-0 ${
            categoriaSeleccionada === categoria.id
              ? 'bg-primary text-neutral-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {categoria.nombre}
        </button>
      ))}
    </div>
  )
}
