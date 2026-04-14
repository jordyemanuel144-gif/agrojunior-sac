import { useReportes } from './hooks/useReportes'
import { ResumenKPI } from './components/TarjetasKPI'
import { FiltrosFecha } from './components/FiltrosFecha'
import { GraficoBarras } from './components/GraficoBarras'
import { GraficoCircular } from './components/GraficoCircular'
import { GraficoVentasCompras } from './components/GraficoVentasCompras'

export default function Reportes() {
  const {
    ventasFiltradas,
    comprasFiltradas,
    filtro,
    estadisticas,
    ventasPorProducto,
    ingresosPorProducto,
    ventasVsComprasPorDia,
    ventasPorMetodoPago,
    actualizarFiltro,
  } = useReportes()

  const tieneDatosVentas = ventasFiltradas.length > 0
  const tieneDatosCompras = comprasFiltradas.length > 0
  const tieneDatos = tieneDatosVentas || tieneDatosCompras

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reportes del Negocio</h1>
          <p className="text-sm text-gray-500">Resumen de ventas, compras y ganancias</p>
        </div>
        <FiltrosFecha filtro={filtro} onCambiar={actualizarFiltro} />
      </div>

      {/* KPIs Principales */}
      <ResumenKPI estadisticas={estadisticas} />

      {tieneDatos ? (
        <div className="space-y-6">
          {/* Gráfico Principal */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Evolución de Ingresos vs Gastos</h2>
            <GraficoVentasCompras 
              datos={ventasVsComprasPorDia} 
              titulo="" 
            />
          </div>

          {/* Gráficos secundarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Métodos de Pago</h2>
              <GraficoCircular datos={ventasPorMetodoPago} titulo="" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Productos Más Vendidos</h2>
              <GraficoBarras datos={ventasPorProducto} titulo="" color="#2563eb" />
            </div>
          </div>

          {/* Productos por ingresos */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Ingresos por Producto</h2>
            <GraficoBarras datos={ingresosPorProducto} titulo="" color="#22c55e" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay datos en el período seleccionado</p>
          <p className="text-gray-400 text-sm mt-1">Cambia el filtro de fecha para ver resultados</p>
        </div>
      )}
    </div>
  )
}
