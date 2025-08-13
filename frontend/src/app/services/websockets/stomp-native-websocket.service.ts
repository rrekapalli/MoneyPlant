import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Client, IMessage, StompConfig, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Modern STOMP WebSocket service
 * Uses @stomp/stompjs with native WebSocket
 * Compatible with Spring Boot STOMP endpoints
 * Now connects to engines project instead of backend
 */
@Injectable({
  providedIn: 'root'
})
export class StompNativeWebSocketService {
  private client: Client;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Data caching
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();
  
  // Active subscriptions
  private activeSubscriptions = new Map<string, any>();

  constructor() {
    this.client = this.createStompClient();
  }

  /**
   * Create and configure STOMP client
   * Now connects to engines project WebSocket endpoints
   */
  private createStompClient(): Client {
    const client = new Client({
      webSocketFactory: () => {
        const baseUrl = environment.enginesHttpUrl + '/ws/nse-indices';
        return new SockJS(baseUrl);
      },
      debug: (msg) => {
        // Debug logging disabled for production
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Set up connection callbacks
    client.onConnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.CONNECTED);
    };

    client.onDisconnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.clearSubscriptions();
    };

    client.onStompError = (frame: IFrame) => {
      console.error('STOMP Error:', frame);
      this.errors$.next(`STOMP Error: ${frame.headers['message']}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    };

    client.onWebSocketError = (error: any) => {
      console.error('WebSocket Error:', error);
      this.errors$.next(`WebSocket Error: ${error.message || error}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    };

    client.onWebSocketClose = (event: CloseEvent) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    };

    return client;
  }

  /**
   * Get connection state observable
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.client?.connected === true;
  }

  /**
   * Connect to engines WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }

    try {
      await this.client.activate();
      console.log('Connected to engines STOMP WebSocket');
    } catch (error) {
      console.error('Failed to connect to engines STOMP WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from engines WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
    this.clearSubscriptions();
  }

  /**
   * Subscribe to all indices data from engines
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const subscription = this.client.subscribe('/topic/indices', (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const indicesData = this.parseIndicesData(data);
        this.allIndicesData$.next(indicesData);
      } catch (error) {
        console.error('Error parsing indices message:', error);
      }
    });

    this.activeSubscriptions.set('all-indices', subscription);

    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Subscribe to specific index data from engines
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const topic = `/topic/indices/${indexName.replace(/\s+/g, '-').toLowerCase()}`;
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const indicesData = this.parseIndicesData(data);
        
        if (!this.specificIndicesData.has(indexName)) {
          this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
        }
        this.specificIndicesData.get(indexName)?.next(indicesData);
      } catch (error) {
        console.error('Error parsing index message:', error);
      }
    });

    this.activeSubscriptions.set(`index-${indexName}`, subscription);

    // Ensure we have a BehaviorSubject for this index
    if (!this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
    }

    // Return observable that filters out null values and ensures type safety
    return this.specificIndicesData.get(indexName)!.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    const subscription = this.activeSubscriptions.get('all-indices');
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete('all-indices');
      this.allIndicesData$.next(null);
    }
  }

  /**
   * Unsubscribe from specific index data
   */
  unsubscribeFromIndex(indexName: string): void {
    const subscription = this.activeSubscriptions.get(`index-${indexName}`);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(`index-${indexName}`);
      
      if (this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.get(indexName)?.next(null);
      }
    }
  }

  /**
   * Send message to engines WebSocket
   */
  sendMessage(destination: string, message: any): void {
    if (this.isConnected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
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
        source: 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    // Single index format
    if (data.indexName || data.name) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: [this.parseIndexData(data)],
        source: 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    // Fallback
    return {
      timestamp: new Date().toISOString(),
      indices: [],
      source: 'Engines STOMP WebSocket',
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
    this.activeSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.activeSubscriptions.clear();
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach(subject => subject.next(null));
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}