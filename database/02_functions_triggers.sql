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
