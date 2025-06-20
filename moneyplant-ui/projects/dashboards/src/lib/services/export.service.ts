import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import * as XLSX from 'xlsx';
import { IWidget } from '../entities/IWidget';

/**
 * Service for exporting dashboard content
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() { }

  /**
   * Exports the dashboard as an image
   * 
   * @param elementId - The ID of the element to export
   * @param filename - The filename for the exported image
   * @returns Observable that completes when the export is done
   */
  exportAsImage(elementId: string, filename: string = 'dashboard.png'): Observable<boolean> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        return throwError(() => new Error(`Element with ID ${elementId} not found`));
      }

      return new Observable(observer => {
        html2canvas(element, {
          allowTaint: true,
          useCORS: true,
          scale: 2
        }).then(canvas => {
          // Convert canvas to blob
          canvas.toBlob(blob => {
            if (blob) {
              saveAs(blob, filename);
              observer.next(true);
              observer.complete();
            } else {
              observer.error(new Error('Failed to convert canvas to blob'));
            }
          });
        }).catch(error => {
          observer.error(error);
        });
      });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Exports the dashboard as a PDF
   * 
   * @param elementId - The ID of the element to export
   * @param filename - The filename for the exported PDF
   * @param options - Additional options for the PDF export
   * @returns Observable that completes when the export is done
   */
  exportAsPDF(
    elementId: string, 
    filename: string = 'dashboard.pdf',
    options: { 
      format?: string, 
      orientation?: 'portrait' | 'landscape',
      title?: string,
      author?: string
    } = {}
  ): Observable<boolean> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        return throwError(() => new Error(`Element with ID ${elementId} not found`));
      }

      return new Observable(observer => {
        html2canvas(element, {
          allowTaint: true,
          useCORS: true,
          scale: 2
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jspdf.jsPDF({
            orientation: options.orientation || 'landscape',
            unit: 'mm',
            format: options.format || 'a4'
          });

          // Set document properties
          if (options.title) {
            pdf.setProperties({ title: options.title });
          }
          if (options.author) {
            pdf.setProperties({ author: options.author });
          }

          // Calculate dimensions
          const imgWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save(filename);

          observer.next(true);
          observer.complete();
        }).catch(error => {
          observer.error(error);
        });
      });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Exports widget data to CSV
   * 
   * @param widget - The widget containing the data to export
   * @param filename - The filename for the exported CSV
   * @returns Observable that completes when the export is done
   */
  exportToCSV(widget: IWidget, filename: string = 'data.csv'): Observable<boolean> {
    try {
      if (!widget || !widget.series || !Array.isArray(widget.series)) {
        return throwError(() => new Error('Widget has no data to export'));
      }

      // Convert data to CSV format
      const data = widget.series[0] as any[];
      if (!data || !Array.isArray(data) || data.length === 0) {
        return throwError(() => new Error('Widget has no data to export'));
      }

      // Get headers from the first data item
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      // Add data rows
      data.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          // Handle values with commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',');
        csvContent += row + '\n';
      });

      // Create blob and save file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, filename);

      return of(true);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Exports widget data to Excel
   * 
   * @param widget - The widget containing the data to export
   * @param filename - The filename for the exported Excel file
   * @param sheetName - The name of the sheet in the Excel file
   * @returns Observable that completes when the export is done
   */
  exportToExcel(
    widget: IWidget, 
    filename: string = 'data.xlsx',
    sheetName: string = 'Data'
  ): Observable<boolean> {
    try {
      if (!widget || !widget.series || !Array.isArray(widget.series)) {
        return throwError(() => new Error('Widget has no data to export'));
      }

      // Get data from widget
      const data = widget.series[0] as any[];
      if (!data || !Array.isArray(data) || data.length === 0) {
        return throwError(() => new Error('Widget has no data to export'));
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate Excel file and save
      XLSX.writeFile(workbook, filename);

      return of(true);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Exports multiple widgets' data to Excel with multiple sheets
   * 
   * @param widgets - Array of widgets containing data to export
   * @param filename - The filename for the exported Excel file
   * @returns Observable that completes when the export is done
   */
  exportMultipleToExcel(
    widgets: IWidget[], 
    filename: string = 'dashboard_data.xlsx'
  ): Observable<boolean> {
    try {
      if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
        return throwError(() => new Error('No widgets to export'));
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Process each widget
      widgets.forEach((widget, index) => {
        if (widget.series && Array.isArray(widget.series) && widget.series.length > 0) {
          const data = widget.series[0] as any[];
          if (data && Array.isArray(data) && data.length > 0) {
            // Create sheet name from widget title or index
            const sheetName = widget.config?.header?.title 
              ? widget.config.header.title.substring(0, 30) // Excel sheet names have a 31 char limit
              : `Sheet${index + 1}`;
            
            // Create worksheet and add to workbook
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
          }
        }
      });

      // Check if any sheets were added
      if (workbook.SheetNames.length === 0) {
        return throwError(() => new Error('No data to export'));
      }

      // Generate Excel file and save
      XLSX.writeFile(workbook, filename);

      return of(true);
    } catch (error) {
      return throwError(() => error);
    }
  }
}