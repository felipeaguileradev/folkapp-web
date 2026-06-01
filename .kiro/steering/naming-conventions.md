---
inclusion: always
---

# Convenciones de Naming

## Archivos y carpetas

| Tipo                          | Convención                               | Ejemplo                                                   |
| ----------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Componentes React             | `PascalCase.tsx`                         | `InspectionTable.tsx`, `NewInspectionDetailModal.tsx`     |
| Páginas                       | `PascalCase` con sufijo `Page`           | `InspectionPage.tsx`, `AdminPage.tsx`                     |
| Hooks                         | `camelCase` con prefijo `use`            | `useInspection.ts`, `useAuth.ts`                          |
| Entidades                     | `kebab-case` con sufijo `.entity.ts`     | `inspections.entity.ts`, `work-order.entity.ts`           |
| Repositorios (interfaz)       | `kebab-case` con sufijo `.repository.ts` | `auth-storage.repository.ts`                              |
| Repositorios (implementación) | `kebab-case` con prefijo descriptivo     | `local-auth-storage.repository.ts`                        |
| Casos de uso                  | `kebab-case` con sufijo `.use-case.ts`   | `auth-storage.use-case.ts`                                |
| APIs/Servicios                | `PascalCase` con sufijo `Api.ts`         | `InspectionApi.ts`                                        |
| Utilidades                    | `kebab-case`                             | `date-utils.ts`, `format-helpers.ts`                      |
| Columnas/config de tablas     | `kebab-case`                             | `inspection-columns.tsx`, `inspection-detail-columns.tsx` |
| Contextos                     | `kebab-case` con sufijo `-context.tsx`   | `session-state-context.tsx`                               |
| Datos mock                    | `camelCase` con prefijo `mock`           | `mockInspectionDetails.ts`, `mockConfigurationData.ts`    |
| Barrel exports                | `index.ts`                               | `index.ts`                                                |

## Código

| Tipo                 | Convención                      | Ejemplo                                     |
| -------------------- | ------------------------------- | ------------------------------------------- |
| Componentes React    | `PascalCase`                    | `const InspectionTable = () => {}`          |
| Hooks                | `camelCase` con prefijo `use`   | `const useInspection = () => {}`            |
| Funciones            | `camelCase`                     | `getInspectionById`, `formatDate`           |
| Variables            | `camelCase`                     | `isLoading`, `inspectionData`               |
| Constantes           | `UPPER_SNAKE_CASE`              | `API_BASE_URL`, `MAX_RETRIES`               |
| Interfaces           | `PascalCase`                    | `InspectionEntity`, `AuthStorageRepository` |
| Types                | `PascalCase`                    | `WorkOrderDetail`, `InspectionStatus`       |
| Enums                | `PascalCase` (enum y valores)   | `enum Status { Active, Inactive }`          |
| Props de componentes | `PascalCase` con sufijo `Props` | `InspectionTableProps`, `ModalProps`        |

## Reglas generales

- No usar prefijos `I` para interfaces (usar `AuthStorageRepository`, no `IAuthStorageRepository`).
- Los nombres deben ser descriptivos y en inglés.
- Evitar abreviaciones ambiguas (`btn`, `mgr`, `svc`). Preferir nombres completos (`button`, `manager`, `service`).
- Los booleanos deben tener prefijo que indique su naturaleza: `is`, `has`, `can`, `should` (ej: `isLoading`, `hasPermission`).
- Los handlers de eventos usan prefijo `handle` en la implementación y `on` en las props (ej: `handleClick` internamente, `onClick` como prop).
