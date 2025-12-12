import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';

export class ExportUtils {
  // Función auxiliar para acceder a propiedades anidadas
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  static exportToPDF(data, columns, fileName = 'documento', title = 'Reporte') {
    try {
      // Crear documento en orientación horizontal (landscape)
      const doc = new jsPDF('l', 'mm', 'a4');

      // Título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 15);

      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const fechaActual = new Date().toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Fecha de generación: ${fechaActual}`, 14, 22);

      const headers = columns.map(col => col.header);
      const rows = data.map(item =>
        columns.map(col => {
          const value = this.getNestedValue(item, col.acceso);
          // Formatear valores especiales
          if (value === null || value === undefined || value === '') return '—';
          if (col.header === 'Total Ayuda Asignada' && col.acceso === 'costoReal') {
            return value ? `Bs. ${parseFloat(value).toFixed(2)}` : '—';
          }
          if (col.acceso === 'fechaSolicitud') {
            return new Date(value).toLocaleDateString('es-BO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
          }
          return String(value);
        })
      );

      // Calcular total de ayuda asignada
      let totalAyudaAsignada = 0;

      data.forEach(item => {
        const costoReal = this.getNestedValue(item, 'costoReal');
        if (costoReal) totalAyudaAsignada += parseFloat(costoReal);
      });

      // Crear fila de totales
      const totalRow = columns.map((col, index) => {
        if (index === 0) return 'TOTAL';
        if (col.header === 'Total Ayuda Asignada' && col.acceso === 'costoReal') {
          return totalAyudaAsignada > 0 ? `Bs. ${totalAyudaAsignada.toFixed(2)}` : '—';
        }
        return '';
      });

      autoTable(doc, {
        head: [headers],
        body: rows,
        foot: [totalRow],
        startY: 28,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          halign: 'left',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [255, 99, 71], // Color naranja/rojo #ff6347
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        footStyles: {
          fillColor: [255, 255, 255],
          textColor: [220, 20, 60], // Color rojo para totales
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [254, 247, 245], // #fef7f5
        },
        margin: { top: 28, left: 8, right: 8, bottom: 10 },
        columnStyles: {
          0: { cellWidth: 25 }, // Código Solicitud
          1: { cellWidth: 38 }, // Beneficiario
          2: { cellWidth: 20 }, // Código Ben
          3: { cellWidth: 12 }, // Edad
          4: { cellWidth: 22 }, // Estado
          5: { cellWidth: 48 }, // Diagnóstico
          6: { cellWidth: 30 }, // Tipo de Ayuda
          7: { cellWidth: 24 }, // Fecha
          8: { cellWidth: 28 }, // Total Ayuda Asignada
          9: { cellWidth: 28 } // Prioridad
        }
      });

      doc.save(`${fileName}.pdf`);

      return { success: true, message: 'PDF exportado exitosamente' };
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      return { success: false, message: 'Error al exportar PDF' };
    }
  }
  
  static exportToExcel(data, columns, fileName = 'documento', sheetName = 'Datos') {
    try {
      const wb = XLSX.utils.book_new();

      // Formatear datos con valores especiales
      const excelData = data.map(item => {
        const row = {};
        columns.forEach(col => {
          const value = this.getNestedValue(item, col.acceso);

          // Formatear valores especiales
          if (value === null || value === undefined || value === '') {
            row[col.header] = '—';
          } else if (col.header === 'Total Ayuda Asignada' && col.acceso === 'costoReal') {
            row[col.header] = value ? `Bs. ${parseFloat(value).toFixed(2)}` : '—';
          } else if (col.acceso === 'fechaSolicitud') {
            row[col.header] = new Date(value).toLocaleDateString('es-BO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
          } else {
            row[col.header] = value;
          }
        });
        return row;
      });

      // Calcular total de ayuda asignada
      let totalAyudaAsignada = 0;

      data.forEach(item => {
        const costoReal = this.getNestedValue(item, 'costoReal');
        if (costoReal) totalAyudaAsignada += parseFloat(costoReal);
      });

      // Agregar fila de totales
      const totalRow = {};
      columns.forEach((col, index) => {
        if (index === 0) {
          totalRow[col.header] = 'TOTAL';
        } else if (col.header === 'Total Ayuda Asignada' && col.acceso === 'costoReal') {
          totalRow[col.header] = totalAyudaAsignada > 0 ? `Bs. ${totalAyudaAsignada.toFixed(2)}` : '—';
        } else {
          totalRow[col.header] = '';
        }
      });

      excelData.push(totalRow);

      const ws = XLSX.utils.json_to_sheet(excelData);

      // Configurar anchos de columna
      const colWidths = columns.map(col => {
        const maxLength = Math.max(
          col.header.length,
          ...data.map(item => {
            const value = this.getNestedValue(item, col.acceso);
            return value ? String(value).length : 0;
          })
        );
        return { wch: Math.min(Math.max(maxLength + 2, 12), 50) };
      });

      ws['!cols'] = colWidths;

      // Aplicar estilos a las celdas
      const range = XLSX.utils.decode_range(ws['!ref']);

      // Estilo para el encabezado (primera fila)
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "FF6347" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      // Estilo para las filas de datos
      for (let row = 1; row <= range.e.r - 1; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) continue;

          ws[cellAddress].s = {
            alignment: { horizontal: "left", vertical: "center" },
            fill: { fgColor: { rgb: row % 2 === 0 ? "FFFFFF" : "FEF7F5" } },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          };
        }
      }

      // Estilo para la fila de totales (última fila)
      const lastRow = range.e.r;
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: lastRow, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "DC143C" } },
          fill: { fgColor: { rgb: "FFFFFF" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "medium", color: { rgb: "DC143C" } },
            bottom: { style: "medium", color: { rgb: "DC143C" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      XLSX.writeFile(wb, `${fileName}.xlsx`);

      return { success: true, message: 'Excel exportado exitosamente' };
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      return { success: false, message: 'Error al exportar Excel' };
    }
  }
}