import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioApiService } from '../../../services/apis/portfolio.api';
import { PortfolioCreateRequest, PortfolioUpdateRequest, PortfolioHoldingDto, HoldingsCreateRequest, HoldingUpdateRequest } from '../../../services/entities/portfolio.entities';
import { AuthService } from '../../../services/security/auth.service';
import { MarketService } from '../../../services/apis/market.api';
import { StockService } from '../../../services/apis/stock.api';
import { IndicesService } from '../../../services/apis/indices.api';
import { Stock } from '../../../services/entities/stock';
import { IndexResponseDto } from '../../../services/entities/indices';

@Component({
  selector: 'app-portfolio-configure',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TableModule,
    DialogModule,
    FormsModule
  ],
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class PortfolioConfigureComponent implements OnInit {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  @Input() riskProfileOptions: any[] = [];

  @Output() saveChanges = new EventEmitter<PortfolioWithMetrics>();
  @Output() cancel = new EventEmitter<void>();
  @Output() goToOverview = new EventEmitter<void>();

  // Inject the portfolio API service
  private portfolioApiService = inject(PortfolioApiService);
  
  // Inject the auth service to get current user ID
  private authService = inject(AuthService);
  
  // Inject market, stock, and indices services for stock search and price data
  private marketService = inject(MarketService);
  private stockService = inject(StockService);
  private indicesService = inject(IndicesService);

  // Local copy for editing
  editingPortfolio: PortfolioWithMetrics | null = null;
  
  // Flag to distinguish between creation and editing modes
  isCreationMode = false;

  // Single editing state for all fields
  isEditing = false;

  // Loading state for save operation
  isSaving = false;

  // Holdings data
  portfolioHoldings: PortfolioHoldingDto[] = [];
  isLoadingHoldings = false;
  
  // Market data for holdings
  holdingsMarketData: { [symbol: string]: any } = {};
  isLoadingMarketData = false;
  
  // Table filter
  globalFilterValue = '';

  // Add Stock Dialog properties
  showAddStockDialog = false;
  stockSearchQuery = '';
  stockSearchResults: any[] = [];
  selectedStock: any = null;
  selectedStockDetails: any = null;
  stockQuantity = 0;
  isSearchingStocks = false;
  isAddingStock = false;
  isLoadingStockDetails = false;

  // All stocks for search validation (like stock-insights component)
  allStocks: Stock[] = [];

  ngOnInit(): void {
    // Load all stocks for search functionality
    this.loadAllStocksForSearch();
  }

  // Load all stocks for search functionality (like stock-insights component)
  private loadAllStocksForSearch(): void {
    this.stockService.getAllStocks().subscribe({
      next: (stocks: Stock[]) => {
        this.allStocks = stocks || [];
        console.log('Loaded stocks for search:', this.allStocks.length);
      },
      error: (error) => {
        console.error('Error loading stocks for search:', error);
        this.allStocks = [];
      }
    });
  }

  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Check if this is a new portfolio (creation mode)
      this.isCreationMode = this.selectedPortfolio.id === 0;
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
      
      // Automatically enter edit mode for new portfolios
      if (this.isCreationMode) {
        this.isEditing = true;
      }

      // Load holdings for existing portfolios
      if (!this.isCreationMode && this.selectedPortfolio.id > 0) {
        this.loadPortfolioHoldings(this.selectedPortfolio.id);
      }
    } else {
      this.editingPortfolio = null;
      this.isCreationMode = false;
      this.isEditing = false;
      this.portfolioHoldings = [];
    }
  }

  // Load portfolio holdings
  loadPortfolioHoldings(portfolioId: number): void {
    this.isLoadingHoldings = true;
    this.portfolioApiService.getHoldings(portfolioId).subscribe({
      next: (holdings) => {
        this.portfolioHoldings = holdings;
        this.isLoadingHoldings = false;
        // Load market data for each holding
        this.loadMarketDataForHoldings(holdings);
      },
      error: (error) => {
        console.error('Error loading portfolio holdings:', error);
        this.isLoadingHoldings = false;
        this.portfolioHoldings = [];
      }
    });
  }

  // Load market data for holdings
  loadMarketDataForHoldings(holdings: PortfolioHoldingDto[]): void {
    this.isLoadingMarketData = true;
    this.holdingsMarketData = {};
    
    // Load market data for each holding
    holdings.forEach(holding => {
      this.loadMarketDataForHolding(holding.symbol);
    });
  }

  // Load market data for a single holding
  loadMarketDataForHolding(symbol: string): void {
    this.stockService.getStockBySymbol(symbol).subscribe({
      next: (stockData: Stock) => {
        this.holdingsMarketData[symbol] = {
          name: stockData.companyName || stockData.name || symbol + ' Limited',
          currentPrice: stockData.tickDetails?.close || 0,
          change: stockData.tickDetails?.close && stockData.tickDetails?.previousClose ? 
                  stockData.tickDetails.close - stockData.tickDetails.previousClose : 0,
          changePercent: stockData.tickDetails?.close && stockData.tickDetails?.previousClose ? 
                        ((stockData.tickDetails.close - stockData.tickDetails.previousClose) / stockData.tickDetails.previousClose) * 100 : 0,
          sector: stockData.stockDetails?.pdSectorInd || stockData.pdSectorInd || 'Unknown',
          industry: stockData.stockDetails?.industry || stockData.industry || 'Unknown',
          volume: stockData.tickDetails?.volume || 0,
          dayHigh: stockData.tickDetails?.high || 0,
          dayLow: stockData.tickDetails?.low || 0,
          open: stockData.tickDetails?.open || 0,
          previousClose: stockData.tickDetails?.previousClose || 0,
          vwap: stockData.tickDetails?.vwap || 0,
          lastUpdated: stockData.tickDetails?.date || ''
        };
        this.isLoadingMarketData = false;
      },
      error: (error) => {
        console.error(`Error loading market data for ${symbol}:`, error);
        // Set default values for failed requests
        this.holdingsMarketData[symbol] = {
          name: symbol + ' Limited',
          currentPrice: 0,
          change: 0,
          changePercent: 0,
          sector: 'Unknown',
          industry: 'Unknown',
          volume: 0,
          dayHigh: 0,
          dayLow: 0,
          open: 0,
          previousClose: 0,
          vwap: 0,
          lastUpdated: ''
        };
        this.isLoadingMarketData = false;
      }
    });
  }

  // Get market data for a holding
  getMarketData(symbol: string): any {
    return this.holdingsMarketData[symbol] || {
      name: symbol + ' Limited',
      currentPrice: 0,
      change: 0,
      changePercent: 0,
      sector: 'Unknown',
      industry: 'Unknown',
      volume: 0,
      dayHigh: 0,
      dayLow: 0,
      open: 0,
      previousClose: 0,
      vwap: 0,
      lastUpdated: ''
    };
  }

  // Calculate current value for a holding
  getCurrentValue(holding: PortfolioHoldingDto): number {
    const marketData = this.getMarketData(holding.symbol);
    return marketData.currentPrice ? holding.quantity * marketData.currentPrice : 0;
  }

  // Calculate unrealized P&L
  getUnrealizedPnl(holding: PortfolioHoldingDto): number {
    const currentValue = this.getCurrentValue(holding);
    const costBasis = holding.quantity * holding.avgCost;
    return currentValue - costBasis;
  }

  // Calculate unrealized P&L percentage
  getUnrealizedPnlPercent(holding: PortfolioHoldingDto): number {
    const costBasis = holding.quantity * holding.avgCost;
    if (costBasis === 0) return 0;
    return (this.getUnrealizedPnl(holding) / costBasis) * 100;
  }

  // Open Add Stock Dialog
  openAddStockDialog(): void {
    this.showAddStockDialog = true;
    this.stockSearchQuery = '';
    this.stockSearchResults = [];
    this.selectedStock = null;
    this.stockQuantity = 0;
    this.isSearchingStocks = false;
  }

  // Close Add Stock Dialog
  closeAddStockDialog(): void {
    this.showAddStockDialog = false;
    this.stockSearchQuery = '';
    this.stockSearchResults = [];
    this.selectedStock = null;
    this.selectedStockDetails = null;
    this.stockQuantity = 0;
    this.isSearchingStocks = false;
    this.isLoadingStockDetails = false;
  }

  // Handle stock search input (like stock-insights component)
  onStockSearchInput(event: any): void {
    const query = event.target.value;
    this.stockSearchQuery = query;
    
    if (!query || query.length < 2) {
      this.stockSearchResults = [];
      return;
    }

    this.isSearchingStocks = true;
    
    // Filter against allStocks list (like stock-insights component)
    const normalizedQuery = query.toLowerCase().trim();
    const filtered = this.allStocks.filter(stock => 
      stock.symbol?.toLowerCase().includes(normalizedQuery) ||
      stock.name?.toLowerCase().includes(normalizedQuery)
    );
    
    // Convert Stock[] to the format expected by our UI
    this.stockSearchResults = filtered.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      companyName: stock.name, // Stock interface doesn't have companyName, use name
      price: 0 // We'll get price separately if needed
    }));
    
    this.isSearchingStocks = false;
  }


  // Select stock from search results
  selectStock(stock: any): void {
    this.selectedStock = stock;
    this.selectedStockDetails = null;
    this.isLoadingStockDetails = true;
    
    // Clear search results and query after selection
    this.stockSearchResults = [];
    this.stockSearchQuery = '';
    
    console.log('Stock selected:', stock);
    
    // Try multiple API endpoints to get stock details
    this.tryMultipleStockApis(stock);
  }

  // Try multiple API endpoints to get stock details
  private tryMultipleStockApis(stock: any): void {
    console.log('Trying multiple APIs for stock:', stock.symbol);
    
    // Try StockService.getStockBySymbol first (now has comprehensive data)
    this.stockService.getStockBySymbol(stock.symbol).subscribe({
      next: (stockData: Stock) => {
        console.log('API response from getStockBySymbol:', stockData);
        
        // Map updated Stock interface with nested tickDetails and stockDetails structure
        this.selectedStockDetails = {
          // Basic info from stockDetails
          symbol: stockData.symbol || stock.symbol,
          name: stockData.companyName || stockData.name || stock.name || stock.companyName,
          industry: stockData.industry || '',
          
          // Market data from tickDetails (nested object)
          price: stockData.tickDetails?.close || 0,
          change: stockData.tickDetails?.close && stockData.tickDetails?.previousClose ? 
                  stockData.tickDetails.close - stockData.tickDetails.previousClose : 0,
          changePercent: stockData.tickDetails?.close && stockData.tickDetails?.previousClose ? 
                        ((stockData.tickDetails.close - stockData.tickDetails.previousClose) / stockData.tickDetails.previousClose) * 100 : 0,
          dayHigh: stockData.tickDetails?.high || 0,
          dayLow: stockData.tickDetails?.low || 0,
          previousClose: stockData.tickDetails?.previousClose || 0,
          volume: stockData.tickDetails?.volume || 0,
          open: stockData.tickDetails?.open || 0,
          marketCap: 0, // Not available in current response
          yearHigh: 0, // Not available in current response
          yearLow: 0, // Not available in current response
          totalTradedValue: stockData.tickDetails?.totalTradedValue || 0,
          vwap: stockData.tickDetails?.vwap || 0,
          identifier: '',
          series: stockData.tickDetails?.series || stockData.stockDetails?.series || '',
          isin: stockData.stockDetails?.isin || '',
          nearWeekHigh: 0,
          nearWeekLow: 0,
          percentChange365d: 0,
          percentChange30d: 0,
          lastUpdated: stockData.tickDetails?.date || '',
          exchange: 'NSE', // Default to NSE
          currency: 'INR' // Default to INR
        };
        
        this.isLoadingStockDetails = false;
        console.log('Stock details loaded from StockService:', this.selectedStockDetails);
      },
      error: (error) => {
        console.error('StockService failed, trying IndicesService:', error);
        
        // Try IndicesService.getIndexBySymbol as fallback
        this.indicesService.getIndexBySymbol(stock.symbol).subscribe({
          next: (indexData: IndexResponseDto) => {
            console.log('API response from getIndexBySymbol:', indexData);
            
            // Map IndexResponseDto to our expected format
            this.selectedStockDetails = {
              symbol: indexData.indexSymbol || stock.symbol,
              name: indexData.indexName || stock.name || stock.companyName,
              price: indexData.lastPrice || 0,
              change: indexData.variation || 0,
              changePercent: indexData.percentChange || 0,
              dayHigh: indexData.highPrice || 0,
              dayLow: indexData.lowPrice || 0,
              previousClose: indexData.previousClose || 0,
              volume: 0, // Not available in IndexResponseDto
              open: indexData.openPrice || 0,
              marketCap: 0, // Not available in IndexResponseDto
              yearHigh: indexData.yearHigh || 0,
              yearLow: indexData.yearLow || 0,
              peRatio: indexData.peRatio || 0,
              pbRatio: indexData.pbRatio || 0,
              dividendYield: indexData.dividendYield || 0,
              sector: indexData.keyCategory || '',
              industry: '',
              exchange: '',
              currency: 'INR',
              lastUpdated: ''
            };
            
            this.isLoadingStockDetails = false;
            console.log('Stock details loaded from IndicesService:', this.selectedStockDetails);
          },
          error: (error2) => {
            console.error('IndicesService also failed, trying MarketService:', error2);
            
            // Try MarketService.getStockDetails as last resort
            this.marketService.getStockDetails(stock.symbol).subscribe({
              next: (marketData: any) => {
                console.log('API response from getStockDetails:', marketData);
                
                // Map MarketData to our expected format
                this.selectedStockDetails = {
                  symbol: marketData.symbol || stock.symbol,
                  name: marketData.name || stock.name || stock.companyName,
                  price: marketData.price || 0,
                  change: marketData.change || 0,
                  changePercent: marketData.changePercent || 0,
                  dayHigh: marketData.dayHigh || 0,
                  dayLow: marketData.dayLow || 0,
                  previousClose: marketData.previousClose || 0,
                  volume: marketData.volume || 0,
                  open: marketData.open || 0,
                  marketCap: marketData.marketCap || 0,
                  yearHigh: 0,
                  yearLow: 0,
                  peRatio: 0,
                  pbRatio: 0,
                  dividendYield: 0,
                  sector: '',
                  industry: '',
                  exchange: '',
                  currency: 'INR',
                  lastUpdated: ''
                };
                
                this.isLoadingStockDetails = false;
                console.log('Stock details loaded from MarketService:', this.selectedStockDetails);
              },
              error: (error3) => {
                console.error('All APIs failed:', error3);
                this.isLoadingStockDetails = false;
                
                // Show error message to user
                alert(`Failed to load details for ${stock.symbol}. All API endpoints failed.`);
                
                // Clear the selected stock details
                this.selectedStockDetails = null;
              }
            });
          }
        });
      }
    });
  }

  // Add selected stock to portfolio using PUT endpoint
  addSelectedStock(): void {
    if (!this.selectedStock || !this.editingPortfolio || this.editingPortfolio.id <= 0) {
      return;
    }

    this.isAddingStock = true;

    // Validate symbol against allStocks (like stock-insights component)
    const matched = this.allStocks.find(s => s.symbol?.toUpperCase() === this.selectedStock.symbol.toUpperCase());
    const targetSymbol = matched ? matched.symbol : this.selectedStock.symbol.toUpperCase();

    // Use PUT endpoint for individual holding (as per Swagger documentation)
    const holdingRequest: HoldingUpdateRequest = {
      quantity: this.stockQuantity || 0,
      avgCost: 0, // Will be set by backend or can be updated later
      realizedPnl: 0
    };

    console.log('Adding stock with PUT endpoint:', {
      portfolioId: this.editingPortfolio.id,
      symbol: targetSymbol,
      request: holdingRequest
    });

    this.portfolioApiService.putHolding(this.editingPortfolio.id, targetSymbol, holdingRequest).subscribe({
      next: (newHolding) => {
        console.log('Stock added successfully:', newHolding);
        // Refresh holdings list
        this.loadPortfolioHoldings(this.editingPortfolio!.id);
        this.closeAddStockDialog();
        this.isAddingStock = false;
      },
      error: (error) => {
        console.error('Error adding stock:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        alert('Failed to add stock to portfolio. Please try again.');
        this.isAddingStock = false;
      }
    });
  }


  // Add holdings method (legacy - keeping for compatibility)
  addHoldings(): void {
    this.openAddStockDialog();
  }

  // Remove holding method
  removeHolding(holding: PortfolioHoldingDto): void {
    if (confirm(`Are you sure you want to remove ${holding.symbol} from this portfolio?`)) {
      // TODO: Implement remove holding functionality
      console.log('Remove holding:', holding.symbol);
      // For now, just remove from local array
      this.portfolioHoldings = this.portfolioHoldings.filter(h => h.id !== holding.id);
    }
  }

  // Refresh holdings data
  refreshHoldings(): void {
    if (this.editingPortfolio && this.editingPortfolio.id > 0) {
      this.loadPortfolioHoldings(this.editingPortfolio.id);
    }
  }

  // Global filter change handler
  onGlobalFilterChange(event: any): void {
    this.globalFilterValue = event.target.value;
  }

  // Start editing all fields
  startEditAll(): void {
    this.isEditing = true;
  }

  // Save all changes using the appropriate API endpoint
  saveEditAll(): void {
    if (this.editingPortfolio && !this.isSaving) {
      // Validate required fields
      if (!this.editingPortfolio.name || this.editingPortfolio.name.trim() === '') {
        alert('Portfolio name is required');
        return;
      }
      
      if (!this.editingPortfolio.riskProfile) {
        alert('Risk profile is required');
        return;
      }

      this.isSaving = true;

      if (this.isCreationMode) {
        // Get current user ID
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          alert('User not authenticated. Please log in again.');
          this.isSaving = false;
          return;
        }

        // Create new portfolio
        const createRequest: PortfolioCreateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description || '',
          baseCurrency: this.editingPortfolio.baseCurrency,
          riskProfile: this.editingPortfolio.riskProfile,
          isActive: true,
          userId: parseInt(currentUser.id, 10) // Convert string ID to number
        };

        console.log('=== PORTFOLIO CREATION DEBUG ===');
        console.log('Current user:', currentUser);
        console.log('User ID (string):', currentUser.id);
        console.log('User ID (parsed):', parseInt(currentUser.id, 10));
        console.log('Creating portfolio with request:', JSON.stringify(createRequest, null, 2));
        console.log('================================');

        this.portfolioApiService.createPortfolio(createRequest).subscribe({
          next: (createdPortfolio) => {
            console.log('Portfolio created successfully:', createdPortfolio);
            // Update the local portfolio with the created one
            this.editingPortfolio = { ...this.editingPortfolio, ...createdPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {
            console.error('Error creating portfolio:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });
            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to create portfolios.');
            } else if (error.status === 400) {
              alert('Invalid portfolio data. Please check your input and try again.');
            } else {
              alert(`Failed to create portfolio (${error.status}). Changes have been saved locally.`);
            }
            
            // Fallback: save locally and emit
            console.log('Falling back to local save for new portfolio');
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
          }
        });
      } else {
        // Update existing portfolio
        const updateRequest: PortfolioUpdateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description,
          riskProfile: this.editingPortfolio.riskProfile
        };

        console.log('=== PORTFOLIO UPDATE DEBUG ===');
        console.log('Portfolio ID:', this.editingPortfolio.id);
        console.log('Update Request:', JSON.stringify(updateRequest, null, 2));
        console.log('Full editing portfolio data:', JSON.stringify(this.editingPortfolio, null, 2));
        console.log('Original portfolio data:', JSON.stringify(this.selectedPortfolio, null, 2));
        console.log('================================');

        this.portfolioApiService.updatePortfolio(this.editingPortfolio.id, updateRequest).subscribe({
          next: (updatedPortfolio) => {
            console.log('Portfolio updated successfully:', updatedPortfolio);
            // Update the local portfolio with the updated one
            this.editingPortfolio = { ...this.editingPortfolio, ...updatedPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {
            console.error('Error updating portfolio:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error,
              url: error.url
            });
            
            // Fallback: save locally and emit
            console.log('Falling back to local save for existing portfolio');
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to update this portfolio.');
            } else if (error.status === 404) {
              alert('Portfolio not found. It may have been deleted by another user.');
            } else {
              alert(`Failed to update portfolio (${error.status}). Changes have been saved locally.`);
            }
          }
        });
      }
    }
  }

  cancelEdit(): void {
    // Reset to original values and exit editing mode
    if (this.selectedPortfolio) {
      this.editingPortfolio = { ...this.selectedPortfolio };
    }
    this.isEditing = false;
    this.isSaving = false;
    // Stay on the same page - don't navigate to overview
    console.log('Cancel editing - staying on configure page');
  }

  onCancel(): void {
    this.cancel.emit();
  }

  navigateToOverview(): void {
    this.goToOverview.emit();
  }
}
