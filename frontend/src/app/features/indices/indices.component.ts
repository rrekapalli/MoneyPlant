import { Component, OnInit } from '@angular/core';
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

import { TreeNode } from 'primeng/api';
import { IndicesService } from '../../services/apis/indices.api';
import { IndexResponseDto } from '../../services/entities/indices';
import { ComponentCommunicationService, SelectedIndexData } from '../../services/component-communication.service';

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
export class IndicesComponent implements OnInit {
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
    private componentCommunicationService: ComponentCommunicationService
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
      
      // Load indices directly from the indices API
      this.loadIndicesLists();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
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