import { type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
}

export function Modal({ abierto, onCerrar, titulo, children }: Props) {
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
        fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
        md:flex md:items-center md:justify-center
        w-full md:w-auto md:max-w-lg
        p-0 rounded-t-3xl md:rounded-2xl
        backdrop:bg-black/50 backdrop:inset-0
        max-h-[85vh] md:max-h-[90vh] overflow-hidden
        data-[closing]:animate-fade-out data-[open]:animate-fade-in
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="flex flex-col max-h-[85vh] md:max-h-[90vh] bg-white w-full md:w-auto">
        {titulo && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
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