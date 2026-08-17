-- Migración: Agregar campo propietario_nombre a prendas
-- Fecha: 2026-08-17
-- Descripción: Cuando el propietario es "Personal", este campo guarda el nombre del dueño.

ALTER TABLE prendas ADD COLUMN IF NOT EXISTS propietario_nombre text;
