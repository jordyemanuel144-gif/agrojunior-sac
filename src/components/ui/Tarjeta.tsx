import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function Tarjeta({ children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function TarjetaHeader({ children, className = '' }: Props) {
  return (
    <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

export function TarjetaCuerpo({ children, className = '' }: Props) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  )
}

export function TarjetaPie({ children, className = '' }: Props) {
  return (
    <div className={`px-4 py-3 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}