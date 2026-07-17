// ConteoInventario - Página para realizar conteos físicos de inventario
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Plus, Search, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosConteos } from './components/FiltrosConteos'
import { inventarioService } from '@/services/inventario.service'
import { useAuth } from '@/hooks/useAuth'
import { formatFecha } from '@/lib/utils'
import type { ConteoInventario, EstadoConteo } from '@/types/inventario.types'

export default function ConteoInventario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conteos, setConteos] = useState<ConteoInventario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modoNuevo, setModoNuevo] = useState(false)
  const [productosStock, setProductosStock] = useState<{id: string; nombre: string; stock_sistema: number; stock_fisico: string}[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoConteo | 'todos'>('todos')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    inventarioService.obtenerConteos().then(data => {
      setConteos(data)
      setCargando(false)
    })
  }, [])

  const iniciarNuevoConteo = async () => {
    const stock = await inventarioService.obtenerStock()
    setProductosStock(stock.map(p => ({
      id: p.id,
      nombre: p.nombre,
      stock_sistema: p.stock_actual,
      stock_fisico: '',
    })))
    setModoNuevo(true)
    setBusqueda('')
  }

  const actualizarStockFisico = (productoId: string, valor: string) => {
    setProductosStock(prev => prev.map(p => 
      p.id === productoId ? { ...p, stock_fisico: valor } : p
    ))
  }

  const guardarConteo = async () => {
    setGuardando(true)
    try {
      const itemsValidos = productosStock
        .filter(p => p.stock_fisico !== '' && p.stock_fisico !== null)
        .map(p => ({
          producto_id: p.id,
          stock_fisico: parseFloat(p.stock_fisico),
        }))

      if (itemsValidos.length === 0) {
        setGuardando(false)
        return
      }

      const nuevoConteo = await inventarioService.crearConteo(
        { items: itemsValidos },
        user?.id ?? 'user-1',
        user?.email ?? 'Usuario'
      )

      const nuevosConteos = await inventarioService.obtenerConteos()
      setConteos(nuevosConteos)
      setModoNuevo(false)
      navigate(`/admin/inventario/conteo/${nuevoConteo.id}`)
    } finally {
      setGuardando(false)
    }
  }

  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productosStock
    return productosStock.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [productosStock, busqueda])

  const conteosCompletados = conteos.filter(c => c.estado === 'completado').length
  const conteosAnulados = conteos.filter(c => c.estado === 'anulado').length

  const conteosFiltrados = useMemo(() => {
    return conteos.filter(c => {
      const matchBusqueda = busqueda === '' || c.numero.toLowerCase().includes(busqueda.toLowerCase())
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
      return matchBusqueda && matchEstado
    })
  }, [conteos, busqueda, filtroEstado])

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (modoNuevo) {
    const itemsConDiferencia = productosStock.filter(p => p.stock_fisico !== '' && parseFloat(p.stock_fisico) !== p.stock_sistema)
    const totalEntradas = productosStock
      .filter(p => p.stock_fisico !== '' && parseFloat(p.stock_fisico) > p.stock_sistema)
      .reduce((acc, p) => acc + (parseFloat(p.stock_fisico) - p.stock_sistema), 0)
    const totalSalidas = productosStock
      .filter(p => p.stock_fisico !== '' && parseFloat(p.stock_fisico) < p.stock_sistema)
      .reduce((acc, p) => acc + (p.stock_sistema - parseFloat(p.stock_fisico)), 0)

    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setModoNuevo(false)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nuevo Conteo de Inventario</h1>
            <p className="text-sm text-gray-500">Ingresa el stock físico de cada producto</p>
          </div>
        </div>

        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-medium">{productosStock.length}</span>
            <span className="text-amber-700">productos</span>
          </div>
          {itemsConDiferencia.length > 0 && (
            <>
              <div className="w-px bg-amber-300 h-4"></div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">+{totalEntradas.toFixed(1)}</span>
                <span className="text-amber-700">entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">-{totalSalidas.toFixed(1)}</span>
                <span className="text-amber-700">salidas</span>
              </div>
            </>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base bg-white rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-light outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-center">Sistema</div>
            <div className="col-span-3 text-center">Físico</div>
            <div className="col-span-2 text-center">Diferencia</div>
          </div>
          {productosFiltrados.map(producto => {
            const diferencia = producto.stock_fisico !== '' 
              ? parseFloat(producto.stock_fisico) - producto.stock_sistema 
              : null
            const diffColor = diferencia === null 
              ? '' 
              : diferencia === 0 
                ? 'bg-green-50 text-green-600' 
                : diferencia > 0 
                  ? 'bg-primary-light text-primary' 
                  : 'bg-red-50 text-red-600'

            return (
              <div key={producto.id} className="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 items-center">
                <div className="col-span-5 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{producto.nombre}</p>
                </div>
                <div className="col-span-2 text-center text-gray-500 text-sm">
                  {producto.stock_sistema.toFixed(1)}
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.1"
                    value={producto.stock_fisico}
                    onChange={e => actualizarStockFisico(producto.id, e.target.value)}
                    placeholder="—"
                    className={`w-full px-2 py-1.5 text-center font-bold rounded-lg bg-transparent outline-none text-base ${
                      diferencia === null 
                        ? 'border border-gray-200 text-gray-400' 
                        : diffColor
                    }`}
                  />
                </div>
                <div className={`col-span-2 text-center text-sm font-bold ${
                  diferencia === null 
                    ? 'text-gray-300' 
                    : diferencia === 0 
                      ? 'text-green-600' 
                      : diferencia > 0 
                        ? 'text-primary' 
                        : 'text-red-500'
                }`}>
                  {diferencia === null ? '—' : `${diferencia > 0 ? '+' : ''}${diferencia.toFixed(1)}`}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setModoNuevo(false)}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={guardarConteo}
            disabled={guardando}
            className="flex-1 py-3 bg-primary text-neutral-900 rounded-xl font-bold text-sm hover:bg-primary-hover disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Crear Conteo'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        titulo="Ajuste de Inventario"
        icono={ClipboardList}
        stats={[
          { label: 'Total', value: conteosFiltrados.length, color: 'gray' },
          { label: 'Completados', value: conteosCompletados, color: 'green' },
          { label: 'Anulados', value: conteosAnulados, color: 'red' },
        ]}
      />

      <div className="max-w-screen-xl mx-auto">
        <button
          onClick={iniciarNuevoConteo}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-primary text-neutral-900 rounded-xl hover:bg-primary-hover transition-colors mb-4"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Conteo</span>
        </button>

        <FiltrosConteos
          busqueda={busqueda}
          filtroEstado={filtroEstado}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setFiltroEstado}
        />

        {conteosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay conteos registrados</p>
            <p className="text-sm text-gray-400 mt-1">Crea un nuevo conteo para comenzar</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {conteosFiltrados.map(conteo => {
              const entradas = conteo.items.filter(i => i.diferencia > 0).reduce((acc, i) => acc + i.diferencia, 0)
              const salidas = conteo.items.filter(i => i.diferencia < 0).reduce((acc, i) => acc + Math.abs(i.diferencia), 0)
              
              const estadoLabel = {
                borrador: 'Borrador',
                completado: 'Completado',
                anulado: 'Anulado'
              }[conteo.estado]
              
              const estadoColor = {
                borrador: 'bg-amber-100 text-amber-700',
                completado: 'bg-green-100 text-green-700',
                anulado: 'bg-red-100 text-red-600'
              }[conteo.estado]
              
              const iconBg = {
                borrador: 'bg-amber-50',
                completado: 'bg-green-50',
                anulado: 'bg-red-50'
              }[conteo.estado]
              
              return (
                <div 
                  key={conteo.id} 
                  onClick={() => navigate(`/admin/inventario/conteo/${conteo.id}`)}
                  className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    {conteo.estado === 'completado' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : conteo.estado === 'borrador' ? (
                      <ClipboardList size={20} className="text-amber-600" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{conteo.numero}</p>
                    <p className="text-sm text-gray-500">
                      {conteo.items.length} productos • {formatFecha(conteo.fecha)}
                    </p>
                    {conteo.estado === 'completado' && (entradas > 0 || salidas > 0) && (
                      <div className="flex gap-2 mt-1">
                        {entradas > 0 && (
                          <span className="text-xs text-primary">+{entradas.toFixed(1)}</span>
                        )}
                        {salidas > 0 && (
                          <span className="text-xs text-red-600">-{salidas.toFixed(1)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${estadoColor}`}>
                      {estadoLabel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
