-- ============================================================
-- BFV Wardrobe Management - Initial Database Schema
-- ============================================================
-- Creates all tables, RLS policies, helper functions, 
-- transactional RPCs, and indexes.
-- Requirements: 9.2, 9.3, 9.4, 9.7
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER FUNCTION: get_user_role()
-- Reads role from JWT app_metadata, defaults to 'encargado'
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT coalesce(
    auth.jwt()->'app_metadata'->>'role',
    'encargado'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLE: cuadros
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cuadros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  zona_geografica text NOT NULL,
  descripcion text,
  color_ui text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: bailarines
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bailarines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  genero text NOT NULL CHECK (genero IN ('Masculino', 'Femenino')),
  cuadros_activos uuid[] NOT NULL DEFAULT '{}',
  color_norte text,
  tallas jsonb NOT NULL DEFAULT '{}',
  activo boolean NOT NULL DEFAULT true,
  fecha_ingreso date NOT NULL,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: prendas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_identificador text UNIQUE NOT NULL,
  nombre text NOT NULL,
  cuadro_id uuid NOT NULL REFERENCES public.cuadros(id) ON DELETE RESTRICT,
  genero text NOT NULL CHECK (genero IN ('Masculino', 'Femenino', 'Unisex')),
  categoria text NOT NULL CHECK (categoria IN ('Tocado', 'Ropa superior', 'Ropa inferior', 'Calzado', 'Accesorio', 'Joyería')),
  color text,
  talla_o_numero text,
  identificador_fisico text,
  bailarin_actual uuid REFERENCES public.bailarines(id) ON DELETE SET NULL,
  propietario text NOT NULL DEFAULT 'Ballet' CHECK (propietario IN ('Ballet', 'Personal')),
  ubicacion text,
  estado text NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En uso', 'En reparación', 'Faltante', 'Prestada', 'Dada de baja')),
  foto_url text,
  comentarios text,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: movimientos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.movimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenda_id uuid NOT NULL REFERENCES public.prendas(id) ON DELETE RESTRICT,
  bailarin_id uuid NOT NULL REFERENCES public.bailarines(id) ON DELETE RESTRICT,
  bailarin_destino_id uuid REFERENCES public.bailarines(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('Asignación', 'Préstamo interno', 'Préstamo externo', 'Devolución', 'Traspaso')),
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_devolucion_esperada date,
  devuelta boolean NOT NULL DEFAULT false,
  registrado_por uuid NOT NULL,
  observacion text,
  estado_resultante text NOT NULL CHECK (estado_resultante IN ('Disponible', 'En uso', 'En reparación', 'Faltante', 'Prestada', 'Dada de baja')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: plantilla_vestuario
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plantilla_vestuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuadro_id uuid NOT NULL REFERENCES public.cuadros(id) ON DELETE CASCADE,
  genero text NOT NULL CHECK (genero IN ('Masculino', 'Femenino')),
  categoria text NOT NULL CHECK (categoria IN ('Tocado', 'Ropa superior', 'Ropa inferior', 'Calzado', 'Accesorio', 'Joyería')),
  nombre_prenda text NOT NULL,
  orden int NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLE: historial
-- ============================================================
CREATE TABLE IF NOT EXISTS public.historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha timestamptz NOT NULL DEFAULT now(),
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('Asignación', 'Devolución', 'Cambio de estado', 'Reparación', 'Préstamo', 'Traspaso', 'Comentario agregado', 'Creación de prenda')),
  prenda_id uuid REFERENCES public.prendas(id) ON DELETE SET NULL,
  persona_involucrada uuid REFERENCES public.bailarines(id) ON DELETE SET NULL,
  descripcion text,
  usuario_que_registro uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: alertas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_condicion text NOT NULL,
  prioridad text NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  entidad_id uuid NOT NULL,
  entidad_tipo text NOT NULL CHECK (entidad_tipo IN ('prenda', 'bailarin')),
  descripcion text NOT NULL,
  resuelta boolean NOT NULL DEFAULT false,
  fecha_generacion timestamptz NOT NULL DEFAULT now(),
  fecha_resolucion timestamptz,
  resuelta_por text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: funciones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.funciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fecha date NOT NULL,
  lugar text,
  cuadros_que_se_presentan uuid[] NOT NULL DEFAULT '{}',
  bailarines_convocados uuid[] NOT NULL DEFAULT '{}',
  estado text NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En curso', 'Finalizada')),
  resultado_checklist jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: checklist_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcion_id uuid NOT NULL REFERENCES public.funciones(id) ON DELETE CASCADE,
  bailarin_id uuid NOT NULL REFERENCES public.bailarines(id) ON DELETE RESTRICT,
  plantilla_item_id uuid REFERENCES public.plantilla_vestuario(id) ON DELETE SET NULL,
  nombre_prenda text NOT NULL,
  categoria text NOT NULL,
  estado_verificacion text NOT NULL DEFAULT 'pendiente' CHECK (estado_verificacion IN ('pendiente', 'verificado', 'faltante')),
  fecha_verificacion timestamptz,
  verificado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.cuadros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bailarines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantilla_vestuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: cuadros (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura cuadros" ON public.cuadros
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción cuadros" ON public.cuadros
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización cuadros" ON public.cuadros
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación cuadros" ON public.cuadros
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: bailarines (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura bailarines" ON public.bailarines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción bailarines" ON public.bailarines
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización bailarines" ON public.bailarines
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación bailarines" ON public.bailarines
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: prendas (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura prendas" ON public.prendas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción prendas" ON public.prendas
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización prendas" ON public.prendas
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación prendas" ON public.prendas
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: movimientos (read: all authenticated, write: all authenticated)
-- ============================================================
CREATE POLICY "Lectura movimientos" ON public.movimientos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción movimientos" ON public.movimientos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualización movimientos" ON public.movimientos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eliminación movimientos" ON public.movimientos
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: plantilla_vestuario (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura plantilla_vestuario" ON public.plantilla_vestuario
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción plantilla_vestuario" ON public.plantilla_vestuario
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización plantilla_vestuario" ON public.plantilla_vestuario
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación plantilla_vestuario" ON public.plantilla_vestuario
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: historial (read: all authenticated, write: admin only, no update/delete)
-- ============================================================
CREATE POLICY "Lectura historial" ON public.historial
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción historial" ON public.historial
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- No UPDATE or DELETE policies on historial (immutable)

-- ============================================================
-- RLS POLICIES: alertas (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura alertas" ON public.alertas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción alertas" ON public.alertas
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización alertas" ON public.alertas
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación alertas" ON public.alertas
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: funciones (read: all authenticated, write: admin)
-- ============================================================
CREATE POLICY "Lectura funciones" ON public.funciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción funciones" ON public.funciones
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Actualización funciones" ON public.funciones
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Eliminación funciones" ON public.funciones
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: checklist_items (read: all authenticated, write: all authenticated)
-- ============================================================
CREATE POLICY "Lectura checklist_items" ON public.checklist_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Inserción checklist_items" ON public.checklist_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualización checklist_items" ON public.checklist_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eliminación checklist_items" ON public.checklist_items
  FOR DELETE USING (public.get_user_role() = 'admin');


-- ============================================================
-- TRANSACTIONAL RPC FUNCTIONS
-- ============================================================

-- ============================================================
-- RPC: asignar_prenda
-- Validates prenda is "Disponible", creates movimiento, updates
-- prenda estado and bailarin_actual, creates historial entry.
-- ============================================================
CREATE OR REPLACE FUNCTION public.asignar_prenda(
  p_prenda_id uuid,
  p_bailarin_id uuid,
  p_tipo text,
  p_registrado_por uuid,
  p_observacion text DEFAULT NULL,
  p_fecha_devolucion_esperada date DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_prenda_estado text;
  v_bailarin_actual uuid;
  v_estado_resultante text;
  v_movimiento_id uuid;
  v_prenda_nombre text;
  v_bailarin_nombre text;
  v_tipo_evento text;
BEGIN
  -- Lock the prenda row to prevent concurrent modifications
  SELECT estado, bailarin_actual, nombre
  INTO v_prenda_estado, v_bailarin_actual, v_prenda_nombre
  FROM public.prendas
  WHERE id = p_prenda_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prenda no encontrada: %', p_prenda_id;
  END IF;

  -- Validate prenda is available
  IF v_prenda_estado <> 'Disponible' THEN
    RAISE EXCEPTION 'La prenda no está disponible. Estado actual: %. Bailarín actual: %', v_prenda_estado, v_bailarin_actual;
  END IF;

  -- Validate tipo
  IF p_tipo NOT IN ('Asignación', 'Préstamo interno', 'Préstamo externo') THEN
    RAISE EXCEPTION 'Tipo de movimiento inválido para asignación: %', p_tipo;
  END IF;

  -- Determine resulting estado
  IF p_tipo = 'Asignación' THEN
    v_estado_resultante := 'En uso';
    v_tipo_evento := 'Asignación';
  ELSE
    v_estado_resultante := 'Prestada';
    v_tipo_evento := 'Préstamo';
  END IF;

  -- Get bailarin name for historial
  SELECT nombre_completo INTO v_bailarin_nombre
  FROM public.bailarines
  WHERE id = p_bailarin_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bailarín no encontrado: %', p_bailarin_id;
  END IF;

  -- Create movimiento
  INSERT INTO public.movimientos (
    prenda_id, bailarin_id, tipo, fecha_inicio,
    fecha_devolucion_esperada, devuelta, registrado_por,
    observacion, estado_resultante
  ) VALUES (
    p_prenda_id, p_bailarin_id, p_tipo, CURRENT_DATE,
    p_fecha_devolucion_esperada, false, p_registrado_por,
    p_observacion, v_estado_resultante
  ) RETURNING id INTO v_movimiento_id;

  -- Update prenda
  UPDATE public.prendas
  SET estado = v_estado_resultante,
      bailarin_actual = p_bailarin_id,
      updated_at = now()
  WHERE id = p_prenda_id;

  -- Create historial entry
  INSERT INTO public.historial (
    fecha, tipo_evento, prenda_id, persona_involucrada,
    descripcion, usuario_que_registro
  ) VALUES (
    now(), v_tipo_evento, p_prenda_id, p_bailarin_id,
    format('%s de "%s" a %s', p_tipo, v_prenda_nombre, v_bailarin_nombre),
    p_registrado_por
  );

  RETURN v_movimiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: devolver_prenda
-- Validates not already devuelta, marks devuelta=true, resets
-- prenda to "Disponible", clears bailarin_actual, creates historial.
-- ============================================================
CREATE OR REPLACE FUNCTION public.devolver_prenda(
  p_movimiento_id uuid,
  p_registrado_por uuid
)
RETURNS void AS $$
DECLARE
  v_movimiento record;
  v_prenda_nombre text;
  v_bailarin_nombre text;
BEGIN
  -- Lock the movimiento row
  SELECT m.*, p.nombre AS prenda_nombre, b.nombre_completo AS bailarin_nombre
  INTO v_movimiento
  FROM public.movimientos m
  JOIN public.prendas p ON p.id = m.prenda_id
  JOIN public.bailarines b ON b.id = m.bailarin_id
  WHERE m.id = p_movimiento_id
  FOR UPDATE OF m;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Movimiento no encontrado: %', p_movimiento_id;
  END IF;

  -- Validate not already returned
  IF v_movimiento.devuelta = true THEN
    RAISE EXCEPTION 'El movimiento ya fue devuelto previamente';
  END IF;

  -- Mark movimiento as returned
  UPDATE public.movimientos
  SET devuelta = true
  WHERE id = p_movimiento_id;

  -- Reset prenda to available
  UPDATE public.prendas
  SET estado = 'Disponible',
      bailarin_actual = NULL,
      updated_at = now()
  WHERE id = v_movimiento.prenda_id;

  -- Create historial entry
  INSERT INTO public.historial (
    fecha, tipo_evento, prenda_id, persona_involucrada,
    descripcion, usuario_que_registro
  ) VALUES (
    now(), 'Devolución', v_movimiento.prenda_id, v_movimiento.bailarin_id,
    format('Devolución de "%s" por %s', v_movimiento.prenda_nombre, v_movimiento.bailarin_nombre),
    p_registrado_por
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: traspasar_prenda
-- Updates bailarin_actual to destination, creates movimiento,
-- creates historial entry. Prenda estado remains unchanged.
-- ============================================================
CREATE OR REPLACE FUNCTION public.traspasar_prenda(
  p_prenda_id uuid,
  p_bailarin_origen_id uuid,
  p_bailarin_destino_id uuid,
  p_registrado_por uuid,
  p_observacion text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_prenda record;
  v_bailarin_origen_nombre text;
  v_bailarin_destino_nombre text;
  v_movimiento_id uuid;
BEGIN
  -- Lock the prenda row
  SELECT id, nombre, estado, bailarin_actual
  INTO v_prenda
  FROM public.prendas
  WHERE id = p_prenda_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prenda no encontrada: %', p_prenda_id;
  END IF;

  -- Validate current bailarin matches origen
  IF v_prenda.bailarin_actual IS NULL OR v_prenda.bailarin_actual <> p_bailarin_origen_id THEN
    RAISE EXCEPTION 'La prenda no está asignada al bailarín de origen especificado';
  END IF;

  -- Get bailarin names
  SELECT nombre_completo INTO v_bailarin_origen_nombre
  FROM public.bailarines WHERE id = p_bailarin_origen_id;

  SELECT nombre_completo INTO v_bailarin_destino_nombre
  FROM public.bailarines WHERE id = p_bailarin_destino_id;

  IF v_bailarin_destino_nombre IS NULL THEN
    RAISE EXCEPTION 'Bailarín destino no encontrado: %', p_bailarin_destino_id;
  END IF;

  -- Create movimiento (estado remains the same)
  INSERT INTO public.movimientos (
    prenda_id, bailarin_id, bailarin_destino_id, tipo,
    fecha_inicio, devuelta, registrado_por,
    observacion, estado_resultante
  ) VALUES (
    p_prenda_id, p_bailarin_origen_id, p_bailarin_destino_id, 'Traspaso',
    CURRENT_DATE, false, p_registrado_por,
    p_observacion, v_prenda.estado
  ) RETURNING id INTO v_movimiento_id;

  -- Update prenda bailarin_actual to destination
  UPDATE public.prendas
  SET bailarin_actual = p_bailarin_destino_id,
      updated_at = now()
  WHERE id = p_prenda_id;

  -- Create historial entry
  INSERT INTO public.historial (
    fecha, tipo_evento, prenda_id, persona_involucrada,
    descripcion, usuario_que_registro
  ) VALUES (
    now(), 'Traspaso', p_prenda_id, p_bailarin_destino_id,
    format('Traspaso de "%s" de %s a %s', v_prenda.nombre, v_bailarin_origen_nombre, v_bailarin_destino_nombre),
    p_registrado_por
  );

  RETURN v_movimiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- INDEXES
-- ============================================================

-- Indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_prendas_cuadro_id ON public.prendas(cuadro_id);
CREATE INDEX IF NOT EXISTS idx_prendas_bailarin_actual ON public.prendas(bailarin_actual);
CREATE INDEX IF NOT EXISTS idx_movimientos_prenda_id ON public.movimientos(prenda_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_bailarin_id ON public.movimientos(bailarin_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_bailarin_destino_id ON public.movimientos(bailarin_destino_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_registrado_por ON public.movimientos(registrado_por);
CREATE INDEX IF NOT EXISTS idx_plantilla_vestuario_cuadro_id ON public.plantilla_vestuario(cuadro_id);
CREATE INDEX IF NOT EXISTS idx_historial_prenda_id ON public.historial(prenda_id);
CREATE INDEX IF NOT EXISTS idx_historial_persona_involucrada ON public.historial(persona_involucrada);
CREATE INDEX IF NOT EXISTS idx_historial_usuario_que_registro ON public.historial(usuario_que_registro);
CREATE INDEX IF NOT EXISTS idx_checklist_items_funcion_id ON public.checklist_items(funcion_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_bailarin_id ON public.checklist_items(bailarin_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_plantilla_item_id ON public.checklist_items(plantilla_item_id);
CREATE INDEX IF NOT EXISTS idx_alertas_entidad_id ON public.alertas(entidad_id);

-- Indexes on frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_prendas_estado ON public.prendas(estado);
CREATE INDEX IF NOT EXISTS idx_prendas_genero ON public.prendas(genero);
CREATE INDEX IF NOT EXISTS idx_prendas_categoria ON public.prendas(categoria);
CREATE INDEX IF NOT EXISTS idx_prendas_propietario ON public.prendas(propietario);
CREATE INDEX IF NOT EXISTS idx_prendas_codigo_identificador ON public.prendas(codigo_identificador);
CREATE INDEX IF NOT EXISTS idx_bailarines_genero ON public.bailarines(genero);
CREATE INDEX IF NOT EXISTS idx_bailarines_activo ON public.bailarines(activo);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON public.movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_devuelta ON public.movimientos(devuelta);
CREATE INDEX IF NOT EXISTS idx_plantilla_vestuario_cuadro_genero ON public.plantilla_vestuario(cuadro_id, genero);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON public.historial(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_historial_tipo_evento ON public.historial(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_alertas_resuelta ON public.alertas(resuelta);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridad ON public.alertas(prioridad);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo_condicion ON public.alertas(tipo_condicion);
CREATE INDEX IF NOT EXISTS idx_funciones_estado ON public.funciones(estado);
CREATE INDEX IF NOT EXISTS idx_funciones_fecha ON public.funciones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_items_estado_verificacion ON public.checklist_items(estado_verificacion);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables with updated_at column
CREATE TRIGGER set_updated_at_bailarines
  BEFORE UPDATE ON public.bailarines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_prendas
  BEFORE UPDATE ON public.prendas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_funciones
  BEFORE UPDATE ON public.funciones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
