import { useDashboard } from './hooks/useDashboard'
import { formatMoneda } from '@/lib/utils'
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, AlertTriangle, Package, Clock, ArrowRight,
  Receipt
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { RUTAS } from '@/config/rutas'

function TarjetaKPI({ 
  icono: Icono, 
  valor, 
  label, 
  color = 'blue',
  comparacion,
  sublabel
}: { 
  icono: React.ElementType
  valor: string | number
  label: string
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray'
  comparacion?: number
  sublabel?: string
}) {
  const colores = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600'
  }

  const bordes = {
    blue: 'border-blue-100',
    green: 'border-green-100',
    purple: 'border-purple-100',
    yellow: 'border-yellow-100',
    red: 'border-red-100',
    gray: 'border-gray-100'
  }

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-5 border ${bordes[color]} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${colores[color]}`}>
          <Icono size={20} />
        </div>
        {comparacion !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${comparacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {comparacion >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(comparacion)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

function SeccionUltimasVentas({ ventas }: { ventas: any[] }) {
  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt size={16} className="text-blue-600" />
          Últimas Ventas
        </h3>
        <p className="text-gray-400 text-sm text-center py-4">No hay ventas hoy</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Receipt size={16} className="text-blue-600" />
          Últimas Ventas
        </h3>
        <Link to={RUTAS.ADMIN.VENTAS} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          Ver todas <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {ventas.map((venta) => (
          <div key={venta.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{venta.numero_ticket?.slice(-3) || '---'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatMoneda(venta.total)}</p>
                <p className="text-xs text-gray-400">{venta.cliente_nombre || 'Público General'}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{new Date(venta.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SeccionAlertas({ 
  clientesPendientes, 
  productosStockBajo,
  productosAgotados
}: { 
  clientesPendientes: any[] 
  productosStockBajo: any[]
  productosAgotados: any[]
}) {
  const totalAlertas = clientesPendientes.length + productosStockBajo.length + productosAgotados.length

  if (totalAlertas === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-green-600" />
          Estado del Sistema
        </h3>
        <div className="flex items-center gap-3 text-green-600">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
            <span className="text-sm">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium">Todo al día</p>
            <p className="text-xs text-gray-400">No hay alertas pendientes</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-yellow-600" />
       Atención Requerida
        {totalAlertas > 0 && (
          <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {totalAlertas}
          </span>
        )}
      </h3>
      <div className="space-y-3">
        {clientesPendientes.length > 0 && (
          <Link 
            to={`${RUTAS.ADMIN.CLIENTES}?filtro=pendientes`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{clientesPendientes.length} clientes pendientes</p>
              <p className="text-xs text-gray-400">de aprobación</p>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </Link>
        )}
        {productosStockBajo.length > 0 && (
          <Link 
            to={`${RUTAS.ADMIN.INVENTARIO}?filtro=stock_bajo`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{productosStockBajo.length} productos</p>
              <p className="text-xs text-gray-400">con stock bajo</p>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </Link>
        )}
        {productosAgotados.length > 0 && (
          <Link 
            to={`${RUTAS.ADMIN.INVENTARIO}?filtro=agotado`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{productosAgotados.length} productos</p>
              <p className="text-xs text-gray-400">agotados</p>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </Link>
        )}
      </div>
    </div>
  )
}

function SeccionUltimasCompras({ compras }: { compras: any[] }) {
  if (compras.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart size={16} className="text-purple-600" />
          Últimas Compras
        </h3>
        <p className="text-gray-400 text-sm text-center py-4">No hay compras hoy</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart size={16} className="text-purple-600" />
          Últimas Compras
        </h3>
        <Link to={RUTAS.ADMIN.COMPRAS} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          Ver todas <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {compras.map((compra) => (
          <div key={compra.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <ShoppingCart size={14} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatMoneda(compra.total)}</p>
                <p className="text-xs text-gray-400">{compra.proveedor_nombre || 'Proveedor'}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{new Date(compra.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const {
    comparativaAyer,
    horaPico,
    ultimasCompras,
    clientesPendientes,
    productosStockBajo,
    productosAgotados,
    ultimasVentas,
    ticketPromedio,
    totalVentasHoy,
    totalComprasHoy,
    metodoPagoMasUsado,
    cargando
  } = useDashboard()

  const fechaHoy = new Date().toLocaleDateString('es-PE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  })

  if (cargando) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Buenos días 👋
          </h1>
          <p className="text-sm text-gray-500 capitalize">{fechaHoy}</p>
        </div>
        <Link 
          to={RUTAS.ADMIN.POS} 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <DollarSign size={18} />
          <span>Nueva Venta</span>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <TarjetaKPI
          icono={DollarSign}
          valor={formatMoneda(totalVentasHoy)}
          label="Ventas hoy"
          color="blue"
          comparacion={comparativaAyer}
          sublabel="vs yesterday"
        />
        <TarjetaKPI
          icono={ShoppingCart}
          valor={formatMoneda(totalComprasHoy)}
          label="Compras hoy"
          color="purple"
        />
        <TarjetaKPI
          icono={Receipt}
          valor={formatMoneda(ticketPromedio)}
          label="Ticket promedio"
          color="green"
          sublabel={`${metodoPagoMasUsado !== '-' ? metodoPagoMasUsado : ''}`}
        />
        <TarjetaKPI
          icono={Clock}
          valor={horaPico}
          label="Hora pico"
          color="yellow"
          sublabel="mayor movimiento"
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <TarjetaKPI
          icono={Users}
          valor={clientesPendientes.length}
          label="Pendientes"
          color={clientesPendientes.length > 0 ? 'yellow' : 'gray'}
          sublabel="clientes"
        />
        <TarjetaKPI
          icono={Package}
          valor={productosStockBajo.length}
          label="Stock bajo"
          color={productosStockBajo.length > 0 ? 'red' : 'gray'}
          sublabel="productos"
        />
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SeccionUltimasVentas ventas={ultimasVentas} />
        <SeccionUltimasCompras compras={ultimasCompras} />
      </div>

      {/* Alertas */}
      <SeccionAlertas 
        clientesPendientes={clientesPendientes} 
        productosStockBajo={productosStockBajo}
        productosAgotados={productosAgotados}
      />
    </div>
  )
}
