import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { GridsterConfig, DisplayGrid, GridType } from 'angular-gridster2';

// Import dashboard modules
import { 
  DashboardContainerComponent,
  IWidget,
} from '@dashboards/public-api';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    TooltipModule,
    // Dashboard components
    DashboardContainerComponent
  ],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit {
  // Dashboard widgets
  widgets: IWidget[] = [];

  // Dashboard options
  options: GridsterConfig = {
    gridType: GridType.Fixed,
    displayGrid: DisplayGrid.None,
    margin: 10,
    outerMargin: true,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    },
    maxCols: 12,
    minCols: 1,
    maxRows: 100,
    minRows: 1,
    fixedRowHeight: 100
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize dashboard widgets
    this.initializeDashboardWidgets();
  }

  /**
   * Initialize dashboard widgets
   */
  private initializeDashboardWidgets(): void {
    // Create Superset dashboard widget
    this.widgets = [
      //this.createSupersetDashboardWidget()
    ];
  }

  /**
   * Create a Superset dashboard widget
   */
  // private createSupersetDashboardWidget(): IWidget {
  //   return {
  //     id: uuidv4(),
  //     position: { x: 0, y: 0, cols: 12, rows: 8 },
  //     config: {
  //       component: 'superset',
  //       header: {
  //         title: 'Today\'s Dashboard'
  //       },
  //       options: {
  //         dashboardUrl: 'https://superset.example.com',
  //         dashboardId: '123',
  //         config: {
  //           showHeader: true,
  //           showFooter: false,
  //           height: '100%',
  //           width: '100%'
  //         }
  //       }
  //     }
  //   };
  // }
}
