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
