import { type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
  tamano?: 'sm' | 'md' | 'lg' | 'xl'
}

const tamanos = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ abierto, onCerrar, titulo, children, tamano = 'md' }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    
    if (abierto) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [abierto])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <dialog
      ref={dialogRef}
      className={`
        fixed inset-0 m-auto p-0 rounded-2xl backdrop:bg-black/50 backdrop:inset-0
        w-[calc(100%-2rem)] ${tamanos[tamano]} max-h-[90vh] overflow-hidden
        data-[closing]:animate-fade-out data-[open]:animate-fade-in
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="flex flex-col max-h-[90vh]">
        {titulo && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
            <button
              onClick={onCerrar}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </dialog>
  )
}