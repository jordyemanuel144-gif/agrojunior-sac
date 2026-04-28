-- ============================================================
-- SAM JOSÉ AVÍCOLA — Índices y Row Level Security
-- Ejecutar DESPUÉS de 02_functions_triggers.sql
-- ============================================================

-- ─── ÍNDICES DE RENDIMIENTO ────────────────────────────────

-- Ventas: las queries más frecuentes del sistema
CREATE INDEX idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id) WHERE cliente_id IS NOT NULL;
CREATE INDEX idx_ventas_vendedor ON ventas(vendedor_id);
CREATE INDEX idx_ventas_pendientes ON ventas(estado_pago, cliente_id)
  WHERE estado = 'completada' AND estado_pago != 'pagado';

-- Venta items: JOINs frecuentes con ventas y productos
CREATE INDEX idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX idx_venta_items_producto ON venta_items(producto_id);

-- Pagos: búsqueda por venta
CREATE INDEX idx_venta_pagos_venta ON venta_pagos(venta_id);

-- Productos: filtros comunes
CREATE INDEX idx_productos_categoria ON productos(categoria_id) WHERE activo = true;
CREATE INDEX idx_productos_activo ON productos(activo) WHERE activo = true;
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_stock_bajo ON productos(stock_actual, stock_minimo)
  WHERE activo = true;

-- Historial precios: consultas por producto
CREATE INDEX idx_precios_historial_producto ON producto_precios_historial(producto_id, created_at DESC);

-- Movimientos inventario: historial por producto
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id, fecha DESC);
CREATE INDEX idx_movimientos_documento ON movimientos_inventario(documento_tipo, documento_id);

-- Compras
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_fecha ON compras(fecha DESC);
CREATE INDEX idx_compra_items_compra ON compra_items(compra_id);

-- Conteos
CREATE INDEX idx_conteo_items_conteo ON conteo_items(conteo_id);

-- Comprobantes
CREATE INDEX idx_comprobantes_cliente ON comprobantes(cliente_id);
CREATE INDEX idx_comprobantes_tipo ON comprobantes(tipo);
CREATE INDEX idx_comprobantes_fecha ON comprobantes(fecha DESC);
CREATE INDEX idx_comprobantes_venta ON comprobantes(venta_id) WHERE venta_id IS NOT NULL;
CREATE INDEX idx_comprobantes_sunat ON comprobantes(sunat_estado)
  WHERE sunat_tipo_documento IS NOT NULL;

-- Clientes
CREATE INDEX idx_clientes_tipo ON clientes(tipo) WHERE activo = true;
CREATE INDEX idx_clientes_auth ON clientes(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Configuración
CREATE INDEX idx_configuracion_clave ON configuracion(clave);


-- ─── ROW LEVEL SECURITY (RLS) ──────────────────────────────

-- Habilitar RLS en todas las tablas
-- Nota: usuarios NO tiene RLS porque auth.users.id = usuarios.id (misma FK).
-- El usuario solo puede tener UNA fila en usuarios. SECURITY DEFINER en
-- auth_user_role() evita la dependencia circular. Se gestiona a nivel app.
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_precios_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- ─── Función helper: obtener rol del usuario autenticado ───
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Función helper: obtener cliente_id del usuario autenticado ─
CREATE OR REPLACE FUNCTION auth_cliente_id()
RETURNS UUID AS $$
  SELECT id FROM clientes WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══ POLÍTICAS: CATEGORÍAS ═════════════════════════════════
-- Lectura: todos los autenticados
CREATE POLICY categorias_select ON categorias
  FOR SELECT TO authenticated USING (true);
-- Escritura: solo admin
CREATE POLICY categorias_admin ON categorias
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: PRODUCTOS ══════════════════════════════════
CREATE POLICY productos_select ON productos
  FOR SELECT TO authenticated USING (true);
-- También lectura pública para catálogo (anon)
CREATE POLICY productos_public ON productos
  FOR SELECT TO anon USING (activo = true);
CREATE POLICY productos_admin ON productos
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: HISTORIAL PRECIOS ══════════════════════════
-- Historial: solo admin puede leer y el trigger inserta automáticamente (no necesita política de insert manual)
CREATE POLICY precios_hist_admin ON producto_precios_historial
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: CLIENTES ═══════════════════════════════════
-- Staff ve todos los clientes
CREATE POLICY clientes_staff ON clientes
  FOR ALL TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
-- Cliente solo ve su propio registro
CREATE POLICY clientes_self ON clientes
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
-- Update propio (editar perfil)
CREATE POLICY clientes_self_update ON clientes
  FOR UPDATE TO authenticated USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ═══ POLÍTICAS: PROVEEDORES ════════════════════════════════
CREATE POLICY proveedores_select ON proveedores
  FOR SELECT TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY proveedores_admin ON proveedores
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: USUARIOS ═══════════════════════════════════
-- Todos los usuarios autenticados pueden leer su propio perfil
CREATE POLICY usuarios_self ON usuarios
  FOR SELECT TO authenticated USING (id = auth.uid());
-- Solo admins pueden hacer todo (no hay selección por rol)
CREATE POLICY usuarios_admin ON usuarios
  FOR ALL TO authenticated USING (id = auth.uid() AND (SELECT role FROM usuarios WHERE id = auth.uid()) = 'admin');

-- ═══ POLÍTICAS: VENTAS ═════════════════════════════════════
-- Staff ve todas
CREATE POLICY ventas_staff ON ventas
  FOR SELECT TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
-- Staff crea ventas
CREATE POLICY ventas_crear ON ventas
  FOR INSERT TO authenticated WITH CHECK (auth_user_role() IN ('admin', 'vendedor'));
-- Solo admin anula
CREATE POLICY ventas_anular ON ventas
  FOR UPDATE TO authenticated USING (auth_user_role() = 'admin');
-- Cliente ve solo sus ventas
CREATE POLICY ventas_cliente ON ventas
  FOR SELECT TO authenticated USING (cliente_id = auth_cliente_id());

-- ═══ POLÍTICAS: VENTA ITEMS ════════════════════════════════
-- Staff: SELECT y UPDATE (INSERT solo via RPC crear_venta)
CREATE POLICY venta_items_staff_select ON venta_items
  FOR SELECT TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY venta_items_staff_update ON venta_items
  FOR UPDATE TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY venta_items_cliente ON venta_items
  FOR SELECT TO authenticated USING (
    venta_id IN (SELECT id FROM ventas WHERE cliente_id = auth_cliente_id())
  );

-- ═══ POLÍTICAS: PAGOS ══════════════════════════════════════
-- Staff: SELECT, INSERT, UPDATE (DELETE no permitido)
CREATE POLICY pagos_staff_select ON venta_pagos
  FOR SELECT TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY pagos_staff_insert ON venta_pagos
  FOR INSERT TO authenticated WITH CHECK (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY pagos_staff_update ON venta_pagos
  FOR UPDATE TO authenticated USING (auth_user_role() = 'admin');
CREATE POLICY pagos_cliente ON venta_pagos
  FOR SELECT TO authenticated USING (
    venta_id IN (SELECT id FROM ventas WHERE cliente_id = auth_cliente_id())
  );

-- ═══ POLÍTICAS: COMPRAS ════════════════════════════════════
CREATE POLICY compras_admin ON compras
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');
CREATE POLICY compras_items_admin ON compra_items
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: INVENTARIO ═════════════════════════════════
CREATE POLICY movimientos_staff ON movimientos_inventario
  FOR SELECT TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY movimientos_insert ON movimientos_inventario
  FOR INSERT TO authenticated WITH CHECK (auth_user_role() IN ('admin', 'vendedor'));

CREATE POLICY conteos_admin ON conteos_inventario
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');
CREATE POLICY conteo_items_admin ON conteo_items
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');

-- ═══ POLÍTICAS: COMPROBANTES ═══════════════════════════════
CREATE POLICY comprobantes_staff ON comprobantes
  FOR ALL TO authenticated USING (auth_user_role() IN ('admin', 'vendedor'));
CREATE POLICY comprobantes_cliente ON comprobantes
  FOR SELECT TO authenticated USING (cliente_id = auth_cliente_id());

-- ═══ POLÍTICAS: CONFIGURACIÓN ══════════════════════════════
CREATE POLICY config_read ON configuracion
  FOR SELECT TO authenticated USING (true);
CREATE POLICY config_admin ON configuracion
  FOR ALL TO authenticated USING (auth_user_role() = 'admin');
