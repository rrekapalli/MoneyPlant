import { Component, ViewChild } from '@angular/core';
import { DashboardContainerComponent } from './dashboard-container.component';
import { PdfExportOptions } from '../services/pdf-export.service';
import { IWidget } from '../entities/IWidget';

@Component({
  selector: 'app-dashboard-with-pdf',
  template: `
    <div class="dashboard-container">
      <!-- Dashboard Export Controls -->
      <div class="export-controls">
        <button (click)="exportToPdf()" class="btn btn-primary">
          Export to PDF
        </button>
        <button (click)="exportToPdfLandscape()" class="btn btn-secondary">
          Export Landscape
        </button>
        <button (click)="exportToPdfHighQuality()" class="btn btn-success">
          Export High Quality
        </button>
        <button (click)="exportWidget()" class="btn btn-info">
          Export Widget
        </button>
      </div>

      <!-- Dashboard Container -->
      <vis-dashboard-container
        #dashboardContainer
        [widgets]="widgets"
        [filterValues]="filterValues"
        [dashboardId]="dashboardId"
        [isEditMode]="isEditMode">
      </vis-dashboard-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    
    .export-controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    
    .btn:hover {
      opacity: 0.8;
    }
  `]
})
export class DashboardWithPdfExampleComponent {
  @ViewChild('dashboardContainer') dashboardContainer!: DashboardContainerComponent;

  widgets: IWidget[] = [
    {
      id: 'chart-1',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      position: { x: 0, y: 0, w: 6, h: 4, rows: 4, cols: 6 },
      rows: 4,
      cols: 6,
      config: {
        component: 'echart',
        header: {
          title: 'Sales Performance'
        },
        options: {
          title: {
            text: 'Monthly Sales'
          },
          xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [120, 200, 150, 80, 70, 110],
            type: 'bar'
          }]
        }
      }
    },
    {
      id: 'chart-2',
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      position: { x: 6, y: 0, w: 6, h: 4, rows: 4, cols: 6 },
      rows: 4,
      cols: 6,
      config: {
        component: 'echart',
        header: {
          title: 'Revenue Trend'
        },
        options: {
          title: {
            text: 'Revenue Over Time'
          },
          xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [820, 932, 901, 934, 1290, 1330],
            type: 'line'
          }]
        }
      }
    },
    {
      id: 'tile-1',
      x: 0,
      y: 4,
      w: 4,
      h: 2,
      position: { x: 0, y: 4, w: 4, h: 2, rows: 2, cols: 4 },
      rows: 2,
      cols: 4,
      config: {
        component: 'tile',
        header: {
          title: 'Total Revenue'
        },
        options: {
          value: '$1,234,567',
          subtitle: 'This Month',
          trend: '+12.5%',
          trendDirection: 'up'
        }
      }
    },
    {
      id: 'table-1',
      x: 4,
      y: 4,
      w: 8,
      h: 2,
      position: { x: 4, y: 4, w: 8, h: 2, rows: 2, cols: 8 },
      rows: 2,
      cols: 8,
      config: {
        component: 'table',
        header: {
          title: 'Top Products'
        },
        options: {
          columns: ['Product', 'Sales', 'Revenue'],
          data: [
            ['Product A', '1,234', '$12,340'],
            ['Product B', '987', '$9,870'],
            ['Product C', '756', '$7,560']
          ]
        }
      }
    }
  ];

  filterValues: any[] = [];
  dashboardId = 'example-dashboard';
  isEditMode = false;

  /**
   * Basic PDF export
   */
  async exportToPdf(): Promise<void> {
    try {
      console.log('Starting PDF export...');
      await this.dashboardContainer.exportToPdf({
        orientation: 'portrait',
        format: 'a4',
        filename: 'dashboard-export.pdf',
        title: 'Dashboard Report'
      });
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      // Handle error (show toast, alert, etc.)
    }
  }

  /**
   * Landscape PDF export
   */
  async exportToPdfLandscape(): Promise<void> {
    try {
      console.log('Starting landscape PDF export...');
      await this.dashboardContainer.exportToPdf({
        orientation: 'landscape',
        format: 'a4',
        filename: 'dashboard-landscape.pdf',
        title: 'Dashboard Report (Landscape)',
        includeHeader: true,
        includeFooter: true
      });
      console.log('Landscape PDF export completed successfully');
    } catch (error) {
      console.error('Landscape PDF export failed:', error);
    }
  }

  /**
   * High quality PDF export
   */
  async exportToPdfHighQuality(): Promise<void> {
    try {
      console.log('Starting high quality PDF export...');
      await this.dashboardContainer.exportToPdf({
        orientation: 'landscape',
        format: 'a3',
        scale: 3, // Higher scale for better quality
        filename: 'dashboard-high-quality.pdf',
        title: 'High Quality Dashboard Report',
        margin: 15
      });
      console.log('High quality PDF export completed successfully');
    } catch (error) {
      console.error('High quality PDF export failed:', error);
    }
  }

  /**
   * Export specific widget
   */
  async exportWidget(): Promise<void> {
    try {
      console.log('Starting widget export...');
      await this.dashboardContainer.exportWidgetToPdf('chart-1', {
        orientation: 'portrait',
        format: 'a4',
        filename: 'sales-chart.pdf',
        title: 'Sales Performance Chart'
      });
      console.log('Widget export completed successfully');
    } catch (error) {
      console.error('Widget export failed:', error);
    }
  }

  /**
   * Export with custom options
   */
  async exportWithCustomOptions(): Promise<void> {
    const options: PdfExportOptions = {
      orientation: 'landscape',
      format: 'a3',
      margin: 20,
      filename: `dashboard-${Date.now()}.pdf`,
      title: 'Custom Dashboard Export',
      includeHeader: true,
      includeFooter: true,
      scale: 2
    };

    try {
      console.log('Starting custom PDF export...');
      await this.dashboardContainer.exportToPdf(options);
      console.log('Custom PDF export completed successfully');
    } catch (error) {
      console.error('Custom PDF export failed:', error);
    }
  }

  /**
   * Export multiple widgets individually
   */
  async exportMultipleWidgets(): Promise<void> {
    const widgetIds = ['chart-1', 'chart-2', 'tile-1'];
    
    for (const widgetId of widgetIds) {
      try {
        await this.dashboardContainer.exportWidgetToPdf(widgetId, {
          filename: `widget-${widgetId}-${Date.now()}.pdf`,
          title: `Widget ${widgetId} Export`
        });
        console.log(`Widget ${widgetId} exported successfully`);
      } catch (error) {
        console.error(`Failed to export widget ${widgetId}:`, error);
      }
    }
  }

  /**
   * Export with different paper sizes
   */
  async exportWithDifferentSizes(): Promise<void> {
    const sizes = ['a4', 'a3', 'letter', 'legal'] as const;
    
    for (const size of sizes) {
      try {
        await this.dashboardContainer.exportToPdf({
          format: size,
          filename: `dashboard-${size}.pdf`,
          title: `Dashboard Export (${size.toUpperCase()})`
        });
        console.log(`${size.toUpperCase()} export completed`);
      } catch (error) {
        console.error(`${size.toUpperCase()} export failed:`, error);
      }
    }
  }

  /**
   * Export with minimal settings
   */
  async exportMinimal(): Promise<void> {
    try {
      await this.dashboardContainer.exportToPdf({
        orientation: 'landscape',
        format: 'a4',
        includeHeader: false,
        includeFooter: false,
        filename: 'dashboard-minimal.pdf'
      });
      console.log('Minimal export completed');
    } catch (error) {
      console.error('Minimal export failed:', error);
    }
  }
} 