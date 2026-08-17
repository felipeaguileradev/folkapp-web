-- Migración: Eliminar columna color_norte de bailarines
-- Fecha: 2026-08-17
-- Descripción: Elimina el campo color_norte que ya no se usa en la aplicación

ALTER TABLE bailarines DROP COLUMN IF EXISTS color_norte;
