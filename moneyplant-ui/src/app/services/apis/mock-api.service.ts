import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private watchlistsData: any = null;
  private holdingsData: any = null;
  private positionsData: any = null;
  private marketData: any = null;
  private notificationsData: any = null;
  private featureFlagsData: any = null;
  private dashboardData: any = null;

  constructor(private http: HttpClient) {}

  /**
   * Loads mock data from JSON files
   */
  private loadWatchlistsData(): Observable<any> {
    if (this.watchlistsData) {
      return of(this.watchlistsData);
    }
    return this.http.get<any>('assets/mock-data/watchlists.json').pipe(
      tap(data => this.watchlistsData = data),
      catchError(error => {
        console.error('Error loading watchlists mock data', error);
        return throwError(() => error);
      })
    );
  }

  private loadHoldingsData(): Observable<any> {
    if (this.holdingsData) {
      return of(this.holdingsData);
    }
    return this.http.get<any>('assets/mock-data/holdings.json').pipe(
      tap(data => this.holdingsData = data),
      catchError(error => {
        console.error('Error loading holdings mock data', error);
        return throwError(() => error);
      })
    );
  }

  private loadPositionsData(): Observable<any> {
    if (this.positionsData) {
      return of(this.positionsData);
    }
    return this.http.get<any>('assets/mock-data/positions.json').pipe(
      tap(data => this.positionsData = data),
      catchError(error => {
        console.error('Error loading positions mock data', error);
        return throwError(() => error);
      })
    );
  }

  private loadMarketData(): Observable<any> {
    if (this.marketData) {
      return of(this.marketData);
    }
    return this.http.get<any>('assets/mock-data/market.json').pipe(
      tap(data => this.marketData = data),
      catchError(error => {
        console.error('Error loading market mock data', error);
        return throwError(() => error);
      })
    );
  }

  private loadNotificationsData(): Observable<any> {
    if (this.notificationsData) {
      return of(this.notificationsData);
    }
    return this.http.get<any>('assets/mock-data/notifications.json').pipe(
      tap(data => this.notificationsData = data),
      catchError(error => {
        console.error('Error loading notifications mock data', error);
        return throwError(() => error);
      })
    );
  }

  private loadFeatureFlagsData(): Observable<any> {
    if (this.featureFlagsData) {
      return of(this.featureFlagsData);
    }
    return this.http.get<any>('assets/mock-data/feature-flags.json').pipe(
      tap(data => this.featureFlagsData = data),
      catchError(error => {
        console.error('Error loading feature flags mock data', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * GET request for mock data
   * @param path The mock data path (e.g., '/watchlists')
   * @param params Optional HTTP parameters
   * @returns An Observable of the mock data
   */
  get<T>(path: string, params?: any): Observable<T> {
    if (path.startsWith('/watchlists')) {
      return this.handleWatchlistsRequest<T>(path);
    } else if (path.startsWith('/holdings')) {
      return this.handleHoldingsRequest<T>(path);
    } else if (path.startsWith('/positions')) {
      return this.handlePositionsRequest<T>(path);
    } else if (path.startsWith('/market')) {
      return this.handleMarketRequest<T>(path, params);
    } else if (path.startsWith('/notifications')) {
      return this.handleNotificationsRequest<T>(path);
    } else if (path.startsWith('/feature-flags')) {
      return this.handleFeatureFlagsRequest<T>(path);
    } else if (path.startsWith('/dashboard')) {
      return this.handleDashboardRequest<T>(path, params);
    }
    return throwError(() => new Error(`Mock API path not supported: ${path}`));
  }

  /**
   * POST request for mock data
   * @param path The mock data path
   * @param body The request body
   * @returns An Observable of the mock response
   */
  post<T>(path: string, body: any): Observable<T> {
    if (path.startsWith('/watchlists')) {
      return this.handleWatchlistsPost<T>(path, body);
    } else if (path.startsWith('/holdings')) {
      return this.handleHoldingsPost<T>(path, body);
    } else if (path.startsWith('/positions')) {
      return this.handlePositionsPost<T>(path, body);
    } else if (path.startsWith('/notifications')) {
      return this.handleNotificationsPost<T>(path, body);
    } else if (path.startsWith('/feature-flags')) {
      return this.handleFeatureFlagsPost<T>(path, body);
    }
    return throwError(() => new Error(`Mock API path not supported: ${path}`));
  }

  /**
   * PUT request for mock data
   * @param path The mock data path
   * @param body The request body
   * @returns An Observable of the mock response
   */
  put<T>(path: string, body: any): Observable<T> {
    if (path.startsWith('/watchlists')) {
      return this.handleWatchlistsPut<T>(path, body);
    } else if (path.startsWith('/holdings')) {
      return this.handleHoldingsPut<T>(path, body);
    } else if (path.startsWith('/positions')) {
      return this.handlePositionsPut<T>(path, body);
    } else if (path.startsWith('/notifications')) {
      return this.handleNotificationsPut<T>(path, body);
    } else if (path.startsWith('/feature-flags')) {
      return this.handleFeatureFlagsPut<T>(path, body);
    }
    return throwError(() => new Error(`Mock API path not supported: ${path}`));
  }

  /**
   * DELETE request for mock data
   * @param path The mock data path
   * @returns An Observable of the mock response
   */
  delete<T>(path: string): Observable<T> {
    if (path.startsWith('/watchlists')) {
      return this.handleWatchlistsDelete<T>(path);
    } else if (path.startsWith('/holdings')) {
      return this.handleHoldingsDelete<T>(path);
    } else if (path.startsWith('/positions')) {
      return this.handlePositionsDelete<T>(path);
    } else if (path.startsWith('/notifications')) {
      return this.handleNotificationsDelete<T>(path);
    } else if (path.startsWith('/feature-flags')) {
      return this.handleFeatureFlagsDelete<T>(path);
    }
    return throwError(() => new Error(`Mock API path not supported: ${path}`));
  }

  // Watchlists handlers
  private handleWatchlistsRequest<T>(path: string): Observable<T> {
    return this.loadWatchlistsData().pipe(
      map(data => {
        if (path === '/watchlists') {
          return data as T;
        }

        const parts = path.split('/');
        if (parts.length === 3) {
          // Get watchlist by ID
          const id = parts[2];
          const watchlist = data.find((w: any) => w.id === id);
          if (watchlist) {
            return watchlist as T;
          }
          throw new Error(`Watchlist with ID ${id} not found`);
        }

        throw new Error(`Unsupported watchlists path: ${path}`);
      })
    );
  }

  private handleWatchlistsPost<T>(path: string, body: any): Observable<T> {
    return this.loadWatchlistsData().pipe(
      map(data => {
        if (path === '/watchlists') {
          // Create new watchlist
          const newWatchlist = {
            ...body,
            id: (Math.max(...data.map((w: any) => parseInt(w.id, 10))) + 1).toString(),
            items: body.items || []
          };
          this.watchlistsData.push(newWatchlist);
          return newWatchlist as T;
        }

        const parts = path.split('/');
        if (parts.length === 4 && parts[3] === 'symbols') {
          // Add symbol to watchlist
          const id = parts[2];
          const watchlist = data.find((w: any) => w.id === id);
          if (!watchlist) {
            throw new Error(`Watchlist with ID ${id} not found`);
          }

          // Mock adding a symbol (in a real app, you'd fetch symbol details)
          const newItem = {
            symbol: body.symbol,
            name: `${body.symbol} Company`,
            price: Math.random() * 1000,
            change: (Math.random() * 0.1) - 0.05
          };

          watchlist.items.push(newItem);
          return watchlist as T;
        }

        throw new Error(`Unsupported watchlists POST path: ${path}`);
      })
    );
  }

  private handleWatchlistsPut<T>(path: string, body: any): Observable<T> {
    return this.loadWatchlistsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 3) {
          // Update watchlist
          const id = parts[2];
          const index = data.findIndex((w: any) => w.id === id);
          if (index === -1) {
            throw new Error(`Watchlist with ID ${id} not found`);
          }

          const updatedWatchlist = {
            ...data[index],
            ...body
          };
          this.watchlistsData[index] = updatedWatchlist;
          return updatedWatchlist as T;
        }

        throw new Error(`Unsupported watchlists PUT path: ${path}`);
      })
    );
  }

  private handleWatchlistsDelete<T>(path: string): Observable<T> {
    return this.loadWatchlistsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 3) {
          // Delete watchlist
          const id = parts[2];
          const index = data.findIndex((w: any) => w.id === id);
          if (index === -1) {
            throw new Error(`Watchlist with ID ${id} not found`);
          }

          this.watchlistsData.splice(index, 1);
          return {} as T;
        }

        if (parts.length === 5 && parts[3] === 'symbols') {
          // Remove symbol from watchlist
          const watchlistId = parts[2];
          const symbol = parts[4];
          const watchlist = data.find((w: any) => w.id === watchlistId);
          if (!watchlist) {
            throw new Error(`Watchlist with ID ${watchlistId} not found`);
          }

          const symbolIndex = watchlist.items.findIndex((item: any) => item.symbol === symbol);
          if (symbolIndex === -1) {
            throw new Error(`Symbol ${symbol} not found in watchlist ${watchlistId}`);
          }

          watchlist.items.splice(symbolIndex, 1);
          return watchlist as T;
        }

        throw new Error(`Unsupported watchlists DELETE path: ${path}`);
      })
    );
  }

  // Holdings handlers
  private handleHoldingsRequest<T>(path: string): Observable<T> {
    return this.loadHoldingsData().pipe(
      map(data => {
        if (path === '/holdings') {
          return data as T;
        }

        const parts = path.split('/');
        if (parts.length === 3) {
          // Get holding group by ID
          const id = parts[2];
          const holdingGroup = data.find((h: any) => h.id === id);
          if (holdingGroup) {
            return holdingGroup as T;
          }
          throw new Error(`Holding group with ID ${id} not found`);
        }

        throw new Error(`Unsupported holdings path: ${path}`);
      })
    );
  }

  private handleHoldingsPost<T>(path: string, body: any): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Holdings POST not implemented'));
  }

  private handleHoldingsPut<T>(path: string, body: any): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Holdings PUT not implemented'));
  }

  private handleHoldingsDelete<T>(path: string): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Holdings DELETE not implemented'));
  }

  // Positions handlers
  private handlePositionsRequest<T>(path: string): Observable<T> {
    return this.loadPositionsData().pipe(
      map(data => {
        if (path === '/positions') {
          return data as T;
        }

        if (path === '/positions/summary') {
          return data.summary as T;
        }

        const parts = path.split('/');
        if (parts.length === 3) {
          // Get position by ID
          const id = parts[2];
          const position = data.positions.find((p: any) => p.id === id);
          if (position) {
            return position as T;
          }
          throw new Error(`Position with ID ${id} not found`);
        }

        throw new Error(`Unsupported positions path: ${path}`);
      })
    );
  }

  private handlePositionsPost<T>(path: string, body: any): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Positions POST not implemented'));
  }

  private handlePositionsPut<T>(path: string, body: any): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Positions PUT not implemented'));
  }

  private handlePositionsDelete<T>(path: string): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Positions DELETE not implemented'));
  }

  // Market handlers
  private handleMarketRequest<T>(path: string, params?: any): Observable<T> {
    return this.loadMarketData().pipe(
      map(data => {
        if (path === '/market/summary') {
          return data.summary as T;
        }

        if (path === '/market/gainers') {
          // In a real implementation, we would limit based on the limit parameter
          // For mock data, we'll just return all gainers
          return data.gainers as T;
        }

        if (path === '/market/losers') {
          // In a real implementation, we would limit based on the limit parameter
          // For mock data, we'll just return all losers
          return data.losers as T;
        }

        if (path === '/market/active') {
          // In a real implementation, we would limit based on the limit parameter
          // For mock data, we'll just return all active stocks
          return data.active as T;
        }

        if (path.startsWith('/market/search')) {
          // In a real implementation, we would filter based on the query parameter
          // For mock data, we'll just return all stocks
          return Object.values(data.stocks) as T;
        }

        if (path.startsWith('/market/stocks/')) {
          const parts = path.split('/');
          if (parts.length === 4) {
            const symbol = parts[3];
            const stock = data.stocks[symbol];
            if (stock) {
              return stock as T;
            }
            throw new Error(`Stock with symbol ${symbol} not found`);
          }
        }

        throw new Error(`Unsupported market path: ${path}`);
      })
    );
  }

  // Notifications handlers
  private handleNotificationsRequest<T>(path: string): Observable<T> {
    return this.loadNotificationsData().pipe(
      map(data => {
        if (path === '/notifications') {
          return data as T;
        }

        const parts = path.split('/');
        if (parts.length === 3) {
          // Get notification by ID
          const id = parts[2];
          const notification = data.find((n: any) => n.id === id);
          if (notification) {
            return notification as T;
          }
          throw new Error(`Notification with ID ${id} not found`);
        }

        throw new Error(`Unsupported notifications path: ${path}`);
      })
    );
  }

  private handleNotificationsPost<T>(path: string, body: any): Observable<T> {
    // Implement as needed
    return throwError(() => new Error('Notifications POST not implemented'));
  }

  private handleNotificationsPut<T>(path: string, body: any): Observable<T> {
    return this.loadNotificationsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 4 && parts[3] === 'read') {
          // Mark notification as read
          const id = parts[2];
          const notification = data.find((n: any) => n.id === id);
          if (!notification) {
            throw new Error(`Notification with ID ${id} not found`);
          }

          notification.isRead = true;
          return notification as T;
        }

        if (path === '/notifications/read-all') {
          // Mark all notifications as read
          data.forEach((notification: any) => {
            notification.isRead = true;
          });
          return {} as T;
        }

        throw new Error(`Unsupported notifications PUT path: ${path}`);
      })
    );
  }

  private handleNotificationsDelete<T>(path: string): Observable<T> {
    return this.loadNotificationsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 3) {
          // Delete notification
          const id = parts[2];
          const index = data.findIndex((n: any) => n.id === id);
          if (index === -1) {
            throw new Error(`Notification with ID ${id} not found`);
          }

          this.notificationsData.splice(index, 1);
          return {} as T;
        }

        if (path === '/notifications/read') {
          // Delete all read notifications
          this.notificationsData = data.filter((n: any) => !n.isRead);
          return {} as T;
        }

        throw new Error(`Unsupported notifications DELETE path: ${path}`);
      })
    );
  }

  // Feature Flags handlers
  private handleFeatureFlagsRequest<T>(path: string): Observable<T> {
    return this.loadFeatureFlagsData().pipe(
      map(data => {
        if (path === '/feature-flags') {
          return data as T;
        }

        const parts = path.split('/');
        if (parts.length === 3) {
          // Get feature flag by ID
          const id = parts[2];
          const featureFlag = data.find((f: any) => f.id === id);
          if (featureFlag) {
            return featureFlag as T;
          }
          throw new Error(`Feature flag with ID ${id} not found`);
        }

        throw new Error(`Unsupported feature flags path: ${path}`);
      })
    );
  }

  private handleFeatureFlagsPost<T>(path: string, body: any): Observable<T> {
    return this.loadFeatureFlagsData().pipe(
      map(data => {
        if (path === '/feature-flags') {
          // Create new feature flag
          const newFeatureFlag = {
            ...body,
            id: `feature-${data.length + 1}`
          };
          this.featureFlagsData.push(newFeatureFlag);
          return newFeatureFlag as T;
        }

        throw new Error(`Unsupported feature flags POST path: ${path}`);
      })
    );
  }

  private handleFeatureFlagsPut<T>(path: string, body: any): Observable<T> {
    return this.loadFeatureFlagsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 3) {
          // Update feature flag
          const id = parts[2];
          const index = data.findIndex((f: any) => f.id === id);
          if (index === -1) {
            throw new Error(`Feature flag with ID ${id} not found`);
          }

          const updatedFeatureFlag = {
            ...data[index],
            ...body
          };
          this.featureFlagsData[index] = updatedFeatureFlag;
          return updatedFeatureFlag as T;
        }

        if (parts.length === 4 && parts[3] === 'enable') {
          // Enable feature flag
          const id = parts[2];
          const featureFlag = data.find((f: any) => f.id === id);
          if (!featureFlag) {
            throw new Error(`Feature flag with ID ${id} not found`);
          }

          featureFlag.enabled = true;
          return featureFlag as T;
        }

        if (parts.length === 4 && parts[3] === 'disable') {
          // Disable feature flag
          const id = parts[2];
          const featureFlag = data.find((f: any) => f.id === id);
          if (!featureFlag) {
            throw new Error(`Feature flag with ID ${id} not found`);
          }

          featureFlag.enabled = false;
          return featureFlag as T;
        }

        throw new Error(`Unsupported feature flags PUT path: ${path}`);
      })
    );
  }

  private handleFeatureFlagsDelete<T>(path: string): Observable<T> {
    return this.loadFeatureFlagsData().pipe(
      map(data => {
        const parts = path.split('/');
        if (parts.length === 3) {
          // Delete feature flag
          const id = parts[2];
          const index = data.findIndex((f: any) => f.id === id);
          if (index === -1) {
            throw new Error(`Feature flag with ID ${id} not found`);
          }

          this.featureFlagsData.splice(index, 1);
          return {} as T;
        }

        throw new Error(`Unsupported feature flags DELETE path: ${path}`);
      })
    );
  }

  // Dashboard data loader
  private loadDashboardData(): Observable<any> {
    if (this.dashboardData) {
      return of(this.dashboardData);
    }

    // Generate mock dashboard data with proper country names for world map
    this.dashboardData = [
      {
        id: '1',
        assetCategory: 'Stocks',
        month: 'Jan',
        market: 'United States',
        totalValue: 150000,
        riskValue: 12,
        returnValue: 8,
        description: 'Technology stocks portfolio'
      },
      {
        id: '2',
        assetCategory: 'Bonds',
        month: 'Jan',
        market: 'Germany',
        totalValue: 75000,
        riskValue: 4,
        returnValue: 3,
        description: 'Government bonds'
      },
      {
        id: '3',
        assetCategory: 'Real Estate',
        month: 'Feb',
        market: 'United Kingdom',
        totalValue: 200000,
        riskValue: 8,
        returnValue: 6,
        description: 'European real estate funds'
      },
      {
        id: '4',
        assetCategory: 'Cryptocurrency',
        month: 'Feb',
        market: 'China',
        totalValue: 50000,
        riskValue: 25,
        returnValue: 15,
        description: 'Digital assets'
      },
      {
        id: '5',
        assetCategory: 'Commodities',
        month: 'Mar',
        market: 'Japan',
        totalValue: 80000,
        riskValue: 15,
        returnValue: 7,
        description: 'Gold and oil futures'
      },
      {
        id: '6',
        assetCategory: 'Stocks',
        month: 'Mar',
        market: 'Canada',
        totalValue: 120000,
        riskValue: 10,
        returnValue: 9,
        description: 'Canadian equities'
      },
      {
        id: '7',
        assetCategory: 'Bonds',
        month: 'Apr',
        market: 'France',
        totalValue: 95000,
        riskValue: 5,
        returnValue: 4,
        description: 'French government bonds'
      },
      {
        id: '8',
        assetCategory: 'Real Estate',
        month: 'Apr',
        market: 'Australia',
        totalValue: 180000,
        riskValue: 9,
        returnValue: 7,
        description: 'Australian property funds'
      }
    ];

    return of(this.dashboardData);
  }

  // Dashboard handlers
  private handleDashboardRequest<T>(path: string, params?: any): Observable<T> {
    return this.loadDashboardData().pipe(
      map(data => {
        // Parse filters from params if they exist
        let filters: any[] = [];
        if (params && params.get && params.get('filters')) {
          try {
            filters = JSON.parse(params.get('filters'));
          } catch (e) {
            // Ignore parsing errors
          }
        }

        // Apply filters to data
        let filteredData = data;
        if (filters && filters.length > 0) {
          filteredData = data.filter((row: any) => {
            return filters.every(filter => {
              const filterColumn = filter.filterColumn || 'assetCategory';
              const rowValue = row[filterColumn];
              return rowValue === filter.value;
            });
          });
        }

        if (path === '/dashboard/data') {
          return filteredData as T;
        }

        if (path === '/dashboard/asset-allocation') {
          // Transform data for asset allocation pie chart
          const assetData = filteredData.reduce((acc: any, row: any) => {
            const category = row.assetCategory;
            if (!acc[category]) {
              acc[category] = { name: category, value: 0, percentage: 0 };
            }
            acc[category].value += row.totalValue;
            return acc;
          }, {});

          const totalValue = Object.values(assetData).reduce((sum: number, item: any) => sum + item.value, 0);
          Object.values(assetData).forEach((item: any) => {
            item.percentage = Math.round((item.value / totalValue) * 100);
          });

          return Object.values(assetData) as T;
        }

        if (path === '/dashboard/monthly-income-expenses') {
          // Transform data for monthly income vs expenses
          const monthlyData = filteredData.reduce((acc: any, row: any) => {
            const month = row.month;
            if (!acc[month]) {
              acc[month] = { month: month, income: 0, expenses: 0, net: 0 };
            }
            acc[month].income += row.totalValue * 1.1; // Simulate income being higher
            acc[month].expenses += row.totalValue;
            acc[month].net = acc[month].income - acc[month].expenses;
            return acc;
          }, {});

          return Object.values(monthlyData) as T;
        }

        if (path === '/dashboard/risk-return-analysis') {
          // Transform data for risk vs return scatter chart
          const riskReturnData = filteredData.filter((row: any) => 
            row.riskValue !== undefined && row.returnValue !== undefined
          );

          const aggregatedData = riskReturnData.reduce((acc: any, row: any) => {
            const category = row.assetCategory;
            if (!acc[category]) {
              acc[category] = {
                assetCategory: category,
                riskSum: 0,
                returnSum: 0,
                marketCapSum: 0,
                count: 0
              };
            }
            acc[category].riskSum += row.riskValue;
            acc[category].returnSum += row.returnValue;
            acc[category].marketCapSum += row.totalValue;
            acc[category].count += 1;
            return acc;
          }, {});

          const result = Object.values(aggregatedData).map((item: any) => ({
            assetCategory: item.assetCategory,
            risk: Math.round((item.riskSum / item.count) * 100) / 100,
            return: Math.round((item.returnSum / item.count) * 100) / 100,
            marketCap: item.marketCapSum
          }));

          return result as T;
        }

        if (path === '/dashboard/investment-distribution') {
          // Transform data for investment distribution map
          const distributionData = filteredData.reduce((acc: any, row: any) => {
            const market = row.market;
            if (!acc[market]) {
              acc[market] = { 
                country: market, 
                region: this.getRegionForCountry(market), 
                value: 0, 
                percentage: 0 
              };
            }
            acc[market].value += row.totalValue;
            return acc;
          }, {});

          const totalValue = Object.values(distributionData).reduce((sum: number, item: any) => sum + item.value, 0);
          Object.values(distributionData).forEach((item: any) => {
            item.percentage = Math.round((item.value / totalValue) * 100);
          });

          return Object.values(distributionData) as T;
        }

        if (path === '/dashboard/metrics') {
          // Calculate metrics for tiles
          const totalValue = filteredData.reduce((sum: number, row: any) => sum + row.totalValue, 0);
          const avgRisk = filteredData.reduce((sum: number, row: any) => sum + (row.riskValue || 0), 0) / filteredData.length;
          const avgReturn = filteredData.reduce((sum: number, row: any) => sum + (row.returnValue || 0), 0) / filteredData.length;

          return {
            totalPortfolioValue: totalValue,
            totalInvestments: filteredData.length,
            averageRisk: Math.round(avgRisk * 100) / 100,
            averageReturn: Math.round(avgReturn * 100) / 100,
            monthlyGrowth: 2.5, // Mock percentage
            yearlyGrowth: 12.8 // Mock percentage
          } as T;
        }

        throw new Error(`Unsupported dashboard path: ${path}`);
      })
    );
  }

  // Helper method to map countries to regions
  private getRegionForCountry(country: string): string {
    const regionMap: Record<string, string> = {
      'United States': 'North America',
      'Canada': 'North America',
      'Germany': 'Europe', 
      'United Kingdom': 'Europe',
      'France': 'Europe',
      'China': 'Asia',
      'Japan': 'Asia',
      'Australia': 'Oceania'
    };
    return regionMap[country] || 'Other';
  }
}
