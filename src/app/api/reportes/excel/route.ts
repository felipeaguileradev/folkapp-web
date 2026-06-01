import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabasePrendaRepository } from "@/modules/inventario/infrastructure/repositories";
import {
  generarReporteInventario,
  generarListaCompras,
} from "@/modules/reportes/application";
import {
  createWorkbookWithHeader,
  workbookToBuffer,
} from "@/modules/reportes/infrastructure/excel";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  if (!tipo) {
    return NextResponse.json(
      { error: "Parámetro 'tipo' requerido" },
      { status: 400 },
    );
  }

  try {
    const supabase = createClient();
    let excelBuffer: Buffer;
    let filename: string;

    switch (tipo) {
      case "inventario": {
        const prendaRepository = new SupabasePrendaRepository(supabase);
        const result = await generarReporteInventario(
          { prendaRepository },
          {
            cuadroId: searchParams.get("cuadroId") ?? undefined,
            genero: (searchParams.get("genero") as any) ?? undefined,
            estado: (searchParams.get("estado") as any) ?? undefined,
            bailarinId: searchParams.get("bailarinId") ?? undefined,
          },
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        const headers = [
          "Código",
          "Nombre",
          "Cuadro",
          "Género",
          "Categoría",
          "Estado",
          "Propietario",
          "Bailarín",
          "Ubicación",
        ];

        const rows = result.data.map((item) => [
          item.codigoIdentificador,
          item.nombre,
          item.cuadroNombre,
          item.genero,
          item.categoria,
          item.estado,
          item.propietario,
          item.bailarinNombre,
          item.ubicacion,
        ]);

        const workbook = createWorkbookWithHeader(
          "Inventario",
          headers,
          rows,
          "Reporte de Inventario — Ballet Folklórico de Valdivia",
        );

        excelBuffer = workbookToBuffer(workbook);
        filename = "reporte-inventario.xlsx";
        break;
      }

      case "lista-compras": {
        const prendaRepository = new SupabasePrendaRepository(supabase);
        const result = await generarListaCompras({ prendaRepository });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        const headers = ["Cuadro", "Categoría", "Nombre", "Género", "Cantidad"];

        const rows = result.data.map((item) => [
          item.cuadroNombre,
          item.categoria,
          item.nombre,
          item.genero,
          item.cantidad,
        ]);

        const workbook = createWorkbookWithHeader(
          "Lista de Compras",
          headers,
          rows,
          "Lista de Compras — Ballet Folklórico de Valdivia",
        );

        excelBuffer = workbookToBuffer(workbook);
        filename = "lista-compras.xlsx";
        break;
      }

      default:
        return NextResponse.json(
          { error: `Tipo de reporte '${tipo}' no soportado para Excel` },
          { status: 400 },
        );
    }

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Error al generar el Excel" },
      { status: 500 },
    );
  }
}
