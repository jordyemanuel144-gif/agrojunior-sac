import html2canvas from 'html2canvas'

export async function generarImagenDesdeElemento(
  elementId: string,
  options?: {
    scale?: number
    backgroundColor?: string
  }
): Promise<string> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Elemento no encontrado')

  const canvas = await html2canvas(element, {
    scale: options?.scale ?? 2,
    backgroundColor: options?.backgroundColor ?? '#ffffff',
    useCORS: true,
    logging: false,
  })

  return canvas.toDataURL('image/png')
}

export function descargarImagen(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

export async function compartirImagenWhatsApp(dataUrl: string, mensaje: string) {
  const mensajeEncoded = encodeURIComponent(mensaje)
  
  if (dataUrl) {
    const base64Data = dataUrl.split(',')[1]
    if (base64Data) {
      const blob = await fetch(dataUrl).then(r => r.blob())
      const blobUrl = URL.createObjectURL(blob)
      window.open(`${blobUrl}`, '_blank')
    }
  }
  
  window.open(`https://wa.me/?text=${mensajeEncoded}`, '_blank')
}