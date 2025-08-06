import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
import { Subscription } from 'rxjs';

import { TreeNode } from 'primeng/api';
import { IndicesService } from '../../services/apis/indices.api';
import { IndexResponseDto } from '../../services/entities/indices';
import { ComponentCommunicationService, SelectedIndexData } from '../../services/component-communication.service';

// Import modern Angular v20 WebSocket services and entities
import { ModernIndicesWebSocketService, IndexDataDto, IndicesDto } from '../../services/websockets';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  templateUrl: './indices.component.html',
  styleUrls: ['./indices.component.scss']
})
export class IndicesComponent implements OnInit, OnDestroy {
  // Indices lists
  indicesLists: any[] = [];

  // Indices data
  indices: IndexResponseDto[] = [];
  isLoadingIndices: boolean = false;

  // TreeTable data
  indicesTreeData: TreeNode[] = [];

  // Search functionality
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: any[] = [];

  // Global filter for TreeTable
  globalFilterValue: string = '';

  // Tab functionality
  activeTab: string = '0';

  // Selected index tracking for highlighting
  selectedIndexSymbol: string | null = null;

  // WebSocket subscription management
  private indicesWebSocketSubscription: Subscription | null = null;
  private allIndicesWebSocketSubscription: Subscription | null = null;

  // Helper method to get current indices list index from activeTab
  private getCurrentIndicesListIndex(): number {
    return parseInt(this.activeTab, 10);
  }

  // TrackBy function for ngFor performance optimization
  trackBySymbol(index: number, item: any): string {
    return item.symbol;
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private indicesService: IndicesService,
    private componentCommunicationService: ComponentCommunicationService,
    private modernIndicesWebSocketService: ModernIndicesWebSocketService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    try {
      // Check if services are properly injected
      if (!this.indicesService) {
        console.error('IndicesService is not available');
        return;
      }
      if (!this.componentCommunicationService) {
        console.error('ComponentCommunicationService is not available');
        return;
      }
      
      // Initialize WebSocket connection
      this.initializeWebSocket();
      
      // Load indices directly from the indices API
      this.loadIndicesLists();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  ngOnDestroy(): void {
    // Clean up WebSocket subscriptions
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }
    
    if (this.allIndicesWebSocketSubscription) {
      this.allIndicesWebSocketSubscription.unsubscribe();
      this.allIndicesWebSocketSubscription = null;
    }
    
    // Disconnect WebSocket
    this.modernIndicesWebSocketService.disconnect();
  }

  /**
   * Initialize WebSocket connection for indices data
   */
  private async initializeWebSocket(): Promise<void> {
    try {
      await this.modernIndicesWebSocketService.connect();
      
      // Subscribe to all indices updates
      this.subscribeToAllIndicesWebSocket();
    } catch (error) {
      console.warn('WebSocket initialization failed - continuing without real-time data:', (error as Error).message || error);
    }
  }

  /**
   * Subscribe to all indices WebSocket updates
   */
  private subscribeToAllIndicesWebSocket(): void {
    // Unsubscribe from previous subscription if any
    if (this.allIndicesWebSocketSubscription) {
      this.allIndicesWebSocketSubscription.unsubscribe();
      this.allIndicesWebSocketSubscription = null;
    }

    try {
      // Only subscribe if WebSocket is actually connected
      if (this.modernIndicesWebSocketService.isConnected) {
        // Subscribe to all indices data using modern service
        this.allIndicesWebSocketSubscription = this.modernIndicesWebSocketService
          .subscribeToAllIndices()
          .subscribe({
            next: (indicesData: IndicesDto) => {
              try {
                if (indicesData && indicesData.indices && indicesData.indices.length > 0) {
                  // Update indices data with WebSocket data
                  this.updateIndicesWithWebSocketData(indicesData.indices);
                  
                  // Update TreeTable data
                  this.indicesTreeData = this.transformToTreeData(this.indices);
                  
                  // Update indices lists
                  this.updateIndicesLists();
                  
                  this.cdr.detectChanges();
                } else {
                  console.warn('WebSocket received data but no valid indices found:', indicesData);
                }
              } catch (error) {
                console.error('Error processing received indices data:', error);
              }
            },
            error: (error) => {
              console.warn('WebSocket subscription error for all indices:', error.message || error);
              this.cdr.detectChanges();
            },
            complete: () => {
              // WebSocket subscription completed
            }
          });
          
      } else {
        console.warn('WebSocket not connected - skipping real-time subscription');
      }
    } catch (error) {
      console.warn('WebSocket subscription failed for all indices - continuing without real-time data:', (error as Error).message || error);
      this.cdr.detectChanges();
    }
  }

  /**
   * Update existing indices data with WebSocket data based on index name/symbol
   * @param webSocketIndices Array of index data from WebSocket
   */
  private updateIndicesWithWebSocketData(webSocketIndices: IndexDataDto[]): void {
    if (!webSocketIndices || webSocketIndices.length === 0) {
      return;
    }

    // Create a map of existing indices by symbol for quick lookup
    const existingIndicesMap = new Map<string, IndexResponseDto>();
    this.indices.forEach(index => {
      if (index.indexSymbol) {
        existingIndicesMap.set(index.indexSymbol.toUpperCase(), index);
      }
    });

    // Update existing indices with WebSocket data
    webSocketIndices.forEach(webSocketIndex => {
      const indexSymbol = webSocketIndex.indexSymbol || webSocketIndex.indexName;
      if (indexSymbol) {
        const normalizedSymbol = indexSymbol.toUpperCase();
        const existingIndex = existingIndicesMap.get(normalizedSymbol);
        
        if (existingIndex) {
          // Update existing index with WebSocket data
          this.updateIndexWithWebSocketData(existingIndex, webSocketIndex);
        } else {
          // Create new index from WebSocket data
          const newIndex = this.createIndexFromWebSocketData(webSocketIndex);
          if (newIndex) {
            this.indices.push(newIndex);
          }
        }
      }
    });

    // Sort indices by symbol for consistent display
    this.indices.sort((a, b) => (a.indexSymbol || '').localeCompare(b.indexSymbol || ''));
  }

  /**
   * Update an existing index with WebSocket data
   * @param existingIndex The existing index to update
   * @param webSocketIndex The WebSocket data to merge
   */
  private updateIndexWithWebSocketData(existingIndex: IndexResponseDto, webSocketIndex: IndexDataDto): void {
    // Update price and variation data
    if (webSocketIndex.lastPrice !== undefined) {
      existingIndex.lastPrice = webSocketIndex.lastPrice;
    }
    
    if (webSocketIndex.variation !== undefined) {
      existingIndex.variation = webSocketIndex.variation;
    }
    
    if (webSocketIndex.percentChange !== undefined) {
      existingIndex.percentChange = webSocketIndex.percentChange;
    }
    
    if (webSocketIndex.openPrice !== undefined) {
      existingIndex.openPrice = webSocketIndex.openPrice;
    }
    
    if (webSocketIndex.dayHigh !== undefined) {
      existingIndex.highPrice = webSocketIndex.dayHigh;
    }
    
    if (webSocketIndex.dayLow !== undefined) {
      existingIndex.lowPrice = webSocketIndex.dayLow;
    }
    
    if (webSocketIndex.previousClose !== undefined) {
      existingIndex.previousClose = webSocketIndex.previousClose;
    }
    
    // Update WebSocket-specific fields
    if (webSocketIndex.last !== undefined) {
      existingIndex.lastPrice = webSocketIndex.last;
    }
    
    if (webSocketIndex.change !== undefined) {
      existingIndex.variation = webSocketIndex.change;
    }
    
    if (webSocketIndex.perChange !== undefined) {
      existingIndex.percentChange = webSocketIndex.perChange;
    }
    
    if (webSocketIndex.open !== undefined) {
      existingIndex.openPrice = webSocketIndex.open;
    }
    
    if (webSocketIndex.high !== undefined) {
      existingIndex.highPrice = webSocketIndex.high;
    }
    
    if (webSocketIndex.low !== undefined) {
      existingIndex.lowPrice = webSocketIndex.low;
    }
  }

  /**
   * Create a new index from WebSocket data
   * @param webSocketIndex The WebSocket data to create index from
   * @returns New IndexResponseDto or null if invalid data
   */
  private createIndexFromWebSocketData(webSocketIndex: IndexDataDto): IndexResponseDto | null {
    const indexSymbol = webSocketIndex.indexSymbol || webSocketIndex.indexName;
    const indexName = webSocketIndex.indexName || webSocketIndex.indexSymbol;
    
    if (!indexSymbol || !indexName) {
      return null;
    }

    return {
      id: 0, // Will be assigned by backend, using 0 as placeholder
      indexSymbol: indexSymbol,
      indexName: indexName,
      lastPrice: webSocketIndex.lastPrice || webSocketIndex.last || 0,
      variation: webSocketIndex.variation || webSocketIndex.change || 0,
      percentChange: webSocketIndex.percentChange || webSocketIndex.perChange || 0,
      openPrice: webSocketIndex.openPrice || webSocketIndex.open || 0,
      highPrice: webSocketIndex.dayHigh || webSocketIndex.high || 0,
      lowPrice: webSocketIndex.dayLow || webSocketIndex.low || 0,
      previousClose: webSocketIndex.previousClose || 0,
      yearHigh: webSocketIndex.yearHigh || 0,
      yearLow: webSocketIndex.yearLow || 0,
      indicativeClose: webSocketIndex.indicativeClose || 0,
      peRatio: webSocketIndex.peRatio || 0,
      pbRatio: webSocketIndex.pbRatio || 0,
      dividendYield: webSocketIndex.dividendYield || 0,
      declines: webSocketIndex.declines || 0,
      advances: webSocketIndex.advances || 0,
      unchanged: webSocketIndex.unchanged || 0,
      percentChange365d: webSocketIndex.percentChange365d || 0,
      date365dAgo: webSocketIndex.date365dAgo || '',
      chart365dPath: webSocketIndex.chart365dPath || '',
      date30dAgo: webSocketIndex.date30dAgo || '',
      percentChange30d: webSocketIndex.percentChange30d || 0,
      chart30dPath: webSocketIndex.chart30dPath || '',
      chartTodayPath: webSocketIndex.chartTodayPath || '',
      keyCategory: 'Index', // Default category
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Update indices lists with current indices data
   */
  private updateIndicesLists(): void {
    if (this.indicesLists.length === 0) {
      return;
    }

    // Update the main indices list (first item)
    const mainIndicesList = this.indicesLists[0];
    if (mainIndicesList) {
      mainIndicesList.items = this.indices.map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      }));
    }
  }

  /**
   * Search for indices by symbol or name within the loaded indices
   * @param query The search query
   */
  searchIndices(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    // Search within the loaded indices
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults = this.indices
      .filter(index => 
        (index.indexSymbol?.toLowerCase().includes(normalizedQuery)) || 
        (index.indexName?.toLowerCase().includes(normalizedQuery))
      )
      .map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      }));

    this.isSearching = false;
  }

  /**
   * Add an index from search results to the current indices list
   * @param index The index to add
   */
  addIndexFromSearch(index: any): void {
    // Get the current indices list from the active tab
    const currentIndicesListIndex = this.getCurrentIndicesListIndex();
    if (currentIndicesListIndex === 0) {
      // Can't add to the main indices list
      return;
    }

    // Check if the index is already in the list
    const currentIndicesList = this.indicesLists[currentIndicesListIndex];
    if (!currentIndicesList) return;

    const indexExists = currentIndicesList.items.some((item: { symbol: any; }) => item.symbol === index.symbol);
    if (indexExists) {
      return;
    }

    // Add the index to the list
    currentIndicesList.items.push(index);

    // Clear search results
    this.searchResults = [];
    this.searchQuery = '';
  }

  /**
   * Transform flat indices data to hierarchical TreeNode structure
   * Groups indices by keyCategory for TreeTable display
   * Only shows categories that have indices with actual data
   */
  private transformToTreeData(indices: IndexResponseDto[]): TreeNode[] {
    const groupedData: { [key: string]: IndexResponseDto[] } = {};
    
    // Filter indices to only include those with meaningful data
    const validIndices = indices.filter(index => 
      index.indexSymbol && 
      (index.lastPrice !== null && index.lastPrice !== undefined) &&
      (index.variation !== null && index.variation !== undefined || 
       index.percentChange !== null && index.percentChange !== undefined)
    );
    
    // Group valid indices by keyCategory
    validIndices.forEach(index => {
      const category = index.keyCategory || 'Uncategorized';
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      groupedData[category].push(index);
    });

    // Transform to TreeNode structure - only include categories with valid indices
    const treeData: TreeNode[] = [];
    Object.keys(groupedData).forEach(category => {
      const categoryIndices = groupedData[category];
      
      // Only create category node if it has at least one valid index
      if (categoryIndices.length > 0) {
        const categoryNode: TreeNode = {
          data: {
            keyCategory: category,
            symbol: '',
            lastPrice: null,
            variation: null,
            percentChange: null,
            isCategory: true
          },
          children: categoryIndices.map(index => ({
            data: {
              keyCategory: category,
              symbol: index.indexSymbol,
              lastPrice: index.lastPrice,
              variation: index.variation,
              percentChange: index.percentChange,
              isCategory: false
            }
          })),
          expanded: true // All rows expanded by default
        };
        treeData.push(categoryNode);
      }
    });

    return treeData;
  }

  /**
   * Handle row click event in the tree table
   * @param rowData The clicked row data
   */
  onRowClick(rowData: any): void {
    // Only handle clicks on non-category rows (actual indices)
    if (rowData.isCategory) {
      return;
    }

    // Set the selected index symbol for highlighting
    this.selectedIndexSymbol = rowData.symbol;

    // Transform the row data to SelectedIndexData format
    const selectedIndexData: SelectedIndexData = {
      id: rowData.symbol || 'unknown',
      symbol: rowData.symbol || '',
      name: rowData.symbol || '', // Using symbol as name since name might not be available
      lastPrice: rowData.lastPrice || 0,
      variation: rowData.variation || 0,
      percentChange: rowData.percentChange || 0,
      keyCategory: rowData.keyCategory || 'Index'
    };

    // Send the selected data to the component communication service
    this.componentCommunicationService.setSelectedIndex(selectedIndexData);

    // Navigate to the overall dashboard component
    this.router.navigate(['/dashboard/overall']);
  }

  /**
   * Load indices lists from the indices API
   * Gets all indices from the API and fills the list with indices data
   */
  private loadIndicesLists(): void {
    try {
      this.isLoadingIndices = true;
      // Get all indices from the API
      this.indicesService.getAllIndices().subscribe({
        next: (indices: IndexResponseDto[]) => {
          this.indices = indices;
          this.isLoadingIndices = false;

          // Transform to TreeTable data
          this.indicesTreeData = this.transformToTreeData(indices);

          // Create an indices list item for each index
          const items = indices.map(index => ({
            symbol: index.indexSymbol,
            name: index.indexName,
            price: index.lastPrice || 0,
            change: (index.percentChange || 0) / 100 // Convert percentage to decimal
          }));

          // Create an indices list with the indices
          const mainIndicesList = {
            id: 'main-indices',
            name: 'Market Indices',
            description: 'All market indices from the indices API',
            items: items
          };

          // Set the indicesLists property with the main indices list as the first item
          this.indicesLists = [mainIndicesList];

          // Set the active tab to the first list
          this.activeTab = '0';
        },
        error: (error: any) => {
          console.error('Failed to load indices:', error);
          this.isLoadingIndices = false;
          
          // If there's an error, use empty indices list
          const emptyIndicesList = {
            id: 'main-indices',
            name: 'Market Indices',
            description: 'All market indices from the indices API',
            items: []
          };
          
          // Set the indicesLists property with the empty list
          this.indicesLists = [emptyIndicesList];
          
          // Set the active tab to the first list
          this.activeTab = '0';
        }
      });
    } catch (error) {
      console.error('Error in loadIndicesLists:', error);
      this.isLoadingIndices = false;
      
      // If there's an error, use empty indices list
      const emptyIndicesList = {
        id: 'main-indices',
        name: 'Market Indices',
        description: 'All market indices from the indices API',
        items: []
      };
      
      // Set the indicesLists property with the empty list
      this.indicesLists = [emptyIndicesList];
      
      // Set the active tab to the first list
      this.activeTab = '0';
    }
  }
}