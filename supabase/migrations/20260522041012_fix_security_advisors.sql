-- Migración: fix_security_advisors
-- Fecha: 2026-05-22
-- Descripción: Corrige warnings de seguridad: agrega SET search_path = '' a todas las funciones
--              y revoca permisos de ejecución del rol anon en funciones SECURITY DEFINER.

-- Fix search_path for all functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT coalesce(
    auth.jwt()->'app_metadata'->>'role',
    'encargado'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

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
  SELECT estado, bailarin_actual, nombre
  INTO v_prenda_estado, v_bailarin_actual, v_prenda_nombre
  FROM public.prendas
  WHERE id = p_prenda_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prenda no encontrada: %', p_prenda_id;
  END IF;

  IF v_prenda_estado <> 'Disponible' THEN
    RAISE EXCEPTION 'La prenda no esta disponible. Estado actual: %. Bailarin actual: %', v_prenda_estado, v_bailarin_actual;
  END IF;

  IF p_tipo NOT IN ('Asignacion', 'Prestamo interno', 'Prestamo externo') THEN
    RAISE EXCEPTION 'Tipo de movimiento invalido para asignacion: %', p_tipo;
  END IF;

  IF p_tipo = 'Asignacion' THEN
    v_estado_resultante := 'En uso';
    v_tipo_evento := 'Asignacion';
  ELSE
    v_estado_resultante := 'Prestada';
    v_tipo_evento := 'Prestamo';
  END IF;

  SELECT nombre_completo INTO v_bailarin_nombre
  FROM public.bailarines
  WHERE id = p_bailarin_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bailarin no encontrado: %', p_bailarin_id;
  END IF;

  INSERT INTO public.movimientos (
    prenda_id, bailarin_id, tipo, fecha_inicio,
    fecha_devolucion_esperada, devuelta, registrado_por,
    observacion, estado_resultante
  ) VALUES (
    p_prenda_id, p_bailarin_id, p_tipo, CURRENT_DATE,
    p_fecha_devolucion_esperada, false, p_registrado_por,
    p_observacion, v_estado_resultante
  ) RETURNING id INTO v_movimiento_id;

  UPDATE public.prendas
  SET estado = v_estado_resultante,
      bailarin_actual = p_bailarin_id,
      updated_at = now()
  WHERE id = p_prenda_id;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.devolver_prenda(
  p_movimiento_id uuid,
  p_registrado_por uuid
)
RETURNS void AS $$
DECLARE
  v_movimiento record;
BEGIN
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

  IF v_movimiento.devuelta = true THEN
    RAISE EXCEPTION 'El movimiento ya fue devuelto previamente';
  END IF;

  UPDATE public.movimientos
  SET devuelta = true
  WHERE id = p_movimiento_id;

  UPDATE public.prendas
  SET estado = 'Disponible',
      bailarin_actual = NULL,
      updated_at = now()
  WHERE id = v_movimiento.prenda_id;

  INSERT INTO public.historial (
    fecha, tipo_evento, prenda_id, persona_involucrada,
    descripcion, usuario_que_registro
  ) VALUES (
    now(), 'Devolucion', v_movimiento.prenda_id, v_movimiento.bailarin_id,
    format('Devolucion de "%s" por %s', v_movimiento.prenda_nombre, v_movimiento.bailarin_nombre),
    p_registrado_por
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
  SELECT id, nombre, estado, bailarin_actual
  INTO v_prenda
  FROM public.prendas
  WHERE id = p_prenda_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prenda no encontrada: %', p_prenda_id;
  END IF;

  IF v_prenda.bailarin_actual IS NULL OR v_prenda.bailarin_actual <> p_bailarin_origen_id THEN
    RAISE EXCEPTION 'La prenda no esta asignada al bailarin de origen especificado';
  END IF;

  SELECT nombre_completo INTO v_bailarin_origen_nombre
  FROM public.bailarines WHERE id = p_bailarin_origen_id;

  SELECT nombre_completo INTO v_bailarin_destino_nombre
  FROM public.bailarines WHERE id = p_bailarin_destino_id;

  IF v_bailarin_destino_nombre IS NULL THEN
    RAISE EXCEPTION 'Bailarin destino no encontrado: %', p_bailarin_destino_id;
  END IF;

  INSERT INTO public.movimientos (
    prenda_id, bailarin_id, bailarin_destino_id, tipo,
    fecha_inicio, devuelta, registrado_por,
    observacion, estado_resultante
  ) VALUES (
    p_prenda_id, p_bailarin_origen_id, p_bailarin_destino_id, 'Traspaso',
    CURRENT_DATE, false, p_registrado_por,
    p_observacion, v_prenda.estado
  ) RETURNING id INTO v_movimiento_id;

  UPDATE public.prendas
  SET bailarin_actual = p_bailarin_destino_id,
      updated_at = now()
  WHERE id = p_prenda_id;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Revoke EXECUTE from anon and public on RPC functions
REVOKE EXECUTE ON FUNCTION public.asignar_prenda(uuid, uuid, text, uuid, text, date) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.devolver_prenda(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.traspasar_prenda(uuid, uuid, uuid, uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon, public;

-- Re-grant to authenticated only
GRANT EXECUTE ON FUNCTION public.asignar_prenda(uuid, uuid, text, uuid, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.devolver_prenda(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traspasar_prenda(uuid, uuid, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
