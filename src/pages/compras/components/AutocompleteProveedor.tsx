// AutocompleteProveedor - Buscador profesional con autocompletado para proveedores
import { useState, useEffect, useRef } from 'react'
import { Building2, Search, X, Check } from 'lucide-react'
import { proveedoresService } from '@/services/proveedores.service'
import type { Proveedor } from '@/types/proveedor.types'

interface Props {
  proveedorId: string | null
  onProveedorChange: (id: string) => void
}

export function AutocompleteProveedor({ proveedorId, onProveedorChange }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Proveedor[]>([])
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const [cargando, setCargando] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    proveedoresService.obtenerTodos().then(data => {
      setProveedores(data)
      setCargando(false)
      if (proveedorId) {
        const prov = data.find(p => p.id === proveedorId)
        if (prov) setBusqueda(prov.nombre)
      }
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.trim()) {
        const filtrados = proveedores.filter(p =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.ruc.includes(busqueda)
        )
        setResultados(filtrados.slice(0, 8))
      } else {
        setResultados(proveedores.slice(0, 8))
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [busqueda, proveedores])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMostrarDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const seleccionarProveedor = (proveedor: Proveedor) => {
    onProveedorChange(proveedor.id)
    setBusqueda(proveedor.nombre)
    setMostrarDropdown(false)
  }

  const limpiarSeleccion = () => {
    onProveedorChange('')
    setBusqueda('')
    setResultados(proveedores.slice(0, 8))
    inputRef.current?.focus()
  }

  if (cargando) {
    return (
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Building2 size={18} className="text-blue-600" />
        Proveedor <span className="text-red-500">*</span>
      </label>
      
      <div className={`relative rounded-xl border-2 transition-all ${
        mostrarDropdown ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
      }`}>
        <div className="flex items-center bg-white rounded-xl">
          <div className="pl-3 text-gray-400">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onFocus={() => {
              setMostrarDropdown(true)
              if (!busqueda) setResultados(proveedores.slice(0, 8))
            }}
            placeholder="Buscar proveedor por nombre o RUC..."
            className="flex-1 px-3 py-3 text-base bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          />
          {busqueda && (
            <button
              onClick={limpiarSeleccion}
              className="pr-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Dropdown de resultados */}
        {mostrarDropdown && resultados.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
            {resultados.map(proveedor => (
              <button
                key={proveedor.id}
                onClick={() => seleccionarProveedor(proveedor)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  proveedorId === proveedor.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{proveedor.nombre}</p>
                  <p className="text-xs text-gray-500">RUC: {proveedor.ruc}</p>
                </div>
                {proveedorId === proveedor.id && (
                  <Check size={18} className="text-blue-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        )}

        {mostrarDropdown && resultados.length === 0 && busqueda && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">No se encontraron proveedores</p>
          </div>
        )}
      </div>

      {!proveedorId && (
        <p className="text-xs text-amber-600 mt-1">Selecciona un proveedor para continuar</p>
      )}
    </div>
  )
}
