import { useState, useEffect, useCallback } from 'react'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import type { CuentaCorriente, ResumenCuentasPorCobrar } from '@/types/cuenta-corriente.types'
import type { Venta } from '@/types/venta.types'
import type { NuevoVentaPago } from '@/types/venta-pago.types'

interface Filtros {
  busqueda: string
}

export function useCobranzas() {
  const [cuentas, setCuentas] = useState<CuentaCorriente[]>([])
  const [resumen, setResumen] = useState<ResumenCuentasPorCobrar | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({ busqueda: '' })
  const [cargando, setCargando] = useState(true)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [cuentasData, resumenData] = await Promise.all([
        cuentaCorrienteService.obtenerTodas(),
        cuentaCorrienteService.obtenerResumen(),
      ])
      setCuentas(cuentasData)
      setResumen(resumenData)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const cuentasFiltradas = cuentas.filter(cuenta => {
    if (!filtros.busqueda) return true
    const busq = filtros.busqueda.toLowerCase()
    return (
      cuenta.cliente_nombre.toLowerCase().includes(busq) ||
      cuenta.cliente_dni_ruc?.toLowerCase().includes(busq) ||
      cuenta.cliente_telefono?.includes(busq)
    )
  })

  return {
    cuentas: cuentasFiltradas,
    todasLasCuentas: cuentas,
    resumen,
    filtros,
    setFiltros,
    recargar: cargarDatos,
    cargando,
  }
}

export function useDetalleCobranza(clienteId: string) {
  const [cuenta, setCuenta] = useState<CuentaCorriente | null>(null)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!clienteId) return
    setCargando(true)
    Promise.all([
      cuentaCorrienteService.obtenerPorCliente(clienteId),
      cuentaCorrienteService.obtenerVentasPendientes(clienteId),
    ])
      .then(([cuentaData, ventasData]) => {
        setCuenta(cuentaData)
        setVentas(ventasData)
      })
      .finally(() => setCargando(false))
  }, [clienteId])

  const registrarPago = async (datos: {
    ventasSeleccionadas: string[]
    monto: number
    metodo_pago: NuevoVentaPago['metodo_pago']
    observaciones?: string
    usuario_id: string
  }) => {
    const pagos = await cuentaCorrienteService.registrarPago(clienteId, datos)
    const [cuentaActualizada, ventasActualizadas] = await Promise.all([
      cuentaCorrienteService.obtenerPorCliente(clienteId),
      cuentaCorrienteService.obtenerVentasPendientes(clienteId),
    ])
    setCuenta(cuentaActualizada)
    setVentas(ventasActualizadas)
    return pagos
  }

  return {
    cuenta,
    ventas,
    cargando,
    recargar: () => {
      if (!clienteId) return
      Promise.all([
        cuentaCorrienteService.obtenerPorCliente(clienteId),
        cuentaCorrienteService.obtenerVentasPendientes(clienteId),
      ]).then(([cuentaData, ventasData]) => {
        setCuenta(cuentaData)
        setVentas(ventasData)
      })
    },
    registrarPago,
  }
}
