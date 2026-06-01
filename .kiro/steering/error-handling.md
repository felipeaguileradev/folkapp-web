---
inclusion: always
---

# Manejo de Errores

## Estrategia por capa

Cada capa de la arquitectura hexagonal maneja errores a su nivel, sin filtrar detalles de implementación hacia capas superiores.

### Domain — Custom Error Classes

Definir clases de error específicas del dominio en `domain/entities/` o en un archivo `domain/errors/`.

```typescript
// domain/errors/inspection.errors.ts
export class InspectionNotFoundError extends Error {
  constructor(id: string) {
    super(`Inspección ${id} no encontrada`);
    this.name = 'InspectionNotFoundError';
  }
}

export class InspectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InspectionValidationError';
  }
}
```

- Cada feature define sus propios errores de dominio.
- Los errores de dominio no deben depender de librerías externas (axios, fetch, etc.).

### Infrastructure — Try/Catch centralizado

La capa de infraestructura captura errores técnicos (HTTP, red, etc.) y los transforma en errores de dominio.

```typescript
// infrastructure/api/InspectionApi.ts
try {
  const response = await axios.get(`/inspections/${id}`);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      throw new InspectionNotFoundError(id);
    }
    if (error.response?.status === 422) {
      throw new InspectionValidationError(error.response.data.message);
    }
  }
  throw new ApiError('Error inesperado al obtener inspección');
}
```

- Nunca dejar que errores de axios/fetch se propaguen sin transformar.
- Usar un `ApiError` genérico como fallback para errores no mapeados.

### Application — Result Pattern

Los casos de uso retornan un `Result<T, E>` en vez de lanzar excepciones, para que la capa de presentación pueda manejar los resultados de forma predecible.

```typescript
// Tipo Result compartido (puede ir en core/domain/ o en un shared/)
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// application/use-cases/get-inspection.use-case.ts
const getInspection = async (id: string): Promise<Result<InspectionEntity>> => {
  try {
    const data = await inspectionRepository.getById(id);
    return { success: true, data };
  } catch (error) {
    if (error instanceof InspectionNotFoundError) {
      return { success: false, error: 'Inspección no encontrada' };
    }
    return { success: false, error: 'Error al obtener la inspección' };
  }
};
```

- Los casos de uso son el límite donde las excepciones se convierten en resultados.
- La presentación nunca debería necesitar try/catch si los use-cases retornan Result.

### Presentation — Estado de error en hooks + Error Boundaries

**Hooks:** Manejan estados `loading`, `error`, `data` para que los componentes reaccionen.

```typescript
// presentation/hooks/useInspection.ts
const [error, setError] = useState<string | null>(null);

const fetchInspection = async (id: string) => {
  setIsLoading(true);
  setError(null);
  const result = await getInspection(id);
  if (result.success) {
    setData(result.data);
  } else {
    setError(result.error);
  }
  setIsLoading(false);
};
```

**Error Boundaries:** Como red de seguridad para errores inesperados en el renderizado.

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <InspectionPage />
</ErrorBoundary>
```

## Error genérico base

Definir un `ApiError` genérico en `core/domain/` o `shared/` para errores no específicos:

```typescript
export class ApiError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
```

## Reglas generales

- No usar `console.error` como único manejo de error. Siempre propagar o mostrar al usuario.
- No silenciar errores con catch vacíos (`catch {}`).
- Los mensajes de error visibles al usuario deben ser en español y amigables.
- Los mensajes de error técnicos (logs) pueden estar en inglés.
- Siempre tipar los errores: evitar `catch (error: any)`.
