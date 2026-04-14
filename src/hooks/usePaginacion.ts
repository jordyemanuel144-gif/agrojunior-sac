import { useState, useMemo, useCallback } from 'react'

interface OpcionesPaginacion {
  paginaInicial?: number
  elementosPorPagina?: number
}

interface ResultadoPaginacion<T> {
  datos: T[]
  pagina: number
  totalPaginas: number
  totalElementos: number
  siguientePagina: () => void
  paginaAnterior: () => void
  irAPagina: (pagina: number) => void
  elementosPorPagina: number
  setElementosPorPagina: (cantidad: number) => void
}

export function usePaginacion<T>(
  datos: T[],
  opciones: OpcionesPaginacion = {}
): ResultadoPaginacion<T> {
  const { paginaInicial = 1, elementosPorPagina: inicialElementos = 10 } = opciones

  const [pagina, setPagina] = useState(paginaInicial)
  const [elementosPorPagina, setElementosPorPagina] = useState(inicialElementos)

  const totalElementos = datos.length
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina)

  const datosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * elementosPorPagina
    return datos.slice(inicio, inicio + elementosPorPagina)
  }, [datos, pagina, elementosPorPagina])

  const siguientePagina = useCallback(() => {
    setPagina(p => Math.min(p + 1, totalPaginas))
  }, [totalPaginas])

  const paginaAnterior = useCallback(() => {
    setPagina(p => Math.max(p - 1, 1))
  }, [])

  const irAPagina = useCallback((nuevaPagina: number) => {
    const pag = Math.max(1, Math.min(nuevaPagina, totalPaginas))
    setPagina(pag)
  }, [totalPaginas])

  return {
    datos: datosPaginados,
    pagina,
    totalPaginas,
    totalElementos,
    siguientePagina,
    paginaAnterior,
    irAPagina,
    elementosPorPagina,
    setElementosPorPagina,
  }
}