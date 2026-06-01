import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { FichaBailarin } from "../../domain/entities";
import { pdfStyles } from "./pdf-styles";
import { PdfHeader } from "./PdfHeader";

interface FichaBailarinPdfProps {
  ficha: FichaBailarin;
}

/** Documento PDF de la ficha de un bailarín */
export function FichaBailarinPdf({ ficha }: FichaBailarinPdfProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Ficha de Bailarín" subtitle={ficha.nombreCompleto} />

        {/* Info básica */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>
            {ficha.nombreCompleto}
          </Text>
          <Text style={{ fontSize: 10, color: "#666" }}>
            Género: {ficha.genero}
          </Text>
        </View>

        {/* Tallas */}
        <Text style={pdfStyles.sectionTitle}>Tallas</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
            Tipo
          </Text>
          <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
            Valor
          </Text>
        </View>
        {Object.entries(ficha.tallas).map(([key, value]) => (
          <View key={key} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
              {value ?? "—"}
            </Text>
          </View>
        ))}

        {/* Vestuario por cuadro */}
        {Object.entries(ficha.vestuarioPorCuadro).map(([cuadroId, prendas]) => (
          <View key={cuadroId}>
            <Text style={pdfStyles.sectionTitle}>Vestuario — {cuadroId}</Text>
            {prendas.length === 0 ? (
              <Text style={{ fontSize: 9, color: "#999" }}>
                Sin prendas asignadas
              </Text>
            ) : (
              <>
                <View style={pdfStyles.tableHeader}>
                  <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
                    Prenda
                  </Text>
                  <Text style={[pdfStyles.tableCellHeader, { width: "50%" }]}>
                    Categoría
                  </Text>
                </View>
                {prendas.map((prenda, index) => (
                  <View key={index} style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
                      {prenda.nombre}
                    </Text>
                    <Text style={[pdfStyles.tableCell, { width: "50%" }]}>
                      {prenda.categoria}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Ballet Folklórico de Valdivia — Sistema de Gestión de Vestuario
        </Text>
      </Page>
    </Document>
  );
}
