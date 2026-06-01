# Migraciones de Base de Datos

## Regla principal

Toda migración de base de datos creada (ya sea vía Supabase CLI, MCP, o manualmente) **debe tener una copia guardada en el proyecto** dentro de la carpeta `supabase/migrations/`.

Esto es crítico porque en el futuro las tablas se migrarán a otra base de datos de producción, y se necesita un historial completo y reproducible de todas las migraciones.

## Convención de archivos

- **Ubicación:** `supabase/migrations/`
- **Formato del nombre:** `<timestamp>_<descripcion>.sql`
  - Timestamp: `YYYYMMDDHHMMSS` (14 dígitos)
  - Descripción: `snake_case`, breve y descriptiva
  - Ejemplo: `20250522150000_create_wardrobe_table.sql`

## Flujo obligatorio

### Al crear una migración con Supabase MCP o CLI:

1. Ejecutar la migración en la base de datos de desarrollo.
2. **Guardar inmediatamente** el SQL de la migración en `supabase/migrations/` con el formato de nombre correcto.
3. Verificar que el archivo contiene el SQL completo y funcional.

### Al crear tablas, modificar esquemas o agregar RLS policies:

1. Generar el SQL correspondiente.
2. Aplicar la migración en la base de datos.
3. **Guardar el archivo `.sql`** en `supabase/migrations/`.

## Contenido del archivo de migración

Cada archivo de migración debe incluir:

```sql
-- Migración: <descripción breve>
-- Fecha: <YYYY-MM-DD>
-- Descripción: <qué hace esta migración>

<SQL de la migración>
```

## Reglas adicionales

- **Nunca** aplicar cambios de esquema sin guardar la migración correspondiente.
- Las migraciones deben ser **idempotentes** cuando sea posible (usar `IF NOT EXISTS`, `IF EXISTS`, etc.).
- Si una migración incluye `DROP` o cambios destructivos, documentar claramente el motivo.
- Mantener las migraciones **ordenadas cronológicamente** por timestamp.
- Cada migración debe ser **autocontenida**: no depender de estado externo no documentado.
- Si se usa Supabase MCP para crear tablas o policies, extraer el SQL generado y guardarlo como migración.

## Ejemplo

```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20250522150000_create_wardrobe_table.sql
├── 20250522160000_add_wardrobe_rls_policies.sql
└── 20250523100000_create_outfit_table.sql
```
