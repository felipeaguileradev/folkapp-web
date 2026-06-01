# Implementation Plan: BFV Wardrobe Management

## Overview

Implementación incremental de la plataforma de gestión de vestuario para el Ballet Folklórico de Valdivia. Se sigue arquitectura hexagonal con vertical slicing, construyendo primero la infraestructura base (Supabase, auth, shared), luego cada módulo funcional de forma independiente, y finalmente integrando reportes y UI transversal.

## Tasks

- [x] 1. Set up project structure, shared infrastructure, and database
  - [x] 1.1 Initialize Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui
    - Create Next.js 14 App Router project with TypeScript strict mode
    - Install and configure Tailwind CSS with the BFV color palette (primary green #0F6E56, amber, blue, pink)
    - Initialize shadcn/ui with default configuration
    - Install Lucide React for icons
    - Install Zod for validation
    - Install fast-check and Vitest for testing
    - Create `.env.example` with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
    - _Requirements: 12.1, 12.4, 12.5_

  - [x] 1.2 Create folder structure following hexagonal architecture with vertical slicing
    - Create `src/modules/` with subfolders for each module: inventario, bailarines, movimientos, cuadros, historial, alertas, funciones, reportes
    - Each module gets domain/ (entities, value-objects, ports), application/ (use-cases, services), infrastructure/ (repositories, mappers, actions)
    - Create `src/shared/` with components, hooks, lib, types, constants
    - Create `src/app/` with (auth) group and login route
    - Create `supabase/` with migrations/ folder
    - _Requirements: 12.3_

  - [x] 1.3 Configure Supabase client and authentication utilities
    - Create `src/shared/lib/supabase/client.ts` for browser client
    - Create `src/shared/lib/supabase/server.ts` for server-side client using cookies
    - Create `src/shared/lib/supabase/admin.ts` for service role client
    - Implement middleware.ts for auth session refresh and route protection
    - _Requirements: 9.1, 9.5, 9.8, 12.2_

  - [x] 1.4 Create Supabase migration for all database tables, RLS policies, and helper functions
    - Write SQL migration creating tables: cuadros, bailarines, prendas, movimientos, plantilla_vestuario, historial, alertas, funciones, checklist_items
    - Implement `get_user_role()` helper function
    - Enable RLS on all tables with policies: read for all authenticated, write for admin on most tables, write for all on movimientos and checklist_items
    - Create transactional RPC functions: `asignar_prenda`, `devolver_prenda`, `traspasar_prenda`
    - Add indexes on foreign keys and frequently filtered columns
    - _Requirements: 9.2, 9.3, 9.4, 9.7_

  - [x] 1.5 Create shared types, value objects, and domain error classes
    - Define all enums/types in `src/shared/types/`: Genero, Categoria, EstadoPrenda, TipoMovimiento, Propietario, Prioridad, EstadoFuncion, TipoEvento, EstadoVerificacion, Role
    - Implement DomainError base class and subclasses: ValidationError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError, SequenceLimitError, ImageUploadError, MovementError
    - Define shared interfaces: Pagination, PaginatedResult, CursorPagination, Result<T, E>
    - _Requirements: 1.3, 12.3_

  - [x] 1.6 Create Zod validation schemas for all entities
    - Implement `createPrendaSchema` and `updatePrendaSchema` in shared/lib/validations/
    - Implement `createBailarinSchema` and `updateBailarinSchema`
    - Implement `createMovimientoSchema`
    - Implement `createCuadroSchema`, `createPlantillaSchema`
    - Implement `createFuncionSchema`
    - Implement `createAlertaSchema`
    - _Requirements: 1.7, 2.5, 2.8, 3.1, 4.1, 7.1_

  - [x]\* 1.7 Write property tests for validation schemas and code generation
    - Property 3: Prenda validation rejects invalid inputs
    - Property 4: Image upload validation
    - Property 7: Bailarin validation rejects invalid inputs
    - Validates: Requirements 1.7, 1.8, 1.9, 2.5, 2.8

- [x] 2. Checkpoint - Verify project setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Inventario module (domain, application, infrastructure)
  - [x] 3.1 Create Inventario domain entities, value objects, and port interfaces
    - Implement `Prenda` entity interface in `modules/inventario/domain/entities/`
    - Implement `CodigoIdentificador` value object with format logic "{G}{C}-{NNN}"
    - Define `PrendaRepository` port interface with all methods
    - Define `PrendaFilters` type for filtering
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Implement CodigoGeneratorService and Inventario use cases
    - Implement `CodigoGeneratorService` that maps genero to M/F/U, cuadro to H/N/R, and generates sequential 3-digit numbers
    - Implement `CrearPrendaUseCase` with validation, code generation, and history creation
    - Implement `BuscarPrendasUseCase` with search across nombre, codigo, bailarin name (min 2 chars)
    - Implement `ActualizarPrendaUseCase` and `EliminarPrendaUseCase`
    - Implement `ObtenerPrendaUseCase` for single prenda retrieval
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.10_

  - [x]\* 3.3 Write property tests for codigo identificador generation
    - Property 1: Codigo identificador format correctness
    - Validates: Requirements 1.1

  - [x]\* 3.4 Write property tests for inventory search
    - Property 2: Search returns only matching results
    - Validates: Requirements 1.6

  - [x] 3.5 Implement SupabasePrendaRepository and server actions
    - Implement `SupabasePrendaRepository` with all port methods
    - Implement `PrendaMapper` for DTO to Entity conversion
    - Create server actions: `crearPrendaAction`, `actualizarPrendaAction`, `eliminarPrendaAction`, `buscarPrendasAction`
    - Implement image upload to Supabase Storage with format/size validation (JPG/PNG/WebP, max 5MB)
    - _Requirements: 1.2, 1.4, 1.6, 1.8, 1.9_

  - [x] 3.6 Create Inventario UI pages and components
    - Create `src/app/(auth)/inventario/page.tsx` with DataTable, pagination (10/page), sorting, filters (cuadro, genero, categoria, estado, propietario)
    - Create `src/app/(auth)/inventario/[id]/page.tsx` with PrendaCard showing all attributes and embedded history timeline
    - Create `PrendaForm` component for create/edit with validation feedback
    - Create `ImageUploader` component with preview, format validation, and size check
    - Implement search input with 2-char minimum trigger
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 10.9_

- [x] 4. Implement Bailarines module
  - [x] 4.1 Create Bailarines domain entities, value objects, and port interfaces
    - Implement `Bailarin` entity interface with Tallas and TallaPersonalizada
    - Define `BailarinRepository` port interface
    - Define `BailarinFilters` type (cuadro, genero, activo)
    - _Requirements: 2.1_

  - [x] 4.2 Implement Bailarines use cases
    - Implement `CrearBailarinUseCase` with validation (1-3 cuadros, required fields)
    - Implement `ActualizarBailarinUseCase` including toggle activo/inactivo
    - Implement `ObtenerBailarinesUseCase` with filters and search by nombre
    - Implement `ObtenerPerfilBailarinUseCase` with vestuario by cuadro and completitud calculation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [x]\* 4.3 Write property tests for bailarin filtering and completitud
    - Property 5: Completitud calculation correctness
    - Property 6: Bailarin filter correctness
    - Property 8: Inactive dancers excluded from completitud
    - Validates: Requirements 2.2, 2.3, 2.7, 4.6, 4.7

  - [x] 4.4 Implement SupabaseBailarinRepository and server actions
    - Implement `SupabaseBailarinRepository` with all port methods
    - Implement `BailarinMapper` for DTO to Entity conversion
    - Create server actions: `crearBailarinAction`, `actualizarBailarinAction`, `toggleActivoAction`
    - _Requirements: 2.1, 2.7_

  - [x] 4.5 Create Bailarines UI pages and components
    - Create `src/app/(auth)/bailarines/page.tsx` with list view, filters (cuadro, genero, activo/inactivo), search
    - Show completitud bar per cuadro for each bailarin in list
    - Create `src/app/(auth)/bailarines/[id]/page.tsx` with BailarinProfile showing tallas and vestuario by cuadro
    - Create `BailarinForm` component with tallas section (predefined + up to 5 custom fields)
    - Show ColorNorteBadge when bailarin has color_norte assigned
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 10.9_

- [x] 5. Implement Movimientos module
  - [x] 5.1 Create Movimientos domain entities, value objects, and port interfaces
    - Implement `Movimiento` entity interface
    - Define `MovimientoRepository` port interface
    - Define `MovimientoFilters` type (tipo, devuelta, cuadro)
    - Define business rules: only "Disponible" prendas can be assigned/loaned, no double devolution
    - _Requirements: 3.1, 3.3, 3.8_

  - [x] 5.2 Implement Movimientos use cases with state transitions
    - Implement `AsignarPrendaUseCase`: validate prenda disponible, create movimiento, update prenda estado to "En uso", set bailarin_actual, create historial entry
    - Implement `PrestarPrendaUseCase`: validate prenda disponible, create movimiento, update prenda estado to "Prestada", set bailarin_actual
    - Implement `DevolverPrendaUseCase`: validate not already devuelta, mark devuelta=true, reset prenda to "Disponible", clear bailarin_actual
    - Implement `TraspasarPrendaUseCase`: update bailarin_actual to destination, preserve prenda estado
    - Implement overdue detection logic (fecha_devolucion_esperada < current date)
    - _Requirements: 3.2, 3.4, 3.5, 3.7_

  - [x]\* 5.3 Write property tests for movement state transitions
    - Property 9: Movement state transitions
    - Property 10: Non-available prenda rejection
    - Property 11: Devolution resets prenda state
    - Property 12: Overdue loan detection
    - Property 13: Traspaso preserves estado and updates bailarin
    - Property 14: Double devolution rejection
    - Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.7, 3.8

  - [x] 5.4 Implement SupabaseMovimientoRepository and server actions
    - Implement `SupabaseMovimientoRepository` using RPC functions for transactional operations
    - Implement `MovimientoMapper` for DTO to Entity conversion
    - Create server actions: `asignarPrendaAction`, `prestarPrendaAction`, `devolverPrendaAction`, `traspasarPrendaAction`
    - _Requirements: 3.1, 3.2, 3.4, 3.7_

  - [x] 5.5 Create Movimientos UI pages and components
    - Create `src/app/(auth)/movimientos/page.tsx` with active movements list, filters (tipo, devuelta, cuadro)
    - Implement overdue indicator (red color + "Vencido" label) for expired loans
    - Create `AsignacionDialog` for one-click assignment from prenda card or bailarin profile
    - Create `DevolucionDialog` for return registration
    - Create `TraspasoDialog` for transfer between bailarines
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 3.7_

- [x] 6. Checkpoint - Verify core modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Cuadros and Plantillas module
  - [x] 7.1 Create Cuadros domain entities, port interfaces, and use cases
    - Implement `Cuadro` entity and `PlantillaItem` entity
    - Define `CuadroRepository` and `PlantillaRepository` port interfaces
    - Implement CRUD use cases for cuadros with validation (nombre max 50, zona max 100, color_ui required)
    - Implement `GestionarPlantillaUseCase` for setting plantilla items (max 30 per cuadro-genero)
    - Implement `CalcularCompletitudUseCase` comparing assigned prendas vs plantilla items
    - _Requirements: 4.1, 4.2, 4.6, 4.7_

  - [x] 7.2 Implement Supabase repositories and server actions for Cuadros
    - Implement `SupabaseCuadroRepository` and `SupabasePlantillaRepository`
    - Create server actions for cuadro CRUD and plantilla management
    - _Requirements: 4.1, 4.2_

  - [x] 7.3 Create Cuadros UI pages and components
    - Create `src/app/(auth)/cuadros/page.tsx` with cuadro list and CuadroBadge (amber/blue/pink)
    - Create `src/app/(auth)/cuadros/[id]/page.tsx` with cuadro detail, PlantillaEditor, and CompletitudMatrix
    - Implement CompletitudMatrix: cross-table with bailarines in rows, plantilla items in columns, green/red cells
    - Show ColorNorteBadge in Cuadro Norte completitud view
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 8. Implement Historial module
  - [x] 8.1 Create Historial domain entities, port interfaces, and use cases
    - Implement `HistorialEntry` entity with all TipoEvento types
    - Define `HistorialRepository` port interface with cursor-based pagination
    - Implement `CrearHistorialUseCase` that creates entries only for successful actions
    - Implement `ObtenerHistorialPrendaUseCase` and `ObtenerHistorialBailarinUseCase` (last 50, load more)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [x] 8.2 Implement SupabaseHistorialRepository and integrate with other modules
    - Implement `SupabaseHistorialRepository` with cursor pagination
    - Ensure historial entries are created within transactional RPCs (atomicity with parent action)
    - Implement immutability: no UPDATE/DELETE policies on historial table
    - _Requirements: 5.1, 5.5, 5.6_

  - [x]\* 8.3 Write property tests for historial
    - Property 15: History entry creation for completed actions
    - Property 16: History immutability
    - Property 17: No history for failed actions
    - Validates: Requirements 5.1, 5.4, 5.5, 5.6

  - [x] 8.4 Create Historial UI components
    - Implement timeline component for prenda card (embedded, last 50 events, load more)
    - Implement history list for bailarin profile (last 50 events, load more)
    - Show tipo_evento, fecha, descripcion, usuario for each entry
    - _Requirements: 5.2, 5.3_

- [x] 9. Implement Alertas module
  - [x] 9.1 Create Alertas domain entities, port interfaces, and use cases
    - Implement `Alerta` entity with TipoCondicion, Prioridad, entidad reference
    - Define `AlertaRepository` port interface
    - Implement `GenerarAlertasUseCase` checking all 6 conditions: Faltante sin movimiento, En reparacion >30 dias, prestamo vencido, completitud <80%, sin ubicacion, "Revisar" en comentarios
    - Implement priority assignment: Alta (vencidos, faltantes), Media (reparacion, completitud), Baja (ubicacion, comentarios)
    - Implement `ResolverAlertaUseCase` (manual) and `AutoResolverAlertaUseCase` (system)
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6_

  - [x]\* 9.2 Write property tests for alertas
    - Property 18: Alert generation with correct priority
    - Property 19: Alert ordering
    - Property 20: Alert auto-resolution
    - Validates: Requirements 6.1, 6.2, 6.3, 6.6

  - [x] 9.3 Implement SupabaseAlertaRepository and server actions
    - Implement `SupabaseAlertaRepository` with ordering by priority desc, fecha desc
    - Create server actions: `resolverAlertaAction`, `recalcularAlertasAction`
    - Integrate alert recalculation into movimiento and prenda update flows
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 9.4 Create Alertas UI page and components
    - Create `src/app/(auth)/alertas/page.tsx` with active alerts panel sorted by priority
    - Show AlertBadge with priority color, tipo, fecha, descripcion, and link to entity
    - Implement "Resolver" button for manual resolution
    - Show resolved alerts history section
    - _Requirements: 6.3, 6.4_

- [x] 10. Implement Funciones and Checklist module
  - [x] 10.1 Create Funciones domain entities, port interfaces, and use cases
    - Implement `Funcion` entity and `ChecklistItem` entity
    - Define `FuncionRepository` and `ChecklistRepository` port interfaces
    - Implement `CrearFuncionUseCase` with automatic checklist generation (bailarin x plantilla items)
    - Implement `VerificarItemUseCase` and `MarcarFaltanteUseCase` for quick marking
    - Implement `FinalizarFuncionUseCase` that saves resultado_checklist summary
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

  - [x]\* 10.2 Write property tests for checklist generation and statistics
    - Property 21: Checklist generation completeness
    - Property 22: Checklist statistics correctness
    - Validates: Requirements 7.2, 7.4, 7.6

  - [x] 10.3 Implement Supabase repositories and server actions for Funciones
    - Implement `SupabaseFuncionRepository` and `SupabaseChecklistRepository`
    - Create server actions: `crearFuncionAction`, `verificarItemAction`, `marcarFaltanteAction`, `finalizarFuncionAction`
    - _Requirements: 7.1, 7.3, 7.5, 7.6_

  - [x] 10.4 Create Funciones UI pages and components
    - Create `src/app/(auth)/funciones/page.tsx` with function list ordered by date desc
    - Create `src/app/(auth)/funciones/[id]/page.tsx` with ChecklistView grouped by bailarin
    - Implement ProgressIndicator showing "X de Y verificados" with progress bar
    - Implement one-click verification and faltante marking (optimistic UI update)
    - Create `FuncionForm` for creating new functions with cuadro and bailarin selection
    - Show past functions with their checklist results
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.7_

- [x] 11. Checkpoint - Verify all domain modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Reportes module
  - [x] 12.1 Create Reportes domain and use cases
    - Implement `GenerarReporteInventarioUseCase` with filters (cuadro, genero, estado, bailarin)
    - Implement `GenerarListaComprasUseCase` filtering prendas with estado "Faltante" grouped by cuadro
    - Implement `GenerarFichaBailarinUseCase` with nombre, tallas, vestuario by cuadro
    - Implement `GenerarReporteEstadoCuadroUseCase` with completitud general, alertas activas, prendas en reparacion
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x]\* 12.2 Write property test for shopping list report
    - Property 23: Shopping list contains exactly "Faltante" items
    - Validates: Requirements 8.2

  - [x] 12.3 Implement PDF export with @react-pdf/renderer
    - Create PDF templates with BFV header (ballet name, report title, generation date/time)
    - Implement inventory report PDF with filtered columns
    - Implement shopping list PDF grouped by cuadro
    - Implement bailarin ficha PDF
    - Implement cuadro status report PDF
    - Create API route `src/app/api/reportes/pdf/route.ts` for server-side PDF generation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 12.6_

  - [x] 12.4 Implement Excel export with xlsx (SheetJS)
    - Implement inventory report Excel with filtered data
    - Implement shopping list Excel grouped by cuadro
    - Include BFV header row in all exports
    - Create API route `src/app/api/reportes/excel/route.ts` for server-side Excel generation
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 12.6_

  - [x] 12.5 Create Reportes UI page
    - Create `src/app/(auth)/reportes/page.tsx` with report type selection and filter controls
    - Implement download buttons for PDF and Excel formats
    - Show loading state during generation, error toast on failure with retry option
    - _Requirements: 8.5, 8.7_

- [x] 13. Implement Authentication UI and role-based access
  - [x] 13.1 Create login page and authentication flow
    - Create `src/app/login/page.tsx` with email/password form
    - Implement login server action with Supabase Auth
    - Show generic error message on invalid credentials (no email existence leak)
    - Redirect to dashboard on successful login
    - Implement logout functionality
    - _Requirements: 9.1, 9.5, 9.6, 9.8_

  - [x] 13.2 Implement role-based UI controls
    - Create `useUserRole` hook to read role from session JWT app_metadata
    - Conditionally hide/disable delete buttons and admin-only actions for "encargado" role
    - Show "Permisos insuficientes" toast when encargado attempts forbidden operation
    - _Requirements: 9.3, 9.4, 9.7_

  - [x]\* 13.3 Write property test for role-based access control
    - Property 24: Role-based access control
    - Validates: Requirements 9.3, 9.4, 9.7

- [x] 14. Implement shared UI layout, navigation, and theming
  - [x] 14.1 Create root layout, authenticated layout with sidebar, and responsive navigation
    - Implement root layout with dark mode provider (localStorage persistence)
    - Create authenticated layout with Sidebar component (collapsible, hamburger menu below 768px)
    - Add navigation links to all modules with Lucide icons
    - Implement PageHeader component with title and action buttons
    - _Requirements: 10.1, 10.4, 10.5_

  - [x] 14.2 Implement shared UI components and feedback patterns
    - Configure Toast component (5s auto-dismiss for success, manual close for errors)
    - Implement SkeletonLoader components for all main views
    - Show "tardando mas de lo esperado" message after 10s loading
    - Implement DataTable generic component with pagination (10/page), sorting, and filters
    - Ensure all interactive elements have 44x44px minimum touch target
    - _Requirements: 10.3, 10.6, 10.7, 10.8, 10.9, 10.10_

- [x] 15. Implement seed data
  - [x] 15.1 Create seed.sql with all initial data
    - Insert 3 cuadros: Huaso (amber), Norte (blue), Rapa Nui (pink)
    - Insert 7 male bailarines (David V., Felipe A., Oscar C., Daniel M., L. Felipe A., Matias D., Ignacio P.) all in Cuadro Huaso minimum
    - Insert 7 female bailarinas (Cristina M., Fernanda M., Josefa M., Javiera V., Beatriz A., Camila M., Josefa T.) all in Cuadro Huaso minimum
    - Insert 20-30 prendas distributed across cuadros with at least one in each estado (Disponible, En uso, En reparacion, Faltante), including Chasquilla No6 (L. Felipe A., En reparacion), Aros (Josefa T., Faltante), Espuela (Ignacio P., Faltante)
    - Insert plantillas: Huaso M (manta, chaquetilla, sombrero, botines, pierneras, espuelas, faja), Huaso F (manta, falda, blusa, sombrero, botines, faja), Norte M/F (sombrero, polera, axo, faja, aguayo), Rapa Nui M (kahu, vere vere, corona, brazaletes), Rapa Nui F (kahu, vere vere, corona, brazaletes, sosten, enagua)
    - Insert at least one admin user
    - Implement idempotency using ON CONFLICT DO NOTHING
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x]\* 15.2 Write property test for seed idempotency
    - Property 25: Seed idempotency
    - Validates: Requirements 11.6

- [x] 16. Final integration and wiring
  - [x] 16.1 Wire alert recalculation into all state-changing flows
    - Trigger alert recalculation after prenda state changes
    - Trigger alert recalculation after movimiento creation/devolution
    - Trigger alert recalculation after bailarin profile updates
    - Implement auto-resolution when conditions no longer hold
    - _Requirements: 6.5, 6.6_

  - [x] 16.2 Wire completitud recalculation into assignment and plantilla flows
    - Recalculate completitud when prendas are assigned/returned
    - Recalculate completitud when plantilla is updated
    - Update bailarin completitud display in real-time
    - _Requirements: 4.6_

  - [x] 16.3 Create README.md with setup and deployment instructions
    - Document prerequisites (Node.js, npm/pnpm)
    - Document dependency installation steps
    - Document environment variable configuration with .env.example reference
    - Document seed execution instructions
    - Document local development commands
    - Document Vercel deployment steps
    - _Requirements: 12.4, 12.5_

  - [x]\* 16.4 Write integration tests for RLS policies and transactional RPCs
    - Test admin can perform all CRUD operations
    - Test encargado can read all, write movimientos and checklist_items, cannot delete
    - Test transactional RPCs rollback on failure (no orphaned historial entries)
    - _Requirements: 9.2, 9.3, 9.4, 5.6_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with \* are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript throughout with Zod for runtime validation
- Server Components are the default; Client Components only where browser state/events are needed
- All transactional operations use Supabase RPC functions for atomicity

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5"] },
    { "id": 3, "tasks": ["1.6"] },
    { "id": 4, "tasks": ["1.7", "3.1", "4.1", "5.1"] },
    { "id": 5, "tasks": ["3.2", "4.2", "5.2", "7.1", "8.1"] },
    {
      "id": 6,
      "tasks": [
        "3.3",
        "3.4",
        "3.5",
        "4.3",
        "4.4",
        "5.3",
        "5.4",
        "7.2",
        "8.2",
        "9.1"
      ]
    },
    {
      "id": 7,
      "tasks": ["3.6", "4.5", "5.5", "7.3", "8.3", "8.4", "9.2", "9.3", "10.1"]
    },
    { "id": 8, "tasks": ["9.4", "10.2", "10.3"] },
    { "id": 9, "tasks": ["10.4", "12.1"] },
    { "id": 10, "tasks": ["12.2", "12.3", "12.4"] },
    { "id": 11, "tasks": ["12.5", "13.1", "13.2"] },
    { "id": 12, "tasks": ["13.3", "14.1"] },
    { "id": 13, "tasks": ["14.2", "15.1"] },
    { "id": 14, "tasks": ["15.2", "16.1", "16.2"] },
    { "id": 15, "tasks": ["16.3", "16.4"] }
  ]
}
```
