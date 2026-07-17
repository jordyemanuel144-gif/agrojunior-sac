-- ============================================================
-- FIX: permisos + acceso público al catálogo.
--
-- Correr UNA vez en el SQL Editor de Supabase DESPUÉS del schema.
-- Necesario porque el reset con `DROP SCHEMA public CASCADE` borró
-- los GRANTs que Supabase da por defecto a los roles anon/authenticated
-- (por eso salía "permission denied for table productos/categorias").
-- ============================================================

-- 1) Restaurar los GRANTs por defecto de Supabase sobre el schema public.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 2) La tabla `usuarios` NO tiene RLS (por diseño). Revocar acceso anon
--    para NO exponerla públicamente. El staff (authenticated) sí la usa.
REVOKE ALL ON usuarios FROM anon;

-- 3) Acceso público (anon) para el catálogo: leer categorías y config.
--    `productos` ya tiene la política productos_public (activo = true).
--    El resto de tablas tienen RLS activo sin política anon => bloqueadas.
DROP POLICY IF EXISTS categorias_public ON categorias;
CREATE POLICY categorias_public ON categorias
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS config_public ON configuracion;
CREATE POLICY config_public ON configuracion
  FOR SELECT TO anon USING (true);
