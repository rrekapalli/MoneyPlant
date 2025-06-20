import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { EventBusService } from '../../services/event-bus.service';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'vis-data-grid',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    InputTextModule, 
    ButtonModule, 
    DropdownModule, 
    MultiSelectModule, 
    FormsModule,
    PaginatorModule
  ],
  template: `
    <div class="data-grid-container">
      <p-table 
        #dt 
        [value]="data" 
        [paginator]="true" 
        [rows]="10" 
        [showCurrentPageReport]="true" 
        [rowsPerPageOptions]="[10,25,50]"
        [globalFilterFields]="columns"
        [loading]="loading"
        styleClass="p-datatable-sm p-datatable-gridlines"
        [tableStyle]="{ 'min-width': '50rem' }"
        [sortField]="sortField"
        [sortOrder]="sortOrder"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        [filterDelay]="0"
        [resizableColumns]="true"
        [reorderableColumns]="true"
        [scrollable]="true"
        scrollHeight="flex"
        [responsive]="true"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-content-between align-items-center">
            <h5 class="m-0">{{ widget.config?.header?.title || 'Data Grid' }}</h5>
            <div class="table-header-container">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input 
                  pInputText 
                  type="text" 
                  (input)="dt.filterGlobal($event.target.value, 'contains')" 
                  placeholder="Search..." 
                />
              </span>
              <button 
                pButton 
                label="Clear" 
                class="p-button-outlined p-button-sm" 
                icon="pi pi-filter-slash" 
                (click)="clear(dt)"
              ></button>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th *ngFor="let col of columns" [pSortableColumn]="col">
              {{ col }}
              <p-sortIcon [field]="col"></p-sortIcon>
              <p-columnFilter 
                [field]="col" 
                matchMode="contains" 
                [showMatchModes]="false" 
                [showOperator]="false" 
                [showAddButton]="false"
              ></p-columnFilter>
            </th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-rowData>
          <tr>
            <td *ngFor="let col of columns">
              {{ rowData[col] }}
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length" class="text-center">
              {{ loading ? 'Loading data...' : (error ? 'Error loading data' : 'No data found') }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .data-grid-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .table-header-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    /* Responsive styles */
    @media screen and (max-width: 768px) {
      :host ::ng-deep .p-datatable-responsive .p-datatable-tbody > tr > td {
        text-align: left;
        display: block;
        width: 100%;
        float: left;
        clear: left;
        border: 0 none;
      }

      :host ::ng-deep .p-datatable-responsive .p-datatable-tbody > tr > td:before {
        content: attr(data-label);
        font-weight: bold;
        display: inline-block;
        margin-right: 0.5rem;
      }
      
      .table-header-container {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent extends BaseWidgetComponent implements OnInit {
  @ViewChild('dt') table: any;
  
  data: any[] = [];
  columns: string[] = [];
  sortField: string = '';
  sortOrder: number = 1;
  
  constructor(
    protected override eventBus: EventBusService,
    private elementRef: ElementRef
  ) {
    super(eventBus);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    
    // Initialize data grid
    this.initializeDataGrid();
  }
  
  /**
   * Initializes the data grid with configuration from the widget
   */
  private initializeDataGrid(): void {
    // Extract columns from widget configuration
    if (this.widget.config?.options?.columns) {
      this.columns = this.widget.config.options.columns as string[];
    }
    
    // Extract initial sort field and order if available
    if (this.widget.config?.options?.sortField) {
      this.sortField = this.widget.config.options.sortField as string;
    }
    
    if (this.widget.config?.options?.sortOrder) {
      this.sortOrder = this.widget.config.options.sortOrder as number;
    }
    
    // Load data
    this.loadData();
  }
  
  /**
   * Called when the widget is updated
   */
  protected override onWidgetUpdated(): void {
    this.initializeDataGrid();
  }
  
  /**
   * Called when filters are updated
   */
  protected override onFilterUpdated(filterData: any): void {
    this.loadData();
  }
  
  /**
   * Clears all filters in the table
   */
  clear(table: any): void {
    table.clear();
  }
  
  /**
   * Processes data received from the server
   */
  private processData(data: any): void {
    if (!data) {
      this.data = [];
      return;
    }
    
    // If data is an array, use it directly
    if (Array.isArray(data)) {
      this.data = data;
    } 
    // If data has a results property that is an array, use that
    else if (data.results && Array.isArray(data.results)) {
      this.data = data.results;
    } 
    // If data has a data property that is an array, use that
    else if (data.data && Array.isArray(data.data)) {
      this.data = data.data;
    }
    
    // If no columns are defined, extract them from the first data item
    if (this.columns.length === 0 && this.data.length > 0) {
      this.columns = Object.keys(this.data[0]);
    }
  }
}