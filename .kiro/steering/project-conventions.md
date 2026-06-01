---
inclusion: always
---

# Convenciones del Proyecto

## Idioma

- Responde siempre en español.
- Los nombres de variables, funciones, clases, interfaces y tipos deben estar en inglés.
- Los comentarios en el código pueden estar en español o inglés, según prefiera el desarrollador.

## Arquitectura: Hexagonal con Vertical Slicing

Este proyecto usa arquitectura hexagonal organizada por features (vertical slicing).

### Routing: Next.js App Router

Este proyecto usa **Next.js App Router** (`src/app/`). Las rutas se definen siguiendo las convenciones de Next.js:

- Las rutas/páginas viven en `src/app/` como archivos `page.tsx`, `layout.tsx`, etc.
- Los archivos `page.tsx` en `src/app/` actúan como puntos de entrada que importan y renderizan los componentes de presentación del feature correspondiente.
- **No se crean componentes de lógica pesada directamente en `src/app/`**. Los `page.tsx` deben ser delgados: importar del feature y renderizar.

```tsx
// src/app/inspections/page.tsx — ejemplo de página delgada
import { InspectionPage } from "@/features/inspection/presentation/pages/InspectionPage";

export default function Page() {
  return <InspectionPage />;
}
```

### Estructura de carpetas por feature

Cada feature se ubica en `src/features/<nombre-feature>/` y sigue esta estructura:

```
src/features/<feature>/
├── domain/
│   ├── entities/        # Entidades y tipos del dominio
│   └── repositories/    # Interfaces/puertos de repositorios (contratos)
├── application/
│   ├── use-cases/       # Casos de uso (lógica de negocio)
│   └── services/        # Servicios de aplicación
├── infrastructure/
│   ├── api/             # Implementación de llamadas HTTP / adaptadores externos
│   ├── repositories/    # Implementación concreta de los repositorios
│   └── data/            # Datos mock o estáticos
├── presentation/
│   ├── pages/           # Componentes de página del feature (importados desde src/app/)
│   ├── components/      # Componentes UI específicos del feature
│   ├── hooks/           # Custom hooks del feature
│   └── context/         # Contextos de React del feature
└── index.ts             # Barrel export del feature
```

> **Nota:** `presentation/pages/` contiene los componentes visuales de página del feature. Estos se importan desde los `page.tsx` del App Router en `src/app/`. No confundir con las rutas de Next.js.

### Reglas de dependencia

- **domain/** no depende de ninguna otra capa. Es el núcleo.
- **application/** depende solo de **domain/**.
- **infrastructure/** implementa los contratos definidos en **domain/** y puede depender de **application/**.
- **presentation/** puede depender de **application/** y **domain/**, pero nunca importa directamente de **infrastructure/**.
- Los features no deben importar directamente de las carpetas internas de otros features. Usa el `index.ts` del feature como punto de entrada.

### Convenciones de código

- Usa TypeScript estricto.
- Las entidades del dominio se definen como interfaces o types en `domain/entities/`.
- Los repositorios se definen como interfaces en `domain/repositories/` y se implementan en `infrastructure/repositories/`.
- Los hooks de presentación encapsulan la lógica de estado y efectos secundarios.
- Usa barrel exports (`index.ts`) en cada capa para exponer solo lo necesario.
