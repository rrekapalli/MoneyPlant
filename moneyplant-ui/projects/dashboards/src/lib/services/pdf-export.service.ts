import { Injectable, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IWidget } from '../entities/IWidget';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  margin?: number;
  filename?: string;
  title?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  quality?: number;
  scale?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Export dashboard to PDF
   * @param dashboardElement - Reference to the dashboard container element
   * @param widgets - Array of widgets to export
   * @param options - PDF export options
   */
  async exportDashboardToPdf(
    dashboardElement: ElementRef<HTMLElement>,
    widgets: IWidget[],
    options: PdfExportOptions = {}
  ): Promise<void> {
    const {
      orientation = 'portrait',
      format = 'a4',
      margin = 10,
      filename = 'dashboard-export.pdf',
      title = 'Dashboard Export',
      includeHeader = true,
      includeFooter = true,
      quality = 1,
      scale = 2
    } = options;

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      let currentY = margin;

      // Add header if requested
      if (includeHeader) {
        currentY = this.addHeader(pdf, title, pageWidth, margin, currentY);
      }

      // Export widgets
      currentY = await this.exportWidgets(
        pdf,
        dashboardElement,
        widgets,
        contentWidth,
        contentHeight,
        margin,
        currentY,
        quality,
        scale
      );

      // Add footer if requested
      if (includeFooter) {
        this.addFooter(pdf, pageWidth, pageHeight, margin);
      }

      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error);
      throw new Error('Failed to export dashboard to PDF');
    }
  }

  /**
   * Add header to PDF
   */
  private addHeader(
    pdf: jsPDF,
    title: string,
    pageWidth: number,
    margin: number,
    currentY: number
  ): number {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated on: ${timestamp}`, pageWidth / 2, currentY + 8, { align: 'center' });
    
    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY + 12, pageWidth - margin, currentY + 12);
    
    return currentY + 20;
  }

  /**
   * Export widgets to PDF
   */
  private async exportWidgets(
    pdf: jsPDF,
    dashboardElement: ElementRef<HTMLElement>,
    widgets: IWidget[],
    contentWidth: number,
    contentHeight: number,
    margin: number,
    startY: number,
    quality: number,
    scale: number
  ): Promise<number> {
    let currentY = startY;
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (const widget of widgets) {
      try {
        // Find widget element
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        if (!widgetElement) {
          console.warn(`Widget element not found for widget ID: ${widget.id}`);
          continue;
        }

        // Convert widget to canvas
        const canvas = await html2canvas(widgetElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        // Calculate widget dimensions
        const widgetWidth = widget['w'] * 100; // Convert grid units to pixels (approximate)
        const widgetHeight = widget['h'] * 100;
        
        // Scale widget to fit content width
        const scaleFactor = contentWidth / widgetWidth;
        const scaledWidth = widgetWidth * scaleFactor;
        const scaledHeight = widgetHeight * scaleFactor;

        // Check if we need a new page
        if (currentY + scaledHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');

        // Add widget to PDF
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          currentY,
          scaledWidth,
          scaledHeight
        );

        // Add widget title if available
        if (widget.config?.header?.title) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(
            widget.config.header.title,
            margin,
            currentY - 5
          );
        }

        currentY += scaledHeight + 10; // Add spacing between widgets

      } catch (error) {
        console.error(`Error exporting widget ${widget.id}:`, error);
        // Continue with next widget
      }
    }

    return currentY;
  }

  /**
   * Add footer to PDF
   */
  private addFooter(
    pdf: jsPDF,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    const footerY = pageHeight - margin;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.text(
      'Dashboard Export - MoneyPlant',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  /**
   * Find widget element by ID
   */
  private findWidgetElement(
    dashboardElement: ElementRef<HTMLElement>,
    widgetId: string
  ): HTMLElement | null {
    const dashboard = dashboardElement.nativeElement;
    return dashboard.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement;
  }

  /**
   * Export single widget to PDF
   */
  async exportWidgetToPdf(
    widgetElement: ElementRef<HTMLElement>,
    widget: IWidget,
    options: PdfExportOptions = {}
  ): Promise<void> {
    const {
      orientation = 'portrait',
      format = 'a4',
      margin = 10,
      filename = `widget-${widget.id}.pdf`,
      title = widget.config?.header?.title || 'Widget Export',
      quality = 1,
      scale = 2
    } = options;

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, margin + 10, { align: 'center' });

      // Convert widget to canvas
      const canvas = await html2canvas(widgetElement.nativeElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Calculate dimensions
      const widgetWidth = widget['w'] * 100;
      const widgetHeight = widget['h'] * 100;
      const scaleFactor = Math.min(
        contentWidth / widgetWidth,
        contentHeight / widgetHeight
      );
      const scaledWidth = widgetWidth * scaleFactor;
      const scaledHeight = widgetHeight * scaleFactor;

      // Center the widget
      const x = (pageWidth - scaledWidth) / 2;
      const y = margin + 20;

      // Add widget to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(
        imgData,
        'PNG',
        x,
        y,
        scaledWidth,
        scaledHeight
      );

      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting widget to PDF:', error);
      throw new Error('Failed to export widget to PDF');
    }
  }
} 