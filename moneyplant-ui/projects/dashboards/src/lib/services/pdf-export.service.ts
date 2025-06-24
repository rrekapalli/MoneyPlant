import { Injectable, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IWidget } from '../entities/IWidget';

/**
 * Configuration options for PDF export functionality
 */
export interface PdfExportOptions {
  /** Page orientation for the PDF */
  orientation?: 'portrait' | 'landscape';
  /** Page format/size for the PDF */
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  /** Margin size in millimeters */
  margin?: number;
  /** Output filename for the PDF */
  filename?: string;
  /** Title to display in the PDF header */
  title?: string;
  /** Whether to include a header in the PDF */
  includeHeader?: boolean;
  /** Whether to include a footer in the PDF */
  includeFooter?: boolean;
  /** Image quality for chart captures (0-1) */
  quality?: number;
  /** Scale factor for chart captures */
  scale?: number;
}

/**
 * Service for exporting dashboard widgets to PDF format
 * Supports both basic and intelligent layout algorithms
 */
@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Export dashboard to PDF using basic layout algorithm
   * @param dashboardElement - Reference to the dashboard container element
   * @param widgets - Array of widgets to export
   * @param options - PDF export configuration options
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
      // Wait for all charts to be fully rendered before capture
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create PDF document with specified settings
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

      // Export widgets using basic layout
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

      // Save the PDF file
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error);
      throw new Error('Failed to export dashboard to PDF');
    }
  }

  /**
   * Export dashboard to PDF using intelligent layout algorithm
   * Attempts to preserve widget positioning and relationships
   * @param dashboardElement - Reference to the dashboard container element
   * @param widgets - Array of widgets to export
   * @param options - PDF export configuration options
   */
  async exportDashboardToPdfIntelligent(
    dashboardElement: ElementRef<HTMLElement>,
    widgets: IWidget[],
    options: PdfExportOptions = {}
  ): Promise<void> {
    const {
      orientation = 'landscape',
      format = 'a4',
      margin = 15,
      filename = 'dashboard-export.pdf',
      title = 'Dashboard Export',
      includeHeader = true,
      includeFooter = true,
      quality = 1,
      scale = 3 // Higher scale for better quality
    } = options;

    try {
      // Wait for all charts to be fully rendered before capture
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create PDF document with specified settings
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

      // Export widgets using intelligent layout
      currentY = await this.exportWidgetsIntelligent(
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

      // Save the PDF file
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error);
      throw new Error('Failed to export dashboard to PDF');
    }
  }

  /**
   * Add header section to the PDF document
   * @param pdf - The PDF document instance
   * @param title - Title to display in the header
   * @param pageWidth - Width of the PDF page
   * @param margin - Page margin
   * @param currentY - Current Y position on the page
   * @returns Updated Y position after adding header
   */
  private addHeader(
    pdf: jsPDF,
    title: string,
    pageWidth: number,
    margin: number,
    currentY: number
  ): number {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
    
    // Add timestamp
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated on: ${timestamp}`, pageWidth / 2, currentY + 6, { align: 'center' });
    
    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY + 10, pageWidth - margin, currentY + 10);
    
    return currentY + 15; // Return updated Y position
  }

  /**
   * Export widgets to PDF using basic layout algorithm
   * Each widget gets its own page
   * @param pdf - The PDF document instance
   * @param dashboardElement - Reference to the dashboard container
   * @param widgets - Array of widgets to export
   * @param contentWidth - Available content width
   * @param contentHeight - Available content height
   * @param margin - Page margin
   * @param startY - Starting Y position
   * @param quality - Image quality for captures
   * @param scale - Scale factor for captures
   * @returns Final Y position after export
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

    for (const widget of widgets) {
      try {
        // Find the widget element in the DOM
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        
        if (!widgetElement) {
          continue; // Skip if widget element not found
        }

        // Create canvas from widget element
        const canvas = await html2canvas(widgetElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        // Calculate image dimensions to fit content width
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if needed
        if (currentY + imgHeight > contentHeight) {
          pdf.addPage();
          currentY = margin;
        }

        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/png', quality);
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

        currentY += imgHeight + 10; // Add spacing between widgets

      } catch (error) {
        console.error(`Error exporting widget ${widget.id}:`, error);
        // Continue with next widget
      }
    }

    return currentY;
  }

  /**
   * Export widgets to PDF using intelligent layout algorithm
   * Attempts to preserve widget grid positioning
   * @param pdf - The PDF document instance
   * @param dashboardElement - Reference to the dashboard container
   * @param widgets - Array of widgets to export
   * @param contentWidth - Available content width
   * @param contentHeight - Available content height
   * @param margin - Page margin
   * @param startY - Starting Y position
   * @param quality - Image quality for captures
   * @param scale - Scale factor for captures
   * @returns Final Y position after export
   */
  private async exportWidgetsIntelligent(
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
    let currentRow = 0;
    let currentCol = 0;
    const maxCols = 2; // Maximum columns per row

    for (const widget of widgets) {
      try {
        // Find the widget element in the DOM
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        
        if (!widgetElement) {
          continue; // Skip if widget element not found
        }

        // Create canvas from widget element
        const canvas = await html2canvas(widgetElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        // Calculate widget dimensions
        const widgetWidth = contentWidth / maxCols - 5; // 5mm spacing between widgets
        const widgetHeight = (canvas.height * widgetWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + widgetHeight > contentHeight) {
          pdf.addPage();
          currentY = margin;
          currentRow = 0;
          currentCol = 0;
        }

        // Calculate position based on grid
        const x = margin + (currentCol * (widgetWidth + 5));
        const y = currentY;

        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/png', quality);
        pdf.addImage(imgData, 'PNG', x, y, widgetWidth, widgetHeight);

        // Update grid position
        currentCol++;
        if (currentCol >= maxCols) {
          currentCol = 0;
          currentRow++;
          currentY += widgetHeight + 10; // Add spacing between rows
        }

      } catch (error) {
        console.error(`Error exporting widget ${widget.id}:`, error);
        // Continue with next widget
      }
    }

    return currentY;
  }

  /**
   * Add footer section to the PDF document
   * @param pdf - The PDF document instance
   * @param pageWidth - Width of the PDF page
   * @param pageHeight - Height of the PDF page
   * @param margin - Page margin
   */
  private addFooter(
    pdf: jsPDF,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): void {
    const footerY = pageHeight - margin;
    
    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    // Add page number
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const pageNumber = `Page ${pdf.getCurrentPageInfo().pageNumber}`;
    pdf.text(pageNumber, pageWidth / 2, footerY, { align: 'center' });
  }

  /**
   * Find widget element in the dashboard DOM
   * @param dashboardElement - Reference to the dashboard container
   * @param widgetId - ID of the widget to find
   * @returns HTMLElement of the widget or null if not found
   */
  private findWidgetElement(
    dashboardElement: ElementRef<HTMLElement>,
    widgetId: string
  ): HTMLElement | null {
    if (!dashboardElement?.nativeElement) {
      return null;
    }

    // Try to find widget by data attribute
    const widgetElement = dashboardElement.nativeElement.querySelector(
      `[data-widget-id="${widgetId}"]`
    ) as HTMLElement;

    if (widgetElement) {
      return widgetElement;
    }

    // Fallback: try to find by class name pattern
    const widgetClass = dashboardElement.nativeElement.querySelector(
      `.widget-${widgetId}`
    ) as HTMLElement;

    if (widgetClass) {
      return widgetClass;
    }

    // Last resort: search for any element containing the widget ID
    const allElements = dashboardElement.nativeElement.querySelectorAll('*');
    for (const element of Array.from(allElements)) {
      if (element.textContent?.includes(widgetId) || 
          element.className?.includes(widgetId) ||
          element.id?.includes(widgetId)) {
        return element as HTMLElement;
      }
    }

    return null;
  }

  /**
   * Export a single widget to PDF
   * @param widgetElement - Reference to the widget element
   * @param widget - Widget configuration
   * @param options - PDF export options
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
      filename = `${widget.id}-export.pdf`,
      title = widget.config?.header?.title || 'Widget Export',
      includeHeader = true,
      includeFooter = true,
      quality = 1,
      scale = 2
    } = options;

    try {
      // Wait for chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      // Create canvas from widget element
      const canvas = await html2canvas(widgetElement.nativeElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Calculate image dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png', quality);
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

      // Add footer if requested
      if (includeFooter) {
        this.addFooter(pdf, pageWidth, pageHeight, margin);
      }

      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting widget to PDF:', error);
      throw new Error('Failed to export widget to PDF');
    }
  }
} 