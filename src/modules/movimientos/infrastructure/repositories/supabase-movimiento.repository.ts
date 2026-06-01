import type { SupabaseClient } from "@supabase/supabase-js";
import type { Movimiento, CreateMovimientoDTO } from "../../domain/entities";
import type {
  MovimientoRepository,
  MovimientoFilters,
} from "../../domain/ports";
import { MovimientoMapper } from "../mappers";
import type { MovimientoRow } from "../mappers";

/**
 * Implementación del repositorio de movimientos usando Supabase.
 * Utiliza funciones RPC para operaciones transaccionales (asignar, devolver, traspasar).
 */
export class SupabaseMovimientoRepository implements MovimientoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Movimiento | null> {
    const { data, error } = await this.supabase
      .from("movimientos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching movimiento: ${error.message}`);
    }

    return MovimientoMapper.toDomain(data as MovimientoRow);
  }

  async findActivos(filters: MovimientoFilters): Promise<Movimiento[]> {
    let query = filters.cuadroId
      ? this.supabase.from("movimientos").select("*, prendas!inner(cuadro_id)")
      : this.supabase.from("movimientos").select("*");

    if (filters.tipo) {
      query = query.eq("tipo", filters.tipo);
    }

    if (filters.devuelta !== undefined) {
      query = query.eq("devuelta", filters.devuelta);
    }

    if (filters.cuadroId) {
      query = query.eq("prendas.cuadro_id", filters.cuadroId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Error fetching movimientos activos: ${error.message}`);
    }

    return (data as MovimientoRow[]).map(MovimientoMapper.toDomain);
  }

  async findByPrenda(prendaId: string): Promise<Movimiento[]> {
    const { data, error } = await this.supabase
      .from("movimientos")
      .select("*")
      .eq("prenda_id", prendaId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching movimientos by prenda: ${error.message}`);
    }

    return (data as MovimientoRow[]).map(MovimientoMapper.toDomain);
  }

  async findByBailarin(bailarinId: string): Promise<Movimiento[]> {
    const { data, error } = await this.supabase
      .from("movimientos")
      .select("*")
      .eq("bailarin_id", bailarinId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Error fetching movimientos by bailarin: ${error.message}`,
      );
    }

    return (data as MovimientoRow[]).map(MovimientoMapper.toDomain);
  }

  async create(movimiento: CreateMovimientoDTO): Promise<Movimiento> {
    if (movimiento.tipo === "Traspaso") {
      return this.createTraspaso(movimiento);
    }

    return this.createAsignacion(movimiento);
  }

  async marcarDevuelto(id: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { error } = await this.supabase.rpc("devolver_prenda", {
      p_movimiento_id: id,
      p_registrado_por: user.id,
    });

    if (error) {
      throw new Error(`Error al devolver prenda: ${error.message}`);
    }
  }

  private async createAsignacion(
    movimiento: CreateMovimientoDTO,
  ): Promise<Movimiento> {
    const { data, error } = await this.supabase.rpc("asignar_prenda", {
      p_prenda_id: movimiento.prendaId,
      p_bailarin_id: movimiento.bailarinId,
      p_tipo: movimiento.tipo,
      p_registrado_por: movimiento.registradoPor,
      p_observacion: movimiento.observacion,
      p_fecha_devolucion_esperada: movimiento.fechaDevolucionEsperada
        ? movimiento.fechaDevolucionEsperada.toISOString().split("T")[0]
        : null,
    });

    if (error) {
      throw new Error(`Error al asignar prenda: ${error.message}`);
    }

    const createdId = data as string;
    const created = await this.findById(createdId);

    if (!created) {
      throw new Error("No se pudo recuperar el movimiento creado");
    }

    return created;
  }

  private async createTraspaso(
    movimiento: CreateMovimientoDTO,
  ): Promise<Movimiento> {
    const { data, error } = await this.supabase.rpc("traspasar_prenda", {
      p_prenda_id: movimiento.prendaId,
      p_bailarin_origen_id: movimiento.bailarinId,
      p_bailarin_destino_id: movimiento.bailarinDestinoId,
      p_registrado_por: movimiento.registradoPor,
      p_observacion: movimiento.observacion,
    });

    if (error) {
      throw new Error(`Error al traspasar prenda: ${error.message}`);
    }

    const createdId = data as string;
    const created = await this.findById(createdId);

    if (!created) {
      throw new Error("No se pudo recuperar el movimiento de traspaso creado");
    }

    return created;
  }
}
