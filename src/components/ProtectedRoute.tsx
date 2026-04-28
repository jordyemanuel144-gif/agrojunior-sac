import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

type Role = 'admin' | 'vendedor' | 'cliente' | 'all'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ children, allowedRoles = ['admin', 'vendedor', 'cliente'] }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    if (allowedRoles.includes('cliente')) {
      return <Navigate to="/mi-cuenta/login" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes('all') && !allowedRoles.includes(user.role)) {
    if (user.role === 'cliente') {
      return <Navigate to="/mi-cuenta" replace />
    }
    return <Navigate to="/admin/pos" replace />
  }

  return <>{children}</>
}
