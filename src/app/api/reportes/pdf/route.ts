import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabasePrendaRepository } from "@/modules/inventario/infrastructure/repositories";
import { SupabaseBailarinRepository } from "@/modules/bailarines/infrastructure/repositories/supabase-bailarin.repository";
import { SupabaseCuadroRepository } from "@/modules/cuadros/infrastructure/repositories";
import { SupabaseAlertaRepository } from "@/modules/alertas/infrastructure/repositories";
import {
  generarReporteInventario,
  generarListaCompras,
  generarFichaBailarin,
  generarReporteEstadoCuadro,
} from "@/modules/reportes/application";
import {
  InventarioReportPdf,
  ListaComprasReportPdf,
  FichaBailarinPdf,
  EstadoCuadroReportPdf,
} from "@/modules/reportes/infrastructure/pdf";

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
    let pdfBuffer: Buffer;
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

        pdfBuffer = await renderToBuffer(
          createElement(InventarioReportPdf, { items: result.data }),
        );
        filename = "reporte-inventario.pdf";
        break;
      }

      case "lista-compras": {
        const prendaRepository = new SupabasePrendaRepository(supabase);
        const result = await generarListaCompras({ prendaRepository });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        pdfBuffer = await renderToBuffer(
          createElement(ListaComprasReportPdf, { items: result.data }),
        );
        filename = "lista-compras.pdf";
        break;
      }

      case "ficha-bailarin": {
        const bailarinId = searchParams.get("bailarinId");
        if (!bailarinId) {
          return NextResponse.json(
            { error: "Parámetro 'bailarinId' requerido" },
            { status: 400 },
          );
        }

        const bailarinRepository = new SupabaseBailarinRepository(supabase);
        const prendaRepository = new SupabasePrendaRepository(supabase);
        const result = await generarFichaBailarin(
          { bailarinRepository, prendaRepository },
          bailarinId,
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        pdfBuffer = await renderToBuffer(
          createElement(FichaBailarinPdf, { ficha: result.data }),
        );
        filename = `ficha-${result.data.nombreCompleto.replace(/\s+/g, "-").toLowerCase()}.pdf`;
        break;
      }

      case "estado-cuadro": {
        const cuadroId = searchParams.get("cuadroId");
        if (!cuadroId) {
          return NextResponse.json(
            { error: "Parámetro 'cuadroId' requerido" },
            { status: 400 },
          );
        }

        const cuadroRepository = new SupabaseCuadroRepository();
        const prendaRepository = new SupabasePrendaRepository(supabase);
        const bailarinRepository = new SupabaseBailarinRepository(supabase);
        const alertaRepository = new SupabaseAlertaRepository();
        const result = await generarReporteEstadoCuadro(
          {
            cuadroRepository,
            prendaRepository,
            bailarinRepository,
            alertaRepository,
          },
          cuadroId,
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        pdfBuffer = await renderToBuffer(
          createElement(EstadoCuadroReportPdf, { reporte: result.data }),
        );
        filename = `estado-cuadro-${result.data.cuadroNombre.toLowerCase()}.pdf`;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Tipo de reporte '${tipo}' no soportado` },
          { status: 400 },
        );
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 },
    );
  }
}
