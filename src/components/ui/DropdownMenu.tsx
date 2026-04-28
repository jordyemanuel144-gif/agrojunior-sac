import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
}

interface DropdownMenuProps {
  trigger: ReactNode
  options: DropdownOption[]
  align?: 'left' | 'right'
}

const ALTURA_MENU = 140

export function DropdownMenu({ trigger, options, align = 'left' }: DropdownMenuProps) {
  const [abierto, setAbierto] = useState(false)
  const [haciaArriba, setHaciaArriba] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }

    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAbierto(false)
      }
    }

    if (abierto) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [abierto])

  useEffect(() => {
    if (abierto && dropdownRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect()
      const espacioAbajo = window.innerHeight - triggerRect.bottom
      
      setHaciaArriba(espacioAbajo < ALTURA_MENU)
    } else {
      setHaciaArriba(false)
    }
  }, [abierto])

  const handleToggle = () => {
    setAbierto(!abierto)
  }

  const handleOptionClick = (onClick: () => void) => {
    onClick()
    setAbierto(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={handleToggle}
        className="inline-flex items-center justify-center cursor-pointer"
      >
        {trigger}
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        />
      </div>

      {abierto && (
        <div 
          className={`absolute z-50 min-w-[160px] bg-white rounded-xl shadow-lg border border-gray-100 animate-dropdown-fade-in
            ${haciaArriba ? 'bottom-full mb-1' : 'top-full mt-1'}
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {options.map((opcion, idx) => (
            <button
              key={idx}
              onClick={() => !opcion.disabled && handleOptionClick(opcion.onClick)}
              disabled={opcion.disabled}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl
                ${opcion.disabled 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : 'hover:bg-gray-50 text-gray-700 active:bg-gray-100'
                }
                ${idx === 0 ? '' : 'border-t border-gray-50'}
              `}
            >
              {opcion.icon && (
                <span className="w-4 h-4 flex items-center justify-center text-gray-400">
                  {opcion.icon}
                </span>
              )}
              <span className="font-medium">{opcion.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}