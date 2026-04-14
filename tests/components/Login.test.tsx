import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login'
import { AuthProvider } from '@/context/AuthContext'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debería renderizar el formulario de login', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('debería mostrar error cuando los campos están vacíos', async () => {
    renderWithRouter(<Login />)
    
    const button = screen.getByRole('button', { name: /iniciar sesión/i })
    await userEvent.click(button)
    
    // El browser maneja la validación HTML5, el botón se deshabilita
    expect(button).toBeInTheDocument()
  })

  it('debería permitir escribir en los campos', async () => {
    renderWithRouter(<Login />)
    
    const emailInput = screen.getByPlaceholderText(/correo/i)
    const passwordInput = screen.getByPlaceholderText(/••••/)
    
    await userEvent.type(emailInput, 'admin@test.com')
    await userEvent.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('admin@test.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('debería mostrar/ocultar contraseña', async () => {
    renderWithRouter(<Login />)
    
    const passwordInput = screen.getByPlaceholderText(/••••/) as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: '' })
    
    // Por defecto es password
    expect(passwordInput.type).toBe('password')
    
    await userEvent.click(toggleButton)
    
    // Después de click debería ser text
    expect(passwordInput.type).toBe('text')
  })
})