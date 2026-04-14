import { LayoutPublico } from '@/components/layout/LayoutPublico'
import { Hero } from './components/Hero'
import { SeccionProductos } from './components/SeccionProductos'
import { SeccionContacto } from './components/SeccionContacto'

export default function LandingPage() {
  return (
    <LayoutPublico>
      <Hero />
      <SeccionProductos />
      <SeccionContacto />
    </LayoutPublico>
  )
}
