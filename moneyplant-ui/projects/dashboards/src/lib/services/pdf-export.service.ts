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
      // Wait for all charts to be fully rendered
      console.log('Waiting for charts to render...');
      await new Promise(resolve => setTimeout(resolve, 2000));

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
   * Export dashboard to PDF with intelligent layout
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
      // Wait for all charts to be fully rendered
      console.log('Waiting for charts to render...');
      await new Promise(resolve => setTimeout(resolve, 2000));

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

      // Export widgets with intelligent layout
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
    
    return currentY + 15; // Reduced spacing
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

    console.log(`Starting export of ${widgets.length} widgets`);

    // Calculate grid layout for better space utilization
    const widgetsPerRow = 2; // 2 widgets per row
    const maxWidgetsPerPage = 4; // 4 widgets per page (2x2 grid)
    let currentRow = 0;
    let currentCol = 0;
    let widgetsOnCurrentPage = 0;

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      
      try {
        console.log(`Processing widget: ${widget.id} - ${widget.config?.header?.title || 'Untitled'}`);
        
        // Find widget element
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        if (!widgetElement) {
          console.warn(`Widget element not found for widget ID: ${widget.id}`);
          continue;
        }

        console.log(`Found widget element for ${widget.id}:`, widgetElement);

        // Wait a bit for any animations or rendering to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Convert widget to canvas
        const canvas = await html2canvas(widgetElement, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: widgetElement.offsetWidth,
          height: widgetElement.offsetHeight
        });

        console.log(`Canvas created for widget ${widget.id}:`, canvas.width, 'x', canvas.height);

        // Check if we need a new page
        if (widgetsOnCurrentPage >= maxWidgetsPerPage) {
          pdf.addPage();
          currentY = margin;
          currentRow = 0;
          currentCol = 0;
          widgetsOnCurrentPage = 0;
          console.log(`Added new page for widget ${widget.id}`);
        }

        // Calculate widget dimensions for grid layout
        const widgetWidth = (contentWidth - margin) / widgetsPerRow; // Divide available width by number of columns
        const widgetHeight = Math.min(80, (pageHeight - margin - startY) / 2); // Smaller fixed height
        
        // Calculate position in grid
        const x = margin + (currentCol * widgetWidth);
        const y = currentY + (currentRow * widgetHeight);

        console.log(`Widget ${widget.id} grid position:`, {
          row: currentRow,
          col: currentCol,
          x: x,
          y: y,
          width: widgetWidth,
          height: widgetHeight
        });

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');

        // Add widget to PDF
        pdf.addImage(
          imgData,
          'PNG',
          x,
          y,
          widgetWidth,
          widgetHeight
        );

        // Add widget title if available
        if (widget.config?.header?.title) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(
            widget.config.header.title,
            x,
            y - 5
          );
        }

        // Update grid position
        currentCol++;
        if (currentCol >= widgetsPerRow) {
          currentCol = 0;
          currentRow++;
        }
        widgetsOnCurrentPage++;

        console.log(`Widget ${widget.id} exported successfully. Grid position: ${currentRow},${currentCol}`);

      } catch (error) {
        console.error(`Error exporting widget ${widget.id}:`, error);
        // Continue with next widget
      }
    }

    console.log(`Export completed. Total widgets processed: ${widgets.length}`);
    return currentY + (currentRow * 80) + 20; // Return final Y position with new height
  }

  /**
   * Export widgets with intelligent layout
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
    const pageHeight = pdf.internal.pageSize.getHeight();

    console.log(`Starting intelligent export of ${widgets.length} widgets`);

    // Group widgets by type for better layout
    const chartWidgets = widgets.filter(w => w.config?.component === 'echart');
    const otherWidgets = widgets.filter(w => w.config?.component !== 'echart');

    // Export chart widgets in a 2x2 grid
    const chartsPerRow = 2;
    const chartsPerPage = 4;
    let chartRow = 0;
    let chartCol = 0;
    let chartsOnPage = 0;

    for (let i = 0; i < chartWidgets.length; i++) {
      const widget = chartWidgets[i];
      
      // Check if we need a new page
      if (chartsOnPage >= chartsPerPage) {
        pdf.addPage();
        currentY = margin;
        chartRow = 0;
        chartCol = 0;
        chartsOnPage = 0;
      }

      try {
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        if (!widgetElement) continue;

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 100));

        // Convert to canvas with high quality
        const canvas = await html2canvas(widgetElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: widgetElement.offsetWidth,
          height: widgetElement.offsetHeight
        });

        // Calculate dimensions for grid layout
        const widgetWidth = (contentWidth - margin) / chartsPerRow;
        const widgetHeight = 100; // Fixed height for charts
        
        const x = margin + (chartCol * widgetWidth);
        const y = currentY + (chartRow * widgetHeight);

        // Add widget to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, widgetWidth, widgetHeight);

        // Add title
        if (widget.config?.header?.title) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(widget.config.header.title, x, y - 5);
        }

        // Update grid position
        chartCol++;
        if (chartCol >= chartsPerRow) {
          chartCol = 0;
          chartRow++;
        }
        chartsOnPage++;

      } catch (error) {
        console.error(`Error exporting chart widget ${widget.id}:`, error);
      }
    }

    // Export other widgets
    for (const widget of otherWidgets) {
      try {
        const widgetElement = this.findWidgetElement(dashboardElement, widget.id);
        if (!widgetElement) continue;

        // Check if we need a new page
        if (currentY + 80 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(widgetElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const widgetWidth = contentWidth;
        const widgetHeight = 60;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, currentY, widgetWidth, widgetHeight);

        if (widget.config?.header?.title) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(widget.config.header.title, margin, currentY - 5);
        }

        currentY += widgetHeight + 10;

      } catch (error) {
        console.error(`Error exporting other widget ${widget.id}:`, error);
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
    
    // First try to find the gridster-item with the widget ID
    const gridsterItem = dashboard.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement;
    
    if (!gridsterItem) {
      console.warn(`Gridster item not found for widget ID: ${widgetId}`);
      return null;
    }
    
    // Look for the actual widget content within the gridster-item
    // The widget content is typically in a div with the widget component
    let widgetContent = gridsterItem.querySelector('vis-widget');
    
    if (widgetContent) {
      // For echart widgets, look for the actual chart element
      const chartElement = widgetContent.querySelector('vis-echart') || 
                          widgetContent.querySelector('[echarts]') ||
                          widgetContent.querySelector('canvas') ||
                          widgetContent.querySelector('div[style*="height"]');
      
      if (chartElement) {
        widgetContent = chartElement as HTMLElement;
      }
    }
    
    // Fallback to other selectors if vis-widget not found
    if (!widgetContent) {
      widgetContent = gridsterItem.querySelector('.widget-content') ||
                     gridsterItem.querySelector('[style*="height"]') ||
                     gridsterItem;
    }
    
    if (!widgetContent) {
      console.warn(`Widget content not found for widget ID: ${widgetId}`);
      return gridsterItem; // Fallback to gridster-item if no specific content found
    }
    
    console.log(`Found widget content for ${widgetId}:`, widgetContent);
    return widgetContent as HTMLElement;
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