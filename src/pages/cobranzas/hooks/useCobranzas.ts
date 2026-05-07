import { useState, useEffect, useCallback, useMemo } from 'react'
import { cuentaCorrienteService } from '@/services/cuenta-corriente.service'
import type { CuentaCorriente, ResumenCuentasPorCobrar } from '@/types/cuenta-corriente.types'
import type { Venta } from '@/types/venta.types'
import type { NuevoVentaPago } from '@/types/venta-pago.types'

type FiltroOrden = 'fecha' | 'deuda' | 'nombre' | 'antiguo'

interface Filtros {
  busqueda: string
  orden: FiltroOrden
}

export function useCobranzas() {
  const [cuentas, setCuentas] = useState<CuentaCorriente[]>([])
  const [resumen, setResumen] = useState<ResumenCuentasPorCobrar | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({ busqueda: '', orden: 'fecha' })
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

  const cuentasFiltradas = useMemo(() => {
    let result = cuentas.filter(c => c.saldo_pendiente > 0)
    
    if (filtros.busqueda) {
      const busq = filtros.busqueda.toLowerCase()
      result = result.filter(c =>
        c.cliente_nombre.toLowerCase().includes(busq) ||
        c.cliente_dni_ruc?.toLowerCase().includes(busq) ||
        c.cliente_telefono?.includes(busq)
      )
    }

    // Ordenar según selección
    switch (filtros.orden) {
      case 'deuda':
        result.sort((a, b) => b.saldo_pendiente - a.saldo_pendiente)
        break
      case 'nombre':
        result.sort((a, b) => a.cliente_nombre.localeCompare(b.cliente_nombre))
        break
      case 'antiguo':
        result.sort((a, b) => {
          const fechaA = a.ultima_venta_fecha?.getTime() || 0
          const fechaB = b.ultima_venta_fecha?.getTime() || 0
          return fechaA - fechaB
        })
        break
      case 'fecha':
      default:
        result.sort((a, b) => {
          const fechaA = a.ultima_venta_fecha?.getTime() || 0
          const fechaB = b.ultima_venta_fecha?.getTime() || 0
          return fechaB - fechaA
        })
    }

    return result
  }, [cuentas, filtros.busqueda, filtros.orden])

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
