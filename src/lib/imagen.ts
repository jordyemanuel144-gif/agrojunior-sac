import html2canvas from 'html2canvas'

export async function generarImagenDesdeElemento(
  elementId: string,
  options?: {
    scale?: number
    backgroundColor?: string
  }
): Promise<string> {
  console.log('buscando elemento con ID:', elementId)
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Elemento no encontrado:', elementId)
    throw new Error('Elemento no encontrado: ' + elementId)
  }

  console.log('Elemento encontrado')

  // Crear contenedor para generar imagen limpia
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 600px;
    background: white;
    padding: 20px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #000;
  `
  
  // Obtener datos del comprobante desde el elemento
  const fecha = element.querySelector('.text-gray-500')?.textContent?.split('•')?.[1]?.trim() || ''
  const cliente = element.querySelector('.font-medium.text-gray-900')?.textContent || ''
  
  // Obtener items y totales
  const itemsContainer = element.querySelector('.space-y-2')
  const items: string[] = []
  if (itemsContainer) {
    itemsContainer.querySelectorAll('.flex.justify-between').forEach(item => {
      const nombre = item.querySelector('.text-gray-900')?.textContent || ''
      const precio = item.querySelector('.font-medium')?.textContent || ''
      if (nombre) items.push(`${nombre}  ${precio}`)
    })
  }
  
  // Obtener total
  const totalElement = element.querySelector('.text-blue-600, .text-lg.font-bold')
  const total = totalElement?.textContent || ''
  
  // Construir HTML limpio sin clases de Tailwind
  container.innerHTML = `
    <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <div style="font-size: 18px; font-weight: bold;">SAM JOSÉ AVÍCOLA</div>
      <div style="font-size: 12px; opacity: 0.8;">RUC: 20601234567</div>
      <div style="font-size: 12px; opacity: 0.8;">Av. Principal 123, Arequipa</div>
    </div>
    <div style="padding: 20px; border: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: #6b7280;">
        <span>${fecha}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; color: #6b7280;">Cliente:</div>
        <div style="font-weight: bold;">${cliente}</div>
      </div>
      <div style="border-top: 1px dashed #e5e7eb; padding-top: 15px; margin-top: 15px;">
        ${items.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            ${item.split('  ').map(t => `<span>${t}</span>`).join('')}
          </div>
        `).join('')}
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
          <span>TOTAL</span>
          <span style="color: #2563eb;">${total}</span>
        </div>
      </div>
      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
        ✦ GRACIAS POR SU COMPRA ✦
      </div>
    </div>
  `
  
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: options?.scale ?? 2,
      backgroundColor: '#ffffff',
      useCORS: false,
      logging: false,
    })
    
    const dataUrl = canvas.toDataURL('image/png')
    document.body.removeChild(container)
    return dataUrl
  } catch (err) {
    console.error('Error en html2canvas:', err)
    document.body.removeChild(container)
    throw err
  }
}

export function descargarImagen(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}