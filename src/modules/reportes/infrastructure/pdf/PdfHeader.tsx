import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";

interface PdfHeaderProps {
  title: string;
  subtitle?: string;
}

/** Encabezado BFV para todos los reportes PDF */
export function PdfHeader({ title, subtitle }: PdfHeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-CL");
  const timeStr = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.headerTitle}>Ballet Folklórico de Valdivia</Text>
      <Text style={pdfStyles.headerSubtitle}>{title}</Text>
      {subtitle && <Text style={pdfStyles.headerDate}>{subtitle}</Text>}
      <Text style={pdfStyles.headerDate}>
        Generado el {dateStr} a las {timeStr}
      </Text>
    </View>
  );
}
