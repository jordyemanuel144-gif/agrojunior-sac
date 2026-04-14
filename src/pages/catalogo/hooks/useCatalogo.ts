import { useEffect, useState, useMemo } from 'react'
import { productosService } from '@/services/productos.service'
import type { Producto } from '@/types/producto.types'
import type { TipoCliente } from '@/types/cliente.types'

const STORAGE_KEY_TIPO_CLIENTE = 'samjose_tipo_cliente'

interface UseCatalogoReturn {
  productos: Producto[]
  productosFiltrados: Producto[]
  cargando: boolean
  categoria: string
  tipoCliente: TipoCliente
  busqueda: string
  productoSeleccionado: Producto | null
  setCategoria: (categoria: string) => void
  setTipoCliente: (tipo: TipoCliente) => void
  setBusqueda: (busqueda: string) => void
  setProductoSeleccionado: (producto: Producto | null) => void
  obtenerPrecio: (producto: Producto) => number
}

export function useCatalogo(): UseCatalogoReturn {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoria, setCategoria] = useState('all')
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  const [tipoCliente, setTipoClienteState] = useState<TipoCliente>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TIPO_CLIENTE)
    return (saved as TipoCliente) || 'minorista'
  })

  useEffect(() => {
    productosService.obtenerTodos().then((data) => {
      setProductos(data)
      setCargando(false)
    })
  }, [])

  const setTipoCliente = (tipo: TipoCliente) => {
    setTipoClienteState(tipo)
    localStorage.setItem(STORAGE_KEY_TIPO_CLIENTE, tipo)
  }

  const productosFiltrados = useMemo(() => {
    let result = productos

    if (categoria !== 'all') {
      result = result.filter((p) => p.categoria_id === categoria)
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().trim()
      result = result.filter((p) => p.nombre.toLowerCase().includes(term))
    }

    return result
  }, [productos, categoria, busqueda])

  const obtenerPrecio = (producto: Producto): number => {
    switch (tipoCliente) {
      case 'mayorista':
        return producto.precio_mayorista
      case 'especial':
        return producto.precio_especial
      default:
        return producto.precio_minorista
    }
  }

  return {
    productos,
    productosFiltrados,
    cargando,
    categoria,
    tipoCliente,
    busqueda,
    productoSeleccionado,
    setCategoria,
    setTipoCliente,
    setBusqueda,
    setProductoSeleccionado,
    obtenerPrecio,
  }
}
