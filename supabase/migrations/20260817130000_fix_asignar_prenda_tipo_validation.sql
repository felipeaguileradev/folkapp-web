-- Migración: Fix validación de tipo en función asignar_prenda
-- Fecha: 2026-08-17
-- Descripción: La función RPC esperaba tipos sin tildes (Asignacion, Prestamo)
--   pero el código TypeScript envía con tildes (Asignación, Préstamo).
--   Se agrega normalización para aceptar ambos formatos.

CREATE OR REPLACE FUNCTION public.asignar_prenda(
  p_prenda_id uuid,
  p_bailarin_id uuid,
  p_tipo text,
  p_registrado_por uuid,
  p_observacion text DEFAULT NULL,
  p_fecha_devolucion_esperada date DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prenda_estado text;
  v_bailarin_actual uuid;
  v_estado_resultante text;
  v_movimiento_id uuid;
  v_prenda_nombre text;
  v_bailarin_nombre text;
  v_tipo_evento text;
  v_tipo_normalizado text;
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

  -- Normalizar tipo (aceptar con y sin tildes)
  v_tipo_normalizado := CASE p_tipo
    WHEN 'Asignación' THEN 'Asignacion'
    WHEN 'Préstamo interno' THEN 'Prestamo interno'
    WHEN 'Préstamo externo' THEN 'Prestamo externo'
    ELSE p_tipo
  END;

  IF v_tipo_normalizado NOT IN ('Asignacion', 'Prestamo interno', 'Prestamo externo') THEN
    RAISE EXCEPTION 'Tipo de movimiento invalido para asignacion: %', p_tipo;
  END IF;

  IF v_tipo_normalizado = 'Asignacion' THEN
    v_estado_resultante := 'En uso';
    v_tipo_evento := 'Asignación';
  ELSE
    v_estado_resultante := 'Prestada';
    v_tipo_evento := 'Préstamo';
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
$$;
