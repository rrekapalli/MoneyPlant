import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, share, tap } from 'rxjs';
import { NativeWebSocketService, NativeWebSocketConfig } from './native-websocket.service';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Native WebSocket service for NSE Indices data
 * Modern implementation using browser native WebSocket API
 * No external dependencies required
 * Now connects to engines project instead of backend
 */
@Injectable({
  providedIn: 'root'
})
export class NativeIndicesWebSocketService {
  private readonly baseUrl = `${environment.enginesWebSocketUrl}/ws/nse-indices-native`; // Engines WebSocket endpoint
  private readonly config: NativeWebSocketConfig = {
    url: this.baseUrl,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    debug: false // Set to true for debugging
  };

  // Current data states
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();
  
  // Active subscriptions tracking
  private activeSubscriptions = new Set<string>();

  constructor(private nativeWebSocketService: NativeWebSocketService) {}

  /**
   * Get connection state
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.nativeWebSocketService.connectionState;
  }

  /**
   * Get errors
   */
  get errors(): Observable<string> {
    return this.nativeWebSocketService.errors;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.nativeWebSocketService.isConnected;
  }

  /**
   * Connect to engines WebSocket
   */
  async connect(): Promise<void> {
    try {
      await this.nativeWebSocketService.connect(this.config);
      console.log('Connected to engines indices WebSocket');
    } catch (error) {
      console.error('Failed to connect to engines indices WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from engines WebSocket
   */
  disconnect(): void {
    this.nativeWebSocketService.disconnect();
    this.clearSubscriptions();
  }

  /**
   * Subscribe to all indices data from engines
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // Send subscription message to engines
    this.sendMessage({
      action: 'subscribe',
      channel: 'nse-indices'
    });

    // Return observable that filters messages for all indices
    return this.nativeWebSocketService.messages.pipe(
      filter((data: any) => data && data.indices && Array.isArray(data.indices)),
      map((data: any) => this.parseIndicesData(data)),
      tap((indicesData: IndicesDto) => {
        this.allIndicesData$.next(indicesData);
      }),
      share()
    );
  }

  /**
   * Subscribe to specific index data from engines
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // Send subscription message to engines for specific index
    this.sendMessage({
      action: 'subscribe',
      channel: 'nse-indices',
      index: indexName
    });

    // Track this subscription
    this.activeSubscriptions.add(indexName);

    // Return observable that filters messages for specific index
    return this.nativeWebSocketService.messages.pipe(
      filter((data: any) => {
        if (!data || !data.indices) return false;
        
        // Check if this message contains data for the requested index
        if (Array.isArray(data.indices)) {
          return data.indices.some((index: any) => 
            index.indexName === indexName || index.name === indexName
          );
        }
        
        return data.indexName === indexName || data.name === indexName;
      }),
      map((data: any) => this.parseIndicesData(data)),
      tap((indicesData: IndicesDto) => {
        // Update specific index data cache
        if (!this.specificIndicesData.has(indexName)) {
          this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
        }
        this.specificIndicesData.get(indexName)?.next(indicesData);
      }),
      share()
    );
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    this.sendMessage({
      action: 'unsubscribe',
      channel: 'nse-indices'
    });
    
    this.allIndicesData$.next(null);
  }

  /**
   * Unsubscribe from specific index data
   */
  unsubscribeFromIndex(indexName: string): void {
    this.sendMessage({
      action: 'unsubscribe',
      channel: 'nse-indices',
      index: indexName
    });
    
    this.activeSubscriptions.delete(indexName);
    
    // Clear specific index data cache
    if (this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.get(indexName)?.next(null);
    }
  }

  /**
   * Get all indices data (cached)
   */
  getAllIndicesData(): Observable<IndicesDto | null> {
    return this.allIndicesData$.asObservable();
  }

  /**
   * Get specific index data (cached)
   */
  getIndexData(indexName: string): Observable<IndicesDto | null> {
    if (!this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
    }
    return this.specificIndicesData.get(indexName)!.asObservable();
  }

  /**
   * Check if subscribed to all indices
   */
  isSubscribedToAllIndices(): boolean {
    return this.allIndicesData$.value !== null;
  }

  /**
   * Check if subscribed to specific index
   */
  isSubscribedToIndex(indexName: string): boolean {
    return this.activeSubscriptions.has(indexName);
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions);
  }

  /**
   * Send message to engines WebSocket
   */
  private sendMessage(message: any): void {
    if (this.isConnected) {
      this.nativeWebSocketService.sendMessage(message);
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Parse indices data from engines WebSocket message
   */
  private parseIndicesData(data: any): IndicesDto {
    // Handle different data formats from engines
    if (data.indices && Array.isArray(data.indices)) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: data.indices.map((index: any) => this.parseIndexData(index)),
        source: 'Engines WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    // Single index format
    if (data.indexName || data.name) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: [this.parseIndexData(data)],
        source: 'Engines WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    // Fallback
    return {
      timestamp: new Date().toISOString(),
      indices: [],
      source: 'Engines WebSocket',
      marketStatus: { status: 'UNKNOWN' }
    };
  }

  /**
   * Parse individual index data
   */
  private parseIndexData(indexData: any): IndexDataDto {
    return {
      key: indexData.key || indexData.indexName || indexData.name,
      indexName: indexData.indexName || indexData.name,
      indexSymbol: indexData.indexSymbol || indexData.symbol,
      lastPrice: indexData.lastPrice || indexData.last || 0,
      variation: indexData.variation || indexData.change || 0,
      percentChange: indexData.percentChange || indexData.percentChange || 0,
      openPrice: indexData.openPrice || indexData.open || 0,
      dayHigh: indexData.dayHigh || indexData.high || 0,
      dayLow: indexData.dayLow || indexData.low || 0,
      previousClose: indexData.previousClose || indexData.prevClose || 0,
      yearHigh: indexData.yearHigh || 0,
      yearLow: indexData.yearLow || 0,
      indicativeClose: indexData.indicativeClose || 0,
      peRatio: indexData.peRatio || 0,
      pbRatio: indexData.pbRatio || 0,
      dividendYield: indexData.dividendYield || 0,
      declines: indexData.declines || 0,
      advances: indexData.advances || 0,
      unchanged: indexData.unchanged || 0,
      percentChange365d: indexData.percentChange365d || 0,
      date365dAgo: indexData.date365dAgo || '',
      percentChange30d: indexData.percentChange30d || 0,
      date30dAgo: indexData.date30dAgo || '',
      chart365dPath: indexData.chart365dPath || '',
      chart30dPath: indexData.chart30dPath || '',
      chartTodayPath: indexData.chartTodayPath || ''
    };
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.activeSubscriptions.clear();
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach(subject => subject.next(null));
  }
}