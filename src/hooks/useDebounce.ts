import { useState, useEffect } from 'react'

export function useDebounce<T>(valor: T, delay: number = 300): T {
  const [valorDebounced, setValorDebounced] = useState<T>(valor)

  useEffect(() => {
    const timer = setTimeout(() => {
      setValorDebounced(valor)
    }, delay)

    return () => clearTimeout(timer)
  }, [valor, delay])

  return valorDebounced
}