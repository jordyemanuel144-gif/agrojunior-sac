import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debería renderizar children cuando hay usuario autenticado', () => {
    const user = { id: '1', name: 'Test', email: 'test@test.com', role: 'admin' as const, active: true, created_at: '', updated_at: '' }
    localStorage.setItem('samjose_session', JSON.stringify(user))
    
    renderWithAuth(
      <ProtectedRoute>
        <div data-testid="protected-content">Contenido Protegido</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})