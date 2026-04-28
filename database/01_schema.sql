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
