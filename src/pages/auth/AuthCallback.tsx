import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { RUTAS } from '@/config/rutas'
import { LayoutPublico } from '@/components/layout/LayoutPublico'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const handleCallback = async () => {
      try {
        let session = (await supabase.auth.getSession()).data.session

        console.log('[AuthCallback] Session:', session ? 'YES' : 'NO')

        if (!session) {
          if (isMounted) setError('No se pudo completar la autenticación')
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        console.log('[AuthCallback] User:', user?.email)

        if (!user?.email) {
          if (isMounted) setError('No se pudo obtener el email del usuario')
          return
        }

        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        console.log('[AuthCallback] Cliente existente:', !!clienteExistente)

        if (clienteExistente) {
          if (isMounted) navigate(RUTAS.CLIENTE.MI_CUENTA)
          return
        }

        const nombre = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]

        const { error: createError } = await supabase
          .from('clientes')
          .insert({
            nombre,
            email: user.email,
            telefono: '',
            tipo: 'minorista',
            pendiente_aprobacion: true,
            activo: true,
          })

        if (createError) {
          console.error('[AuthCallback] Error al crear cliente:', createError)
          
          if (createError.code === '23505') {
            console.log('[AuthCallback] Cliente ya existe, buscando...')
            const { data: existing } = await supabase
              .from('clientes')
              .select('*')
              .eq('email', user.email)
              .maybeSingle()
            
            if (existing && isMounted) {
              navigate(RUTAS.CLIENTE.MI_CUENTA)
              return
            }
          }
          
          if (isMounted) setError('Error al crear cuenta: ' + createError.message)
          return
        }

        if (isMounted) navigate(RUTAS.CLIENTE.MI_CUENTA)

      } catch (err) {
        console.error('[AuthCallback] Error:', err)
        if (isMounted) setError('Error al procesar la autenticación')
      }
    }

    handleCallback()

    return () => {
      isMounted = false
    }
  }, [navigate])

  if (error) {
    return (
      <LayoutPublico>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-500">{error}</p>
            <a
              href={RUTAS.CLIENTE.LOGIN}
              className="mt-6 inline-block px-6 py-3 bg-primary text-neutral-900 font-bold rounded-xl hover:bg-primary-hover transition-colors"
            >
              Volver al login
            </a>
          </div>
        </div>
      </LayoutPublico>
    )
  }

  return (
    <LayoutPublico>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900">Completando autenticación...</h2>
          <p className="mt-2 text-gray-500">Por favor espera</p>
        </div>
      </div>
    </LayoutPublico>
  )
}