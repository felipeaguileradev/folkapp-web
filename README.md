# BFV — Gestión de Vestuario

Plataforma de gestión de vestuario para el Ballet Folklórico de Valdivia. Permite administrar el inventario de prendas, bailarines, movimientos, cuadros, funciones, alertas y reportes.

## Requisitos previos

- Node.js 18+ (recomendado 20+)
- npm (incluido con Node.js)
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Folk-app-web

# Instalar dependencias
npm install
```

## Configuración de variables de entorno

Copia el archivo de ejemplo y completa con tus credenciales de Supabase:

```bash
cp .env.example .env
```

Variables requeridas:

| Variable                               | Descripción                          |
| -------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL del proyecto Supabase            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key)             |
| `SUPABASE_SERVICE_ROLE_KEY`            | Clave de servicio (solo server-side) |

Puedes encontrar estas credenciales en el Dashboard de Supabase → Settings → API.

## Base de datos

### Migraciones

Las migraciones SQL se encuentran en `supabase/migrations/`. Para aplicarlas en un proyecto nuevo:

1. Instala Supabase CLI: `npm install -g supabase`
2. Vincula tu proyecto: `supabase link --project-ref <tu-project-ref>`
3. Aplica migraciones: `supabase db push`

### Seed data

Para cargar los datos iniciales (cuadros, bailarines, prendas, plantillas):

```bash
# Ejecutar el seed directamente en Supabase
# Opción 1: Desde el SQL Editor del Dashboard, pegar el contenido de supabase/seed.sql
# Opción 2: Usando Supabase CLI
supabase db reset  # Aplica migraciones + seed
```

El seed es idempotente (usa `ON CONFLICT DO NOTHING`), puede ejecutarse múltiples veces sin duplicar datos.

### Usuario admin

Crear un usuario admin desde el Dashboard de Supabase:

1. Authentication → Users → Add user
2. Email: `admin@bfv.cl`, contraseña segura
3. Actualizar metadata: `{"role": "admin"}` en `app_metadata`

## Desarrollo local

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Comandos disponibles

| Comando         | Descripción                 |
| --------------- | --------------------------- |
| `npm run dev`   | Servidor de desarrollo      |
| `npm run build` | Build de producción         |
| `npm run start` | Iniciar build de producción |
| `npm run lint`  | Ejecutar ESLint             |
| `npm run test`  | Ejecutar tests (Vitest)     |

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router (páginas delgadas)
│   ├── (auth)/             # Rutas protegidas con sidebar
│   ├── login/              # Página de login
│   └── api/                # API routes (PDF, Excel)
├── modules/                # Módulos por feature (hexagonal)
│   ├── inventario/         # Gestión de prendas
│   ├── bailarines/         # Gestión de bailarines
│   ├── movimientos/        # Asignaciones, préstamos, traspasos
│   ├── cuadros/            # Cuadros y plantillas
│   ├── historial/          # Historial inmutable
│   ├── alertas/            # Sistema de alertas
│   ├── funciones/          # Funciones y checklist
│   ├── reportes/           # Generación de reportes
│   └── auth/               # Autenticación
├── shared/                 # Código compartido
│   ├── components/ui/      # Componentes shadcn/ui
│   ├── components/layout/  # Layout y navegación
│   ├── hooks/              # Hooks compartidos
│   ├── lib/                # Utilidades, Supabase client, validaciones
│   └── types/              # Tipos y enums compartidos
└── lib/                    # Utilidad cn() para Tailwind
```

## Despliegue en Vercel

1. Conecta el repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno en el Dashboard de Vercel
3. El framework se detecta automáticamente (Next.js)
4. Deploy automático en cada push a `main`

### Variables de entorno en Vercel

Agrega las mismas variables del `.env` en Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Validación:** Zod
- **PDF:** @react-pdf/renderer
- **Excel:** xlsx (SheetJS)
- **Testing:** Vitest + fast-check
- **Iconos:** Lucide React
