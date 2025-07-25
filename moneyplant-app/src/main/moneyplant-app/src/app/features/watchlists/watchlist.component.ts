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
import { WatchlistService, MarketService } from '../../services';
import { Watchlist, WatchlistItem, MarketData } from '../../services/entities';
import { ScrollerModule } from "primeng/scroller";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-watchlist',
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
    RadioButtonModule,
    TooltipModule
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  watchlists: Watchlist[] = [];

  // View mode selection
  selectedViewMode: string = 'watchlist'; // Default to watchlist view

  // Search functionality
  searchQuery: string = '';
  searchResults: MarketData[] = [];
  isSearching: boolean = false;

  // Tab functionality
  activeTab: string = '0';

  // Helper method to get current watchlist index from activeTab
  private getCurrentWatchlistIndex(): number {
    return parseInt(this.activeTab, 10);
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private watchlistService: WatchlistService,
    private marketService: MarketService
  ) {}

  ngOnInit(): void {
    this.loadWatchlists();
  }

  /**
   * Handle view mode change
   * @param mode The selected view mode
   */
  onViewModeChange(mode: string): void {
    console.log(`View mode changed to: ${mode}`);
    // Additional logic for switching between watchlist and portfolio views can be added here
  }

  private loadWatchlists(): void {
    this.watchlistService.getWatchlists().subscribe({
      next: (data) => {
        this.watchlists = data;
      },
      error: (error) => {
        // Fallback to sample data if API is not available
        this.loadSampleData();
      }
    });
  }

  // No longer needed with tab-based interface
  private loadWatchlistDetails(id: string): void {
    this.watchlistService.getWatchlistById(id).subscribe({
      next: (data) => {
        // Find the index of the watchlist and set it as active
        const index = this.watchlists.findIndex(w => w.id === id);
        if (index !== -1) {
          this.watchlists[index] = data;
          this.activeTab = index.toString();
        }
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  private loadSampleData(): void {
    // Sample data as fallback
    this.watchlists = [
      {
        id: '1',
        name: 'Tech Stocks',
        description: 'Technology sector watchlist',
        items: [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 0.0234 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', price: 290.10, change: 0.0156 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -0.0089 }
        ]
      },
      {
        id: '2',
        name: 'Financial Stocks',
        description: 'Financial sector watchlist',
        items: [
          { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 150.25, change: 0.0134 },
          { symbol: 'BAC', name: 'Bank of America Corp.', price: 40.10, change: -0.0056 }
        ]
      }
    ];
  }

  createWatchlist(): void {
    // This would typically open a dialog or navigate to a form
    // For now, we'll just create a simple watchlist with a placeholder name
    const newWatchlist = {
      name: 'New Watchlist',
      description: 'A new watchlist',
      items: []
    };

    this.watchlistService.createWatchlist(newWatchlist).subscribe({
      next: (createdWatchlist) => {
        this.watchlists.push(createdWatchlist);
        // Switch to the new watchlist tab
        this.activeTab = (this.watchlists.length - 1).toString();
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  viewWatchlist(watchlist: Watchlist): void {
    const index = this.watchlists.findIndex(w => w.id === watchlist.id);
    if (index !== -1) {
      this.activeTab = index.toString();
    }
  }

  editWatchlist(): void {
    // Get the current watchlist from the active tab
    const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
    if (!currentWatchlist) return;

    // This would typically open a dialog or form with the current data
    // For now, we'll just update the description
    const updatedWatchlist = {
      ...currentWatchlist,
      description: `${currentWatchlist.description} (updated)`
    };

    this.watchlistService.updateWatchlist(currentWatchlist.id, updatedWatchlist).subscribe({
      next: (updated) => {
        // Update the watchlist in the array
        this.watchlists[this.getCurrentWatchlistIndex()] = updated;
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  deleteWatchlist(watchlist: Watchlist | null): void {
    if (!watchlist) return;

    this.watchlistService.deleteWatchlist(watchlist.id).subscribe({
      next: () => {
        // Get the index of the deleted watchlist
        const deletedIndex = this.watchlists.findIndex(w => w.id === watchlist.id);

        // Remove from the list
        this.watchlists = this.watchlists.filter(w => w.id !== watchlist.id);

        // Adjust the active tab index if needed
        if (this.watchlists.length > 0) {
          // If we deleted the last tab or a tab before the current one, adjust the active index
          if (deletedIndex <= this.getCurrentWatchlistIndex()) {
            this.activeTab = Math.max(0, this.getCurrentWatchlistIndex() - 1).toString();
          }
        } else {
          // No watchlists left
          this.activeTab = '0';
        }
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  addSymbol(): void {
    // Get the current watchlist from the active tab
    const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
    if (!currentWatchlist) return;

    // This would typically open a dialog to search for and select a symbol
    // For now, we'll just add a placeholder symbol
    const symbol = 'NFLX'; // Example symbol

    this.watchlistService.addSymbol(currentWatchlist.id, symbol).subscribe({
      next: (updated) => {
        // Update the watchlist in the array
        this.watchlists[this.getCurrentWatchlistIndex()] = updated;
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  removeSymbol(item: WatchlistItem): void {
    // Get the current watchlist from the active tab
    const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
    if (!currentWatchlist) return;

    this.watchlistService.removeSymbol(currentWatchlist.id, item.symbol).subscribe({
      next: (updated) => {
        // Update the watchlist in the array
        this.watchlists[this.getCurrentWatchlistIndex()] = updated;
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }

  // No longer needed with tab-based interface
  // Kept for backward compatibility
  backToList(): void {
    // Reset the active tab index
    this.activeTab = '0';
  }

  /**
   * Search for stocks by symbol or name
   * @param query The search query
   */
  searchStocks(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.marketService.searchStocks(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        this.isSearching = false;
        // Handle error (e.g., show a notification)
      }
    });
  }

  /**
   * Add a stock from search results to the current watchlist
   * @param stock The stock to add
   */
  addStockFromSearch(stock: MarketData): void {
    // Get the current watchlist from the active tab
    const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
    if (!currentWatchlist) return;

    this.watchlistService.addSymbol(currentWatchlist.id, stock.symbol).subscribe({
      next: (updated) => {
        // Update the watchlist in the array
        this.watchlists[this.getCurrentWatchlistIndex()] = updated;
        // Optionally clear search results or show a success message
        this.searchResults = [];
        this.searchQuery = '';
      },
      error: (error) => {
        // Handle error (e.g., show a notification)
      }
    });
  }
}
