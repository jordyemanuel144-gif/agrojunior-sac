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
-- NO se insertan acá: requiere crear primero el usuario real en
-- Supabase Authentication (Dashboard → Authentication → Users → Add user)
-- y usar el UUID que Supabase genere. Ver database/05_insert_users.sql.
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
