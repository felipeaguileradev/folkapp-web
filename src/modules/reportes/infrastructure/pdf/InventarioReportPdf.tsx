import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { ReporteInventarioItem } from "../../domain/entities";
import { pdfStyles } from "./pdf-styles";
import { PdfHeader } from "./PdfHeader";

interface InventarioReportPdfProps {
  items: ReporteInventarioItem[];
}

/** Documento PDF del reporte de inventario */
export function InventarioReportPdf({ items }: InventarioReportPdfProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <PdfHeader
          title="Reporte de Inventario"
          subtitle={`${items.length} prendas`}
        />

        {/* Table header */}
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Código
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "18%" }]}>
            Nombre
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Cuadro
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "10%" }]}>
            Género
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Categoría
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Estado
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Propietario
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "12%" }]}>
            Ubicación
          </Text>
        </View>

        {/* Table rows */}
        {items.map((item, index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.codigoIdentificador}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "18%" }]}>
              {item.nombre}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.cuadroNombre}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "10%" }]}>
              {item.genero}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.categoria}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.estado}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.propietario}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "12%" }]}>
              {item.ubicacion ?? "—"}
            </Text>
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Ballet Folklórico de Valdivia — Sistema de Gestión de Vestuario
        </Text>
      </Page>
    </Document>
  );
}
