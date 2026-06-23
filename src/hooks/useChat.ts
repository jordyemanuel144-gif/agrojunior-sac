import { useState, useCallback, useRef } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { classifyIntent, getWelcomeMessage } from '@/components/chat/chatEngine'
import { resolveIntent } from '@/components/chat/chatResolvers'
import { generarId } from '@/lib/utils'
import { askGemini, hasGeminiKey, GEMINI_RATE_LIMITED } from '@/lib/gemini'
import type { GeminiMessage } from '@/lib/gemini'
import type { ChatMessage, ChatMode, ChatResponse, QuickAction, IntentType } from '@/components/chat/chatTypes'

export interface UseChatReturn {
  messages: ChatMessage[]
  isOpen: boolean
  isProcessing: boolean
  mode: ChatMode
  unreadCount: number
  quickActions: QuickAction[]
  toggleChat: () => void
  closeChat: () => void
  sendMessage: (text: string) => void
  handleQuickAction: (intent: string, label?: string) => void
  handleNavigateTo: (route: string) => void
}

const ROUTE_PATHS: Record<string, string> = {
  dashboard: '/admin/dashboard',
  inventario: '/admin/inventario',
  cobranzas: '/admin/cobranzas',
  clientes: '/admin/clientes',
  reportes: '/admin/reportes',
  pos: '/admin/pos',
  ventas: '/admin/ventas',
  compras: '/admin/compras',
  proveedores: '/admin/proveedores',
  configuracion: '/admin/configuracion',
  perfil: '/admin/perfil',
}

/**
 * Orquestador del chatbot.
 *
 * Responsabilidades (y SOLO estas): estado de la UI, clasificar el texto,
 * delegar la resolución al registro de resolvers, y el fallback a Gemini para
 * lo no reconocido. La lógica de negocio vive en chatEngine y chatResolvers.
 */
export function useChat(): UseChatReturn {
  const { isAdmin, isVendedor, loading } = useAuthContext()
  const mode: ChatMode = !loading && (isAdmin || isVendedor) ? 'admin' : 'public'

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getWelcomeMessage(mode)])
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen
  const modeRef = useRef(mode)
  modeRef.current = mode
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  // Quick actions shown = those attached to the latest bot message
  const quickActions: QuickAction[] = (() => {
    const botMessages = messages.filter((m) => m.sender === 'bot')
    return botMessages[botMessages.length - 1]?.quickActions ?? []
  })()

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) setUnreadCount(0)
      return next
    })
  }, [])

  const closeChat = useCallback(() => setIsOpen(false), [])

  const handleNavigateTo = useCallback((route: string) => {
    const target = ROUTE_PATHS[route.toLowerCase()] ?? `/${route}`
    try {
      window.location.href = target
    } catch {
      // jsdom (tests) no soporta navegación — no-op
    }
  }, [])

  // ── Gemini: solo para lo no reconocido, con historial conversacional ──
  function buildGeminiHistory(): GeminiMessage[] {
    return messagesRef.current.slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }))
  }

  async function resolveWithGemini(text: string): Promise<ChatResponse> {
    const ruleFallback = () => resolveIntent('desconocido', { text, mode: modeRef.current })

    if (!hasGeminiKey()) return ruleFallback()

    const geminiText = await askGemini(text, buildGeminiHistory())

    if (geminiText === GEMINI_RATE_LIMITED) {
      return {
        text: '⏳ El asistente de IA está temporalmente saturado (plan gratuito: 15 consultas/min). Esperá unos segundos, o elegí una opción:',
        quickActions: [
          { label: '📋 Precios', intent: 'precios' },
          { label: '🕐 Horarios', intent: 'horarios' },
          { label: '📍 Dirección', intent: 'direccion' },
          { label: '📞 Contacto', intent: 'telefono' },
        ],
      }
    }
    if (geminiText) return { text: geminiText }
    return ruleFallback()
  }

  // ── Núcleo: clasifica/resuelve y publica la respuesta ─────────────────
  async function processIntent(intent: IntentType, text: string, allowGemini: boolean) {
    let response: ChatResponse
    try {
      response =
        intent === 'desconocido' && allowGemini
          ? await resolveWithGemini(text)
          : await resolveIntent(intent, { text, mode: modeRef.current })
    } catch (err) {
      console.error('[useChat] Error resolving intent:', err)
      response = { text: 'Hubo un problema al consultar los datos. Intentá de nuevo.' }
    }

    const botMessage: ChatMessage = {
      id: generarId(),
      sender: 'bot',
      text: response.text,
      timestamp: new Date(),
      quickActions: response.quickActions,
    }

    setMessages((prev) => [...prev, botMessage])
    setIsProcessing(false)

    if (response.action === 'navegar' && typeof response.data?.ruta === 'string') {
      setTimeout(() => handleNavigateTo(response.data!.ruta as string), 800)
    }

    if (!isOpenRef.current) setUnreadCount((prev) => prev + 1)
  }

  function pushUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: generarId(), sender: 'user', text, timestamp: new Date() }])
    setIsProcessing(true)
  }

  // ── sendMessage (texto escrito) → Gemini permitido para desconocido ───
  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    pushUserMessage(trimmed)
    const intent = classifyIntent(trimmed, modeRef.current)
    processIntent(intent, trimmed, true)
  }, [])

  // ── handleQuickAction (botón) → determinístico, sin Gemini ────────────
  const handleQuickAction = useCallback((intentStr: string, label?: string) => {
    const intent = intentStr as IntentType
    pushUserMessage(label || intentStr)
    processIntent(intent, intentStr, false)
  }, [])

  return {
    messages,
    isOpen,
    isProcessing,
    mode,
    unreadCount,
    quickActions,
    toggleChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    handleNavigateTo,
  }
}
