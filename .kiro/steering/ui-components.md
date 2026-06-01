# Reglas de Componentes UI

## Uso de shadcn/ui

Este proyecto usa **shadcn/ui** como librería de componentes visuales base. Siempre que construyas un componente de interfaz, sigue este flujo de decisión:

### 1. Verificar si el componente existe en shadcn/ui

Antes de construir cualquier elemento visual (botón, input, modal, tabla, select, badge, etc.), consulta si existe un componente equivalente en shadcn/ui:

- Referencia: https://ui.shadcn.com/docs/components

Los componentes instalados se ubican en `src/shared/components/ui/`.

### 2. Si el componente shadcn YA está instalado

Úsalo directamente importándolo desde el alias `@/shared/components/ui/`:

```tsx
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
```

### 3. Si el componente shadcn NO está instalado

**Detente e informa al usuario** antes de continuar. Muestra el comando exacto para instalarlo:

```bash
npx shadcn@latest add <nombre-componente>
```

Ejemplos comunes:

```bash
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
```

No implementes el componente desde cero si existe en shadcn. Pide al usuario que lo instale primero.

### 4. Si el componente NO existe en shadcn/ui

Solo en este caso construye el componente manualmente, siguiendo las convenciones del proyecto:

- Ubicarlo en `src/shared/components/ui/` si es reutilizable globalmente
- Ubicarlo en `src/features/<feature>/presentation/components/` si es específico del feature
- Usar Tailwind CSS + `cn()` para estilos
- Usar Radix UI primitives si el componente requiere accesibilidad avanzada (ya está disponible como dependencia de shadcn)

## Configuración del proyecto

- **Alias UI:** `@/shared/components/ui`
- **Alias utils:** `@/lib/utils` (contiene `cn()`)
- **Iconos:** Lucide React (`lucide-react`)
- **Estilo shadcn:** `default` (baseColor: `slate`)
- **CSS variables:** habilitadas
- **RSC:** habilitado (React Server Components)

## Reglas generales

- Nunca reimplementes un componente que ya existe en shadcn/ui instalado.
- Siempre usa `cn()` de `@/lib/utils` para combinar clases de Tailwind.
- Los iconos deben venir de `lucide-react`, no de otras librerías.
- Extiende los componentes de shadcn con variantes propias usando `cva` si necesitas personalización, en lugar de sobreescribir estilos.
