import { PdfExportOptions } from '../services/pdf-export.service';

/**
 * Examples of how to use the PDF export functionality
 */

// Example 1: Basic PDF export with default settings
export const basicPdfExport = async (dashboard: any) => {
  try {
    await dashboard.exportToPdf();
    console.log('Dashboard exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 2: PDF export with custom options
export const customPdfExport = async (dashboard: any) => {
  const options: PdfExportOptions = {
    orientation: 'landscape',
    format: 'a3',
    margin: 15,
    filename: 'my-dashboard-report.pdf',
    title: 'Financial Dashboard Report',
    includeHeader: true,
    includeFooter: true,
    scale: 2
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('Dashboard exported with custom settings');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 3: Portrait orientation export
export const portraitPdfExport = async (dashboard: any) => {
  const options: PdfExportOptions = {
    orientation: 'portrait',
    format: 'a4',
    filename: 'dashboard-portrait.pdf',
    title: 'Dashboard Report (Portrait)'
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('Portrait export completed');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 4: Export specific widget
export const exportSingleWidget = async (dashboard: any, widgetId: string) => {
  const options: PdfExportOptions = {
    orientation: 'portrait',
    format: 'a4',
    filename: `widget-${widgetId}.pdf`,
    title: 'Widget Export'
  };

  try {
    await dashboard.exportWidgetToPdf(widgetId, options);
    console.log(`Widget ${widgetId} exported successfully`);
  } catch (error) {
    console.error('Widget export failed:', error);
  }
};

// Example 5: Export with minimal header/footer
export const minimalPdfExport = async (dashboard: any) => {
  const options: PdfExportOptions = {
    orientation: 'landscape',
    format: 'a4',
    includeHeader: false,
    includeFooter: false,
    filename: 'dashboard-minimal.pdf'
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('Minimal export completed');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 6: High quality export
export const highQualityPdfExport = async (dashboard: any) => {
  const options: PdfExportOptions = {
    orientation: 'landscape',
    format: 'a3',
    scale: 3, // Higher scale for better quality
    filename: 'dashboard-high-quality.pdf',
    title: 'High Quality Dashboard Export'
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('High quality export completed');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 7: Export with custom margins
export const customMarginPdfExport = async (dashboard: any) => {
  const options: PdfExportOptions = {
    orientation: 'portrait',
    format: 'a4',
    margin: 20, // Larger margins
    filename: 'dashboard-with-margins.pdf',
    title: 'Dashboard with Custom Margins'
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('Custom margin export completed');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Example 8: Export multiple widgets individually
export const exportMultipleWidgets = async (dashboard: any, widgetIds: string[]) => {
  for (const widgetId of widgetIds) {
    try {
      await dashboard.exportWidgetToPdf(widgetId, {
        filename: `widget-${widgetId}-${Date.now()}.pdf`,
        title: `Widget ${widgetId} Export`
      });
      console.log(`Widget ${widgetId} exported successfully`);
    } catch (error) {
      console.error(`Failed to export widget ${widgetId}:`, error);
    }
  }
};

// Example 9: Export with different paper sizes
export const exportWithDifferentSizes = async (dashboard: any) => {
  const sizes = ['a4', 'a3', 'letter', 'legal'] as const;
  
  for (const size of sizes) {
    try {
      await dashboard.exportToPdf({
        format: size,
        filename: `dashboard-${size}.pdf`,
        title: `Dashboard Export (${size.toUpperCase()})`
      });
      console.log(`${size.toUpperCase()} export completed`);
    } catch (error) {
      console.error(`${size.toUpperCase()} export failed:`, error);
    }
  }
};

// Example 10: Export with timestamp in filename
export const exportWithTimestamp = async (dashboard: any) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const options: PdfExportOptions = {
    orientation: 'landscape',
    format: 'a4',
    filename: `dashboard-export-${timestamp}.pdf`,
    title: 'Dashboard Export',
    includeHeader: true,
    includeFooter: true
  };

  try {
    await dashboard.exportToPdf(options);
    console.log('Timestamped export completed');
  } catch (error) {
    console.error('Export failed:', error);
  }
}; 