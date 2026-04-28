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
  ('a1000000-0000-0000-0000-000000000001', 'Pollo'),
  ('a1000000-0000-0000-0000-000000000002', 'Huevos'),
  ('a1000000-0000-0000-0000-000000000003', 'Cerdo'),
  ('a1000000-0000-0000-0000-000000000004', 'Ofertas');

-- ─── PRODUCTOS ─────────────────────────────────────────────
INSERT INTO productos (id, codigo, nombre, categoria_id, tipo_medida, precio_costo, precio_minorista, precio_mayorista, precio_especial, stock_actual, stock_minimo, imagen_url, tag, destacado) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'P001', 'Pollo Entero Grado A',
   'a1000000-0000-0000-0000-000000000001', 'kg', 8.00, 8.50, 7.80, 7.50,
   85.4, 10, 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&q=80', 'oferta', true),

  ('b1000000-0000-0000-0000-000000000002', 'H001', 'Cartón Huevos x30',
   'a1000000-0000-0000-0000-000000000002', 'unidad', 14.00, 18.00, 16.50, 15.50,
   45, 5, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80', NULL, true),

  ('b1000000-0000-0000-0000-000000000003', 'P002', 'Pechuga Especial',
   'a1000000-0000-0000-0000-000000000001', 'kg', 10.00, 12.00, 11.00, 10.50,
   32.0, 5, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80', 'nuevo', true),

  ('b1000000-0000-0000-0000-000000000004', 'P003', 'Muslos de Pollo',
   'a1000000-0000-0000-0000-000000000001', 'kg', 6.00, 7.20, 6.50, 6.20,
   28.5, 5, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&q=80', NULL, false),

  ('b1000000-0000-0000-0000-000000000005', 'C001', 'Chuleta de Cerdo',
   'a1000000-0000-0000-0000-000000000003', 'kg', 11.00, 14.50, 13.00, 12.50,
   18.0, 3, 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&q=80', NULL, false),

  ('b1000000-0000-0000-0000-000000000006', 'P004', 'Alas de Pollo',
   'a1000000-0000-0000-0000-000000000001', 'kg', 5.00, 6.50, 6.00, 5.80,
   0, 5, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&q=80', NULL, false),

  ('b1000000-0000-0000-0000-000000000007', 'H002', 'Bandeja Huevos x12',
   'a1000000-0000-0000-0000-000000000002', 'unidad', 7.00, 9.00, 8.00, 7.50,
   3, 10, 'https://images.unsplash.com/photo-1491524062933-cb188fc9b932?w=300&q=80', NULL, false);

-- ─── CLIENTES ──────────────────────────────────────────────
-- Nota: NO hay registro "Público General". cliente_id = NULL en ventas.
INSERT INTO clientes (id, nombre, dni_ruc, telefono, tipo, pendiente_aprobacion, email, activo) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Distribuidora Alimentos S.A.', '20512345678', '999888777', 'mayorista', false, 'dist@email.com', true),
  ('c1000000-0000-0000-0000-000000000002', 'María Rodríguez', '12345678', '987654321', 'minorista', false, 'maria@email.com', true),
  ('c1000000-0000-0000-0000-000000000003', 'Juan Pérez', '87654321', '966780316', 'especial', false, 'juan@email.com', true),
  ('c1000000-0000-0000-0000-000000000004', 'Restaurante El Buen Sabor', '20654321987', '956789123', 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000005', 'Café Restaurant La Terraza', '10456789012', '923456789', 'especial', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000006', 'Rosa Huamán', '45678901', '978912345', 'minorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000007', 'Restaurante Mi Tierra', '20123456789', '966780316', 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000008', 'Lucía Gonzales', '76543210', '966780316', 'minorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000009', 'Carnicería El Rojo', '20234567890', '966780316', 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000010', 'Sandra Málaga', '61234567', '966780316', 'especial', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000011', 'Pollería Express', '20345678901', '966780316', 'mayorista', false, NULL, true),
  ('c1000000-0000-0000-0000-000000000012', 'Amanda Quispe', '59876543', '966780316', 'minorista', false, NULL, true);

-- ─── PROVEEDORES ───────────────────────────────────────────
INSERT INTO proveedores (id, nombre, ruc, telefono, email, direccion, contacto) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Avícola Los Andes S.A.C.', '20456789012', '984123456', 'ventas@avicolaandina.pe', 'Av. Industrial 456, Lima', 'Carlos Mendoza'),
  ('d1000000-0000-0000-0000-000000000002', 'Granja Porcina El Sol E.I.R.L.', '20567890123', '956789012', 'contacto@granjaporcinaelsol.pe', 'Jr. Los Álamos 123, Ica', 'María Fernández'),
  ('d1000000-0000-0000-0000-000000000003', 'Distribuidora de Huevos Frescos S.A.', '20678901234', '967890123', 'info@distrihuevos.pe', 'Av. La Marina 789, Trujillo', 'Juan Rodríguez'),
  ('d1000000-0000-0000-0000-000000000004', 'Insumos Agrícolas del Norte S.A.C.', '20789012345', '978901234', 'ventas@insumosnorte.pe', 'Calle Comercio 456, Chiclayo', 'Ana Torres');

-- ─── CONFIGURACIÓN ─────────────────────────────────────────
INSERT INTO configuracion (clave, valor) VALUES
  ('negocio', '{"nombre": "Sam José Avícola", "ruc": "20000000000", "direccion": "Av. Principal 123, Arequipa", "telefono": "+51 916 794 870", "whatsapp": "916794870", "horario": {"laboral": "Lun - Sáb: 7am - 8pm", "domingo": "Dom: 8am - 2pm"}, "yape": "916794870", "banco_nombre": "Banco de Crédito", "banco_titular": "Juan Pérez", "banco_cuenta": "215-55555555"}'::jsonb),
  ('impuestos', '{"igv_activo": false, "igv_porcentaje": 18}'::jsonb),
  ('descuentos', '{"mayorista": 10, "especial": 5}'::jsonb),
  ('sistema', '{"stock_minimo_alerta": 5, "terminal": "Terminal 01", "caja_principal": "Caja Principal"}'::jsonb);

-- ─── USUARIOS ──────────────────────────────────────────────
INSERT INTO usuarios (id, email, name, role) VALUES
  ('8f6e2683-e4bf-496a-817e-dbdc69335c05', 'admin@samjose.com', 'Administrador', 'admin'),
  ('b5b76f4b-0829-43d1-9e4e-2f88d7661b1a', 'vendedor@samjose.com', 'Juan Pérez', 'vendedor');

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
