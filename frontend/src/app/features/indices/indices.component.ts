import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { Subject, takeUntil, interval, Subscription } from 'rxjs';

import { TreeNode } from 'primeng/api';
import { IndicesService } from '../../services/apis/indices.api';
import { IndexResponseDto } from '../../services/entities/indices';
import { ComponentCommunicationService, SelectedIndexData } from '../../services/component-communication.service';
import { NseIndicesService } from '../../services/apis/nse-indices.api';
import { NseIndicesTickDto } from '../../services/entities/nse-indices';
import { EnginesWebSocketService } from '../../services/websockets/engines-websocket.service';

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
  styleUrls: ['./indices.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class IndicesComponent implements OnInit, OnDestroy {

  // Convert main data properties to signals for better performance
  indices = signal<IndexResponseDto[]>([]);
  indicesTreeData = signal<TreeNode[]>([]);
  indicesLists = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  selectedIndexSymbol = signal<string | null>(null);
  
  // NSE Indices data for real-time streaming
  nseIndicesData = signal<NseIndicesTickDto[]>([]);
  isNseIndicesConnected = signal<boolean>(false);
  
  // Loading states as signals
  isLoadingIndices = signal<boolean>(true); // Start with loading true
  isSearching = signal<boolean>(false);
  


  // Search functionality
  searchQuery = signal<string>('');
  globalFilterValue = signal<string>('');

  // Tab functionality
  activeTab = signal<string>('0');
  

  
  // Method to update active tab (for two-way binding)
  updateActiveTab(value: string | number): void {
    this.activeTab.set(value.toString());
  }
  
  // Method to update global filter value (for two-way binding)
  updateGlobalFilterValue(value: string | number): void {
    this.globalFilterValue.set(value.toString());
  }

  // Computed signals for derived data
  hasIndices = computed(() => this.indices().length > 0);
  hasTreeData = computed(() => this.indicesTreeData().length > 0);
  hasSearchResults = computed(() => this.searchResults().length > 0);

  currentIndicesList = computed(() => {
    const index = parseInt(this.activeTab(), 10);
    return this.indicesLists()[index] || null;
  });

  // WebSocket subscription management
  private indicesWebSocketSubscription: Subscription | null = null;
  private allIndicesWebSocketSubscription: Subscription | null = null;
  private webSocketUpdateTimer: any = null;
  
  // NSE Indices refresh timer
  private nseIndicesRefreshTimer: any = null;

  // WebSocket subscription
  private webSocketSubscription: Subscription | null = null;
  private connectionStatusSubscription: Subscription | null = null;
  private errorSubscription: Subscription | null = null;

  // Helper method to get current indices list index from activeTab
  private getCurrentIndicesListIndex(): number {
    return parseInt(this.activeTab(), 10);
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
    private nseIndicesService: NseIndicesService,
    private enginesWebSocketService: EnginesWebSocketService,
    private cdr: ChangeDetectorRef
  ) {
    // Removed effects to prevent infinite loops
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
      
      // Initialize NSE Indices connection
      this.initializeNseIndices();
      
      // Initialize WebSocket connection to engines
      this.initializeEnginesWebSocket();
      
      // Check initial NSE indices status
      this.checkIngestionStatus();
      
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
    
    // Clean up engines WebSocket subscriptions
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
      this.webSocketSubscription = null;
    }
    
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
      this.connectionStatusSubscription = null;
    }
    
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
      this.errorSubscription = null;
    }
    
    // Clear any pending WebSocket update timer
    if (this.webSocketUpdateTimer) {
      clearTimeout(this.webSocketUpdateTimer);
      this.webSocketUpdateTimer = null;
    }
    
    // Clear NSE indices refresh timer
    if (this.nseIndicesRefreshTimer) {
      clearInterval(this.nseIndicesRefreshTimer);
      this.nseIndicesRefreshTimer = null;
    }
    
    // Disconnect WebSockets
    this.modernIndicesWebSocketService.disconnect();
    this.enginesWebSocketService.disconnect();
  }

  /**
   * Initialize WebSocket connection to engines module
   */
  private initializeEnginesWebSocket(): void {
    try {
      // Subscribe to WebSocket connection status
      this.connectionStatusSubscription = this.enginesWebSocketService.getConnectionStatus()
        .subscribe(status => {
          this.isNseIndicesConnected.set(status);
          console.log('Engines WebSocket connection status:', status);
        });

      // Subscribe to NSE indices data stream
      this.webSocketSubscription = this.enginesWebSocketService.getNseIndicesStream()
        .subscribe(data => {
          if (data && data.indices && data.indices.length > 0) {
            console.log('Received NSE indices data via WebSocket:', data);
            this.nseIndicesData.set([data]);
            this.updateIndicesListsWithNseData();
            this.cdr.detectChanges();
          }
        });

      // Subscribe to error stream
      this.errorSubscription = this.enginesWebSocketService.getErrorStream()
        .subscribe(error => {
          console.error('Engines WebSocket error:', error);
        });

      // Start ingestion via WebSocket
      this.enginesWebSocketService.startIngestion();

    } catch (error) {
      console.error('Failed to initialize engines WebSocket:', error);
    }
  }

  /**
   * Initialize NSE Indices connection for real-time data streaming
   */
  public async initializeNseIndices(): Promise<void> {
    try {
      // Start NSE indices ingestion
      this.nseIndicesService.startIngestion().subscribe({
        next: (response) => {
          console.log('NSE Indices ingestion started:', response);
          
          // Check the actual ingestion status
          this.checkIngestionStatus();
          
          // Subscribe to all indices data
          this.subscribeToAllNseIndices();
          
          // Start periodic refresh
          this.startPeriodicNseIndicesRefresh();
        },
        error: (error) => {
          console.warn('Failed to start NSE indices ingestion:', error);
          this.isNseIndicesConnected.set(false);
          
          // Try to get latest data anyway
          this.getLatestNseIndicesData();
        }
      });
    } catch (error) {
      console.warn('NSE Indices initialization failed:', error);
      this.isNseIndicesConnected.set(false);
    }
  }

  /**
   * Subscribe to all NSE indices data
   */
  private subscribeToAllNseIndices(): void {
    this.nseIndicesService.subscribeToAllIndices().subscribe({
      next: (response) => {
        console.log('Subscribed to all NSE indices:', response);
        // Get the latest data
        this.getLatestNseIndicesData();
      },
      error: (error) => {
        console.warn('Failed to subscribe to all NSE indices:', error);
        // Try to get latest data anyway
        this.getLatestNseIndicesData();
      }
    });
  }

  /**
   * Check the current ingestion status from the API
   */
  private checkIngestionStatus(): void {
    this.nseIndicesService.getIngestionStatus().subscribe({
      next: (status) => {
        console.log('Ingestion status:', status);
        this.isNseIndicesConnected.set(status.ingestionStatus === 'RUNNING');
      },
      error: (error) => {
        console.warn('Failed to get ingestion status:', error);
        this.isNseIndicesConnected.set(false);
      }
    });
  }

  /**
   * Get the latest NSE indices data
   */
  private getLatestNseIndicesData(): void {
    this.nseIndicesService.getLatestIndicesData().subscribe({
      next: (indicesData: NseIndicesTickDto[]) => {
        this.nseIndicesData.set(indicesData || []);
        console.log('Loaded NSE indices data:', this.nseIndicesData());
        
        // Check if we have valid data
        const validEntries = indicesData?.filter(entry => 
          entry.indices && entry.indices.length > 0 && entry.source === 'MOCK_NSE'
        ) || [];
        
        if (validEntries.length > 0) {
          console.log('Found valid NSE indices entries:', validEntries.length);
          // Update the indices lists with NSE data
          this.updateIndicesListsWithNseData();
        } else {
          console.log('No valid NSE indices data found in response');
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.warn('Failed to load NSE indices data:', error);
        this.nseIndicesData.set([]);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Start periodic refresh of NSE indices data
   * Updates data every 30 seconds
   */
  private startPeriodicNseIndicesRefresh(): void {
    // Clear any existing timer
    if (this.nseIndicesRefreshTimer) {
      clearInterval(this.nseIndicesRefreshTimer);
    }
    
    // Refresh every 30 seconds
    this.nseIndicesRefreshTimer = setInterval(() => {
      this.refreshNseIndicesData();
    }, 30000);
  }

  /**
   * Update indices lists with NSE indices data
   */
  private updateIndicesListsWithNseData(): void {
    const nseData = this.nseIndicesData();
    if (!nseData || nseData.length === 0) {
      return;
    }

    // Find entries with actual indices data (not just timestamps)
    const validEntries = nseData.filter(entry => 
      entry.indices && entry.indices.length > 0 && entry.source === 'MOCK_NSE'
    );

    if (validEntries.length === 0) {
      console.log('No valid NSE indices data found');
      return;
    }

    // Use the most recent valid entry
    const latestEntry = validEntries[validEntries.length - 1];
    console.log('Processing NSE indices data:', latestEntry);

    // Create NSE indices list items
    const nseItems = latestEntry.indices!.map(index => ({
      symbol: index.indexSymbol || index.index,
      name: index.index,
      price: index.last || 0,
      change: (index.percentChange || 0) / 100 // Convert percentage to decimal
    }));

    // Get current indices lists
    const currentLists = this.indicesLists();
    
    // Create or update NSE indices list
    const nseIndicesList = {
      id: 'nse-indices',
      name: 'NSE Indices (Real-time)',
      description: 'Real-time NSE indices data from WebSocket stream',
      items: nseItems
    };

    // Add NSE indices list to the beginning
    const updatedLists = [nseIndicesList, ...currentLists];
    this.indicesLists.set(updatedLists);
    
    // Set active tab to NSE indices if this is the first time
    if (this.activeTab() === '0') {
      this.activeTab.set('0'); // Keep it at 0 since we added NSE list at the beginning
    }

    console.log('Updated indices lists with NSE data:', updatedLists);
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
                  // Debounce WebSocket updates to prevent excessive signal updates
                  if (this.webSocketUpdateTimer) {
                    clearTimeout(this.webSocketUpdateTimer);
                  }
                  
                  this.webSocketUpdateTimer = setTimeout(() => {
                    // Update indices data with WebSocket data
                    if (indicesData.indices) {
                      this.updateIndicesWithWebSocketData(indicesData.indices);
                      
                      // Update TreeTable data
                      this.indicesTreeData.set(this.transformToTreeData(this.indices()));
                      
                      // Update indices lists
                      this.updateIndicesLists();
                    }
                  }, 100); // 100ms debounce
                } else {
                  console.warn('WebSocket received data but no valid indices found:', indicesData);
                }
              } catch (error) {
                console.error('Error processing received indices data:', error);
              }
            },
            error: (error) => {
              console.warn('WebSocket subscription error for all indices:', error.message || error);
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
    this.indices().forEach(index => {
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
            this.indices.update(prev => [...prev, newIndex]);
          }
        }
      }
    });

    // Sort indices by symbol for consistent display
    this.indices.update(prev => [...prev].sort((a, b) => (a.indexSymbol || '').localeCompare(b.indexSymbol || '')));
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
    const currentIndicesLists = this.indicesLists();
    if (currentIndicesLists.length === 0) {
      return;
    }

    // Update the main indices list (first item)
    const updatedIndicesLists = [...currentIndicesLists];
    const mainIndicesList = updatedIndicesLists[0];
    if (mainIndicesList) {
      mainIndicesList.items = this.indices().map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      }));
      this.indicesLists.set(updatedIndicesLists);
    }
  }

  /**
   * Search for indices by symbol or name within the loaded indices
   * @param query The search query
   */
  searchIndices(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);

    // Search within the loaded indices
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults.set(this.indices()
      .filter(index => 
        (index.indexSymbol?.toLowerCase().includes(normalizedQuery)) || 
        (index.indexName?.toLowerCase().includes(normalizedQuery))
      )
      .map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      })));

    this.isSearching.set(false);
  }

  /**
   * Refresh NSE indices data manually
   */
  public refreshNseIndicesData(): void {
    console.log('Refreshing NSE indices data...');
    this.getLatestNseIndicesData();
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
    const currentIndicesLists = this.indicesLists();
    const currentIndicesList = currentIndicesLists[currentIndicesListIndex];
    if (!currentIndicesList) return;

    const indexExists = currentIndicesList.items.some((item: { symbol: any; }) => item.symbol === index.symbol);
    if (indexExists) {
      return;
    }

    // Add the index to the list
    const updatedIndicesLists = [...currentIndicesLists];
    updatedIndicesLists[currentIndicesListIndex] = {
      ...currentIndicesList,
      items: [...currentIndicesList.items, index]
    };
    this.indicesLists.set(updatedIndicesLists);

    // Clear search results
    this.searchResults.set([]);
    this.searchQuery.set('');
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
    this.selectedIndexSymbol.set(rowData.symbol);

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
      this.isLoadingIndices.set(true);
      // Get all indices from the API
      this.indicesService.getAllIndices().subscribe({
        next: (indices: IndexResponseDto[]) => {
          this.indices.set(indices);
          this.isLoadingIndices.set(false);

          // Transform to TreeTable data
          this.indicesTreeData.set(this.transformToTreeData(indices));

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
          this.indicesLists.set([mainIndicesList]);
          // Set the active tab to the first list
          this.activeTab.set('0');
          
          // Force change detection to ensure template updates
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Failed to load indices:', error);
          this.isLoadingIndices.set(false);
          
          // If there's an error, use empty indices list
          const emptyIndicesList = {
            id: 'main-indices',
            name: 'Market Indices',
            description: 'All market indices from the indices API',
            items: []
          };
          
          // Set the indicesLists property with the empty list
          this.indicesLists.set([emptyIndicesList]);
          
          // Set the active tab to the first list
          this.activeTab.set('0');
        }
      });
    } catch (error) {
      console.error('Error in loadIndicesLists:', error);
      this.isLoadingIndices.set(false);
      
      // If there's an error, use empty indices list
      const emptyIndicesList = {
        id: 'main-indices',
        name: 'Market Indices',
        description: 'All market indices from the indices API',
        items: []
      };
      
      // Set the indicesLists property with the empty list
      this.indicesLists.set([emptyIndicesList]);
      
      // Set the active tab to the first list
      this.activeTab.set('0');
    }
  }
}