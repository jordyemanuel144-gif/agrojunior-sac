import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Banknote, QrCode, Building2, Minus, Plus, Trash2, X } from 'lucide-react'
import type { CartItem } from '@/types/venta.types'
import type { MetodoPago } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { DESCUENTOS_MAYORISTA } from '@/datos-mock/descuentos.mock'

interface Props {
  items: CartItem[]
  cliente: Cliente
  igvActivo?: boolean
  onVolver: () => void
  onConfirmar: (metodo: MetodoPago, descuento: number, igv: number, total: number) => void
  onActualizarCantidad: (productoId: string, cantidad: number) => void
  onEliminarItem: (productoId: string) => void
}

const METODOS: { id: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={28} /> },
  { id: 'yape', label: 'Yape/Plin', icon: <QrCode size={28} /> },
  { id: 'transferencia', label: 'Transf.', icon: <Building2 size={28} /> },
]

export function ConfirmarPedido({ items, cliente, igvActivo = false, onVolver, onConfirmar, onActualizarCantidad, onEliminarItem }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState<Record<string, string>>({})

  const getDisplayCantidad = (productoId: string, cantidad: number) => {
    const valor = editando[productoId]
    if (valor !== undefined) return valor
    return cantidad
  }

  const handleEditStart = (productoId: string, cantidad: number) => {
    setEditando(prev => ({ ...prev, [productoId]: String(cantidad) }))
  }

  const handleEditChange = (productoId: string, valor: string) => {
    if (valor === '' || /^\d+$/.test(valor)) {
      setEditando(prev => ({ ...prev, [productoId]: valor }))
    }
  }

  const handleEditConfirm = (productoId: string, cantidadOriginal: number) => {
    const valorEditado = editando[productoId]
    if (valorEditado === undefined || valorEditado === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [productoId]: _unused, ...rest } = editando
      setEditando(rest)
      return
    }
    const num = parseInt(valorEditado)
    if (num === cantidadOriginal) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [productoId]: _unused, ...rest } = editando
      setEditando(rest)
      return
    }
    if (num <= 0) {
      onEliminarItem(productoId)
    } else {
      onActualizarCantidad(productoId, num)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productoId]: _unused, ...rest } = editando
    setEditando(rest)
  }

  const pctDescuento = DESCUENTOS_MAYORISTA[cliente.tipo] ?? 0
  const subtotalCalculado = items.reduce((acc, item) => acc + item.subtotal, 0)
  const montoDescuento = subtotalCalculado * pctDescuento
  const baseIgv = subtotalCalculado - montoDescuento
  const igv = igvActivo ? baseIgv * 0.18 : 0
  const total = baseIgv + igv

  const tipoLabel: Record<string, string> = { minorista: 'Minorista', mayorista: 'Mayorista', especial: 'Especial' }

  const handleConfirmar = async () => {
    if (cargando) return
    setCargando(true)
    console.log('Iniciando confirmación...')
    await new Promise(r => setTimeout(r, 500))
    try {
      console.log('Llamando onConfirmar...', { metodo, montoDescuento, igv, total })
      await onConfirmar(metodo, montoDescuento, igv, total)
      console.log('Confirmación exitosa')
    } catch (error) {
      console.error('Error en confirmación:', error)
      alert('Error al procesar la venta: ' + String(error))
    }
    setCargando(false)
    console.log('Fin de confirmación')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirmar Pedido</h1>
        </div>
        <button onClick={() => { if (confirm('¿Cancelar la venta actual?')) { onVolver() } }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <X size={16} />Cancelar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 text-lg">👤</span></div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cliente</p>
            <p className="text-sm font-bold text-gray-900 truncate">{cliente.nombre}</p>
          </div>
          {cliente.tipo !== 'minorista' && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${cliente.tipo === 'mayorista' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {tipoLabel[cliente.tipo]}
            </span>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Resumen de Venta</h2>
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map(item => (
              <div key={item.producto.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.producto.imagen_url ? <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🐔</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.producto.nombre}</p>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">S/ {item.subtotal.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">S/ {item.precio_unitario.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1">
                  <button onClick={() => { if (item.cantidad > 1) { onActualizarCantidad(item.producto.id, item.cantidad - 1) } else { onEliminarItem(item.producto.id) } }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                    {item.cantidad > 1 ? <Minus size={14} className="text-gray-600" /> : <Trash2 size={14} className="text-red-500" />}
                  </button>
                  <input
                    type="number"
                    value={getDisplayCantidad(item.producto.id, item.cantidad)}
                    onFocus={() => handleEditStart(item.producto.id, item.cantidad)}
                    onChange={(e) => handleEditChange(item.producto.id, e.target.value)}
                    onBlur={() => handleEditConfirm(item.producto.id, item.cantidad)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm(item.producto.id, item.cantidad)}
                    className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button onClick={() => onActualizarCantidad(item.producto.id, item.cantidad + 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                    <Plus size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Método de Pago</h2>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map(m => (
              <button key={m.id} onClick={() => setMetodo(m.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${metodo === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <span className={metodo === m.id ? 'text-blue-600' : 'text-gray-400'}>{m.icon}</span>
                <span className={`text-xs font-semibold ${metodo === m.id ? 'text-blue-600' : 'text-gray-500'}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-900">S/ {subtotalCalculado.toFixed(2)}</span></div>
          {pctDescuento > 0 && <div className="flex justify-between text-sm"><span className="text-green-600 font-medium">Descuento {tipoLabel[cliente.tipo]} (-{(pctDescuento * 100).toFixed(0)}%)</span><span className="text-green-600 font-semibold">-S/ {montoDescuento.toFixed(2)}</span></div>}
          {igvActivo && <div className="flex justify-between text-sm text-gray-500"><span>IGV (18%)</span><span className="font-medium text-gray-900">S/ {igv.toFixed(2)}</span></div>}
          <div className="border-t border-gray-100 pt-2 flex justify-between items-center"><span className="text-base font-bold text-gray-900">Total</span><span className="text-2xl font-bold text-blue-600">S/ {total.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="bg-white px-4 py-4 border-t border-gray-100 pb-safe">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleConfirmar()
          }}
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all active:scale-[.98]"
        >
          {cargando ? (
            <span className="animate-pulse">Procesando...</span>
          ) : (
            <>
              <CheckCircle2 size={20} />
              PROCESAR PAGO
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">Sam José Avícola · Terminal POS #01</p>
      </div>
    </div>
  )
}
