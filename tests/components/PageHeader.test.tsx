import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Package } from 'lucide-react'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PageHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar título', () => {
    renderWithRouter(<PageHeader titulo="Test Title" icono={Package} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('debería renderizar con stats', () => {
    renderWithRouter(
      <PageHeader 
        titulo="Test" 
        icono={Package}
        stats={[
          { label: 'Total', value: 10, color: 'blue' },
          { label: 'Activos', value: 5, color: 'green' },
        ]}
      />
    )
    
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('debería renderizar sin fecha cuando fecha=false', () => {
    renderWithRouter(
      <PageHeader titulo="Test" icono={Package} fecha={false} />
    )
    
    const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    expect(screen.queryByText(today)).not.toBeInTheDocument()
  })

  it('debería renderizar con fecha por defecto', () => {
    renderWithRouter(<PageHeader titulo="Test" icono={Package} />)
    
    const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    expect(screen.getByText(today)).toBeInTheDocument()
  })
})