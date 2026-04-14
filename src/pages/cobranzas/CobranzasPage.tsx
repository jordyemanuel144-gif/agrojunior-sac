import { useCobranzas } from './hooks/useCobranzas'
import { HeaderCobranzas } from './components/HeaderCobranzas'
import { FiltrosCobranzas } from './components/FiltrosCobranzas'
import { ResumenCobranzas } from './components/ResumenCobranzas'
import { ListaCuentasCorrientes } from './components/ListaCuentasCorrientes'
import { ModalRegistrarPago } from './components/ModalRegistrarPago'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CobranzasPage() {
  const navigate = useNavigate()
  const { cuentas, resumen, filtros, setFiltros, recargar, cargando } = useCobranzas()
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null)
  const [cuentaActualizada, setCuentaActualizada] = useState<string | null>(null)

  const abrirPago = (clienteId: string) => {
    setClienteSeleccionado(clienteId)
    setModalPagoAbierto(true)
  }

  const cerrarPago = () => {
    const clientePagado = clienteSeleccionado
    setModalPagoAbierto(false)
    setClienteSeleccionado(null)
    recargar()
    if (clientePagado) {
      setCuentaActualizada(clientePagado)
      setTimeout(() => setCuentaActualizada(null), 2500)
    }
  }

  const verDetalle = (clienteId: string) => {
    navigate(`/clientes/${clienteId}`)
  }

  return (
    <>
      <HeaderCobranzas />

      <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-4">
        {resumen && <ResumenCobranzas resumen={resumen} />}

        <FiltrosCobranzas
          filtros={filtros}
          onChange={setFiltros}
        />

        <ListaCuentasCorrientes
          cuentas={cuentas}
          cargando={cargando}
          onPagar={abrirPago}
          onVerDetalle={verDetalle}
          cuentaActualizada={cuentaActualizada}
        />
      </div>

      {modalPagoAbierto && clienteSeleccionado && (
        <ModalRegistrarPago
          clienteId={clienteSeleccionado}
          onCerrar={cerrarPago}
        />
      )}
    </>
  )
}
