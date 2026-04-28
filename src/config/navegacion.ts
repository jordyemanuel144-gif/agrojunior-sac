import type { LucideIcon } from 'lucide-react'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Truck, 
  Users, 
  Warehouse, 
  BarChart3, 
  Settings, 
  User,
  DollarSign,
  FileText,
  ClipboardList
} from 'lucide-react'
import { RUTAS } from './rutas'

export interface ItemNavegacion {
  ruta: string
  label: string
  icono: LucideIcon
  adminOnly: boolean
}

export const NAVEGACION: ItemNavegacion[] = [
  { ruta: RUTAS.ADMIN.DASHBOARD, label: 'Dashboard', icono: LayoutDashboard, adminOnly: false },
  { ruta: RUTAS.ADMIN.POS, label: 'Punto de Venta', icono: ShoppingCart, adminOnly: false },
  { ruta: RUTAS.ADMIN.VENTAS, label: 'Ventas', icono: Receipt, adminOnly: false },
  { ruta: RUTAS.ADMIN.COBRANZAS, label: 'Cobranzas', icono: DollarSign, adminOnly: false },
  { ruta: RUTAS.ADMIN.COMPROBANTES, label: 'Comprobantes', icono: FileText, adminOnly: false },
  { ruta: RUTAS.ADMIN.PRODUCTOS, label: 'Productos', icono: Package, adminOnly: true },
  { ruta: RUTAS.ADMIN.INVENTARIO, label: 'Inventario', icono: Warehouse, adminOnly: false },
  { ruta: RUTAS.ADMIN.INVENTARIO_CONTEO, label: 'Ajuste de Inventario', icono: ClipboardList, adminOnly: true },
  { ruta: RUTAS.ADMIN.COMPRAS, label: 'Compras', icono: Package, adminOnly: true },
  { ruta: RUTAS.ADMIN.PROVEEDORES, label: 'Proveedores', icono: Truck, adminOnly: true },
  { ruta: RUTAS.ADMIN.CLIENTES, label: 'Clientes', icono: Users, adminOnly: false },
  { ruta: RUTAS.ADMIN.REPORTES, label: 'Reportes', icono: BarChart3, adminOnly: true },
  { ruta: RUTAS.ADMIN.CONFIGURACION, label: 'Configuración', icono: Settings, adminOnly: true },
  { ruta: RUTAS.ADMIN.PERFIL, label: 'Mi Perfil', icono: User, adminOnly: false },
]

export const NAVEGACION_MOVIL: ItemNavegacion[] = [
  { ruta: RUTAS.ADMIN.DASHBOARD, label: 'Dashboard', icono: LayoutDashboard, adminOnly: false },
  { ruta: RUTAS.ADMIN.POS, label: 'POS', icono: ShoppingCart, adminOnly: false },
  { ruta: RUTAS.ADMIN.VENTAS, label: 'Ventas', icono: Receipt, adminOnly: false },
  { ruta: RUTAS.ADMIN.COBRANZAS, label: 'Cobranzas', icono: DollarSign, adminOnly: false },
  { ruta: RUTAS.ADMIN.PRODUCTOS, label: 'Productos', icono: Package, adminOnly: true },
]