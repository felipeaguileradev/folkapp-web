-- Seed Data: Ballet Folklórico de Valdivia
-- Fecha: 2025-06-01
-- Descripción: Datos iniciales para el sistema de gestión de vestuario
-- Idempotente: usa ON CONFLICT DO NOTHING

-- ============================================================
-- 1. CUADROS
-- ============================================================
INSERT INTO cuadros (id, nombre, zona_geografica, descripcion, color_ui)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Huaso', 'Zona Central', 'Bailes tradicionales de la zona central de Chile', '#D97706'),
  ('c1000000-0000-0000-0000-000000000002', 'Norte', 'Norte Grande', 'Bailes del norte de Chile, influencia andina', '#2563EB'),
  ('c1000000-0000-0000-0000-000000000003', 'Rapa Nui', 'Isla de Pascua', 'Bailes polinésicos de Rapa Nui', '#DB2777')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. BAILARINES (Masculinos)
-- ============================================================
INSERT INTO bailarines (id, nombre_completo, genero, cuadros_activos, color_norte, tallas, activo, fecha_ingreso)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'David Valenzuela', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "M", "pantalon": "40", "sombrero": "57", "calzado": "42", "personalizados": []}'::jsonb,
   true, '2020-03-15'),
  ('b1000000-0000-0000-0000-000000000002', 'Felipe Araya', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'], 'Rojo',
   '{"camisa": "L", "pantalon": "42", "sombrero": "58", "calzado": "43", "personalizados": []}'::jsonb,
   true, '2019-08-01'),
  ('b1000000-0000-0000-0000-000000000003', 'Oscar Contreras', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "M", "pantalon": "38", "sombrero": "56", "calzado": "41", "personalizados": []}'::jsonb,
   true, '2021-03-10'),
  ('b1000000-0000-0000-0000-000000000004', 'Daniel Muñoz', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003'], NULL,
   '{"camisa": "L", "pantalon": "42", "sombrero": "58", "calzado": "44", "personalizados": []}'::jsonb,
   true, '2020-07-20'),
  ('b1000000-0000-0000-0000-000000000005', 'L. Felipe Aravena', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "S", "pantalon": "36", "sombrero": "55", "calzado": "40", "personalizados": []}'::jsonb,
   true, '2022-01-15'),
  ('b1000000-0000-0000-0000-000000000006', 'Matias Diaz', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'], 'Azul',
   '{"camisa": "M", "pantalon": "40", "sombrero": "57", "calzado": "42", "personalizados": []}'::jsonb,
   true, '2021-06-01'),
  ('b1000000-0000-0000-0000-000000000007', 'Ignacio Parra', 'Masculino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "L", "pantalon": "44", "sombrero": "59", "calzado": "44", "personalizados": []}'::jsonb,
   true, '2023-03-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. BAILARINES (Femeninas)
-- ============================================================
INSERT INTO bailarines (id, nombre_completo, genero, cuadros_activos, color_norte, tallas, activo, fecha_ingreso)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Cristina Morales', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'], 'Rojo',
   '{"camisa": "S", "pantalon": "36", "sombrero": "55", "calzado": "37", "personalizados": []}'::jsonb,
   true, '2019-03-15'),
  ('b2000000-0000-0000-0000-000000000002', 'Fernanda Muñoz', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "M", "pantalon": "38", "sombrero": "56", "calzado": "38", "personalizados": []}'::jsonb,
   true, '2020-08-01'),
  ('b2000000-0000-0000-0000-000000000003', 'Josefa Martínez', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003'], NULL,
   '{"camisa": "S", "pantalon": "36", "sombrero": "55", "calzado": "36", "personalizados": []}'::jsonb,
   true, '2021-03-10'),
  ('b2000000-0000-0000-0000-000000000004', 'Javiera Vidal', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "M", "pantalon": "38", "sombrero": "56", "calzado": "38", "personalizados": []}'::jsonb,
   true, '2020-07-20'),
  ('b2000000-0000-0000-0000-000000000005', 'Beatriz Araya', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'], 'Verde',
   '{"camisa": "S", "pantalon": "34", "sombrero": "54", "calzado": "36", "personalizados": []}'::jsonb,
   true, '2022-01-15'),
  ('b2000000-0000-0000-0000-000000000006', 'Camila Moreno', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001'], NULL,
   '{"camisa": "M", "pantalon": "38", "sombrero": "56", "calzado": "37", "personalizados": []}'::jsonb,
   true, '2021-06-01'),
  ('b2000000-0000-0000-0000-000000000007', 'Josefa Torres', 'Femenino',
   ARRAY['c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003'], NULL,
   '{"camisa": "S", "pantalon": "36", "sombrero": "55", "calzado": "37", "personalizados": []}'::jsonb,
   true, '2023-03-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. PRENDAS (distribuidas por cuadro y estado)
-- ============================================================
INSERT INTO prendas (id, codigo_identificador, nombre, cuadro_id, genero, categoria, estado, propietario, bailarin_actual, ubicacion, comentarios, fecha_ingreso)
VALUES
  -- Huaso Masculino
  ('d1000000-0000-0000-0000-000000000001', 'MH-001', 'Manta huaso', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa superior', 'En uso', 'Ballet', 'b1000000-0000-0000-0000-000000000001', 'Armario 1', NULL, '2020-03-15'),
  ('d1000000-0000-0000-0000-000000000002', 'MH-002', 'Chaquetilla', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa superior', 'En uso', 'Ballet', 'b1000000-0000-0000-0000-000000000002', 'Armario 1', NULL, '2020-03-15'),
  ('d1000000-0000-0000-0000-000000000003', 'MH-003', 'Sombrero huaso', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Tocado', 'Disponible', 'Ballet', NULL, 'Armario 2', NULL, '2020-03-15'),
  ('d1000000-0000-0000-0000-000000000004', 'MH-004', 'Botines negros', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Calzado', 'Disponible', 'Ballet', NULL, 'Armario 3', NULL, '2020-05-01'),
  ('d1000000-0000-0000-0000-000000000005', 'MH-005', 'Pierneras', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa inferior', 'En uso', 'Ballet', 'b1000000-0000-0000-0000-000000000003', 'Armario 1', NULL, '2020-05-01'),
  ('d1000000-0000-0000-0000-000000000006', 'MH-006', 'Chasquilla No6', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Accesorio', 'En reparación', 'Ballet', 'b1000000-0000-0000-0000-000000000005', NULL, 'Revisar costura lateral', '2021-01-10'),
  ('d1000000-0000-0000-0000-000000000007', 'MH-007', 'Espuela', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Accesorio', 'Faltante', 'Ballet', 'b1000000-0000-0000-0000-000000000007', NULL, NULL, '2021-06-01'),
  ('d1000000-0000-0000-0000-000000000008', 'MH-008', 'Faja huaso', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Accesorio', 'Disponible', 'Personal', NULL, 'Armario 2', NULL, '2022-01-15'),
  -- Huaso Femenino
  ('d1000000-0000-0000-0000-000000000009', 'FH-001', 'Manta china', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa superior', 'En uso', 'Ballet', 'b2000000-0000-0000-0000-000000000001', 'Armario 4', NULL, '2020-03-15'),
  ('d1000000-0000-0000-0000-000000000010', 'FH-002', 'Falda huasa', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa inferior', 'En uso', 'Ballet', 'b2000000-0000-0000-0000-000000000002', 'Armario 4', NULL, '2020-03-15'),
  ('d1000000-0000-0000-0000-000000000011', 'FH-003', 'Blusa blanca', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa superior', 'Disponible', 'Ballet', NULL, 'Armario 4', NULL, '2020-05-01'),
  ('d1000000-0000-0000-0000-000000000012', 'FH-004', 'Sombrero china', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Tocado', 'Prestada', 'Ballet', 'b2000000-0000-0000-0000-000000000003', 'Armario 5', NULL, '2020-05-01'),
  ('d1000000-0000-0000-0000-000000000013', 'FH-005', 'Aros', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Joyería', 'Faltante', 'Ballet', 'b2000000-0000-0000-0000-000000000007', NULL, NULL, '2021-06-01'),
  ('d1000000-0000-0000-0000-000000000014', 'FH-006', 'Botines china', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Calzado', 'Disponible', 'Ballet', NULL, 'Armario 5', NULL, '2022-01-15'),
  ('d1000000-0000-0000-0000-000000000015', 'FH-007', 'Faja china', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Accesorio', 'En uso', 'Ballet', 'b2000000-0000-0000-0000-000000000004', 'Armario 4', NULL, '2022-01-15'),
  -- Norte
  ('d1000000-0000-0000-0000-000000000016', 'MN-001', 'Sombrero norte', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Tocado', 'En uso', 'Ballet', 'b1000000-0000-0000-0000-000000000002', 'Armario 6', NULL, '2021-03-01'),
  ('d1000000-0000-0000-0000-000000000017', 'MN-002', 'Polera norte', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Ropa superior', 'Disponible', 'Ballet', NULL, 'Armario 6', NULL, '2021-03-01'),
  ('d1000000-0000-0000-0000-000000000018', 'FN-001', 'Aguayo', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Accesorio', 'En uso', 'Ballet', 'b2000000-0000-0000-0000-000000000001', 'Armario 6', NULL, '2021-03-01'),
  ('d1000000-0000-0000-0000-000000000019', 'FN-002', 'Axo norte', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Ropa superior', 'Disponible', 'Ballet', NULL, 'Armario 6', NULL, '2021-03-01'),
  ('d1000000-0000-0000-0000-000000000020', 'UN-001', 'Faja norte', 'c1000000-0000-0000-0000-000000000002', 'Unisex', 'Accesorio', 'Disponible', 'Ballet', NULL, 'Armario 6', NULL, '2021-03-01'),
  -- Rapa Nui
  ('d1000000-0000-0000-0000-000000000021', 'MR-001', 'Kahu masculino', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Ropa inferior', 'En uso', 'Ballet', 'b1000000-0000-0000-0000-000000000004', 'Armario 7', NULL, '2022-06-01'),
  ('d1000000-0000-0000-0000-000000000022', 'MR-002', 'Vere vere', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Accesorio', 'Disponible', 'Ballet', NULL, 'Armario 7', NULL, '2022-06-01'),
  ('d1000000-0000-0000-0000-000000000023', 'MR-003', 'Corona rapanui M', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Tocado', 'Disponible', 'Ballet', NULL, 'Armario 7', NULL, '2022-06-01'),
  ('d1000000-0000-0000-0000-000000000024', 'FR-001', 'Kahu femenino', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Ropa inferior', 'En uso', 'Ballet', 'b2000000-0000-0000-0000-000000000003', 'Armario 7', NULL, '2022-06-01'),
  ('d1000000-0000-0000-0000-000000000025', 'FR-002', 'Corona rapanui F', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Tocado', 'Dada de baja', 'Ballet', NULL, NULL, 'Deterioro irreparable', '2022-06-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. PLANTILLA DE VESTUARIO
-- ============================================================

-- Huaso Masculino
INSERT INTO plantilla_vestuario (id, cuadro_id, genero, categoria, nombre_prenda, orden)
VALUES
  ('pl100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa superior', 'Manta huaso', 1),
  ('pl100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa superior', 'Chaquetilla', 2),
  ('pl100000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Tocado', 'Sombrero huaso', 3),
  ('pl100000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Calzado', 'Botines negros', 4),
  ('pl100000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Ropa inferior', 'Pierneras', 5),
  ('pl100000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Accesorio', 'Espuela', 6),
  ('pl100000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Masculino', 'Accesorio', 'Faja huaso', 7)
ON CONFLICT (id) DO NOTHING;

-- Huaso Femenino
INSERT INTO plantilla_vestuario (id, cuadro_id, genero, categoria, nombre_prenda, orden)
VALUES
  ('pl200000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa superior', 'Manta china', 1),
  ('pl200000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa inferior', 'Falda huasa', 2),
  ('pl200000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Ropa superior', 'Blusa blanca', 3),
  ('pl200000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Tocado', 'Sombrero china', 4),
  ('pl200000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Calzado', 'Botines china', 5),
  ('pl200000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Femenino', 'Accesorio', 'Faja china', 6)
ON CONFLICT (id) DO NOTHING;

-- Norte Masculino/Femenino (Unisex en su mayoría)
INSERT INTO plantilla_vestuario (id, cuadro_id, genero, categoria, nombre_prenda, orden)
VALUES
  ('pl300000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Tocado', 'Sombrero norte', 1),
  ('pl300000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Ropa superior', 'Polera norte', 2),
  ('pl300000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Ropa superior', 'Axo norte', 3),
  ('pl300000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Accesorio', 'Faja norte', 4),
  ('pl300000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Masculino', 'Accesorio', 'Aguayo', 5),
  ('pl300000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Tocado', 'Sombrero norte', 1),
  ('pl300000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Ropa superior', 'Polera norte', 2),
  ('pl300000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Ropa superior', 'Axo norte', 3),
  ('pl300000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Accesorio', 'Faja norte', 4),
  ('pl300000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'Femenino', 'Accesorio', 'Aguayo', 5)
ON CONFLICT (id) DO NOTHING;

-- Rapa Nui Masculino
INSERT INTO plantilla_vestuario (id, cuadro_id, genero, categoria, nombre_prenda, orden)
VALUES
  ('pl400000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Ropa inferior', 'Kahu masculino', 1),
  ('pl400000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Accesorio', 'Vere vere', 2),
  ('pl400000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Tocado', 'Corona rapanui M', 3),
  ('pl400000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Masculino', 'Accesorio', 'Brazaletes', 4)
ON CONFLICT (id) DO NOTHING;

-- Rapa Nui Femenino
INSERT INTO plantilla_vestuario (id, cuadro_id, genero, categoria, nombre_prenda, orden)
VALUES
  ('pl500000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Ropa inferior', 'Kahu femenino', 1),
  ('pl500000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Accesorio', 'Vere vere', 2),
  ('pl500000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Tocado', 'Corona rapanui F', 3),
  ('pl500000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Accesorio', 'Brazaletes', 4),
  ('pl500000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Ropa superior', 'Sosten rapanui', 5),
  ('pl500000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Femenino', 'Ropa inferior', 'Enagua rapanui', 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. USUARIO ADMIN
-- ============================================================
-- Nota: El usuario admin se crea via Supabase Auth (Dashboard o CLI).
-- Este INSERT es para la metadata del rol en auth.users.
-- En producción, ejecutar desde el Dashboard de Supabase:
--   1. Crear usuario con email: admin@bfv.cl, password segura
--   2. Actualizar app_metadata: {"role": "admin"}
--
-- Si la tabla auth.users es accesible (solo en local/dev):
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@bfv.cl';

-- ============================================================
-- FIN DEL SEED
-- ============================================================
