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
      // Remove reconnectDelay to prevent automatic disconnection
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Set up connection callbacks
    client.onConnect = (frame: IFrame) => {
      console.log('STOMP client connected successfully');
      this.connectionState$.next(WebSocketConnectionState.CONNECTED);
    };

    client.onDisconnect = (frame: IFrame) => {
      console.log('STOMP client disconnected');
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
    const connected = this.client?.connected === true;
    console.log(`WebSocket connection status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    return connected;
  }

  /**
   * Connect to engines WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('WebSocket already connected, skipping connection');
      return Promise.resolve();
    }

    try {
      console.log('Attempting to connect to engines STOMP WebSocket...');
      await this.client.activate();
      console.log('STOMP client activation completed');
      
      // Wait a bit for the connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (this.isConnected) {
        console.log('WebSocket connection established successfully');
      } else {
        console.warn('WebSocket connection not yet established after activation');
      }
    } catch (error) {
      console.error('Failed to connect to engines STOMP WebSocket:', error);
      throw error;
    }
  }

  /**
   * Clear all active subscriptions
   */
  private clearSubscriptions(): void {
    console.log('Clearing all active subscriptions');
    
    // Unsubscribe from all active subscriptions
    this.activeSubscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
        console.log(`Unsubscribed from: ${key}`);
      } catch (error) {
        console.warn(`Error unsubscribing from ${key}:`, error);
      }
    });
    
    // Clear the subscriptions map
    this.activeSubscriptions.clear();
    
    // Clear all data subjects
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach((subject, indexName) => {
      subject.next(null);
    });
    
    console.log('All subscriptions cleared');
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    try {
      console.log('Disconnecting from WebSocket...');
      
      // Clear all subscriptions first
      this.clearSubscriptions();
      
      // Disconnect the STOMP client
      if (this.client && this.client.connected) {
        this.client.deactivate();
      }
      
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      console.log('WebSocket disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from WebSocket:', error);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    }
  }

  /**
   * Subscribe to all indices data from engines
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const subscription = this.client.subscribe('/topic/nse-indices', (message: IMessage) => {
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
      console.error('Cannot subscribe: WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    // Check if we're already subscribed to this index
    const subscriptionKey = `index-${indexName}`;
    if (this.activeSubscriptions.has(subscriptionKey)) {
      console.log(`Already subscribed to index: ${indexName}, returning existing subscription`);
      // Return existing subscription
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
      }
      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is IndicesDto => data !== null)
      );
    }

    // Use the correct topic format that matches the backend controller
    const topic = `/topic/nse-indices/${indexName.replace(/\s+/g, '-').toLowerCase()}`;
    console.log(`Subscribing to STOMP topic: ${topic}`);
    
    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          console.log(`Received WebSocket data for ${indexName}:`, data);
          
          const indicesData = this.parseIndicesData(data);
          console.log(`Parsed indices data for ${indexName}:`, indicesData);
          
          if (!this.specificIndicesData.has(indexName)) {
            this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
          }
          this.specificIndicesData.get(indexName)?.next(indicesData);
        } catch (error) {
          console.error('Error parsing index message:', error);
        }
      });

      this.activeSubscriptions.set(subscriptionKey, subscription);
      console.log(`Successfully subscribed to topic: ${topic}`);

      // Ensure we have a BehaviorSubject for this index
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
      }

      // Return observable that filters out null values and ensures type safety
      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is IndicesDto => data !== null)
      );
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
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
    const subscriptionKey = `index-${indexName}`;
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
      
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
      lastPrice: indexData.lastPrice || indexData.currentPrice || indexData.last || 0,
      variation: indexData.variation || indexData.change || 0,
      percentChange: indexData.percentChange || indexData.perChange || 0,
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
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}