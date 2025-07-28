import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { ScrollerModule } from "primeng/scroller";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { IndicesService } from '../../services/apis/indices.api';
import { IndexResponseDto } from '../../services/entities/indices';

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

  // Search functionality
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: any[] = [];

  // Tab functionality
  activeTab: string = '0';

  // Helper method to get current indices list index from activeTab
  private getCurrentIndicesListIndex(): number {
    return parseInt(this.activeTab, 10);
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private indicesService: IndicesService
  ) {}

  ngOnInit(): void {
    // Load indices directly from the indices API
    this.loadIndicesLists();
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
      console.log('Cannot add indices to the main indices list');
      return;
    }

    // Check if the index is already in the list
    const currentIndicesList = this.indicesLists[currentIndicesListIndex];
    if (!currentIndicesList) return;

    const indexExists = currentIndicesList.items.some((item: { symbol: any; }) => item.symbol === index.symbol);
    if (indexExists) {
      console.log(`Index ${index.symbol} is already in the list`);
      return;
    }

    // Add the index to the list
    currentIndicesList.items.push(index);

    // Clear search results
    this.searchResults = [];
    this.searchQuery = '';
  }

  /**
   * Load indices lists from the indices API
   * Gets all indices from the API and fills the list with indices data
   */
  private loadIndicesLists(): void {
    this.isLoadingIndices = true;
    // Get all indices from the API
    this.indicesService.getAllIndices().subscribe({
      next: (indices: IndexResponseDto[]) => {
        this.indices = indices;
        this.isLoadingIndices = false;

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
  }
}