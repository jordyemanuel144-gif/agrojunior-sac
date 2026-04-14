import { useState, useMemo } from 'react'
import { ArrowLeft, CheckCircle2, Banknote, QrCode, Building2, Minus, Plus, Trash2, X, UserCircle, Edit3, Search, CreditCard, Clock } from 'lucide-react'
import type { CartItem } from '@/types/venta.types'
import type { MetodoPago, EstadoPago } from '@/types/venta.types'
import type { Cliente } from '@/types/cliente.types'
import { DESCUENTOS_MAYORISTA } from '@/datos-mock/descuentos.mock'

interface Props {
  items: CartItem[]
  cliente: Cliente
  clientes?: Cliente[]
  stockInfo?: Record<string, number>
  igvActivo?: boolean
  showClientePicker?: boolean
  onVolver: () => void
  onConfirmar: (metodo: MetodoPago, descuento: number, igv: number, total: number, montoPagado: number, estadoPago: EstadoPago) => void
  onActualizarCantidad: (productoId: string, cantidad: number) => void
  onEliminarItem: (productoId: string) => void
  onCambiarCliente?: (cliente: Cliente) => void
  onAbrirClientePicker?: () => void
  onCerrarClientePicker?: () => void
}

const METODOS: { id: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={28} /> },
  { id: 'yape', label: 'Yape/Plin', icon: <QrCode size={28} /> },
  { id: 'transferencia', label: 'Transf.', icon: <Building2 size={28} /> },
]

const TIPOS_PAGO: { id: EstadoPago; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'pagado', label: 'Pagado', icon: <CheckCircle2 size={18} />, desc: 'Pago completo' },
  { id: 'parcial', label: 'Parcial', icon: <CreditCard size={18} />, desc: 'Pago parcial' },
  { id: 'pendiente', label: 'A Cuenta', icon: <Clock size={18} />, desc: 'A cuenta/saldo' },
]

export function ConfirmarPedido({ items, cliente, clientes, stockInfo: _stockInfo, igvActivo = false, showClientePicker: _showClientePicker, onVolver, onConfirmar, onActualizarCantidad, onEliminarItem, onCambiarCliente, onAbrirClientePicker: _onAbrirClientePicker, onCerrarClientePicker: _onCerrarClientePicker }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [cargando, setCargando] = useState(false)
  const [editando, setEditando] = useState<Record<string, string>>({})
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'minorista' | 'mayorista' | 'especial'>('todos')
  const [tipoPago, setTipoPago] = useState<EstadoPago>('pagado')
  const [montoPagadoInput, setMontoPagadoInput] = useState('')

  const clientesFiltrados = useMemo(() => {
    if (!clientes || clientes.length === 0) return []
    const busquedaLower = busquedaCliente.toLowerCase().trim()
    return clientes.filter(c => {
      const coincideBusqueda = !busquedaLower || 
        c.nombre.toLowerCase().includes(busquedaLower) ||
        c.dni_ruc?.toLowerCase().includes(busquedaLower) ||
        c.telefono?.toLowerCase().includes(busquedaLower)
      const coincideTipo = filtroTipo === 'todos' || c.tipo === filtroTipo
      return coincideBusqueda && coincideTipo
    })
  }, [clientes, busquedaCliente, filtroTipo])

  const handleSelectCliente = (nuevoCliente: Cliente) => {
    if (onCambiarCliente) {
      onCambiarCliente(nuevoCliente)
    }
    setShowClientSelector(false)
    setBusquedaCliente('')
    setFiltroTipo('todos')
  }

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
  
  const montoPagado = tipoPago === 'pagado' ? total : tipoPago === 'parcial' && montoPagadoInput ? parseFloat(montoPagadoInput) : tipoPago === 'pendiente' && montoPagadoInput ? parseFloat(montoPagadoInput) : 0

  const montoInvalido = !!(montoPagado > total)
  const montoPagadoExacto = montoPagado > 0 && montoPagado === total
  const montoPagadoMayor = montoPagado > total
  const saldoPendiente = Math.max(0, total - montoPagado)
  
  const esClienteRegistrado = cliente.id !== 'publico'
  const mostrarAlertaCliente = (tipoPago === 'parcial' || tipoPago === 'pendiente') && !esClienteRegistrado
  
  const estadoPagoCalculado: EstadoPago = montoPagado >= total ? 'pagado' : montoPagado > 0 ? (esClienteRegistrado ? tipoPago : 'pagado') : 'pendiente'

  const tipoLabel: Record<string, string> = { minorista: 'Minorista', mayorista: 'Mayorista', especial: 'Especial' }

  const handleConfirmar = async () => {
    if (cargando || montoInvalido || mostrarAlertaCliente) return
    setCargando(true)
    console.log('Iniciando confirmación...')
    await new Promise(r => setTimeout(r, 500))
    try {
      console.log('Llamando onConfirmar...', { metodo, montoDescuento, igv, total, montoPagado, estadoPagoCalculado })
      await onConfirmar(metodo, montoDescuento, igv, total, montoPagado, estadoPagoCalculado)
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
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4`}>
        {showClientSelector && clientes && clientes.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Cambiar Cliente</h3>
              <button onClick={() => { setShowClientSelector(false); setBusquedaCliente(''); setFiltroTipo('todos'); }} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={14} />
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
              {(['todos', 'minorista', 'mayorista', 'especial'] as const).map(tipo => (
                <button key={tipo} onClick={() => setFiltroTipo(tipo)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${filtroTipo === tipo ? (tipo === 'todos' ? 'bg-blue-600 text-white' : tipo === 'mayorista' ? 'bg-green-600 text-white' : tipo === 'especial' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white') : 'bg-gray-100 text-gray-500'}`}>
                  {tipo === 'todos' ? 'Todos' : tipo === 'minorista' ? 'Minorista' : tipo === 'mayorista' ? 'Mayorista' : 'Especial'}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {clientesFiltrados.map(c => (
                <button key={c.id} onClick={() => handleSelectCliente(c)} className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition-all ${cliente.id === c.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.tipo === 'mayorista' ? 'bg-green-100' : c.tipo === 'especial' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    <UserCircle size={14} className={`${c.tipo === 'mayorista' ? 'text-green-600' : c.tipo === 'especial' ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.nombre}</p>
                    <p className="text-[10px] text-gray-400">{c.dni_ruc || c.telefono || ''}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.tipo === 'mayorista' ? 'bg-green-100 text-green-700' : c.tipo === 'especial' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.tipo === 'mayorista' ? 'MAY' : c.tipo === 'especial' ? 'ESP' : 'MIN'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowClientSelector(true)}
            className={`w-full relative bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors text-left ${cliente.tipo !== 'minorista' ? 'pr-14' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cliente.tipo === 'mayorista' ? 'bg-green-100' : cliente.tipo === 'especial' ? 'bg-purple-100' : 'bg-blue-100'}`}>
              <UserCircle size={20} className={`${cliente.tipo === 'mayorista' ? 'text-green-600' : cliente.tipo === 'especial' ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <div className={`flex-1 min-w-0 ${cliente.tipo !== 'minorista' ? '' : 'pr-3'}`}>
              <p className={`text-[11px] font-semibold ${cliente.tipo === 'mayorista' ? 'text-green-600' : cliente.tipo === 'especial' ? 'text-purple-600' : 'text-gray-400'}`}>
                {cliente.tipo === 'mayorista' ? 'CLIENTE MAYORISTA' : cliente.tipo === 'especial' ? 'CLIENTE ESPECIAL' : 'Cliente'}
              </p>
              <p className={`text-sm font-bold truncate ${cliente.tipo === 'mayorista' ? 'text-green-900' : cliente.tipo === 'especial' ? 'text-purple-900' : 'text-gray-900'}`}>{cliente.nombre}</p>
              <div className={`flex items-center gap-2 mt-0.5 ${cliente.tipo !== 'minorista' ? 'text-gray-500' : ''}`}>
                {cliente.dni_ruc && <p className={`text-xs ${cliente.tipo !== 'minorista' ? 'text-green-600' : 'text-gray-400'}`}>{cliente.dni_ruc}</p>}
                {cliente.dni_ruc && cliente.telefono && <span className={`${cliente.tipo !== 'minorista' ? 'text-green-300' : 'text-gray-300'}`}>•</span>}
                {cliente.telefono && <p className={`text-xs ${cliente.tipo !== 'minorista' ? 'text-green-600' : 'text-gray-400'}`}>{cliente.telefono}</p>}
              </div>
            </div>
            {cliente.tipo !== 'minorista' && (
              <span className={`absolute right-10 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                cliente.tipo === 'mayorista' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {cliente.tipo === 'mayorista' ? 'Mayorista' : 'Especial'}
              </span>
            )}
            <div className={`absolute right-3 w-9 h-9 rounded-full flex items-center justify-center ${cliente.tipo === 'mayorista' ? 'bg-green-50' : cliente.tipo === 'especial' ? 'bg-purple-50' : 'bg-gray-100'}`}>
              <Edit3 size={14} className={`${cliente.tipo === 'mayorista' ? 'text-green-500' : cliente.tipo === 'especial' ? 'text-purple-500' : 'text-gray-500'}`} />
            </div>
          </button>
        )}
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
          <h2 className="font-bold text-gray-900 mb-3">Tipo de Pago</h2>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_PAGO.map(tp => (
              <button 
                key={tp.id} 
                onClick={() => { 
                  if (tp.id === 'pagado' || esClienteRegistrado) {
                    setTipoPago(tp.id)
                    if (tp.id === 'pagado') setMontoPagadoInput('')
                  }
                }} 
                disabled={!esClienteRegistrado && (tp.id === 'parcial' || tp.id === 'pendiente')}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${esClienteRegistrado || tp.id === 'pagado' ? '' : 'opacity-50 cursor-not-allowed'} ${tipoPago === tp.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <span className={tipoPago === tp.id ? 'text-blue-600' : 'text-gray-400'}>{tp.icon}</span>
                <span className={`text-xs font-semibold ${tipoPago === tp.id ? 'text-blue-600' : 'text-gray-500'}`}>{tp.label}</span>
              </button>
            ))}
          </div>
          {mostrarAlertaCliente && (
            <p className="text-xs text-amber-600 mt-2">Selecciona un cliente registrado para pago parcial o a cuenta</p>
          )}
          {(tipoPago === 'parcial') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Monto Recibido</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoPagadoInput}
                  onChange={(e) => setMontoPagadoInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {montoPagadoInput && parseFloat(montoPagadoInput) > total && (
                <p className="text-xs text-red-500 mt-1.5">El monto no puede ser mayor al total (S/ {total.toFixed(2)})</p>
              )}
              {montoPagadoInput && parseFloat(montoPagadoInput) > 0 && parseFloat(montoPagadoInput) <= total && parseFloat(montoPagadoInput) < total && (
                <p className="text-xs text-amber-600 mt-1.5">Falta: S/ {(total - parseFloat(montoPagadoInput)).toFixed(2)}</p>
              )}
              {montoPagadoExacto && (
                <p className="text-xs text-green-600 mt-1.5">✓ Pago completado</p>
              )}
              {montoPagadoMayor && (
                <p className="text-xs text-green-600 mt-1.5">Cambio: S/ {(parseFloat(montoPagadoInput) - total).toFixed(2)}</p>
              )}
            </div>
          )}
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
          {(tipoPago === 'parcial' || tipoPago === 'pendiente') && (
            <div className="pt-2 border-t border-dashed border-gray-200 space-y-1">
              <div className="flex justify-between text-xs text-gray-500"><span>Monto Recibido</span><span className={`font-medium ${estadoPagoCalculado === 'pagado' ? 'text-green-600' : 'text-gray-900'}`}>S/ {montoPagado.toFixed(2)}</span></div>
              {estadoPagoCalculado !== 'pagado' && (
                <div className="flex justify-between text-xs text-amber-600"><span>Saldo Pendiente</span><span className="font-semibold">S/ {saldoPendiente.toFixed(2)}</span></div>
              )}
              {estadoPagoCalculado === 'pagado' && (
                <div className="flex justify-between text-xs text-green-600"><span>Estado</span><span className="font-semibold">✓ Pagado</span></div>
              )}
            </div>
          )}
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
          disabled={cargando || montoInvalido}
          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all active:scale-[.98] ${cargando || montoInvalido ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
