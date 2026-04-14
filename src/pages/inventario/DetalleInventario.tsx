// DetalleInventario - Página de detalle de stock de un producto
// Muestra información del stock y historial de movimientos
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, ArrowUpCircle, ArrowDownCircle, Edit2, Plus, ExternalLink } from 'lucide-react'
import { inventarioService } from '@/services/inventario.service'
import { RUTAS } from '@/config/rutas'
import { formatFecha } from '@/lib/utils'
import type { ItemStock, MovimientoInventario, ConteoInventario } from '@/types/inventario.types'
import { ModalMovimiento } from './components/ModalMovimiento'

export default function DetalleInventario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ItemStock | null>(null)
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [conteos, setConteos] = useState<ConteoInventario[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarMovimiento, setMostrarMovimiento] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        inventarioService.obtenerStockPorId(id),
        inventarioService.obtenerMovimientosPorProducto(id),
        inventarioService.obtenerConteos(),
      ]).then(([itemData, movs, conteosData]) => {
        setItem(itemData)
        setMovimientos(movs)
        setConteos(conteosData)
        setCargando(false)
      })
    }
  }, [id])

  const handleMovimientoRegistrado = async () => {
    if (!id) return
    const [itemData, movs] = await Promise.all([
      inventarioService.obtenerStockPorId(id),
      inventarioService.obtenerMovimientosPorProducto(id),
    ])
    setItem(itemData)
    setMovimientos(movs)
    setMostrarMovimiento(false)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Producto no encontrado en inventario</p>
        </div>
      </div>
    )
  }

  const estadoConfig = {
    ok: { color: 'green', bg: 'bg-green-50', text: 'text-green-600', label: 'Normal' },
    bajo: { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', label: 'Bajo Stock' },
    agotado: { color: 'red', bg: 'bg-red-50', text: 'text-red-600', label: 'Agotado' },
  }
  const estado = estadoConfig[item.estado]

  return (
    <>
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => navigate(RUTAS.ADMIN.INVENTARIO)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="flex-1" />
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${estado.bg} ${estado.text}`}>
              {estado.label}
            </span>
          </div>

          <div className="flex items-center gap-4 px-4 pb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Package size={28} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{item.nombre}</h1>
              <div className="flex items-center gap-3 mt-1">
                {item.codigo && <span className="text-gray-500">Código: {item.codigo}</span>}
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm">{item.categoria}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Stock Actual</h3>
              <div className="flex items-center gap-6">
                <div className={`px-4 py-3 rounded-xl ${estado.bg}`}>
                  <p className={`text-3xl font-bold ${estado.text}`}>
                    {item.stock_actual.toFixed(item.tipo_medida === 'kg' ? 1 : 0)}
                  </p>
                  <p className="text-sm text-gray-500">{item.tipo_medida}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Stock mínimo</p>
                  <p className="text-lg font-medium text-gray-900">
                    {item.stock_minimo.toFixed(item.tipo_medida === 'kg' ? 1 : 0)} {item.tipo_medida}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Historial de Movimientos
              </h3>
              {movimientos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {movimientos.slice(0, 20).map(mov => {
                    const handleClick = () => {
                      if (mov.documento_tipo === 'venta' && mov.documento_id) {
                        navigate(`${RUTAS.ADMIN.VENTAS}/${mov.documento_id}`)
                      } else if (mov.documento_tipo === 'compra' && mov.documento_id) {
                        navigate(`${RUTAS.ADMIN.COMPRAS}/${mov.documento_id}`)
                      } else if (mov.documento_tipo === 'conteo' && mov.documento_id) {
                        const conteoEncontrado = conteos.find(c => c.id === mov.documento_id || c.numero === mov.documento_id)
                        if (conteoEncontrado) {
                          navigate(`${RUTAS.ADMIN.INVENTARIO_CONTEO}/${conteoEncontrado.id}`)
                        }
                      }
                    }
                    
                    const esClickeable = mov.documento_tipo && mov.documento_id && (
                      (mov.documento_tipo === 'conteo' && conteos.some(c => c.id === mov.documento_id || c.numero === mov.documento_id)) ||
                      mov.documento_tipo !== 'conteo'
                    )

                    return (
                      <div 
                        key={mov.id} 
                        onClick={esClickeable ? handleClick : undefined}
                        className={`flex items-center gap-3 p-2 rounded-lg ${esClickeable ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                      >
                        {mov.tipo === 'entrada' ? (
                          <ArrowUpCircle size={20} className="text-green-600 flex-shrink-0" />
                        ) : (
                          <ArrowDownCircle size={20} className="text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {mov.motivo.charAt(0).toUpperCase() + mov.motivo.slice(1)}
                            {mov.documento_tipo && (
                              <span className="text-gray-400"> • {mov.documento_tipo}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{formatFecha(mov.fecha)}</p>
                        </div>
                        {esClickeable && (
                          <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                            {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad.toFixed(item.tipo_medida === 'kg' ? 1 : 0)} {item.tipo_medida}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acciones</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`${RUTAS.ADMIN.PRODUCTOS}/${item.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <Edit2 size={18} />
                  Editar en Productos
                </button>
                <button
                  onClick={() => setMostrarMovimiento(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm"
                >
                  <Plus size={18} />
                  Registrar Movimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarMovimiento && item && (
        <ModalMovimiento
          producto={item}
          onCerrar={() => setMostrarMovimiento(false)}
          onRegistrado={handleMovimientoRegistrado}
        />
      )}
    </>
  )
}
