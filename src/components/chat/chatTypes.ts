export type ChatMode = 'public' | 'admin'

export type MessageSender = 'user' | 'bot'

export interface QuickAction {
  label: string
  intent: string
}

export interface ChatMessage {
  id: string
  sender: MessageSender
  text: string
  timestamp: Date
  quickActions?: QuickAction[]
}

export interface ChatState {
  messages: ChatMessage[]
  mode: ChatMode
  isTyping: boolean
}

export type IntentType =
  // Public intents
  | 'precios'
  | 'precios-angus'
  | 'precios-holstein'
  | 'precios-menudencia'
  | 'precios-lote'
  | 'horarios'
  | 'direccion'
  | 'yape'
  | 'telefono'
  | 'saludar'
  | 'ayuda'
  // Admin intents
  | 'stock'
  | 'stock-bajo'
  | 'ventas-hoy'
  | 'consultar-cliente'
  | 'deuda-cliente'
  | 'enviar-deuda'
  | 'listar-deudores'
  | 'navegar'
  // System
  | 'desconocido'

export interface IntentResult {
  type: IntentType
  confidence: number
  text: string
  action?: string
  data?: Record<string, unknown>
}

export interface ChatResponse {
  text: string
  quickActions?: QuickAction[]
  action?: string
  data?: Record<string, unknown>
}
