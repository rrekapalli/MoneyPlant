import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { ScrollerModule } from "primeng/scroller";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { TreeNode } from 'primeng/api';
import { StockListData } from './stock-list-chart-builder';

/**
 * Interface for selected stock data communication
 */
export interface SelectedStockData {
  id: string;
  symbol: string;
  name: string;
  lastPrice: number;
  priceChange: number;
  percentChange: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  industry?: string;
  sector?: string;
}

@Component({
  selector: 'app-stock-list-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TreeTableModule,
    DividerModule,
    InputTextModule,
    ScrollerModule,
    DataViewModule,
    ScrollPanelModule,
    TabsModule,
    TooltipModule
  ],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center">
          <h3>Stock List</h3>
          <div class="flex gap-2">
            <p-button 
              icon="pi pi-refresh" 
              [loading]="isLoadingStocks" 
              (onClick)="refreshStocks()"
              severity="secondary"
              size="small">
            </p-button>
          </div>
        </div>
      </ng-template>

      <!-- Search functionality -->
      <div class="mb-3">
        <div class="p-inputgroup">
          <span class="p-inputgroup-addon">
            <i class="pi pi-search"></i>
          </span>
          <input 
            type="text" 
            pInputText 
            placeholder="Search stocks by symbol or company name..." 
            [(ngModel)]="searchQuery"
            (input)="searchStocks(searchQuery)"
            class="w-full">
        </div>
        
        <!-- Search results -->
        <div *ngIf="searchResults.length > 0" class="mt-2">
          <p-divider align="left">
            <div class="inline-flex align-items-center">
              <i class="pi pi-search mr-2"></i>
              <b>Search Results</b>
            </div>
          </p-divider>
          <div class="grid">
            <div 
              *ngFor="let stock of searchResults; trackBy: trackBySymbol" 
              class="col-12 md:col-6 lg:col-4">
              <p-card class="cursor-pointer hover:shadow-3 transition-all transition-duration-200"
                      (click)="addStockFromSearch(stock)">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <div class="font-bold text-lg">{{ stock.symbol }}</div>
                    <div class="text-sm text-600">{{ stock.companyName || 'N/A' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold">₹{{ stock.lastPrice | number:'1.2-2' }}</div>
                    <div [class]="stock.percentChange >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ stock.percentChange >= 0 ? '+' : '' }}{{ stock.percentChange | number:'1.2-2' }}%
                    </div>
                  </div>
                </div>
              </p-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Main stock table -->
      <p-treeTable 
        [value]="stocksTreeData" 
        [globalFilterFields]="['symbol', 'companyName', 'industry', 'sector']"
        [scrollable]="true" 
        scrollHeight="600px"
        styleClass="p-treetable-sm"
        selectionMode="single">
        
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 3rem">
              <p-treeTableHeaderCheckbox></p-treeTableHeaderCheckbox>
            </th>
            <th pSortableColumn="symbol" style="min-width: 120px">
              Symbol
              <p-sortIcon field="symbol"></p-sortIcon>
            </th>
            <th pSortableColumn="companyName" style="min-width: 200px">
              Company Name
              <p-sortIcon field="companyName"></p-sortIcon>
            </th>
            <th pSortableColumn="lastPrice" style="min-width: 100px" class="text-right">
              Last Price
              <p-sortIcon field="lastPrice"></p-sortIcon>
            </th>
            <th pSortableColumn="priceChange" style="min-width: 100px" class="text-right">
              Change
              <p-sortIcon field="priceChange"></p-sortIcon>
            </th>
            <th pSortableColumn="percentChange" style="min-width: 100px" class="text-right">
              Change %
              <p-sortIcon field="percentChange"></p-sortIcon>
            </th>
            <th pSortableColumn="volume" style="min-width: 120px" class="text-right">
              Volume
              <p-sortIcon field="volume"></p-sortIcon>
            </th>
            <th pSortableColumn="dayHigh" style="min-width: 100px" class="text-right">
              High
              <p-sortIcon field="dayHigh"></p-sortIcon>
            </th>
            <th pSortableColumn="dayLow" style="min-width: 100px" class="text-right">
              Low
              <p-sortIcon field="dayLow"></p-sortIcon>
            </th>
            <th pSortableColumn="industry" style="min-width: 150px">
              Industry
              <p-sortIcon field="industry"></p-sortIcon>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
          <tr [pSelectableRow]="rowNode" 
              [class]="rowData.isCategory ? 'category-row font-bold' : 'stock-row cursor-pointer'"
              (click)="onRowClick(rowData)">
            <td>
              <p-treeTableCheckbox [value]="rowNode" *ngIf="!rowData.isCategory"></p-treeTableCheckbox>
            </td>
            <td>
              <p-treeTableToggler [rowNode]="rowNode" *ngIf="rowData.isCategory"></p-treeTableToggler>
              <span [class]="rowData.isCategory ? 'font-bold text-primary' : ''">
                {{ rowData.symbol || rowData.industry }}
              </span>
            </td>
            <td>
              <span [class]="rowData.isCategory ? 'font-bold text-600' : ''">
                {{ rowData.companyName || (rowData.isCategory ? 'Industry Group' : 'N/A') }}
              </span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span class="font-semibold">₹{{ rowData.lastPrice | number:'1.2-2' }}</span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span [class]="rowData.priceChange >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                {{ rowData.priceChange >= 0 ? '+' : '' }}₹{{ rowData.priceChange | number:'1.2-2' }}
              </span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span [class]="rowData.percentChange >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                {{ rowData.percentChange >= 0 ? '+' : '' }}{{ rowData.percentChange | number:'1.2-2' }}%
              </span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span>{{ rowData.volume | number }}</span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span>₹{{ rowData.dayHigh | number:'1.2-2' }}</span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td class="text-right" *ngIf="!rowData.isCategory">
              <span>₹{{ rowData.dayLow | number:'1.2-2' }}</span>
            </td>
            <td class="text-right" *ngIf="rowData.isCategory">
              <span class="text-600">-</span>
            </td>
            <td *ngIf="!rowData.isCategory">
              <span class="text-sm">{{ rowData.industry || 'N/A' }}</span>
            </td>
            <td *ngIf="rowData.isCategory">
              <span class="text-600 text-sm">{{ rowData.stockCount || 0 }} stocks</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="10" class="text-center p-4">
              <div class="flex flex-column align-items-center gap-3">
                <i class="pi pi-chart-line text-4xl text-400"></i>
                <span class="text-lg text-600">No stock data available</span>
                <p-button 
                  label="Load Sample Data" 
                  icon="pi pi-plus" 
                  (onClick)="loadSampleData()"
                  size="small">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-treeTable>
    </p-card>
  `,
  styles: [`
    .category-row {
      background-color: #f8f9fa;
    }
    
    .stock-row:hover {
      background-color: #e9ecef;
    }
    
    .p-card {
      margin-bottom: 1rem;
    }
    
    .p-treetable .p-treetable-tbody > tr > td {
      padding: 0.75rem;
    }
    
    .text-green-600 {
      color: #16a34a;
    }
    
    .text-red-600 {
      color: #dc2626;
    }
  `]
})
export class StockListTableComponent implements OnInit, OnChanges {
  @Input() stocks: StockListData[] = [];
  @Input() isLoadingStocks: boolean = false;
  @Output() stockSelected = new EventEmitter<SelectedStockData>();
  @Output() refreshRequested = new EventEmitter<void>();

  // TreeTable data
  stocksTreeData: TreeNode[] = [];

  // Search functionality
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: StockListData[] = [];

  // Global filter for TreeTable
  globalFilterValue: string = '';

  constructor() {}

  ngOnInit(): void {
    this.transformToTreeData();
  }

  ngOnChanges(): void {
    this.transformToTreeData();
  }

  /**
   * TrackBy function for ngFor performance optimization
   */
  trackBySymbol(index: number, item: StockListData): string {
    return item.symbol || '';
  }

  /**
   * Search for stocks by symbol or company name
   */
  searchStocks(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    // Search within the loaded stocks
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults = this.stocks
      .filter(stock => 
        (stock.symbol?.toLowerCase().includes(normalizedQuery)) || 
        (stock.companyName?.toLowerCase().includes(normalizedQuery))
      )
      .map(stock => ({
        ...stock
      }));

    this.isSearching = false;
  }

  /**
   * Add a stock from search results to the current view
   */
  addStockFromSearch(stock: StockListData): void {
    // Check if the stock is already in the list
    const stockExists = this.stocks.some(item => item.symbol === stock.symbol);
    if (stockExists) {
      return;
    }

    // Add the stock to the list
    this.stocks.push(stock);
    this.transformToTreeData();

    // Clear search results
    this.searchResults = [];
    this.searchQuery = '';
  }

  /**
   * Transform flat stock data to hierarchical TreeNode structure
   * Groups stocks by industry for TreeTable display
   */
  private transformToTreeData(): void {
    if (!this.stocks || this.stocks.length === 0) {
      this.stocksTreeData = [];
      return;
    }

    const groupedData: { [key: string]: StockListData[] } = {};
    
    // Group stocks by industry
    this.stocks.forEach(stock => {
      const industry = stock.industry || 'Uncategorized';
      if (!groupedData[industry]) {
        groupedData[industry] = [];
      }
      groupedData[industry].push(stock);
    });

    // Transform to TreeNode structure
    this.stocksTreeData = [];
    Object.keys(groupedData).forEach(industry => {
      const industryNode: TreeNode = {
        data: {
          industry: industry,
          symbol: '',
          companyName: '',
          lastPrice: null,
          priceChange: null,
          percentChange: null,
          volume: null,
          dayHigh: null,
          dayLow: null,
          isCategory: true,
          stockCount: groupedData[industry].length
        },
        children: groupedData[industry].map(stock => ({
          data: {
            ...stock,
            isCategory: false
          }
        })),
        expanded: true // All rows expanded by default
      };
      this.stocksTreeData.push(industryNode);
    });
  }

  /**
   * Handle row click event in the tree table
   */
  onRowClick(rowData: any): void {
    // Only handle clicks on non-category rows (actual stocks)
    if (rowData.isCategory) {
      return;
    }

    // Transform the row data to SelectedStockData format
    const selectedStockData: SelectedStockData = {
      id: rowData.symbol || 'unknown',
      symbol: rowData.symbol || '',
      name: rowData.companyName || rowData.symbol || '',
      lastPrice: rowData.lastPrice || 0,
      priceChange: rowData.priceChange || 0,
      percentChange: rowData.percentChange || 0,
      volume: rowData.volume,
      dayHigh: rowData.dayHigh,
      dayLow: rowData.dayLow,
      industry: rowData.industry,
      sector: rowData.sector
    };

    // Emit the selected stock data
    this.stockSelected.emit(selectedStockData);
  }

  /**
   * Refresh stocks data
   */
  refreshStocks(): void {
    this.refreshRequested.emit();
  }

  /**
   * Load sample data for testing
   */
  loadSampleData(): void {
    const sampleStocks: StockListData[] = [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        lastPrice: 2456.75,
        priceChange: 23.50,
        percentChange: 0.97,
        volume: 1234567,
        dayHigh: 2478.90,
        dayLow: 2445.20,
        openPrice: 2450.00,
        previousClose: 2433.25,
        industry: 'Oil & Gas',
        sector: 'Energy'
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        lastPrice: 3567.80,
        priceChange: -15.25,
        percentChange: -0.43,
        volume: 987654,
        dayHigh: 3590.00,
        dayLow: 3555.50,
        openPrice: 3580.00,
        previousClose: 3583.05,
        industry: 'Information Technology',
        sector: 'IT'
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        lastPrice: 1456.30,
        priceChange: 8.75,
        percentChange: 0.60,
        volume: 2345678,
        dayHigh: 1465.00,
        dayLow: 1445.80,
        openPrice: 1450.00,
        previousClose: 1447.55,
        industry: 'Information Technology',
        sector: 'IT'
      },
      {
        symbol: 'HDFC',
        companyName: 'HDFC Bank Limited',
        lastPrice: 1678.90,
        priceChange: 12.40,
        percentChange: 0.74,
        volume: 1876543,
        dayHigh: 1685.50,
        dayLow: 1665.20,
        openPrice: 1670.00,
        previousClose: 1666.50,
        industry: 'Banking',
        sector: 'Financial Services'
      },
      {
        symbol: 'ICICI',
        companyName: 'ICICI Bank Limited',
        lastPrice: 987.65,
        priceChange: -5.30,
        percentChange: -0.53,
        volume: 3456789,
        dayHigh: 995.00,
        dayLow: 982.50,
        openPrice: 990.00,
        previousClose: 992.95,
        industry: 'Banking',
        sector: 'Financial Services'
      }
    ];

    this.stocks = sampleStocks;
    this.transformToTreeData();
  }
}