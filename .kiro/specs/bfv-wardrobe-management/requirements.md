# Requirements Document

## Introduction

Plataforma web de gestión integral de vestuario para el Ballet Folklórico de Valdivia (BFV). El sistema permite administrar el inventario de prendas, asignaciones a bailarines, préstamos, alertas de estado, checklists de funciones y reportes exportables. Está diseñado para ser utilizado desde dispositivos móviles en camarines y desde escritorio para tareas administrativas.

El ballet cuenta con tres cuadros (repertorios): Cuadro Huaso, Cuadro Norte y Cuadro Rapa Nui, cada uno con vestuario distintivo. Los bailarines pueden participar en uno o más cuadros simultáneamente.

## Glossary

- **Sistema**: La plataforma web BFV Wardrobe Management en su totalidad
- **Módulo_Inventario**: Subsistema encargado de la gestión del catálogo de prendas
- **Módulo_Bailarines**: Subsistema encargado de la gestión de perfiles de bailarines
- **Módulo_Movimientos**: Subsistema encargado del registro de asignaciones, préstamos y devoluciones
- **Módulo_Cuadros**: Subsistema encargado de la configuración de cuadros y plantillas de vestuario requerido
- **Módulo_Historial**: Subsistema encargado del registro automático de eventos sobre prendas y bailarines
- **Módulo_Alertas**: Subsistema encargado de la generación y gestión de alertas automáticas
- **Módulo_Funciones**: Subsistema encargado de la creación de eventos y checklists de verificación de vestuario
- **Módulo_Reportes**: Subsistema encargado de la generación de reportes y exportación a PDF/Excel
- **Prenda**: Artículo de vestuario individual registrado en el inventario
- **Bailarín**: Persona registrada como integrante del ballet (masculino o femenino)
- **Cuadro**: Repertorio artístico del ballet asociado a una zona geográfica de Chile (Huaso, Norte, Rapa Nui)
- **Movimiento**: Registro de una acción sobre una prenda (asignación, préstamo, devolución, traspaso)
- **Función**: Evento de presentación artística del ballet
- **Checklist**: Lista de verificación de prendas generada automáticamente para una función
- **Plantilla_Vestuario**: Conjunto de prendas requeridas por cuadro y género
- **Color_Norte**: Color único asignado a cada bailarín para el Cuadro Norte
- **RLS**: Row Level Security de Supabase para control de acceso por rol
- **Admin**: Rol con acceso completo a todas las operaciones del sistema
- **Encargado**: Rol con acceso de lectura completo, escritura en asignaciones y checklist, sin permisos de eliminación
- **Completitud**: Porcentaje de prendas requeridas que un bailarín tiene asignadas para un cuadro específico

## Requirements

### Requirement 1: Gestión de Inventario de Prendas

**User Story:** Como encargado de vestuario, quiero registrar y consultar todas las prendas del ballet con sus atributos completos, para mantener un catálogo actualizado y localizable del vestuario.

#### Acceptance Criteria

1. WHEN un usuario crea una prenda, THE Módulo_Inventario SHALL generar automáticamente un código identificador con formato "{G}{C}-{NNN}" donde G es el género (M/F/U), C es la inicial del cuadro (H/N/R), y NNN es un número secuencial de tres dígitos (001-999) asignando el siguiente número disponible para la combinación género-cuadro correspondiente.
2. THE Módulo_Inventario SHALL almacenar para cada prenda los campos: id, nombre (máximo 100 caracteres), cuadro, género (Masculino/Femenino/Unisex), categoría (Tocado/Ropa superior/Ropa inferior/Calzado/Accesorio/Joyería), color (máximo 50 caracteres), talla_o_numero (máximo 20 caracteres), identificador_fisico (máximo 50 caracteres), bailarin_actual, propietario (Ballet/Personal), ubicacion (máximo 100 caracteres), estado, foto_url, comentarios (máximo 500 caracteres), y fecha_ingreso.
3. THE Módulo_Inventario SHALL permitir los estados: Disponible, En uso, En reparación, Faltante, Prestada, y Dada de baja.
4. WHEN un usuario accede al inventario, THE Módulo_Inventario SHALL presentar una vista de tabla con paginación de 10 registros por página, ordenamiento por columnas, y filtros por cuadro, género, categoría, estado y propietario.
5. WHEN un usuario selecciona una prenda, THE Módulo_Inventario SHALL mostrar una tarjeta individual con todos los atributos de la prenda y su historial de eventos embebido.
6. WHEN un usuario busca en el inventario, THE Módulo_Inventario SHALL permitir búsqueda por nombre de prenda, código identificador, o nombre de bailarín asignado, filtrando resultados a partir de 2 caracteres ingresados.
7. IF un usuario envía el formulario de creación o edición de prenda con algún campo obligatorio (nombre, cuadro, género, categoría, estado) vacío o inválido, THEN THE Módulo_Inventario SHALL impedir el guardado y mostrar un mensaje de error indicando los campos que requieren corrección.
8. WHEN un usuario sube una foto para una prenda, THE Módulo_Inventario SHALL aceptar archivos en formato JPG, PNG o WebP con tamaño máximo de 5 MB, almacenar la imagen en Supabase Storage, y asociar la URL generada a la prenda.
9. IF la subida de imagen falla por formato no soportado o tamaño excedido, THEN THE Módulo_Inventario SHALL mostrar un mensaje de error indicando la restricción incumplida sin guardar cambios en la prenda.
10. IF el número secuencial de un código identificador alcanza 999 para una combinación género-cuadro, THEN THE Módulo_Inventario SHALL impedir la creación de la prenda y mostrar un mensaje de error indicando que se ha alcanzado el límite de códigos para esa combinación.

### Requirement 2: Gestión de Bailarines

**User Story:** Como encargado de vestuario, quiero gestionar los perfiles de bailarines con sus tallas y cuadros activos, para saber qué vestuario necesita cada persona.

#### Acceptance Criteria

1. THE Módulo_Bailarines SHALL almacenar para cada bailarín: nombre_completo (obligatorio, máximo 100 caracteres), género (obligatorio, Masculino/Femenino), cuadros_activos (arreglo de 1 a 3 cuadros), color_norte (opcional, aplicable solo si Cuadro Norte está en cuadros_activos), tallas (objeto con campos predefinidos: camisa, pantalón, sombrero, calzado, y hasta 5 campos personalizados adicionales con nombre y valor de máximo 30 caracteres cada uno), activo (booleano, por defecto verdadero), fecha_ingreso (obligatorio), y notas (opcional, máximo 500 caracteres).
2. WHEN un usuario accede al listado de bailarines, THE Módulo_Bailarines SHALL mostrar cada bailarín con su nombre, género, cuadros activos, y un indicador visual de completitud de vestuario por cuadro activo en forma de barra de progreso porcentual (0% a 100%), calculada comparando prendas asignadas contra la Plantilla_Vestuario del cuadro y género correspondiente.
3. WHEN un usuario accede al listado de bailarines, THE Módulo_Bailarines SHALL permitir filtrar por cuadro, género y estado (activo/inactivo), y buscar por nombre_completo.
4. WHEN un usuario selecciona un bailarín, THE Módulo_Bailarines SHALL mostrar un perfil individual con las tallas registradas y todo el vestuario asignado organizado por cuadro, indicando para cada prenda: nombre, categoría, estado y código identificador.
5. THE Módulo_Bailarines SHALL proporcionar un formulario de creación y edición con validación de campos obligatorios (nombre_completo, género, al menos un cuadro activo, fecha_ingreso) y una sección dedicada a tallas que incluya campos predefinidos (camisa, pantalón, sombrero, calzado) y la posibilidad de agregar hasta 5 campos de talla personalizados.
6. IF un bailarín tiene asignado un color_norte, THEN THE Módulo_Bailarines SHALL mostrar ese color como etiqueta visual en todas las vistas donde aparezca el bailarín.
7. WHEN un usuario marca un bailarín como inactivo, THE Módulo_Bailarines SHALL preservar su historial y asignaciones previas, excluirlo de los cálculos de completitud por cuadro, y no mostrarlo en los listados por defecto (visible solo al activar el filtro de inactivos).
8. IF un usuario intenta guardar un bailarín con campos obligatorios vacíos o con más de 3 cuadros activos, THEN THE Módulo_Bailarines SHALL impedir el guardado y mostrar un mensaje de error indicando los campos que requieren corrección.

### Requirement 3: Asignaciones y Préstamos

**User Story:** Como encargado de vestuario, quiero registrar asignaciones y préstamos de prendas a bailarines con un solo clic, para mantener trazabilidad de quién tiene cada prenda.

#### Acceptance Criteria

1. THE Módulo_Movimientos SHALL registrar cada movimiento con: prenda_id, bailarin_id, tipo (Asignación/Préstamo interno/Préstamo externo/Devolución/Traspaso), fecha_inicio, fecha_devolucion_esperada (opcional), devuelta (booleano), registrado_por, observación (texto libre de máximo 500 caracteres), y estado de la prenda resultante.
2. WHEN un usuario asigna una prenda con estado "Disponible" desde la tarjeta de prenda o desde el perfil de bailarín, THE Módulo_Movimientos SHALL completar la asignación con un solo clic de confirmación, actualizar el campo bailarin_actual de la prenda, y cambiar el estado de la prenda a "En uso" para Asignaciones o a "Prestada" para Préstamos internos y externos.
3. IF un usuario intenta asignar o prestar una prenda cuyo estado no es "Disponible", THEN THE Módulo_Movimientos SHALL rechazar la operación y mostrar un mensaje indicando que la prenda no está disponible junto con el bailarín que la tiene actualmente.
4. WHEN un usuario registra una devolución, THE Módulo_Movimientos SHALL marcar el movimiento original como devuelto, actualizar el estado de la prenda a "Disponible", y limpiar el campo bailarin_actual.
5. WHILE un préstamo activo tiene fecha_devolucion_esperada y la fecha actual supera dicha fecha, THE Módulo_Movimientos SHALL mostrar el préstamo con un indicador de color rojo y la etiqueta "Vencido" en la vista de préstamos activos.
6. THE Módulo_Movimientos SHALL mostrar una vista de movimientos activos (movimientos no devueltos de tipo Asignación, Préstamo interno, Préstamo externo o Traspaso) filtrable por tipo de movimiento, estado de devolución, y cuadro de la prenda.
7. WHEN un usuario realiza un traspaso, THE Módulo_Movimientos SHALL registrar la salida del bailarín anterior y la entrada al bailarín nuevo en un solo movimiento, actualizando el campo bailarin_actual de la prenda al nuevo bailarín y manteniendo el estado actual de la prenda sin cambios.
8. IF un usuario intenta registrar una devolución sobre un movimiento que ya está marcado como devuelto, THEN THE Módulo_Movimientos SHALL rechazar la operación y mostrar un mensaje indicando que el movimiento ya fue devuelto previamente.

### Requirement 4: Gestión de Cuadros y Plantillas de Vestuario

**User Story:** Como administrador, quiero configurar los cuadros del ballet y definir qué prendas requiere cada cuadro por género, para calcular automáticamente la completitud del vestuario de cada bailarín.

#### Acceptance Criteria

1. THE Módulo_Cuadros SHALL permitir operaciones CRUD sobre cuadros con los campos: nombre (obligatorio, máximo 50 caracteres), zona_geográfica (obligatorio, máximo 100 caracteres), descripción (opcional, máximo 500 caracteres), y color_ui (obligatorio, color de identificación visual en la plataforma), validando los campos obligatorios antes de guardar.
2. THE Módulo_Cuadros SHALL permitir definir una plantilla de vestuario requerido por cuadro y género, donde cada ítem de la plantilla especifica una categoría (Tocado/Ropa superior/Ropa inferior/Calzado/Accesorio/Joyería) y un nombre de prenda obligatoria, con un máximo de 30 ítems por combinación cuadro-género.
3. WHEN un usuario accede a la vista de completitud de un cuadro, THE Módulo_Cuadros SHALL mostrar una tabla cruzada con los bailarines activos del cuadro en filas y las prendas requeridas según la plantilla del género correspondiente en columnas, usando celdas verdes para prendas asignadas y celdas rojas para prendas faltantes.
4. THE Módulo_Cuadros SHALL aplicar los colores de identificación visual por cuadro: ámbar para Huaso, azul para Norte, y rosa para Rapa Nui, como badges en toda la plataforma donde se muestre el nombre de un cuadro.
5. WHEN un administrador asigna un color_norte a un bailarín, THE Módulo_Cuadros SHALL mostrar ese color como etiqueta visual junto al nombre del bailarín en la vista de completitud del Cuadro Norte y en la tabla cruzada de dicho cuadro.
6. WHEN se modifica una asignación de prenda o se actualiza una plantilla de vestuario, THE Módulo_Cuadros SHALL recalcular el porcentaje de completitud de vestuario de cada bailarín afectado, dividiendo la cantidad de prendas asignadas que coinciden con ítems de la plantilla entre la cantidad total de ítems de la plantilla para el cuadro y género correspondiente, expresado como porcentaje entero de 0 a 100.
7. IF la plantilla de vestuario de un cuadro y género no contiene ítems, THEN THE Módulo_Cuadros SHALL mostrar la completitud como "Sin plantilla definida" en lugar de un porcentaje numérico.

### Requirement 5: Historial y Trazabilidad

**User Story:** Como encargado de vestuario, quiero que el sistema registre automáticamente cada evento sobre una prenda o bailarín, para tener trazabilidad completa del ciclo de vida del vestuario.

#### Acceptance Criteria

1. WHEN ocurre una Asignación, Devolución, Cambio de estado, Reparación, Préstamo, Traspaso, Comentario agregado, o Creación de prenda, THE Módulo_Historial SHALL crear automáticamente un registro con: fecha (timestamp), tipo_evento, prenda_id, persona_involucrada (bailarín asociado al evento, si aplica), descripción (máximo 500 caracteres), y usuario_que_registró.
2. WHEN un usuario visualiza la tarjeta de una prenda, THE Módulo_Historial SHALL mostrar una línea de tiempo con todos los eventos asociados a esa prenda, ordenados del más reciente al más antiguo, mostrando los últimos 50 eventos con opción de cargar más.
3. WHEN un usuario visualiza el perfil de un bailarín, THE Módulo_Historial SHALL mostrar el historial de todos los movimientos asociados a ese bailarín, ordenados del más reciente al más antiguo, mostrando los últimos 50 eventos con opción de cargar más.
4. THE Módulo_Historial SHALL registrar los siguientes tipos de evento: Asignación, Devolución, Cambio de estado, Reparación, Préstamo, Traspaso, Comentario agregado, y Creación de prenda.
5. THE Módulo_Historial SHALL preservar los registros históricos de forma inmutable, sin permitir edición ni eliminación de entradas del historial.
6. IF la acción que origina un evento falla o es revertida, THEN THE Módulo_Historial SHALL no crear el registro de historial correspondiente, garantizando que solo se registren eventos de acciones completadas exitosamente.

### Requirement 6: Alertas y Estado

**User Story:** Como encargado de vestuario, quiero recibir alertas automáticas sobre situaciones que requieren atención, para gestionar proactivamente el estado del vestuario.

#### Acceptance Criteria

1. THE Módulo_Alertas SHALL generar alertas automáticas para las siguientes condiciones: prendas con estado "Faltante" sin un movimiento activo de tipo Asignación o Préstamo registrado posteriormente al cambio de estado, prendas "En reparación" por más de 30 días consecutivos, préstamos con fecha de devolución vencida, bailarines con completitud de vestuario inferior al 80% en un cuadro activo, prendas sin ubicación asignada, y prendas con la palabra "Revisar" en el campo comentarios.
2. THE Módulo_Alertas SHALL asignar una prioridad a cada alerta: Alta (préstamos vencidos y prendas faltantes), Media (reparaciones prolongadas y completitud baja), o Baja (sin ubicación y comentarios de revisión).
3. WHEN un usuario accede al panel de alertas, THE Módulo_Alertas SHALL mostrar todas las alertas activas ordenadas por prioridad descendente (Alta primero) y dentro de la misma prioridad por fecha de generación descendente (más reciente primero), mostrando para cada alerta: tipo de condición, prioridad, fecha de generación, descripción del problema, y un enlace directo a la tarjeta de la prenda o perfil del bailarín asociado.
4. WHEN un usuario marca una alerta como resuelta, THE Módulo_Alertas SHALL registrar la resolución con fecha y usuario, y mover la alerta al historial de alertas resueltas.
5. WHEN se modifica el estado de una prenda, se registra un movimiento, o se actualiza un perfil de bailarín, THE Módulo_Alertas SHALL recalcular las condiciones de alerta asociadas a la entidad modificada.
6. IF la condición que originó una alerta activa deja de cumplirse tras un recálculo (por ejemplo, una prenda faltante es asignada, una prenda recibe ubicación, o la completitud supera el 80%), THEN THE Módulo_Alertas SHALL resolver automáticamente la alerta, registrando "Resuelta por sistema" como usuario y la fecha del recálculo.

### Requirement 7: Checklist de Funciones

**User Story:** Como encargado de vestuario, quiero generar automáticamente una lista de verificación de prendas para cada función, para asegurar que todo el vestuario esté presente antes de la presentación.

#### Acceptance Criteria

1. THE Módulo_Funciones SHALL permitir crear un evento de función con: nombre (máximo 100 caracteres), fecha, lugar (máximo 200 caracteres), cuadros_que_se_presentan (arreglo de 1 a 3 cuadros), bailarines_convocados (arreglo con al menos 1 bailarín), y estado (Pendiente/En curso/Finalizada), donde el estado inicial es "Pendiente".
2. WHEN un usuario crea una función, THE Módulo_Funciones SHALL generar automáticamente un checklist donde cada ítem corresponde a una prenda requerida por la plantilla de vestuario del cuadro y género de cada bailarín convocado, resultando en un ítem por cada combinación bailarín-prenda requerida.
3. WHEN un usuario verifica una prenda en el checklist, THE Módulo_Funciones SHALL marcar el ítem como verificado con fecha, hora y usuario que verificó, mediante una interfaz de marcado rápido (un clic).
4. WHILE una función tiene estado "En curso", THE Módulo_Funciones SHALL mostrar el checklist agrupado por bailarín con el avance en formato "X de Y verificados" y una barra de progreso, actualizándose inmediatamente tras cada marcado sin recargar la página.
5. WHEN un usuario marca un ítem del checklist como no presente, THE Módulo_Funciones SHALL registrar el ítem como faltante con fecha, hora y usuario que reportó, y resaltarlo visualmente como pendiente de resolución.
6. WHEN un usuario cambia el estado de una función a "Finalizada", THE Módulo_Funciones SHALL guardar el resultado del checklist incluyendo: total de ítems, cantidad verificados, cantidad faltantes, porcentaje de completitud, y el detalle de cada ítem con su estado final.
7. THE Módulo_Funciones SHALL mantener un historial de funciones pasadas con sus checklists y resultados de verificación accesible desde una vista dedicada, ordenado por fecha de forma descendente.

### Requirement 8: Reportes y Exportación

**User Story:** Como administrador, quiero generar reportes del inventario y exportarlos a PDF y Excel, para compartir información con la directiva y planificar compras.

#### Acceptance Criteria

1. THE Módulo_Reportes SHALL generar un reporte de inventario completo exportable a PDF y Excel, con filtros por cuadro, género, estado y bailarín asignado, incluyendo las columnas: código identificador, nombre, cuadro, género, categoría, talla, estado, bailarín asignado y ubicación.
2. THE Módulo_Reportes SHALL generar una lista de compras exportable a PDF y Excel con todas las prendas en estado "Faltante", incluyendo nombre, cuadro, género, categoría, talla requerida y bailarín que la necesita, agrupada por cuadro.
3. THE Módulo_Reportes SHALL generar una ficha individual de bailarín en PDF con: nombre, tallas, y vestuario asignado organizado por cuadro.
4. THE Módulo_Reportes SHALL generar un reporte de estado por cuadro que incluya: porcentaje de completitud general, cantidad de alertas activas, y listado de prendas en reparación.
5. WHEN un usuario solicita una exportación, THE Módulo_Reportes SHALL generar el archivo en el formato solicitado (PDF o Excel) y ofrecerlo para descarga en un tiempo máximo de 10 segundos.
6. THE Módulo_Reportes SHALL incluir en cada reporte exportado un encabezado con el nombre del ballet, el título del reporte, y la fecha y hora de generación.
7. IF la generación de un reporte falla, THEN THE Módulo_Reportes SHALL mostrar un mensaje de error indicando que no se pudo generar el archivo y permitir al usuario reintentar la operación.

### Requirement 9: Autenticación y Control de Acceso

**User Story:** Como administrador, quiero que el sistema controle el acceso mediante roles, para proteger la integridad de los datos y limitar operaciones según responsabilidades.

#### Acceptance Criteria

1. THE Sistema SHALL autenticar usuarios mediante Supabase Auth con email y contraseña antes de permitir acceso a cualquier funcionalidad.
2. THE Sistema SHALL implementar Row Level Security (RLS) en todas las tablas de la base de datos con dos roles: admin y encargado.
3. WHILE un usuario tiene rol "admin", THE Sistema SHALL permitir acceso completo a todas las operaciones incluyendo creación, lectura, actualización y eliminación en todas las tablas.
4. WHILE un usuario tiene rol "encargado", THE Sistema SHALL permitir lectura completa de todas las tablas, escritura en movimientos y checklist_items, y ocultar o deshabilitar los controles de eliminación en la interfaz.
5. IF un usuario no autenticado intenta acceder a una ruta protegida, THEN THE Sistema SHALL redirigir al usuario a la página de inicio de sesión.
6. IF un usuario ingresa credenciales inválidas, THEN THE Sistema SHALL mostrar un mensaje de error indicando que las credenciales son incorrectas sin revelar si el email existe en el sistema, y permitir un nuevo intento.
7. IF un usuario con rol "encargado" intenta realizar una operación no permitida para su rol, THEN THE Sistema SHALL denegar la operación y mostrar una notificación indicando permisos insuficientes.
8. IF la sesión de un usuario expira o el token de autenticación deja de ser válido, THEN THE Sistema SHALL redirigir al usuario a la página de inicio de sesión.

### Requirement 10: Interfaz de Usuario y Experiencia

**User Story:** Como usuario del sistema, quiero una interfaz responsiva, accesible y visualmente coherente, para poder usar la plataforma tanto desde un computador como desde un teléfono en el camarín.

#### Acceptance Criteria

1. THE Sistema SHALL presentar una navegación lateral (sidebar) con acceso a todos los módulos del sistema, colapsándose a un menú tipo hamburguesa en dispositivos con ancho inferior a 768px.
2. THE Sistema SHALL usar la paleta de colores: verde oscuro primario (#0F6E56), superficies blancas, y bordes de 1px en color gris claro.
3. THE Sistema SHALL ser completamente responsivo y funcional en dispositivos con ancho mínimo de 320px, con todos los elementos interactivos (botones, enlaces, ítems de checklist) con un área táctil mínima de 44x44px.
4. THE Sistema SHALL implementar modo claro como predeterminado con soporte para modo oscuro, persistiendo la preferencia del usuario en almacenamiento local del navegador.
5. THE Sistema SHALL usar iconos de la librería Lucide React para toda la iconografía del sistema.
6. WHEN un usuario completa una acción de creación, edición o eliminación exitosamente, THE Sistema SHALL mostrar un toast de confirmación visible durante 5 segundos con opción de cierre manual.
7. IF una acción de creación, edición o eliminación falla, THEN THE Sistema SHALL mostrar un toast de error indicando el motivo del fallo, visible hasta que el usuario lo cierre manualmente.
8. WHILE una vista principal está cargando datos, THE Sistema SHALL mostrar skeleton loaders en lugar del contenido, y si la carga supera los 10 segundos, mostrar un mensaje indicando que la operación está tardando más de lo esperado.
9. WHEN una tabla contiene más de 10 registros, THE Sistema SHALL paginar los resultados en páginas de 10 filas y permitir ordenamiento ascendente y descendente por columnas.
10. THE Sistema SHALL cumplir con nivel de accesibilidad WCAG 2.1 AA, incluyendo navegación completa por teclado, etiquetas ARIA en componentes interactivos, y contraste mínimo de 4.5:1 en texto sobre fondo.

### Requirement 11: Datos Iniciales (Seed)

**User Story:** Como administrador, quiero que el sistema venga precargado con los datos base del ballet, para poder comenzar a usar la plataforma inmediatamente después del despliegue.

#### Acceptance Criteria

1. THE Sistema SHALL precargar los tres cuadros: Cuadro Huaso (ámbar, zona central), Cuadro Norte (azul, zona norte), y Cuadro Rapa Nui (rosa, Isla de Pascua).
2. THE Sistema SHALL precargar 7 bailarines masculinos: David V., Felipe A., Oscar C., Daniel M., L. Felipe A., Matías D., e Ignacio P., cada uno asignado a al menos un cuadro activo, y todos asignados al Cuadro Huaso como mínimo.
3. THE Sistema SHALL precargar 7 bailarinas femeninas: Cristina M., Fernanda M., Josefa M., Javiera V., Beatriz A., Camila M., y Josefa T., cada una asignada a al menos un cuadro activo, y todas asignadas al Cuadro Huaso como mínimo.
4. THE Sistema SHALL precargar al menos 20 y no más de 30 prendas de ejemplo distribuidas entre los tres cuadros, incluyendo al menos una prenda en cada uno de los estados "Disponible", "En uso", "En reparación" y "Faltante", e incluyendo específicamente: Chasquilla Nº6 de L. Felipe A. con estado "En reparación", Aros de Josefa T. con estado "Faltante", y Espuela de Ignacio P. con estado "Faltante".
5. THE Sistema SHALL precargar las plantillas de vestuario requerido con las siguientes prendas obligatorias: para Cuadro Huaso masculino (manta, chaquetilla, sombrero, botines, pierneras, espuelas, faja), para Cuadro Huaso femenino (manta, falda, blusa, sombrero, botines, faja), para Cuadro Norte masculino y femenino (sombrero, polera, axo, faja, aguayo), y para Cuadro Rapa Nui masculino (kahu, vere vere, corona, brazaletes) y femenino (kahu, vere vere, corona, brazaletes, sostén, enagua).
6. IF el seed se ejecuta sobre una base de datos que ya contiene datos de seed previos, THEN THE Sistema SHALL omitir la inserción de registros duplicados sin generar errores, garantizando la idempotencia de la operación.
7. THE Sistema SHALL precargar al menos un usuario con rol "admin" para permitir el acceso inicial a la plataforma tras el despliegue.

### Requirement 12: Arquitectura y Despliegue

**User Story:** Como desarrollador, quiero que el proyecto siga una arquitectura hexagonal con vertical slicing y esté listo para desplegar en Vercel, para mantener el código organizado y facilitar el mantenimiento.

#### Acceptance Criteria

1. THE Sistema SHALL implementarse con Next.js 14 App Router, TypeScript, Tailwind CSS, y componentes shadcn/ui.
2. THE Sistema SHALL usar Supabase como base de datos PostgreSQL y servicio de autenticación.
3. THE Sistema SHALL organizar el código siguiendo arquitectura hexagonal con vertical slicing, donde cada módulo funcional (inventario, bailarines, movimientos, cuadros, historial, alertas, funciones, reportes) contiene su propia carpeta con tres capas: dominio (entidades, value objects, puertos/interfaces), aplicación (casos de uso, servicios), e infraestructura (repositorios Supabase, rutas API, server actions).
4. THE Sistema SHALL ser desplegable en Vercel sin configuración adicional más allá de las variables de entorno requeridas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, y SUPABASE_SERVICE_ROLE_KEY.
5. THE Sistema SHALL incluir un archivo README.md con las siguientes secciones: requisitos previos (Node.js, npm/pnpm), pasos de instalación de dependencias, configuración de variables de entorno con ejemplo (.env.example), instrucciones de ejecución del seed de datos, comandos de desarrollo local, y pasos de despliegue en Vercel.
6. THE Sistema SHALL generar exportaciones PDF mediante react-pdf o jsPDF y exportaciones Excel mediante una librería compatible con el stack definido.
7. THE Sistema SHALL utilizar Server Components de Next.js como patrón predeterminado para renderizado, y Server Actions para las mutaciones de datos, limitando los Client Components a interacciones que requieran estado del navegador o event handlers.
