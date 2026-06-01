import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { ReporteEstadoCuadro } from "../../domain/entities";
import { pdfStyles } from "./pdf-styles";
import { PdfHeader } from "./PdfHeader";

interface EstadoCuadroReportPdfProps {
  reporte: ReporteEstadoCuadro;
}

/** Documento PDF del reporte de estado de un cuadro */
export function EstadoCuadroReportPdf({ reporte }: EstadoCuadroReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          title="Reporte de Estado de Cuadro"
          subtitle={reporte.cuadroNombre}
        />

        <View style={{ marginTop: 20 }}>
          {/* Stats */}
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
              Indicador
            </Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
              Valor
            </Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              Completitud general
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {reporte.completitudGeneral}%
            </Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              Alertas activas
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {reporte.alertasActivas}
            </Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              Prendas en reparación
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {reporte.prendasEnReparacion}
            </Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              Total de prendas
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {reporte.totalPrendas}
            </Text>
          </View>

          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              Total de bailarines
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {reporte.totalBailarines}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Ballet Folklórico de Valdivia — Sistema de Gestión de Vestuario
        </Text>
      </Page>
    </Document>
  );
}
