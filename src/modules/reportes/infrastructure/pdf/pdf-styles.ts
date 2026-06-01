import { StyleSheet } from "@react-pdf/renderer";

/** Estilos compartidos para todos los reportes PDF */
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#0F6E56",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F6E56",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  headerDate: {
    fontSize: 8,
    color: "#999",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    minHeight: 24,
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    minHeight: 28,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
  },
  tableCellHeader: {
    padding: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});
