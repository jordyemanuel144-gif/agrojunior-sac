// IndicadorProgreso - Muestra 3 pasos con estado actual y completado
// Usado en el header del formulario de nueva compra

import { Check } from 'lucide-react'
import type { Paso } from '../hooks/useCompra'

interface Props {
  pasoActual: Paso
}

const pasos = [
  { numero: 1, label: 'Proveedor' },
  { numero: 2, label: 'Productos' },
  { numero: 3, label: 'Confirmar' },
]

export function IndicadorProgreso({ pasoActual }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {pasos.map((paso, index) => {
        const esCompletado = paso.numero < pasoActual
        const esActual = paso.numero === pasoActual

        return (
          <div key={paso.numero} className="flex items-center">
            {/* Punto del paso */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  esCompletado
                    ? 'bg-green-500 text-white'
                    : esActual
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {esCompletado ? <Check size={20} /> : paso.numero}
              </div>
              <span
                className={`text-xs mt-1 font-medium hidden sm:block ${
                  esActual ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {paso.label}
              </span>
            </div>

            {/* Línea conectora */}
            {index < pasos.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-1 mx-2 rounded ${
                  esCompletado ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
