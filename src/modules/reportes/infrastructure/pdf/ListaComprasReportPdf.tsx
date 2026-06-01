import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { ListaComprasItem } from "../../domain/entities";
import { pdfStyles } from "./pdf-styles";
import { PdfHeader } from "./PdfHeader";

interface ListaComprasReportPdfProps {
  items: ListaComprasItem[];
}

/** Documento PDF de la lista de compras (prendas faltantes) */
export function ListaComprasReportPdf({ items }: ListaComprasReportPdfProps) {
  // Agrupar por cuadro
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.cuadroNombre]) {
        acc[item.cuadroNombre] = [];
      }
      acc[item.cuadroNombre].push(item);
      return acc;
    },
    {} as Record<string, ListaComprasItem[]>,
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          title="Lista de Compras"
          subtitle={`${items.length} ítems faltantes`}
        />

        {Object.entries(grouped).map(([cuadro, cuadroItems]) => (
          <View key={cuadro}>
            <Text style={pdfStyles.sectionTitle}>{cuadro}</Text>

            {/* Table header */}
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCellHeader, { width: "30%" }]}>
                Nombre
              </Text>
              <Text style={[pdfStyles.tableCellHeader, { width: "25%" }]}>
                Categoría
              </Text>
              <Text style={[pdfStyles.tableCellHeader, { width: "20%" }]}>
                Género
              </Text>
              <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>
                Cantidad
              </Text>
            </View>

            {cuadroItems.map((item, index) => (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { width: "30%" }]}>
                  {item.nombre}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "25%" }]}>
                  {item.categoria}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "20%" }]}>
                  {item.genero}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: "15%" }]}>
                  {item.cantidad}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Ballet Folklórico de Valdivia — Sistema de Gestión de Vestuario
        </Text>
      </Page>
    </Document>
  );
}
