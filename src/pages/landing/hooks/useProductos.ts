import { useEffect, useState } from 'react'
import { productosService } from '@/services/productos.service'
import type { Producto } from '@/types/producto.types'

interface UseProductosReturn {
  productos: Producto[]
  cargando: boolean
}

export function useProductos(): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    productosService.obtenerDestacados()
      .then((data) => {
        setProductos(data.slice(0, 3))
        setCargando(false)
      })
  }, [])

  return { productos, cargando }
}
