/**
 * Types auto-generados del schema de Supabase.
 * Reflejan las 17 tablas definidas en database/01_schema.sql
 *
 * FASE SUPABASE: Estos types se regeneran con:
 *   npx supabase gen types typescript --project-id <id> > src/types/supabase.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RolUsuario = 'admin' | 'vendedor'
export type TipoCliente = 'minorista' | 'mayorista' | 'especial'
export type TipoMedida = 'kg' | 'unidad'
export type MetodoPago = 'efectivo' | 'yape' | 'transferencia'
export type EstadoVenta = 'completada' | 'anulada'
export type EstadoPago = 'pagado' | 'parcial' | 'pendiente'
export type EstadoCompra = 'completada' | 'anulada' | 'pendiente'
export type TipoMovimiento = 'entrada' | 'salida'
export type MotivoMovimiento = 'venta' | 'compra' | 'merma' | 'regalo' | 'correccion' | 'ajuste'
export type EstadoConteo = 'borrador' | 'completado' | 'anulado'
export type TipoComprobante = 'venta' | 'pago_cobranza'
export type EstadoComprobante = 'activo' | 'anulado'
export type SunatTipoDocumento = 'boleta' | 'factura' | 'nota_venta' | 'nota_credito' | 'nota_debito'
export type SunatEstado = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado'

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categorias']['Row']>
      }

      productos: {
        Row: {
          id: string
          codigo: string
          nombre: string
          categoria_id: string
          tipo_medida: TipoMedida
          precio_costo: number
          precio_minorista: number
          precio_mayorista: number
          precio_especial: number
          stock_actual: number
          stock_minimo: number
          imagen_url: string | null
          destacado: boolean
          tag: 'oferta' | 'nuevo' | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['productos']['Row']>
      }

      producto_precios_historial: {
        Row: {
          id: string
          producto_id: string
          precio_costo: number
          precio_minorista: number
          precio_mayorista: number
          precio_especial: number
          motivo: string | null
          usuario_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['producto_precios_historial']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['producto_precios_historial']['Row']>
      }

      clientes: {
        Row: {
          id: string
          nombre: string
          dni_ruc: string | null
          telefono: string | null
          email: string | null
          tipo: TipoCliente
          pendiente_aprobacion: boolean
          activo: boolean
          auth_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clientes']['Row']>
      }

      proveedores: {
        Row: {
          id: string
          nombre: string
          ruc: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          contacto: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['proveedores']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['proveedores']['Row']>
      }

      usuarios: {
        Row: {
          id: string
          email: string
          name: string
          role: RolUsuario
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['usuarios']['Row']>
      }

      ventas: {
        Row: {
          id: string
          ticket_numero: string
          cliente_id: string | null
          vendedor_id: string
          metodo_pago: MetodoPago
          subtotal: number
          descuento: number
          igv: number
          total: number
          monto_pagado: number
          estado_pago: EstadoPago
          estado: EstadoVenta
          fecha: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ventas']['Row'], 'id' | 'ticket_numero' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ventas']['Row']>
      }

      venta_items: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['venta_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['venta_items']['Row']>
      }

      venta_pagos: {
        Row: {
          id: string
          venta_id: string
          monto: number
          metodo_pago: MetodoPago
          observaciones: string | null
          usuario_id: string
          fecha: string
        }
        Insert: Omit<Database['public']['Tables']['venta_pagos']['Row'], 'id' | 'fecha'>
        Update: Partial<Database['public']['Tables']['venta_pagos']['Row']>
      }

      compras: {
        Row: {
          id: string
          numero: string
          proveedor_id: string
          usuario_id: string
          subtotal: number
          igv: number
          total: number
          estado: EstadoCompra
          notas: string | null
          fecha: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['compras']['Row'], 'id' | 'numero' | 'created_at'>
        Update: Partial<Database['public']['Tables']['compras']['Row']>
      }

      compra_items: {
        Row: {
          id: string
          compra_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          total: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['compra_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['compra_items']['Row']>
      }

      movimientos_inventario: {
        Row: {
          id: string
          producto_id: string
          tipo: TipoMovimiento
          cantidad: number
          motivo: MotivoMovimiento
          notas: string | null
          usuario_id: string
          documento_tipo: 'venta' | 'compra' | 'conteo' | null
          documento_id: string | null
          fecha: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['movimientos_inventario']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['movimientos_inventario']['Row']>
      }

      conteos_inventario: {
        Row: {
          id: string
          numero: string
          usuario_id: string
          estado: EstadoConteo
          notas: string | null
          fecha: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conteos_inventario']['Row'], 'id' | 'numero' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conteos_inventario']['Row']>
      }

      conteo_items: {
        Row: {
          id: string
          conteo_id: string
          producto_id: string
          stock_sistema: number
          stock_fisico: number
          diferencia: number
        }
        Insert: Omit<Database['public']['Tables']['conteo_items']['Row'], 'id' | 'diferencia'>
        Update: Partial<Omit<Database['public']['Tables']['conteo_items']['Row'], 'diferencia'>>
      }

      comprobantes: {
        Row: {
          id: string
          numero: string
          tipo: TipoComprobante
          estado: EstadoComprobante
          cliente_id: string | null
          cliente_nombre: string
          cliente_documento: string | null
          cliente_tipo: string | null
          cliente_telefono: string | null
          venta_id: string | null
          subtotal: number | null
          descuento: number | null
          igv: number | null
          total: number
          metodo_pago: string | null
          datos_pago: Json | null
          vendedor_nombre: string | null
          usuario_nombre: string | null
          sunat_tipo_documento: SunatTipoDocumento | null
          sunat_serie: string | null
          sunat_correlativo: string | null
          sunat_hash: string | null
          sunat_estado: SunatEstado | null
          sunat_respuesta: Json | null
          sunat_fecha_envio: string | null
          sunat_pdf_url: string | null
          sunat_xml_url: string | null
          fecha: string
          hora: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comprobantes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comprobantes']['Row']>
      }

      configuracion: {
        Row: {
          id: string
          clave: string
          valor: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['configuracion']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['configuracion']['Row']>
      }
    }

    Views: {
      vista_cuentas_corrientes: {
        Row: {
          cliente_id: string
          cliente_nombre: string
          cliente_dni_ruc: string | null
          cliente_telefono: string | null
          cliente_tipo: TipoCliente
          total_deuda: number
          total_pagado: number
          saldo_pendiente: number
          cantidad_ventas_pendientes: number
          total_ventas_sin_descuento: number
          ultima_venta_fecha: string | null
          ultima_venta_monto: number | null
        }
      }
      vista_stock: {
        Row: {
          id: string
          nombre: string
          codigo: string
          stock_actual: number
          stock_minimo: number
          tipo_medida: TipoMedida
          categoria: string
          estado: 'ok' | 'bajo' | 'agotado'
        }
      }
      vista_resumen_cobranzas: {
        Row: {
          total_deuda: number
          total_pendiente: number
          cantidad_clientes_con_deuda: number
          cantidad_ventas_pendientes: number
        }
      }
      vista_dashboard_hoy: {
        Row: {
          total_ventas: number
          total_ingresos: number
          promedio_venta: number
          venta_mas_alta: number
          ventas_pendientes: number
          ventas_pagadas: number
        }
      }
    }

    Functions: {
      crear_venta: {
        Args: {
          p_cliente_id?: string
          p_vendedor_id?: string
          p_metodo_pago?: string
          p_subtotal?: number
          p_descuento?: number
          p_igv?: number
          p_total?: number
          p_monto_pagado?: number
          p_estado_pago?: string
          p_items?: Json
        }
        Returns: Json
      }
      crear_compra: {
        Args: {
          p_proveedor_id: string
          p_usuario_id: string
          p_subtotal?: number
          p_igv?: number
          p_total?: number
          p_notas?: string
          p_items?: Json
        }
        Returns: Json
      }
      registrar_pago_cobranza: {
        Args: {
          p_cliente_id: string
          p_monto: number
          p_metodo_pago: string
          p_observaciones?: string
          p_usuario_id?: string
          p_ventas_ids?: string[]
        }
        Returns: Json
      }
      crear_conteo: {
        Args: {
          p_productos?: Json
        }
        Returns: Json
      }
      completar_conteo: {
        Args: {
          p_conteo_id: string
          p_usuario_id: string
        }
        Returns: Json
      }
      obtener_estadisticas: {
        Args: {
          p_fecha_inicio?: string
          p_fecha_fin?: string
        }
        Returns: Json
      }
    }
  }
}