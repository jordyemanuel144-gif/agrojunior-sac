-- ============================================================
-- SAM JOSÉ AVÍCOLA — Schema Principal
-- Ejecutar en Supabase SQL Editor en orden
-- ============================================================

-- ─── SECUENCIAS ─────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ventas_ticket_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS compras_numero_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS conteos_numero_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS comprobante_venta_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS comprobante_pago_seq START WITH 1;

-- ─── 1. CATEGORÍAS ─────────────────────────────────────────
CREATE TABLE categorias (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL UNIQUE,
  activo     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE categorias IS 'Agrupación de productos (Pollo, Huevos, Cerdo, etc.)';

-- ─── 2. PRODUCTOS ──────────────────────────────────────────
CREATE TABLE productos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo           TEXT NOT NULL UNIQUE,
  nombre           TEXT NOT NULL,
  categoria_id     UUID NOT NULL REFERENCES categorias(id),
  tipo_medida      TEXT NOT NULL CHECK (tipo_medida IN ('kg', 'unidad')),
  precio_costo     NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_minorista NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_mayorista NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_especial  NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_actual     NUMERIC(10,3) NOT NULL DEFAULT 0,
  stock_minimo     NUMERIC(10,3) NOT NULL DEFAULT 0,
  imagen_url       TEXT,
  destacado        BOOLEAN NOT NULL DEFAULT false,
  tag              TEXT CHECK (tag IN ('oferta', 'nuevo') OR tag IS NULL),
  activo           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE productos IS 'Catálogo de productos con 3 niveles de precio según tipo de cliente';
COMMENT ON COLUMN productos.stock_actual IS 'NUMERIC(10,3) porque se vende pollo por kg con decimales';

-- ─── 3. HISTORIAL DE PRECIOS ───────────────────────────────
CREATE TABLE producto_precios_historial (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id      UUID NOT NULL REFERENCES productos(id),
  precio_costo     NUMERIC(10,2) NOT NULL,
  precio_minorista NUMERIC(10,2) NOT NULL,
  precio_mayorista NUMERIC(10,2) NOT NULL,
  precio_especial  NUMERIC(10,2) NOT NULL,
  motivo           TEXT,
  usuario_id       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE producto_precios_historial IS 'Historial de cambios de precio para análisis de márgenes. Los precios del pollo fluctúan constantemente.';

-- ─── 4. CLIENTES ───────────────────────────────────────────
CREATE TABLE clientes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre               TEXT NOT NULL,
  dni_ruc              TEXT,
  telefono             TEXT,
  email                TEXT UNIQUE,
  tipo                 TEXT NOT NULL DEFAULT 'minorista'
                       CHECK (tipo IN ('minorista', 'mayorista', 'especial')),
  pendiente_aprobacion BOOLEAN NOT NULL DEFAULT true,
  activo               BOOLEAN NOT NULL DEFAULT true,
  auth_user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE clientes IS 'Clientes del negocio. auth_user_id vincula con Supabase Auth para portal de clientes.';
COMMENT ON COLUMN clientes.auth_user_id IS 'Nullable: no todos los clientes tienen cuenta web';

-- ─── 5. PROVEEDORES ────────────────────────────────────────
CREATE TABLE proveedores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  ruc        TEXT,
  telefono   TEXT,
  email      TEXT,
  direccion  TEXT,
  contacto   TEXT,
  activo     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE proveedores IS 'Proveedores de mercadería (granjas avícolas, distribuidores)';

-- ─── 6. USUARIOS (STAFF) ──────────────────────────────────
CREATE TABLE usuarios (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'vendedor'
             CHECK (role IN ('admin', 'vendedor')),
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE usuarios IS 'Staff del negocio (admin/vendedor). PK = auth.users.id. Clientes NO van aquí.';

-- ─── 7. VENTAS ─────────────────────────────────────────────
CREATE TABLE ventas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_numero TEXT NOT NULL UNIQUE
                DEFAULT 'SAM-' || lpad(nextval('ventas_ticket_seq')::text, 5, '0'),
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  vendedor_id   UUID NOT NULL REFERENCES usuarios(id),
  metodo_pago   TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'yape', 'transferencia')),
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  descuento     NUMERIC(10,2) NOT NULL DEFAULT 0,
  igv           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  monto_pagado  NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado_pago   TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (estado_pago IN ('pagado', 'parcial', 'pendiente')),
  estado        TEXT NOT NULL DEFAULT 'completada'
                CHECK (estado IN ('completada', 'anulada')),
  fecha         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ventas IS 'Transacciones de venta. cliente_id NULL = venta a Público General.';

-- ─── 8. ITEMS DE VENTA ─────────────────────────────────────
CREATE TABLE venta_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id        UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id     UUID NOT NULL REFERENCES productos(id),
  cantidad        NUMERIC(10,3) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE venta_items IS 'Detalle normalizado de cada venta. Reemplaza el JSON embebido del mock.';

-- ─── 9. PAGOS DE VENTA ─────────────────────────────────────
CREATE TABLE venta_pagos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id      UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  monto         NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo_pago   TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'yape', 'transferencia')),
  observaciones TEXT,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  fecha         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE venta_pagos IS 'Abonos parciales/totales a ventas pendientes. Para cobranzas.';

-- ─── 10. COMPRAS ───────────────────────────────────────────
CREATE TABLE compras (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero       TEXT NOT NULL UNIQUE
               DEFAULT 'C-' || lpad(nextval('compras_numero_seq')::text, 5, '0'),
  proveedor_id UUID NOT NULL REFERENCES proveedores(id),
  usuario_id   UUID NOT NULL REFERENCES usuarios(id),
  subtotal     NUMERIC(10,2) NOT NULL DEFAULT 0,
  igv          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado       TEXT NOT NULL DEFAULT 'completada'
               CHECK (estado IN ('completada', 'anulada', 'pendiente')),
  notas        TEXT,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE compras IS 'Registro de compras a proveedores';

-- ─── 11. ITEMS DE COMPRA ───────────────────────────────────
CREATE TABLE compra_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id       UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id     UUID NOT NULL REFERENCES productos(id),
  cantidad        NUMERIC(10,3) NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  total           NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE compra_items IS 'Detalle normalizado de cada compra';

-- ─── 12. MOVIMIENTOS DE INVENTARIO ─────────────────────────
CREATE TABLE movimientos_inventario (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id    UUID NOT NULL REFERENCES productos(id),
  tipo           TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad       NUMERIC(10,3) NOT NULL CHECK (cantidad > 0),
  motivo         TEXT NOT NULL
                 CHECK (motivo IN ('venta', 'compra', 'merma', 'regalo', 'correccion', 'ajuste')),
  notas          TEXT,
  usuario_id     UUID NOT NULL REFERENCES usuarios(id),
  documento_tipo TEXT CHECK (documento_tipo IN ('venta', 'compra', 'conteo') OR documento_tipo IS NULL),
  documento_id   UUID,
  fecha          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE movimientos_inventario IS 'Log inmutable de todo movimiento de stock. Base para trazabilidad.';

-- ─── 13. CONTEOS DE INVENTARIO ─────────────────────────────
CREATE TABLE conteos_inventario (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero     TEXT NOT NULL UNIQUE
             DEFAULT 'INV-' || lpad(nextval('conteos_numero_seq')::text, 4, '0'),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  estado     TEXT NOT NULL DEFAULT 'borrador'
             CHECK (estado IN ('borrador', 'completado', 'anulado')),
  notas      TEXT,
  fecha      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE conteos_inventario IS 'Inventario físico. Borrador → Completado genera ajustes de stock.';

-- ─── 14. ITEMS DE CONTEO ───────────────────────────────────
CREATE TABLE conteo_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conteo_id     UUID NOT NULL REFERENCES conteos_inventario(id) ON DELETE CASCADE,
  producto_id   UUID NOT NULL REFERENCES productos(id),
  stock_sistema NUMERIC(10,3) NOT NULL,
  stock_fisico  NUMERIC(10,3) NOT NULL,
  diferencia    NUMERIC(10,3) GENERATED ALWAYS AS (stock_fisico - stock_sistema) STORED
);

COMMENT ON COLUMN conteo_items.diferencia IS 'Columna computada: imposible que se desincronice.';

-- ─── 15. COMPROBANTES (con campos SUNAT) ───────────────────
CREATE TABLE comprobantes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            TEXT NOT NULL UNIQUE,
  tipo              TEXT NOT NULL CHECK (tipo IN ('venta', 'pago_cobranza')),
  estado            TEXT NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'anulado')),

  -- Datos del cliente (desnormalizados — documento histórico)
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre    TEXT NOT NULL DEFAULT 'Público General',
  cliente_documento TEXT,
  cliente_tipo      TEXT,
  cliente_telefono  TEXT,

  -- Referencia al documento origen
  venta_id          UUID REFERENCES ventas(id) ON DELETE SET NULL,

  -- Montos
  subtotal          NUMERIC(10,2) DEFAULT 0,
  descuento         NUMERIC(10,2) DEFAULT 0,
  igv               NUMERIC(10,2) DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  metodo_pago       TEXT,

  -- Datos de pago cobranza (flexible)
  datos_pago        JSONB,

  -- Quién emitió
  vendedor_nombre   TEXT,
  usuario_nombre    TEXT,

  -- ─── Campos SUNAT ───
  sunat_tipo_documento  TEXT CHECK (sunat_tipo_documento IN (
    'boleta', 'factura', 'nota_venta', 'nota_credito', 'nota_debito'
  ) OR sunat_tipo_documento IS NULL),
  sunat_serie           TEXT,
  sunat_correlativo     TEXT,
  sunat_hash            TEXT,
  sunat_estado          TEXT CHECK (sunat_estado IN (
    'pendiente', 'enviado', 'aceptado', 'rechazado', 'anulado'
  ) OR sunat_estado IS NULL),
  sunat_respuesta       JSONB,
  sunat_fecha_envio     TIMESTAMPTZ,
  sunat_pdf_url         TEXT,
  sunat_xml_url         TEXT,

  fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),
  hora              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE comprobantes IS 'Documento impreso/digital. Desnormaliza datos a propósito: es un registro histórico inmutable.';
COMMENT ON COLUMN comprobantes.sunat_tipo_documento IS 'Tipo de comprobante SUNAT. NULL si aún no se integra.';

-- ─── 16. CONFIGURACIÓN ─────────────────────────────────────
CREATE TABLE configuracion (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE configuracion IS 'Parámetros del negocio en formato clave-valor JSON';
-- ============================================================
-- SAM JOSÉ AVÍCOLA — Funciones y Triggers
-- Ejecutar DESPUÉS de 01_schema.sql
-- ============================================================

-- ─── FUNCIÓN: updated_at automático ────────────────────────
-- Razón: Evita que el frontend tenga que setear updated_at manualmente.
-- Se aplica a toda tabla que tenga la columna updated_at.
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_ventas_updated_at
  BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ─── FUNCIÓN: Registrar historial de precios ───────────────
-- Razón: Los precios del pollo fluctúan constantemente.
-- Este trigger captura automáticamente cada cambio de precio
-- para análisis de márgenes posteriores.
CREATE OR REPLACE FUNCTION fn_registrar_cambio_precio()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si algún precio cambió realmente
  IF OLD.precio_costo     IS DISTINCT FROM NEW.precio_costo
  OR OLD.precio_minorista IS DISTINCT FROM NEW.precio_minorista
  OR OLD.precio_mayorista IS DISTINCT FROM NEW.precio_mayorista
  OR OLD.precio_especial  IS DISTINCT FROM NEW.precio_especial
  THEN
    INSERT INTO producto_precios_historial (
      producto_id, precio_costo, precio_minorista,
      precio_mayorista, precio_especial, motivo
    ) VALUES (
      NEW.id, OLD.precio_costo, OLD.precio_minorista,
      OLD.precio_mayorista, OLD.precio_especial,
      'Cambio de precio automático'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_producto_precio_historial
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION fn_registrar_cambio_precio();


-- ─── FUNCIÓN: Venta item resta stock ───────────────────────
-- Razón: Al insertar un item de venta, el stock del producto
-- se reduce automáticamente. El frontend no calcula stock.
CREATE OR REPLACE FUNCTION fn_venta_item_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock_actual = stock_actual - NEW.cantidad
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_item_restar_stock
  AFTER INSERT ON venta_items
  FOR EACH ROW EXECUTE FUNCTION fn_venta_item_stock();


-- ─── FUNCIÓN: Anulación de venta devuelve stock ────────────
-- Razón: Cuando una venta cambia de 'completada' a 'anulada',
-- se devuelve todo el stock de sus items automáticamente.
-- También registra movimientos de inventario para trazabilidad.
CREATE OR REPLACE FUNCTION fn_anular_venta_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'completada' AND NEW.estado = 'anulada' THEN
    -- Devolver stock de cada item
    UPDATE productos p
    SET stock_actual = p.stock_actual + vi.cantidad
    FROM venta_items vi
    WHERE vi.venta_id = NEW.id AND p.id = vi.producto_id;

    -- Registrar movimientos de inventario por trazabilidad
    INSERT INTO movimientos_inventario (
      producto_id, tipo, cantidad, motivo, notas,
      usuario_id, documento_tipo, documento_id
    )
    SELECT
      vi.producto_id,
      'entrada',
      vi.cantidad,
      'correccion',
      'Anulación de venta ' || NEW.ticket_numero,
      NEW.vendedor_id,
      'venta',
      NEW.id
    FROM venta_items vi
    WHERE vi.venta_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_anular_venta_devolver_stock
  AFTER UPDATE OF estado ON ventas
  FOR EACH ROW EXECUTE FUNCTION fn_anular_venta_stock();


-- ─── FUNCIÓN: Compra item suma stock ───────────────────────
-- Razón: Al registrar items de una compra, el stock sube
-- automáticamente. Simétrico al trigger de venta.
CREATE OR REPLACE FUNCTION fn_compra_item_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock_actual = stock_actual + NEW.cantidad
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_item_sumar_stock
  AFTER INSERT ON compra_items
  FOR EACH ROW EXECUTE FUNCTION fn_compra_item_stock();


-- ─── FUNCIÓN: Anulación de compra resta stock ──────────────
CREATE OR REPLACE FUNCTION fn_anular_compra_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'completada' AND NEW.estado = 'anulada' THEN
    UPDATE productos p
    SET stock_actual = p.stock_actual - ci.cantidad
    FROM compra_items ci
    WHERE ci.compra_id = NEW.id AND p.id = ci.producto_id;

    INSERT INTO movimientos_inventario (
      producto_id, tipo, cantidad, motivo, notas,
      usuario_id, documento_tipo, documento_id
    )
    SELECT
      ci.producto_id,
      'salida',
      ci.cantidad,
      'correccion',
      'Anulación de compra ' || NEW.numero,
      NEW.usuario_id,
      'compra',
      NEW.id
    FROM compra_items ci
    WHERE ci.compra_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_anular_compra_restar_stock
  AFTER UPDATE OF estado ON compras
  FOR EACH ROW EXECUTE FUNCTION fn_anular_compra_stock();


-- ─── FUNCIÓN: Registrar movimiento de inventario en venta ──
-- Razón: Cada item de venta genera un movimiento de inventario
-- para tener un log completo de trazabilidad.
CREATE OR REPLACE FUNCTION fn_venta_item_movimiento()
RETURNS TRIGGER AS $$
DECLARE
  v_vendedor_id UUID;
BEGIN
  SELECT vendedor_id INTO v_vendedor_id
  FROM ventas WHERE id = NEW.venta_id;

  INSERT INTO movimientos_inventario (
    producto_id, tipo, cantidad, motivo,
    usuario_id, documento_tipo, documento_id
  ) VALUES (
    NEW.producto_id, 'salida', NEW.cantidad, 'venta',
    v_vendedor_id, 'venta', NEW.venta_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_item_movimiento
  AFTER INSERT ON venta_items
  FOR EACH ROW EXECUTE FUNCTION fn_venta_item_movimiento();


-- ─── FUNCIÓN: Registrar movimiento de inventario en compra ─
CREATE OR REPLACE FUNCTION fn_compra_item_movimiento()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  SELECT usuario_id INTO v_usuario_id
  FROM compras WHERE id = NEW.compra_id;

  INSERT INTO movimientos_inventario (
    producto_id, tipo, cantidad, motivo,
    usuario_id, documento_tipo, documento_id
  ) VALUES (
    NEW.producto_id, 'entrada', NEW.cantidad, 'compra',
    v_usuario_id, 'compra', NEW.compra_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_item_movimiento
  AFTER INSERT ON compra_items
  FOR EACH ROW EXECUTE FUNCTION fn_compra_item_movimiento();


-- ─── FUNCIÓN: Actualizar estado_pago de venta al registrar pago ─
-- Razón: Al insertar un pago, recalcula monto_pagado y estado_pago
-- de la venta automáticamente. Elimina lógica del frontend.
CREATE OR REPLACE FUNCTION fn_actualizar_estado_pago_venta()
RETURNS TRIGGER AS $$
DECLARE
  v_total_pagado NUMERIC(10,2);
  v_total_venta  NUMERIC(10,2);
BEGIN
  SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
  FROM venta_pagos WHERE venta_id = NEW.venta_id;

  SELECT total INTO v_total_venta
  FROM ventas WHERE id = NEW.venta_id;

  UPDATE ventas SET
    monto_pagado = v_total_pagado,
    estado_pago = CASE
      WHEN v_total_pagado >= v_total_venta THEN 'pagado'
      WHEN v_total_pagado > 0 THEN 'parcial'
      ELSE 'pendiente'
    END
  WHERE id = NEW.venta_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pago_actualizar_venta
  AFTER INSERT ON venta_pagos
  FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_pago_venta();
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
-- ============================================================
-- SAM JOSÉ AVÍCOLA — Vistas y Funciones RPC
-- Ejecutar DESPUÉS de 03_indexes_rls.sql
-- ============================================================

-- ─── VISTA: Cuentas Corrientes ─────────────────────────────
-- Razón: La cuenta corriente NO es una tabla física.
-- Se calcula en tiempo real sobre ventas pendientes por cliente.
-- Esto garantiza que nunca se desincronice.
CREATE OR REPLACE VIEW vista_cuentas_corrientes AS
SELECT
  c.id                AS cliente_id,
  c.nombre            AS cliente_nombre,
  c.dni_ruc           AS cliente_dni_ruc,
  c.telefono          AS cliente_telefono,
  c.tipo              AS cliente_tipo,
  COALESCE(SUM(v.total), 0)::NUMERIC(10,2)        AS total_deuda,
  COALESCE(SUM(v.monto_pagado), 0)::NUMERIC(10,2) AS total_pagado,
  (COALESCE(SUM(v.total), 0) - COALESCE(SUM(v.monto_pagado), 0))::NUMERIC(10,2)
                                                    AS saldo_pendiente,
  COUNT(v.id)::INT                                  AS cantidad_ventas_pendientes,
  COALESCE(SUM(v.subtotal), 0)::NUMERIC(10,2)     AS total_ventas_sin_descuento,
  MAX(v.fecha)                                      AS ultima_venta_fecha,
  MAX(v.total)::NUMERIC(10,2)                      AS ultima_venta_monto
FROM clientes c
INNER JOIN ventas v
  ON v.cliente_id = c.id
  AND v.estado = 'completada'
  AND v.estado_pago != 'pagado'
GROUP BY c.id, c.nombre, c.dni_ruc, c.telefono, c.tipo
HAVING (COALESCE(SUM(v.total), 0) - COALESCE(SUM(v.monto_pagado), 0)) > 0
ORDER BY saldo_pendiente DESC;


-- ─── VISTA: Stock con estado ───────────────────────────────
-- Razón: Calcula el estado del stock (ok/bajo/agotado) en la BD
-- en vez de hacerlo en el frontend.
CREATE OR REPLACE VIEW vista_stock AS
SELECT
  p.id,
  p.nombre,
  p.codigo,
  p.stock_actual,
  p.stock_minimo,
  p.tipo_medida,
  cat.nombre AS categoria,
  CASE
    WHEN p.stock_actual = 0 THEN 'agotado'
    WHEN p.stock_actual <= p.stock_minimo THEN 'bajo'
    ELSE 'ok'
  END AS estado
FROM productos p
LEFT JOIN categorias cat ON cat.id = p.categoria_id
WHERE p.activo = true
ORDER BY
  CASE
    WHEN p.stock_actual = 0 THEN 0
    WHEN p.stock_actual <= p.stock_minimo THEN 1
    ELSE 2
  END,
  p.nombre;


-- ─── VISTA: Resumen cuentas por cobrar ─────────────────────
CREATE OR REPLACE VIEW vista_resumen_cobranzas AS
SELECT
  COALESCE(SUM(total_deuda), 0)::NUMERIC(10,2)       AS total_deuda,
  COALESCE(SUM(saldo_pendiente), 0)::NUMERIC(10,2)   AS total_pendiente,
  COUNT(*)::INT                                        AS cantidad_clientes_con_deuda,
  COALESCE(SUM(cantidad_ventas_pendientes), 0)::INT   AS cantidad_ventas_pendientes
FROM vista_cuentas_corrientes;


-- ─── VISTA: Dashboard KPIs del día ────────────────────────
CREATE OR REPLACE VIEW vista_dashboard_hoy AS
SELECT
  COUNT(*)::INT                                    AS total_ventas,
  COALESCE(SUM(total), 0)::NUMERIC(10,2)          AS total_ingresos,
  COALESCE(AVG(total), 0)::NUMERIC(10,2)          AS promedio_venta,
  COALESCE(MAX(total), 0)::NUMERIC(10,2)          AS venta_mas_alta,
  COUNT(*) FILTER (WHERE estado_pago = 'pendiente')::INT AS ventas_pendientes,
  COUNT(*) FILTER (WHERE estado_pago = 'pagado')::INT    AS ventas_pagadas
FROM ventas
WHERE fecha::date = CURRENT_DATE
  AND estado = 'completada';


-- ═══════════════════════════════════════════════════════════
-- FUNCIONES RPC (llamadas desde el frontend con supabase.rpc)
-- ═══════════════════════════════════════════════════════════

-- ─── RPC: Crear venta completa (transaccional) ────────────
-- Razón: Una venta involucra insertar en ventas + N items.
-- Debe ser atómico: o todo se guarda o nada.
-- Los triggers se encargan del stock y movimientos.
CREATE OR REPLACE FUNCTION crear_venta(
  p_cliente_id    UUID DEFAULT NULL,
  p_vendedor_id   UUID DEFAULT NULL,
  p_metodo_pago   TEXT DEFAULT 'efectivo',
  p_subtotal      NUMERIC DEFAULT 0,
  p_descuento     NUMERIC DEFAULT 0,
  p_igv           NUMERIC DEFAULT 0,
  p_total         NUMERIC DEFAULT 0,
  p_monto_pagado  NUMERIC DEFAULT 0,
  p_estado_pago   TEXT DEFAULT 'pendiente',
  p_items         JSONB DEFAULT '[]'
)
RETURNS JSON AS $$
DECLARE
  v_venta_id UUID;
  v_ticket   TEXT;
  v_item     JSONB;
BEGIN
  -- Insertar la venta (ticket_numero se genera por DEFAULT de la secuencia)
  INSERT INTO ventas (
    cliente_id, vendedor_id, metodo_pago,
    subtotal, descuento, igv, total,
    monto_pagado, estado_pago
  ) VALUES (
    p_cliente_id, p_vendedor_id, p_metodo_pago,
    p_subtotal, p_descuento, p_igv, p_total,
    p_monto_pagado, p_estado_pago
  )
  RETURNING id, ticket_numero INTO v_venta_id, v_ticket;

  -- Insertar cada item (los triggers restan stock y registran movimientos)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (
      v_venta_id,
      (v_item->>'producto_id')::UUID,
      (v_item->>'cantidad')::NUMERIC,
      (v_item->>'precio_unitario')::NUMERIC,
      (v_item->>'subtotal')::NUMERIC
    );
  END LOOP;

  RETURN json_build_object(
    'id', v_venta_id,
    'ticket_numero', v_ticket
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── RPC: Crear compra completa (transaccional) ───────────
CREATE OR REPLACE FUNCTION crear_compra(
  p_proveedor_id UUID,
  p_usuario_id   UUID,
  p_subtotal     NUMERIC DEFAULT 0,
  p_igv          NUMERIC DEFAULT 0,
  p_total        NUMERIC DEFAULT 0,
  p_notas        TEXT DEFAULT NULL,
  p_items        JSONB DEFAULT '[]'
)
RETURNS JSON AS $$
DECLARE
  v_compra_id UUID;
  v_numero    TEXT;
  v_item      JSONB;
BEGIN
  INSERT INTO compras (
    proveedor_id, usuario_id, subtotal, igv, total, notas
  ) VALUES (
    p_proveedor_id, p_usuario_id, p_subtotal, p_igv, p_total, p_notas
  )
  RETURNING id, numero INTO v_compra_id, v_numero;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO compra_items (compra_id, producto_id, cantidad, precio_unitario, total)
    VALUES (
      v_compra_id,
      (v_item->>'producto_id')::UUID,
      (v_item->>'cantidad')::NUMERIC,
      (v_item->>'precio_unitario')::NUMERIC,
      (v_item->>'total')::NUMERIC
    );
  END LOOP;

  RETURN json_build_object('id', v_compra_id, 'numero', v_numero);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── RPC: Registrar pago de cobranza ──────────────────────
-- Razón: Un pago puede aplicarse a múltiples ventas pendientes.
-- Distribuye el monto desde la venta más antigua a la más reciente.
-- El trigger trg_pago_actualizar_venta actualiza estado_pago.
CREATE OR REPLACE FUNCTION registrar_pago_cobranza(
  p_cliente_id        UUID,
  p_monto             NUMERIC,
  p_metodo_pago       TEXT,
  p_observaciones     TEXT DEFAULT NULL,
  p_usuario_id        UUID DEFAULT NULL,
  p_ventas_ids        UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_venta         RECORD;
  v_monto_rest    NUMERIC := p_monto;
  v_saldo         NUMERIC;
  v_aplicar       NUMERIC;
  v_pagos_count   INT := 0;
  v_usuario_final UUID;
BEGIN
  v_usuario_final := COALESCE(p_usuario_id, auth.uid());

  FOR v_venta IN
    SELECT id, total, monto_pagado
    FROM ventas
    WHERE cliente_id = p_cliente_id
      AND estado = 'completada'
      AND estado_pago != 'pagado'
      AND (p_ventas_ids IS NULL OR id = ANY(p_ventas_ids))
    ORDER BY fecha ASC
  LOOP
    EXIT WHEN v_monto_rest <= 0;

    v_saldo := v_venta.total - v_venta.monto_pagado;
    v_aplicar := LEAST(v_monto_rest, v_saldo);

    IF v_aplicar > 0 THEN
      INSERT INTO venta_pagos (venta_id, monto, metodo_pago, observaciones, usuario_id)
      VALUES (v_venta.id, v_aplicar, p_metodo_pago, p_observaciones, v_usuario_final);

      v_monto_rest := v_monto_rest - v_aplicar;
      v_pagos_count := v_pagos_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'pagos_registrados', v_pagos_count,
    'monto_aplicado', p_monto - v_monto_rest,
    'monto_sobrante', v_monto_rest
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── RPC: Completar conteo de inventario ──────────────────
-- Razón: Al completar un conteo, se ajusta el stock real
-- y se registran movimientos de corrección/merma.
CREATE OR REPLACE FUNCTION completar_conteo(
  p_conteo_id  UUID,
  p_usuario_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_item    RECORD;
  v_tipo    TEXT;
  v_motivo  TEXT;
  v_conteo  TEXT;
  v_count   INT := 0;
BEGIN
  SELECT numero INTO v_conteo
  FROM conteos_inventario WHERE id = p_conteo_id AND estado = 'borrador';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conteo no encontrado o no está en estado borrador';
  END IF;

  FOR v_item IN
    SELECT producto_id, stock_sistema, stock_fisico, diferencia
    FROM conteo_items WHERE conteo_id = p_conteo_id
  LOOP
    IF v_item.diferencia != 0 THEN
      v_tipo := CASE WHEN v_item.diferencia > 0 THEN 'entrada' ELSE 'salida' END;
      v_motivo := CASE WHEN v_item.diferencia > 0 THEN 'correccion' ELSE 'merma' END;

      -- Actualizar stock del producto
      UPDATE productos
      SET stock_actual = v_item.stock_fisico
      WHERE id = v_item.producto_id;

      -- Registrar movimiento
      INSERT INTO movimientos_inventario (
        producto_id, tipo, cantidad, motivo, notas,
        usuario_id, documento_tipo, documento_id
      ) VALUES (
        v_item.producto_id, v_tipo, ABS(v_item.diferencia), v_motivo,
        'Conteo ' || v_conteo, p_usuario_id, 'conteo', p_conteo_id
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  UPDATE conteos_inventario SET estado = 'completado' WHERE id = p_conteo_id;

  RETURN json_build_object('ajustes_realizados', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── RPC: Estadísticas para reportes ──────────────────────
CREATE OR REPLACE FUNCTION obtener_estadisticas(
  p_fecha_inicio TIMESTAMPTZ DEFAULT NULL,
  p_fecha_fin    TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_ventas  JSON;
  v_compras JSON;
BEGIN
  SELECT json_build_object(
    'totalVentas', COUNT(*),
    'totalIngresos', COALESCE(SUM(total), 0),
    'promedioVenta', COALESCE(AVG(total), 0),
    'ventaMasAlta', COALESCE(MAX(total), 0),
    'ventaMasBaja', COALESCE(MIN(total), 0)
  ) INTO v_ventas
  FROM ventas
  WHERE estado = 'completada'
    AND (p_fecha_inicio IS NULL OR fecha >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR fecha <= p_fecha_fin);

  SELECT json_build_object(
    'totalCompras', COUNT(*),
    'totalGastos', COALESCE(SUM(total), 0),
    'promedioCompra', COALESCE(AVG(total), 0),
    'compraMasAlta', COALESCE(MAX(total), 0)
  ) INTO v_compras
  FROM compras
  WHERE estado = 'completada'
    AND (p_fecha_inicio IS NULL OR fecha >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR fecha <= p_fecha_fin);

  RETURN json_build_object(
    'ventas', v_ventas,
    'compras', v_compras,
    'gananciaNeta', (v_ventas->>'totalIngresos')::NUMERIC - (v_compras->>'totalGastos')::NUMERIC
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================
-- SAM JOSÉ AVÍCOLA — Datos Iniciales (Seed)
-- Ejecutar DESPUÉS de todos los archivos anteriores.
--
-- IMPORTANTE: Los triggers de stock están activos, así que
-- al insertar venta_items y compra_items el stock se ajusta
-- automáticamente. Por eso insertamos productos con stock = 0
-- y dejamos que los triggers de compra lo suban.
--
-- Sin embargo, para el seed inicial insertamos el stock
-- directamente en productos y NO pasamos por triggers de
-- compra/venta para evitar movimientos fantasma.
-- ============================================================

-- ─── Desactivar triggers de stock temporalmente ────────────
ALTER TABLE venta_items DISABLE TRIGGER trg_venta_item_restar_stock;
ALTER TABLE venta_items DISABLE TRIGGER trg_venta_item_movimiento;
ALTER TABLE compra_items DISABLE TRIGGER trg_compra_item_sumar_stock;
ALTER TABLE compra_items DISABLE TRIGGER trg_compra_item_movimiento;
ALTER TABLE venta_pagos DISABLE TRIGGER trg_pago_actualizar_venta;

-- ─── CATEGORÍAS ────────────────────────────────────────────
INSERT INTO categorias (id, nombre) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Cortes Angus'),
  ('a1000000-0000-0000-0000-000000000002', 'Cortes Holstein'),
  ('a1000000-0000-0000-0000-000000000003', 'Menudencia'),
  ('a1000000-0000-0000-0000-000000000004', 'Lote al por mayor');

-- ─── PRODUCTOS ─────────────────────────────────────────────
INSERT INTO productos (id, codigo, nombre, categoria_id, tipo_medida, precio_costo, precio_minorista, precio_mayorista, precio_especial, stock_actual, stock_minimo, imagen_url, tag, destacado) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'ANG001', 'Lomo Fino Angus',
   'a1000000-0000-0000-0000-000000000001', 'kg', 30.00, 45.00, 40.00, 38.00,
   60.0, 10, NULL, 'nuevo', true),

  ('b1000000-0000-0000-0000-000000000002', 'ANG002', 'Bife Ancho Angus',
   'a1000000-0000-0000-0000-000000000001', 'kg', 26.00, 38.00, 34.00, 32.00,
   48.0, 8, NULL, NULL, true),

  ('b1000000-0000-0000-0000-000000000003', 'HOL001', 'Carne Molida Holstein',
   'a1000000-0000-0000-0000-000000000002', 'kg', 14.00, 22.00, 19.00, 18.00,
   70.0, 10, NULL, 'oferta', true),

  ('b1000000-0000-0000-0000-000000000004', 'HOL002', 'Bistec Holstein',
   'a1000000-0000-0000-0000-000000000002', 'kg', 18.00, 27.00, 24.00, 23.00,
   40.0, 8, NULL, NULL, false),

  ('b1000000-0000-0000-0000-000000000005', 'MEN001', 'Hígado de Res',
   'a1000000-0000-0000-0000-000000000003', 'kg', 8.00, 14.00, 12.00, 11.00,
   25.0, 5, NULL, NULL, false),

  ('b1000000-0000-0000-0000-000000000006', 'MEN002', 'Mondongo',
   'a1000000-0000-0000-0000-000000000003', 'kg', 7.00, 12.00, 10.00, 9.00,
   0, 5, NULL, NULL, false),

  ('b1000000-0000-0000-0000-000000000007', 'LOT001', 'Media Res Angus (lote)',
   'a1000000-0000-0000-0000-000000000004', 'kg', 22.00, 32.00, 28.00, 27.00,
   5.0, 2, NULL, 'nuevo', true);

-- ─── CLIENTES ──────────────────────────────────────────────
-- Nota: NO hay registro "Público General". cliente_id = NULL en ventas.
-- Leads/prospectos del CRM (LinkedIn, WhatsApp, Facebook, TikTok, Referencia).
-- Cargo/Empresa/Canal/Estado/BANT se registran en el nombre por no existir
-- columnas dedicadas en el schema actual.
INSERT INTO clientes (id, nombre, dni_ruc, telefono, tipo, pendiente_aprobacion, email, activo) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Julio Huamani — Comerciante de Carne, Metropolitan Market (LinkedIn · Negociación · BANT 9/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000002', 'Rando Vargas Bejarano — Administración, Mercado San Camilo (LinkedIn · Calificado · BANT 8/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000003', 'Joaquín Alcázar Belaunde — Gerente de Operaciones, Pachamama Gourmet (LinkedIn · Contactado · BANT 8/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000004', 'Cosme Casos — Secretario, Asoc. Mercado San Camilo (Referencia · Contactado · BANT 6/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000005', 'Ismael Samos Rivera — Subgerente Desarrollo Económico, Municipalidad Provincial Arequipa (LinkedIn · Nuevo · BANT 6/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000006', 'Milagros Chávez Ponce — Jefa de Compras, Supermercados La Ibérica (LinkedIn · Calificado · BANT 7/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000007', 'Percy Delgado Ruiz — Comerciante de Carnes, Mercado Andrés Avelino Cáceres (WhatsApp · Contactado · BANT 5/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000008', 'Carla Zúñiga Peralta — Encargada de Abastecimiento, Restaurante El Fogón Arequipeña (Facebook · Nuevo · BANT 5/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000009', 'Renato Salas Quispe — Presidente de Asociación, Asoc. Mercado Río Seco (Referencia · Contactado · BANT 4/10)', NULL, NULL, 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000010', 'Fiorella Nina Condori — Coordinadora Comercial, Distribuidora Cárnicos del Sur (TikTok · Ganado · BANT 10/10)', NULL, NULL, 'mayorista', false, NULL, true);

-- ─── PROVEEDORES ───────────────────────────────────────────
INSERT INTO proveedores (id, nombre, ruc, telefono, email, direccion, contacto) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Ganadería Los Andes S.A.C.', '20456789012', '984123456', 'ventas@ganaderialosandes.pe', 'Av. Industrial 456, Arequipa', 'Carlos Mendoza'),
  ('d1000000-0000-0000-0000-000000000002', 'Transportes Frigoríficos del Sur E.I.R.L.', '20567890123', '956789012', 'contacto@frigosurperu.pe', 'Jr. Los Álamos 123, Arequipa', 'María Fernández'),
  ('d1000000-0000-0000-0000-000000000003', 'Insumos Ganaderos de Majes S.A.', '20678901234', '967890123', 'info@insumosmajes.pe', 'Av. La Marina 789, Majes', 'Juan Rodríguez');

-- ─── CONFIGURACIÓN ─────────────────────────────────────────
INSERT INTO configuracion (clave, valor) VALUES
  ('negocio', '{"nombre": "AGROJUNIOR SAC", "ruc": "20000000000", "direccion": "Parcela 316, Los Molles, Sección A — Majes, Arequipa", "telefono": "+51 970 995 140", "whatsapp": "970995140", "horario": {"laboral": "Lun - Sáb: 7am - 6pm", "domingo": "Dom: 8am - 12pm"}, "yape": "970995140", "banco_nombre": "Banco de Crédito", "banco_titular": "Darly Sanchez Cutipa", "banco_cuenta": "215-55555555"}'::jsonb),
  ('impuestos', '{"igv_activo": false, "igv_porcentaje": 18}'::jsonb),
  ('descuentos', '{"mayorista": 10, "especial": 5}'::jsonb),
  ('sistema', '{"stock_minimo_alerta": 5, "terminal": "Terminal 01", "caja_principal": "Caja Principal"}'::jsonb);

-- ─── USUARIOS ──────────────────────────────────────────────
INSERT INTO usuarios (id, email, name, role) VALUES
  ('1b5192fc-5015-45b8-b158-4daf778e43d1', 'admin@agrojuniorsac.com', 'Darly Sanchez Cutipa', 'admin');

-- ─── AVANZAR SECUENCIAS ────────────────────────────────────
-- Para que los próximos tickets/números empiecen después del seed
SELECT setval('ventas_ticket_seq', 25);
SELECT setval('compras_numero_seq', 5);
SELECT setval('conteos_numero_seq', 3);
SELECT setval('comprobante_venta_seq', 20);
SELECT setval('comprobante_pago_seq', 5);

-- ─── Reactivar triggers ────────────────────────────────────
ALTER TABLE venta_items ENABLE TRIGGER trg_venta_item_restar_stock;
ALTER TABLE venta_items ENABLE TRIGGER trg_venta_item_movimiento;
ALTER TABLE compra_items ENABLE TRIGGER trg_compra_item_sumar_stock;
ALTER TABLE compra_items ENABLE TRIGGER trg_compra_item_movimiento;
ALTER TABLE venta_pagos ENABLE TRIGGER trg_pago_actualizar_venta;

-- ════════════════════════════════════════════════════════════
-- NOTA SOBRE VENTAS DE SEED:
-- Las ventas mock requieren usuarios (vendedor_id FK).
-- Una vez que crees los usuarios en Supabase Auth y los
-- insertes en la tabla usuarios, puedes ejecutar un script
-- adicional para insertar las ventas de prueba.
-- ════════════════════════════════════════════════════════════
