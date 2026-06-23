import { useCobranzas } from './hooks/useCobranzas'
import { HeaderCobranzas } from './components/HeaderCobranzas'
import { FiltrosCobranzas } from './components/FiltrosCobranzas'
import { ResumenCobranzas } from './components/ResumenCobranzas'
import { ListaCuentasCorrientes } from './components/ListaCuentasCorrientes'
import { ModalRegistrarPago } from './components/ModalRegistrarPago'
import { ToastPagoRegistrado } from './components/ToastPagoRegistrado'
import { descargarTexto, descargarImagen, descargarPdf } from '@/lib/deuda'
import { formatMoneda } from '@/lib/utils'
import { generarLinkWhatsApp, generarMensajeDeuda } from '@/lib/whatsapp'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ventasService } from '@/services/ventas.service'

export default function CobranzasPage() {
  const navigate = useNavigate()
  const { cuentas, resumen, filtros, setFiltros, recargar, cargando } = useCobranzas()
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null)
  const [cuentaActualizada, setCuentaActualizada] = useState<string | null>(null)
  const [pagoRegistrado, setPagoRegistrado] = useState<{ comprobanteId: string } | null>(null)

  const abrirPago = (clienteId: string) => {
    setClienteSeleccionado(clienteId)
    setModalPagoAbierto(true)
  }

  const cerrarPago = (result?: { comprobanteId: string }) => {
    const clientePagado = clienteSeleccionado
    setModalPagoAbierto(false)
    setClienteSeleccionado(null)
    recargar()
    if (clientePagado) {
      setCuentaActualizada(clientePagado)
      setTimeout(() => setCuentaActualizada(null), 2500)
    }
    if (result?.comprobanteId) {
      setPagoRegistrado({ comprobanteId: result.comprobanteId })
    }
  }

  useEffect(() => {
    if (pagoRegistrado) {
      const timer = setTimeout(() => setPagoRegistrado(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [pagoRegistrado])

  const verDetalle = (clienteId: string) => {
    navigate(`/admin/cobranzas/${clienteId}`)
  }

  const abrirWhatsApp = async (clienteId: string) => {
    const cuenta = cuentas.find(c => c.cliente_id === clienteId)
    if (!cuenta) return

    if (!cuenta.cliente_telefono) {
      alert('El cliente no tiene teléfono registrado. Usa el botón Descargar para guardar el número.')
      return
    }

    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === clienteId && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )

    const mensaje = generarMensajeDeuda(cuenta.cliente_nombre, cuenta.saldo_pendiente, ventasPendientes)

    const link = generarLinkWhatsApp(cuenta.cliente_telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleDescargar = async (_cuenta: import('@/types/cuenta-corriente.types').CuentaCorriente, tipo: 'texto' | 'imagen' | 'pdf') => {
    const todasVentas = await ventasService.obtenerTodos()
    const ventasPendientes = todasVentas.filter(
      v => v.cliente_id === _cuenta.cliente_id && 
      v.estado === 'completada' && 
      v.estado_pago !== 'pagado'
    )
    
    if (tipo === 'texto') {
      descargarTexto(_cuenta, ventasPendientes)
    } else if (tipo === 'imagen') {
      descargarImagen(_cuenta, ventasPendientes)
    } else {
      descargarPdf(_cuenta, ventasPendientes)
    }
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
          onWhatsApp={abrirWhatsApp}
          onDescargar={(cuenta, tipo) => handleDescargar(cuenta, tipo)}
          cuentaActualizada={cuentaActualizada}
        />
      </div>

      {modalPagoAbierto && clienteSeleccionado && (
        <ModalRegistrarPago
          clienteId={clienteSeleccionado}
          onCerrar={cerrarPago}
        />
      )}

      {pagoRegistrado && (
        <ToastPagoRegistrado
          comprobanteId={pagoRegistrado.comprobanteId}
          onCerrar={() => setPagoRegistrado(null)}
        />
      )}
    </>
  )
}
