// HistorialVentas - Lista todas las ventas con filtros por rol
import { Receipt } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FiltrosVentas } from './components/FiltrosVentas'
import { ListaVentas } from './components/ListaVentas'
import { useHistorialVentas } from './hooks/useHistorialVentas'

export default function HistorialVentas() {
  const {
    ventas,
    loading,
    busqueda,
    filtroEstado,
    filtroPago,
    filtroFecha,
    rangoPersonalizado,
    filtroVendedor,
    vendedores,
    esAdmin,
    completadas,
    totalDia,
    anuladas,
    setBusqueda,
    setFiltroEstado,
    setFiltroPago,
    setFiltroFecha,
    setRangoPersonalizado,
    setFiltroVendedor,
  } = useHistorialVentas()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        titulo="Historial de Ventas"
        icono={Receipt}
        stats={[
          { label: 'Total día', value: `S/ ${totalDia.toFixed(2)}`, color: 'gray' },
          { label: 'Completadas', value: completadas, color: 'green' },
          { label: 'Anuladas', value: anuladas, color: 'red' },
        ]}
      />

      <div className="max-w-screen-xl mx-auto">
        <FiltrosVentas
          busqueda={busqueda}
          filtroEstado={filtroEstado}
          filtroPago={filtroPago}
          filtroFecha={filtroFecha}
          rangoPersonalizado={rangoPersonalizado}
          filtroVendedor={filtroVendedor}
          vendedores={vendedores}
          esAdmin={esAdmin}
          onBusquedaChange={setBusqueda}
          onEstadoChange={setFiltroEstado}
          onPagoChange={setFiltroPago}
          onFechaChange={setFiltroFecha}
          onRangoChange={setRangoPersonalizado}
          onVendedorChange={setFiltroVendedor}
        />

        <ListaVentas ventas={ventas} />
      </div>
    </div>
  )
}
