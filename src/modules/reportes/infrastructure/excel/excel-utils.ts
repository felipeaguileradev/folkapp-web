import * as XLSX from "xlsx";

/** Crea un header row con el nombre del ballet */
export function createBfvHeaderRow(): string[] {
  return ["Ballet Folklórico de Valdivia — Sistema de Gestión de Vestuario"];
}

/** Genera un buffer de Excel a partir de un workbook */
export function workbookToBuffer(workbook: XLSX.WorkBook): Buffer {
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });
  return Buffer.from(excelBuffer);
}

/** Crea un workbook con una hoja y header BFV */
export function createWorkbookWithHeader(
  sheetName: string,
  headers: string[],
  rows: (string | number | null)[][],
  reportTitle: string,
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Construir datos con header BFV
  const data: (string | number | null)[][] = [
    [reportTitle],
    [`Generado: ${new Date().toLocaleString("es-CL")}`],
    [], // Fila vacía de separación
    headers,
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Ajustar ancho de columnas
  const colWidths = headers.map((header, index) => {
    const maxDataWidth = rows.reduce((max, row) => {
      const cellValue = row[index]?.toString() ?? "";
      return Math.max(max, cellValue.length);
    }, header.length);
    return { wch: Math.min(maxDataWidth + 2, 40) };
  });
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}
