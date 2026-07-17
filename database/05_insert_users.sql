-- Insertar usuarios de staff con sus UUIDs de auth.users.
--
-- IMPORTANTE: primero crea el usuario en Supabase Dashboard →
-- Authentication → Users → Add user (con su email y contraseña).
-- Copia el UUID que Supabase le asigna y reemplázalo abajo antes
-- de correr este script. No puedes insertar un UUID inventado:
-- la tabla "usuarios" tiene FK contra auth.users(id).

INSERT INTO usuarios (id, email, name, role) VALUES
  ('1b5192fc-5015-45b8-b158-4daf778e43d1', 'admin@agrojuniorsac.com', 'Darly Sanchez Cutipa', 'admin');
